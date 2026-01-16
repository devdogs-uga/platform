ALTER TABLE `user` DROP FOREIGN KEY `user_githubId_github_profile_id_fk`;
--> statement-breakpoint
ALTER TABLE `user` DROP FOREIGN KEY `user_discordId_discord_profile_id_fk`;
--> statement-breakpoint
ALTER TABLE `user` ADD CONSTRAINT `user_githubId_github_profile_id_fk` FOREIGN KEY (`githubId`) REFERENCES `github_profile`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user` ADD CONSTRAINT `user_discordId_discord_profile_id_fk` FOREIGN KEY (`discordId`) REFERENCES `discord_profile`(`id`) ON DELETE set null ON UPDATE no action;