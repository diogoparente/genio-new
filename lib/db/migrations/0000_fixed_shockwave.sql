CREATE TABLE `idea_competitors` (
	`id` text PRIMARY KEY NOT NULL,
	`idea_id` text NOT NULL,
	`name` text NOT NULL,
	`url` text,
	`description` text,
	`strength` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `idea_details` (
	`id` text PRIMARY KEY NOT NULL,
	`idea_id` text NOT NULL,
	`suggested_tech_stack` text,
	`estimated_tam` text,
	`acquisition_channels` text,
	`pricing_suggestions` text,
	`mvp_feature_set` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `idea_generations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`niche` text,
	`batch_size` integer DEFAULT 7 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`confidence` real,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `idea_signals` (
	`id` text PRIMARY KEY NOT NULL,
	`idea_id` text NOT NULL,
	`source` text NOT NULL,
	`keyword` text NOT NULL,
	`volume_estimate` real,
	`trend_direction` text NOT NULL,
	`mention_count` integer DEFAULT 0 NOT NULL,
	`sentiment_summary` text DEFAULT '' NOT NULL,
	`raw_data` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ideas` (
	`id` text PRIMARY KEY NOT NULL,
	`generation_id` text NOT NULL,
	`name` text NOT NULL,
	`tagline` text NOT NULL,
	`description` text NOT NULL,
	`target_audience` text NOT NULL,
	`monetization_model` text NOT NULL,
	`confidence_score` real NOT NULL,
	`is_saved` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`generation_id`) REFERENCES `idea_generations`(`id`) ON UPDATE no action ON DELETE no action
);
