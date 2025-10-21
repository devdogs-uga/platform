Reading schema files:
/home/sloan/DevDogs-UGA/DevDogs-Website/src/server/db/schema.ts

CREATE TABLE `discord_profile` (
	`id` varchar(255) NOT NULL,
	`username` varchar(255) NOT NULL,
	`avatar` varchar(255) NOT NULL,
	`accessToken` varchar(255),
	`accessTokenExpires` timestamp,
	`refreshToken` varchar(255),
	CONSTRAINT `discord_profile_id` PRIMARY KEY(`id`),
	CONSTRAINT `username_idx` UNIQUE((lower(`username`)))
);

CREATE TABLE `github_profile` (
	`id` int NOT NULL,
	`login` varchar(255) NOT NULL,
	`avatarUrl` text,
	`pointsAY2023` int NOT NULL DEFAULT 0,
	`pointsAY2024` int NOT NULL DEFAULT 0,
	`pointsAY2025` int NOT NULL DEFAULT 0,
	`accessToken` varchar(255),
	`accessTokenExpires` timestamp,
	`refreshToken` varchar(255),
	CONSTRAINT `github_profile_id` PRIMARY KEY(`id`),
	CONSTRAINT `login_idx` UNIQUE((lower(`login`)))
);

CREATE TABLE `oauth_states` (
	`token` varchar(255) NOT NULL,
	`realm` enum('uga','discord','github') NOT NULL,
	`callbackPath` text NOT NULL DEFAULT ('/'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `oauth_states_token` PRIMARY KEY(`token`)
);

CREATE TABLE `session` (
	`token` varchar(255) NOT NULL,
	`userAgent` text,
	`userId` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `session_token` PRIMARY KEY(`token`)
);

CREATE TABLE `user` (
	`id` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`image` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`githubId` int,
	`discordId` varchar(255),
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_idx` UNIQUE((lower(`email`)))
);

ALTER TABLE `session` ADD CONSTRAINT `session_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `user` ADD CONSTRAINT `user_githubId_github_profile_id_fk` FOREIGN KEY (`githubId`) REFERENCES `github_profile`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `user` ADD CONSTRAINT `user_discordId_discord_profile_id_fk` FOREIGN KEY (`discordId`) REFERENCES `discord_profile`(`id`) ON DELETE set null ON UPDATE no action;
