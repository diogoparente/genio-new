import type { z, ZodSchema } from "zod";

export interface LLMProvider {
	name: string;
	generateStructured<T>(params: {
		systemPrompt: string;
		userPrompt: string;
		schema: ZodSchema<T>;
	}): Promise<T>;
}

// Re-export zod for convenience — used in schema validation
export type { ZodSchema } from "zod";
