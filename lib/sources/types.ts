export interface NormalizedSignal {
	source: string;
	keyword: string;
	volume: number | null;
	trend: "up" | "flat" | "down";
	mentionCount: number;
	sentimentSummary: string;
	rawData: Record<string, unknown>;
}

export interface SignalSource {
	name: string;
	fetchSignals(params: {
		niche?: string;
		limit: number;
	}): Promise<NormalizedSignal[]>;
	healthCheck(): Promise<boolean>;
}
