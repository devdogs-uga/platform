CREATE TABLE `authorization` (
	`id` varchar(255) PRIMARY KEY,
	`accessToken` text NOT NULL,
	`accessTokenExpires` timestamp,
	`refreshToken` text
);

CREATE TABLE `discord_profile` (
	`id` varchar(255) PRIMARY KEY,
	`username` varchar(255) NOT NULL,
	`avatar` varchar(255) NOT NULL,
	`authorizationId` varchar(255),
	CONSTRAINT `username_idx` UNIQUE INDEX((lower(`username`)))
);

CREATE TABLE `github_profile` (
	`id` int PRIMARY KEY,
	`login` varchar(255) NOT NULL,
	`avatarUrl` text,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`points` int NOT NULL DEFAULT 0,
	`ranking` int,
	`authorizationId` varchar(255),
	CONSTRAINT `login_idx` UNIQUE INDEX((lower(`login`)))
);

CREATE TABLE `oauth_states` (
	`token` varchar(255) PRIMARY KEY,
	`realm` enum('uga','discord','github') NOT NULL,
	`callbackPath` text NOT NULL DEFAULT ('/'),
	`createdAt` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE `public_profile` (
	`id` varchar(255) PRIMARY KEY,
	`name` varchar(255) NOT NULL,
	`email` varchar(255),
	`image` text,
	`githubUsername` varchar(255),
	`discordUsername` varchar(255),
	`linkedinUsername` varchar(255),
	`instagramUsername` varchar(255),
	`portfolioUrl` text
);

CREATE TABLE `session` (
	`token` varchar(255) PRIMARY KEY,
	`userAgent` text,
	`userId` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE `user` (
	`id` varchar(255) PRIMARY KEY,
	`ugaMyId` varchar(255) NOT NULL,
	`legalName` varchar(255) NOT NULL,
	`viewedSettings` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`githubId` int,
	`discordId` varchar(255)
);

ALTER TABLE `discord_profile` ADD CONSTRAINT `discord_profile_authorizationId_authorization_id_fkey` FOREIGN KEY (`authorizationId`) REFERENCES `authorization`(`id`);
ALTER TABLE `github_profile` ADD CONSTRAINT `github_profile_authorizationId_authorization_id_fkey` FOREIGN KEY (`authorizationId`) REFERENCES `authorization`(`id`);
ALTER TABLE `public_profile` ADD CONSTRAINT `public_profile_id_user_id_fkey` FOREIGN KEY (`id`) REFERENCES `user`(`id`) ON DELETE CASCADE;
ALTER TABLE `session` ADD CONSTRAINT `session_userId_user_id_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE;
ALTER TABLE `user` ADD CONSTRAINT `user_githubId_github_profile_id_fkey` FOREIGN KEY (`githubId`) REFERENCES `github_profile`(`id`) ON DELETE SET NULL;
ALTER TABLE `user` ADD CONSTRAINT `user_discordId_discord_profile_id_fkey` FOREIGN KEY (`discordId`) REFERENCES `discord_profile`(`id`) ON DELETE SET NULL;
