CREATE TABLE `ai_chats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bookId` int,
	`title` text NOT NULL,
	`language` enum('en','ml') NOT NULL DEFAULT 'en',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_chats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chatId` int NOT NULL,
	`sender` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `books` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`description` text,
	`coverUrl` text,
	`isbn` varchar(20),
	`language` enum('en','ml','both') NOT NULL DEFAULT 'en',
	`genre` varchar(100),
	`publishedYear` int,
	`addedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `books_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookshelf` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bookId` int NOT NULL,
	`status` enum('want_to_read','reading','completed') NOT NULL DEFAULT 'want_to_read',
	`progressPercent` int NOT NULL DEFAULT 0,
	`rating` int,
	`review` text,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookshelf_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `club_books` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clubId` int NOT NULL,
	`bookId` int NOT NULL,
	`status` enum('upcoming','reading','completed') NOT NULL DEFAULT 'upcoming',
	`startDate` timestamp,
	`endDate` timestamp,
	`addedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `club_books_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `club_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clubId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('admin','member') NOT NULL DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `club_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clubs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`bannerUrl` text,
	`isPrivate` boolean NOT NULL DEFAULT false,
	`language` enum('en','ml','both') NOT NULL DEFAULT 'both',
	`creatorId` int NOT NULL,
	`currentBookId` int,
	`memberCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clubs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_rsvps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`userId` int NOT NULL,
	`status` enum('going','maybe','not_going') NOT NULL DEFAULT 'going',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `event_rsvps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clubId` int,
	`title` text NOT NULL,
	`description` text,
	`eventDate` timestamp NOT NULL,
	`location` text,
	`meetingLink` text,
	`isVirtual` boolean NOT NULL DEFAULT false,
	`bookId` int,
	`createdBy` int NOT NULL,
	`rsvpCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `preferredLanguage` enum('en','ml') DEFAULT 'en' NOT NULL;