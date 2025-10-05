CREATE TABLE `like` (
	`userId` varchar(255) NOT NULL,
	`postId` varchar(255) NOT NULL,
	CONSTRAINT `like_userId_postId_pk` PRIMARY KEY(`userId`,`postId`)
);
--> statement-breakpoint
ALTER TABLE `post` ADD `likes` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `like` ADD CONSTRAINT `like_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `like` ADD CONSTRAINT `like_postId_post_id_fk` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE no action ON UPDATE no action;