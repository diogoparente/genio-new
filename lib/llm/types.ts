import type { z, ZodSchema } from "zod";

export interface StructuredResult<T> {
	/** The validated output data */
	data: T;
	/** Number of items that were discarded due to validation failures */
	discarded: number;
	/** Whether the LLM response was truncated (finish_reason === "length") */
	truncated: boolean;
	/** Whether a retry was performed to get more results */
	retried: boolean;
}

export interface LLMProvider {
	name: string;
	generateStructured<T>(params: {
		systemPrompt: string;
		userPrompt: string;
		schema: ZodSchema<T>;
		/** Expected item count — used to decide whether to retry on truncation/shortfall */
		expectedCount?: number;
	}): Promise<StructuredResult<T>>;
}

// Re-export zod for convenience — used in schema validation
export type { ZodSchema } from "zod";
