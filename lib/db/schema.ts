import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/* ------------------------------------------------------------------ */
/*  ideaGenerations — top-level generation runs                       */
/* ------------------------------------------------------------------ */
export const ideaGenerations = sqliteTable("idea_generations", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull(),
	niche: text("niche"),
	batchSize: integer("batch_size").notNull().default(7),
	status: text("status", { enum: ["pending", "running", "completed", "failed"] })
		.notNull()
		.default("pending"),
	confidence: real("confidence"),
	createdAt: text("created_at")
		.notNull()
		.default(sql`(current_timestamp)`),
});

/* ------------------------------------------------------------------ */
/*  ideas — individual generated ideas                                */
/* ------------------------------------------------------------------ */
export const ideas = sqliteTable("ideas", {
	id: text("id").primaryKey(),
	generationId: text("generation_id")
		.notNull()
		.references(() => ideaGenerations.id),
	name: text("name").notNull(),
	tagline: text("tagline").notNull(),
	description: text("description").notNull(),
	targetAudience: text("target_audience").notNull(),
	monetizationModel: text("monetization_model").notNull(),
	confidenceScore: real("confidence_score").notNull(),
	isSaved: integer("is_saved").notNull().default(0),
	notes: text("notes"),
	createdAt: text("created_at")
		.notNull()
		.default(sql`(current_timestamp)`),
});

/* ------------------------------------------------------------------ */
/*  ideaSignals — market signals associated with an idea              */
/* ------------------------------------------------------------------ */
export const ideaSignals = sqliteTable("idea_signals", {
	id: text("id").primaryKey(),
	ideaId: text("idea_id")
		.notNull()
		.references(() => ideas.id),
	source: text("source").notNull(),
	keyword: text("keyword").notNull(),
	volumeEstimate: real("volume_estimate"),
	trendDirection: text("trend_direction", {
		enum: ["up", "flat", "down"],
	}).notNull(),
	mentionCount: integer("mention_count").notNull().default(0),
	sentimentSummary: text("sentiment_summary").notNull().default(""),
	rawData: text("raw_data"), // JSON stored as text
	createdAt: text("created_at")
		.notNull()
		.default(sql`(current_timestamp)`),
});

/* ------------------------------------------------------------------ */
/*  ideaCompetitors — competitors for a given idea                    */
/* ------------------------------------------------------------------ */
export const ideaCompetitors = sqliteTable("idea_competitors", {
	id: text("id").primaryKey(),
	ideaId: text("idea_id")
		.notNull()
		.references(() => ideas.id),
	name: text("name").notNull(),
	url: text("url"),
	description: text("description"),
	strength: text("strength", { enum: ["low", "medium", "high"] }).notNull(),
	createdAt: text("created_at")
		.notNull()
		.default(sql`(current_timestamp)`),
});

/* ------------------------------------------------------------------ */
/*  ideaDetails — deep-dive details for an idea (1:1 with ideas)     */
/* ------------------------------------------------------------------ */
export const ideaDetails = sqliteTable("idea_details", {
	id: text("id").primaryKey(),
	ideaId: text("idea_id")
		.notNull()
		.references(() => ideas.id),
	suggestedTechStack: text("suggested_tech_stack"), // JSON
	estimatedTAM: text("estimated_tam"),
	acquisitionChannels: text("acquisition_channels"), // JSON
	pricingSuggestions: text("pricing_suggestions"), // JSON
	mvpFeatureSet: text("mvp_feature_set"), // JSON
	createdAt: text("created_at")
		.notNull()
		.default(sql`(current_timestamp)`),
});
