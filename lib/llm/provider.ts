import type { LLMProvider } from "./types";
import type { ZodSchema } from "zod";

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
    choices: Array<{ message: { content: string } }>;
}

export function createLLMProvider(overrides?: {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
}): LLMProvider {
    const apiKey = overrides?.apiKey ?? process.env.LLM_API_KEY;
    const baseUrl = overrides?.baseUrl ?? process.env.LLM_BASE_URL ?? DEFAULT_BASE_URL;
    const model = overrides?.model ?? process.env.LLM_MODEL ?? DEFAULT_MODEL;

    return {
        name: "openai-compatible",

        async generateStructured<T>(params: {
            systemPrompt: string;
            userPrompt: string;
            schema: ZodSchema<T>;
        }): Promise<T> {
            if (!apiKey) {
                throw new Error(
                    "Missing LLM_API_KEY environment variable.",
                );
            }

            const messages: ChatMessage[] = [
                { role: "system", content: params.systemPrompt },
                { role: "user", content: params.userPrompt },
            ];

            const res = await fetch(`${baseUrl}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages,
                    response_format: { type: "json_object" },
                    temperature: 0.7,
                    max_tokens: 16384,
                }),
                signal: AbortSignal.timeout(60_000),
            });

            if (!res.ok) {
                const body = await res.text();
                throw new Error(
                    `LLM API error ${res.status}: ${body.slice(0, 300)}`,
                );
            }

            const json: ChatCompletionResponse = await res.json();
            const rawContent = json.choices?.[0]?.message?.content;

            if (!rawContent) {
                throw new Error("LLM returned empty response content.");
            }

            // Strip markdown fences in case the model wraps the JSON
            let sanitized = rawContent.trim();
            if (sanitized.startsWith("```")) {
                sanitized = sanitized
                    .replace(/^```(?:json)?\s*\n?/, "")
                    .replace(/\n?```\s*$/, "");
            }

            let parsed: unknown;
            try {
                parsed = JSON.parse(sanitized);
            } catch {
                throw new Error(
                    `LLM response was not valid JSON: ${rawContent.slice(0, 300)}…`,
                );
            }

            const result = params.schema.safeParse(parsed);

            if (!result.success) {
                throw new Error(
                    `LLM response failed schema validation: ${result.error.message}`,
                );
            }

            return result.data;
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
