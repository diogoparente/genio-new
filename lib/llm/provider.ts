import type { LLMProvider, StructuredResult } from "./types";
import type { ZodSchema } from "zod";
import { synthesizedIdeaSchema } from "@/lib/synthesis/parser";

/* ------------------------------------------------------------------ */
/*  OpenAI-compatible LLM provider — stateless factory function        */
/*  Configured via LLM_API_KEY, LLM_BASE_URL, LLM_MODEL env vars.      */
/*  Defaults to DeepSeek API.                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_BASE_URL = "https://api.deepseek.com/v1";
const DEFAULT_MODEL = "deepseek-chat";

interface ChatMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

interface ChatCompletionResponse {
	choices: Array<{
		message: { content: string };
		finish_reason: "stop" | "length" | "content_filter" | "tool_calls";
	}>;
}

/* ------------------------------------------------------------------ */
/*  JSON repair — salvage complete ideas from a truncated response     */
/* ------------------------------------------------------------------ */

function sanitizeContent(raw: string): string {
	let s = raw.trim();
	if (s.startsWith("```")) {
		s = s.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
	}
	return s;
}

/**
 * Attempts to repair truncated JSON by finding the last complete idea
 * object and closing the array + outer wrapper.
 */
function repairTruncatedJSON(raw: string): {
	parsed: unknown;
	discarded: number;
} | null {
	// Try appending closing brackets (handles most simple truncations)
	const closingAttempts = [raw + "]}", raw + "}]}", raw + "}]}"];
	for (const attempt of closingAttempts) {
		try {
			return { parsed: JSON.parse(attempt), discarded: 0 };
		} catch {
			// continue
		}
	}

	// Scan backwards from end, cutting at the last '}' that produces valid JSON
	for (let i = raw.length - 1; i >= 0; i--) {
		if (raw[i] === "}") {
			const attempt = raw.slice(0, i + 1) + "]}";
			try {
				const parsed = JSON.parse(attempt);
				return { parsed, discarded: 0 };
			} catch {
				// This '}' might be inside a string value, keep scanning
			}
		}
	}

	return null;
}

/* ------------------------------------------------------------------ */
/*  Permissive validation — filter out invalid items individually      */
/* ------------------------------------------------------------------ */

/**
 * Validates each item in the `ideas` array individually against
 * the lenient idea schema. Returns only valid items and logs failures.
 */
function validatePermissively(rawParsed: unknown): {
	validIdeas: unknown[];
	discarded: number;
} {
	const obj = rawParsed as Record<string, unknown>;
	const ideas = Array.isArray(obj?.ideas) ? (obj.ideas as unknown[]) : [];

	if (ideas.length === 0) {
		return { validIdeas: [], discarded: 0 };
	}

	const valid: unknown[] = [];
	let discarded = 0;

	for (let i = 0; i < ideas.length; i++) {
		const result = synthesizedIdeaSchema.safeParse(ideas[i]);
		if (result.success) {
			valid.push(result.data);
		} else {
			discarded++;
			console.error(
				`[genio] Discarded invalid idea #${i + 1}:`,
				result.error.message,
				"Raw:",
				JSON.stringify(ideas[i]).slice(0, 200),
			);
		}
	}

	return { validIdeas: valid, discarded };
}

/* ------------------------------------------------------------------ */
/*  LLM call helper                                                    */
/* ------------------------------------------------------------------ */

