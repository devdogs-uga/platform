ALTER TABLE `discord_profile` MODIFY COLUMN `accessToken` varchar(255);--> statement-breakpoint
ALTER TABLE `discord_profile` MODIFY COLUMN `accessTokenExpires` timestamp;--> statement-breakpoint
ALTER TABLE `discord_profile` MODIFY COLUMN `refreshToken` varchar(255);--> statement-breakpoint
ALTER TABLE `github_profile` ADD `accessToken` varchar(255);--> statement-breakpoint
ALTER TABLE `github_profile` ADD `accessTokenExpires` timestamp;--> statement-breakpoint
ALTER TABLE `github_profile` ADD `refreshToken` varchar(255);--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `type`;