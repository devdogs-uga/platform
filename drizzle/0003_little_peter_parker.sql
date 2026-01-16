CREATE TABLE `github_profile` (
	`id` int NOT NULL,
	`login` varchar(255) NOT NULL,
	`points` double NOT NULL DEFAULT 0,
	`avatarUrl` text,
	CONSTRAINT `github_profile_id` PRIMARY KEY(`id`),
	CONSTRAINT `login_idx` UNIQUE((lower(`login`)))
);
--> statement-breakpoint
ALTER TABLE `user` RENAME COLUMN `created_at` TO `createdAt`;--> statement-breakpoint
ALTER TABLE `user` RENAME COLUMN `updated_at` TO `updatedAt`;--> statement-breakpoint
ALTER TABLE `user` ADD `githubId` int;--> statement-breakpoint
ALTER TABLE `user` ADD CONSTRAINT `user_githubId_github_profile_id_fk` FOREIGN KEY (`githubId`) REFERENCES `github_profile`(`id`) ON DELETE no action ON UPDATE no action;