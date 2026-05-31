import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
} from "drizzle-orm/mysql-core";

// ─── Users ──────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Extended profile fields
  username: varchar("username", { length: 64 }),
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  preferredLanguage: mysqlEnum("preferredLanguage", ["en", "ml"]).default("en").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Books ───────────────────────────────────────────────────────────────────
export const books = mysqlTable("books", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description"),
  coverUrl: text("coverUrl"),
  isbn: varchar("isbn", { length: 20 }),
  language: mysqlEnum("language", ["en", "ml", "both"]).default("en").notNull(),
  genre: varchar("genre", { length: 100 }),
  publishedYear: int("publishedYear"),
  addedBy: int("addedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Book = typeof books.$inferSelect;
export type InsertBook = typeof books.$inferInsert;

// ─── Bookshelf ────────────────────────────────────────────────────────────────
export const bookshelf = mysqlTable("bookshelf", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  bookId: int("bookId").notNull(),
  status: mysqlEnum("status", ["want_to_read", "reading", "completed"]).default("want_to_read").notNull(),
  progressPercent: int("progressPercent").default(0).notNull(),
  rating: int("rating"), // 1-5
  review: text("review"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Bookshelf = typeof bookshelf.$inferSelect;
export type InsertBookshelf = typeof bookshelf.$inferInsert;

// ─── Reading Clubs ────────────────────────────────────────────────────────────
export const clubs = mysqlTable("clubs", {
  id: int("id").autoincrement().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  bannerUrl: text("bannerUrl"),
  isPrivate: boolean("isPrivate").default(false).notNull(),
  language: mysqlEnum("language", ["en", "ml", "both"]).default("both").notNull(),
  creatorId: int("creatorId").notNull(),
  currentBookId: int("currentBookId"),
  memberCount: int("memberCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Club = typeof clubs.$inferSelect;
export type InsertClub = typeof clubs.$inferInsert;

// ─── Club Members ─────────────────────────────────────────────────────────────
export const clubMembers = mysqlTable("club_members", {
  id: int("id").autoincrement().primaryKey(),
  clubId: int("clubId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["admin", "member"]).default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type ClubMember = typeof clubMembers.$inferSelect;
export type InsertClubMember = typeof clubMembers.$inferInsert;

// ─── Club Books ───────────────────────────────────────────────────────────────
export const clubBooks = mysqlTable("club_books", {
  id: int("id").autoincrement().primaryKey(),
  clubId: int("clubId").notNull(),
  bookId: int("bookId").notNull(),
  status: mysqlEnum("status", ["upcoming", "reading", "completed"]).default("upcoming").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  addedBy: int("addedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClubBook = typeof clubBooks.$inferSelect;
export type InsertClubBook = typeof clubBooks.$inferInsert;

// ─── Events ───────────────────────────────────────────────────────────────────
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  clubId: int("clubId"),
  title: text("title").notNull(),
  description: text("description"),
  eventDate: timestamp("eventDate").notNull(),
  location: text("location"), // physical address
  meetingLink: text("meetingLink"), // virtual link
  isVirtual: boolean("isVirtual").default(false).notNull(),
  bookId: int("bookId"),
  createdBy: int("createdBy").notNull(),
  rsvpCount: int("rsvpCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// ─── Event RSVPs ──────────────────────────────────────────────────────────────
export const eventRsvps = mysqlTable("event_rsvps", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["going", "maybe", "not_going"]).default("going").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventRsvp = typeof eventRsvps.$inferSelect;
export type InsertEventRsvp = typeof eventRsvps.$inferInsert;

// ─── AI Chats ─────────────────────────────────────────────────────────────────
export const aiChats = mysqlTable("ai_chats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  bookId: int("bookId"),
  title: text("title").notNull(),
  language: mysqlEnum("language", ["en", "ml"]).default("en").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiChat = typeof aiChats.$inferSelect;
export type InsertAiChat = typeof aiChats.$inferInsert;

// ─── AI Messages ──────────────────────────────────────────────────────────────
export const aiMessages = mysqlTable("ai_messages", {
  id: int("id").autoincrement().primaryKey(),
  chatId: int("chatId").notNull(),
  sender: mysqlEnum("sender", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiMessage = typeof aiMessages.$inferSelect;
export type InsertAiMessage = typeof aiMessages.$inferInsert;
