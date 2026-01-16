CREATE TABLE `discord_profile` (
	`id` varchar(255) NOT NULL,
	`username` varchar(255) NOT NULL,
	`avatar` varchar(255) NOT NULL,
	`accessToken` varchar(255) NOT NULL,
	`accessTokenExpires` timestamp NOT NULL,
	`refreshToken` varchar(255) NOT NULL,
	CONSTRAINT `discord_profile_id` PRIMARY KEY(`id`),
	CONSTRAINT `username_idx` UNIQUE((lower(`username`)))
);
--> statement-breakpoint
ALTER TABLE `user` ADD `discordId` varchar(255);--> statement-breakpoint
ALTER TABLE `user` ADD CONSTRAINT `user_discordId_discord_profile_id_fk` FOREIGN KEY (`discordId`) REFERENCES `discord_profile`(`id`) ON DELETE no action ON UPDATE no action;