async function callLLM(params: {
	apiKey: string;
	baseUrl: string;
	model: string;
	messages: ChatMessage[];
	maxTokens: number;
}): Promise<{ rawContent: string; finishReason: string }> {
	const res = await fetch(`${params.baseUrl}/chat/completions`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${params.apiKey}`,
		},
		body: JSON.stringify({
			model: params.model,
			messages: params.messages,
			response_format: { type: "json_object" },
			temperature: 0.7,
			max_tokens: params.maxTokens,
		}),
		signal: AbortSignal.timeout(60_000),
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`LLM API error ${res.status}: ${body.slice(0, 300)}`);
	}

	const json: ChatCompletionResponse = await res.json();
	const rawContent = json.choices?.[0]?.message?.content;
	const finishReason = json.choices?.[0]?.finish_reason ?? "stop";

	if (!rawContent) {
		throw new Error("LLM returned empty response content.");
	}

	return { rawContent, finishReason };
}

/* ------------------------------------------------------------------ */
/*  Factory                                                            */
/* ------------------------------------------------------------------ */

export function createLLMProvider(overrides?: {
	apiKey?: string;
	baseUrl?: string;
	model?: string;
}): LLMProvider {
	const apiKey = overrides?.apiKey ?? process.env.LLM_API_KEY;
	const baseUrl =
		overrides?.baseUrl ?? process.env.LLM_BASE_URL ?? DEFAULT_BASE_URL;
	const model = overrides?.model ?? process.env.LLM_MODEL ?? DEFAULT_MODEL;

	return {
		name: "openai-compatible",

		async generateStructured<T>(params: {
			systemPrompt: string;
			userPrompt: string;
			schema: ZodSchema<T>;
			expectedCount?: number;
		}): Promise<StructuredResult<T>> {
			if (!apiKey) {
				throw new Error("Missing LLM_API_KEY environment variable.");
			}

			const messages: ChatMessage[] = [
				{ role: "system", content: params.systemPrompt },
				{ role: "user", content: params.userPrompt },
			];

			// --- First attempt ---
			let { rawContent, finishReason } = await callLLM({
				apiKey,
				baseUrl,
				model,
				messages,
				maxTokens: 16384,
			});

			const sanitized = sanitizeContent(rawContent);
			let truncated = finishReason === "length";
			let discarded = 0;
			let retried = false;

			// Try standard JSON parse
			let parsed: unknown;
			let parseFailed = false;
			try {
				parsed = JSON.parse(sanitized);
			} catch {
				parseFailed = true;
			}

			// If parse failed, try repair
			if (parseFailed) {
				const repaired = repairTruncatedJSON(sanitized);
				if (repaired) {
					parsed = repaired.parsed;
					discarded += repaired.discarded;
					truncated = true; // treat repaired as truncated
					console.warn(
						"[genio] Repaired truncated JSON — some ideas may have been lost.",
					);
				}
			}

			// Retry if we couldn't parse at all
			if (parsed === undefined) {
				const expected = params.expectedCount ?? 0;
				if (expected > 0) {
					console.warn(
						"[genio] LLM output unparseable, retrying with stricter prompt and higher token limit…",
					);
					const retryResult = await callLLM({
						apiKey,
						baseUrl,
						model,
						messages: [
							...messages,
							{
								role: "user",
								content:
									"Your previous response was not valid JSON. " +
									"You MUST respond with valid JSON only. " +
									"Do NOT truncate or cut the response short.",
							},
						],
						maxTokens: 32768,
					});
					const retrySanitized = sanitizeContent(retryResult.rawContent);
					try {
						parsed = JSON.parse(retrySanitized);
						truncated = retryResult.finishReason === "length";
						retried = true;
					} catch {
						const repaired = repairTruncatedJSON(retrySanitized);
						if (repaired) {
							parsed = repaired.parsed;
							discarded += repaired.discarded;
							truncated = true;
							retried = true;
						}
					}
				}

				if (parsed === undefined) {
					throw new Error(
						`LLM response was not valid JSON and could not be repaired. Raw: ${sanitized.slice(0, 300)}…`,
					);
				}
			}

			// --- Schema validation ---
			const schemaResult = params.schema.safeParse(parsed);

			if (schemaResult.success) {
				// Schema passed — return as-is
				return {
					data: schemaResult.data,
					discarded,
					truncated,
					retried,
				};
			}

			// Schema failed — try permissive per-idea validation
			const { validIdeas, discarded: permissiveDiscarded } =
				validatePermissively(parsed);
			discarded += permissiveDiscarded;

			if (validIdeas.length === 0) {
				throw new Error(
					`LLM response failed schema validation and permissive filtering yielded zero valid ideas. ` +
						`Schema error: ${schemaResult.error.message.slice(0, 300)}`,
				);
			}

			// --- Retry if too few valid ideas ---
			const expected = params.expectedCount ?? validIdeas.length;
			if (validIdeas.length < Math.ceil(expected / 2) && !retried) {
				console.warn(
					`[genio] Only ${validIdeas.length}/${expected} ideas valid, retrying with stricter prompt…`,
				);
				const remainingNeeded = expected - validIdeas.length;
				try {
					const retryResult = await callLLM({
						apiKey,
						baseUrl,
						model,
						messages: [
							...messages,
							{
								role: "user",
								content:
									`Your previous response had ${permissiveDiscarded} invalid ideas. ` +
									`Please generate ${remainingNeeded} MORE ideas following the EXACT format specified. ` +
									"All fields are required and must have the exact types shown. " +
									'Respond with valid JSON only: {"ideas": [...]}',
							},
						],
						maxTokens: 16384,
					});
					const retrySanitized = sanitizeContent(retryResult.rawContent);
					let retryParsed: unknown;
					try {
						retryParsed = JSON.parse(retrySanitized);
					} catch {
						const repaired = repairTruncatedJSON(retrySanitized);
						if (repaired) {
							retryParsed = repaired.parsed;
						}
					}
					if (retryParsed) {
						const { validIdeas: retryIdeas } =
							validatePermissively(retryParsed);
						validIdeas.push(...retryIdeas);
						retried = true;
					}
				} catch (err) {
					console.error("[genio] Retry LLM call failed:", err);
				}
			}

			return {
				data: { ideas: validIdeas } as unknown as T,
				discarded,
				truncated,
				retried,
			};
		},
	};
}

let _provider: LLMProvider | null = null;

export function getLLMProvider(): LLMProvider {
	if (!_provider) {
		_provider = createLLMProvider();
	}
	return _provider;
}
