CREATE TABLE `oauth_states` (
	`token` varchar(255) NOT NULL,
	`callbackPath` varchar(255) NOT NULL DEFAULT '/',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `oauth_states_token` PRIMARY KEY(`token`)
);
