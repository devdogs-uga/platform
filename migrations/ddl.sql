CREATE TABLE `access_token` (
	`id` varchar(255) PRIMARY KEY,
	`accessToken` text NOT NULL,
	`accessTokenExpires` timestamp,
	`refreshToken` text
);

CREATE TABLE `authorization_code` (
	`code` varchar(255) PRIMARY KEY,
	`clientId` varchar(255),
	`redirectUri` text NOT NULL,
	`state` text,
	`userId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE `discord_profile` (
	`id` varchar(255) PRIMARY KEY,
	`username` varchar(255) NOT NULL,
	`avatar` varchar(255),
	`accessTokenId` varchar(255),
	CONSTRAINT `username_idx` UNIQUE INDEX((lower(`username`)))
);

CREATE TABLE `github_profile` (
	`id` int PRIMARY KEY,
	`login` varchar(255) NOT NULL,
	`avatarUrl` text,
	`allTimePoints` int NOT NULL DEFAULT 0,
	`allTimeRanking` int,
	`currentYearPoints` int NOT NULL DEFAULT 0,
	`currentYearRanking` int,
	`accessTokenId` varchar(255),
	CONSTRAINT `login_unique` UNIQUE INDEX(`login`),
	CONSTRAINT `login_idx` UNIQUE INDEX((lower(`login`)))
);

CREATE TABLE `oauth_key` (
	`userId` varchar(255) PRIMARY KEY,
	`clientId` varchar(255) NOT NULL,
	`clientSecret` varchar(255) NOT NULL,
	`lastUpdated` timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientId_unique` UNIQUE INDEX(`clientId`),
	CONSTRAINT `clientSecret_unique` UNIQUE INDEX(`clientSecret`)
);

CREATE TABLE `oauth_state` (
	`token` varchar(255) PRIMARY KEY,
	`provider` enum('google','discord','github') NOT NULL,
	`callbackPath` text NOT NULL DEFAULT ('/'),
	`createdAt` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE `points` (
	`githubProfileId` int NOT NULL,
	`year` int NOT NULL,
	`streakStart` date NOT NULL,
	`streakLength` int NOT NULL DEFAULT 0,
	`longestStreakLength` int NOT NULL DEFAULT 0,
	`projectPoints` int NOT NULL DEFAULT 0,
	`streakBonusPoints` int NOT NULL DEFAULT 0,
	`academyPoints` int NOT NULL DEFAULT 0,
	`points` int GENERATED ALWAYS AS (`points`.`projectPoints` + `points`.`streakBonusPoints` + `points`.`academyPoints`) STORED NOT NULL,
	CONSTRAINT `PRIMARY` PRIMARY KEY(`githubProfileId`,`year`)
);

CREATE TABLE `public_profile` (
	`userId` varchar(255) PRIMARY KEY,
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

CREATE TABLE `tic_tac_toe_key` (
	`userId` varchar(255) PRIMARY KEY,
	`publicKey` varchar(255) NOT NULL,
	`lastUpdated` timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `publicKey_unique` UNIQUE INDEX(`publicKey`)
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

ALTER TABLE `authorization_code` ADD CONSTRAINT `authorization_code_clientId_oauth_key_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `oauth_key`(`clientId`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `authorization_code` ADD CONSTRAINT `authorization_code_userId_user_id_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `discord_profile` ADD CONSTRAINT `discord_profile_accessTokenId_access_token_id_fkey` FOREIGN KEY (`accessTokenId`) REFERENCES `access_token`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `github_profile` ADD CONSTRAINT `github_profile_accessTokenId_access_token_id_fkey` FOREIGN KEY (`accessTokenId`) REFERENCES `access_token`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `oauth_key` ADD CONSTRAINT `oauth_key_userId_user_id_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `points` ADD CONSTRAINT `points_githubProfileId_github_profile_id_fkey` FOREIGN KEY (`githubProfileId`) REFERENCES `github_profile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `public_profile` ADD CONSTRAINT `public_profile_userId_user_id_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `session` ADD CONSTRAINT `session_userId_user_id_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `tic_tac_toe_key` ADD CONSTRAINT `tic_tac_toe_key_userId_user_id_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user` ADD CONSTRAINT `user_githubId_github_profile_id_fkey` FOREIGN KEY (`githubId`) REFERENCES `github_profile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `user` ADD CONSTRAINT `user_discordId_discord_profile_id_fkey` FOREIGN KEY (`discordId`) REFERENCES `discord_profile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
