import type { LLMProvider } from "./types";
import type { ZodSchema } from "zod";

/* ------------------------------------------------------------------ */
/*  DeepSeek LLM provider — OpenAI-compatible chat completions API     */
/* ------------------------------------------------------------------ */

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

interface DeepSeekMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

interface DeepSeekResponse {
	choices: Array<{ message: { content: string } }>;
}

export class DeepSeekProvider implements LLMProvider {
	name = "deepseek";

	async generateStructured<T>(params: {
		systemPrompt: string;
		userPrompt: string;
		schema: ZodSchema<T>;
	}): Promise<T> {
		const apiKey = process.env.DEEPSEEK_API_KEY;
		if (!apiKey) {
			throw new Error(
				"Missing DEEPSEEK_API_KEY environment variable.",
			);
		}

		const messages: DeepSeekMessage[] = [
			{ role: "system", content: params.systemPrompt },
			{ role: "user", content: params.userPrompt },
		];

		const res = await fetch(DEEPSEEK_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: "deepseek-chat",
				messages,
				response_format: { type: "json_object" },
				temperature: 0.7,
				max_tokens: 4096,
			}),
			signal: AbortSignal.timeout(60_000),
		});

		if (!res.ok) {
			const body = await res.text();
			throw new Error(
				`DeepSeek API error ${res.status}: ${body.slice(0, 300)}`,
			);
		}

		const json: DeepSeekResponse = await res.json();
		const rawContent = json.choices?.[0]?.message?.content;

		if (!rawContent) {
			throw new Error("DeepSeek returned empty response content.");
		}

		let parsed: unknown;
		try {
			parsed = JSON.parse(rawContent);
		} catch {
			throw new Error(
				`DeepSeek response was not valid JSON: ${rawContent.slice(0, 300)}`,
			);
		}

		const result = params.schema.safeParse(parsed);

		if (!result.success) {
			throw new Error(
				`DeepSeek response failed schema validation: ${result.error.message}`,
			);
		}

		return result.data;
	}
}

let _provider: DeepSeekProvider | null = null;

export function getLLMProvider(): LLMProvider {
	if (!_provider) {
		_provider = new DeepSeekProvider();
	}
	return _provider;
}
