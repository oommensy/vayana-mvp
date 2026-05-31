import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  User,
  aiChats,
  aiMessages,
  bookshelf,
  books,
  clubBooks,
  clubMembers,
  clubs,
  eventRsvps,
  events,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value !== undefined) {
      values[field] = value ?? null;
      updateSet[field] = value ?? null;
    }
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function updateUserProfile(
  id: number,
  data: {
    username?: string;
    bio?: string;
    avatarUrl?: string;
    preferredLanguage?: "en" | "ml";
    name?: string;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id));
}

// ─── Books ────────────────────────────────────────────────────────────────────

export async function listBooks(search?: string, language?: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(books);
  if (search) {
    query = query.where(
      or(
        like(books.title, `%${search}%`),
        like(books.author, `%${search}%`)
      )
    ) as typeof query;
  }
  return query.orderBy(desc(books.createdAt)).limit(limit).offset(offset);
}

export async function getBookById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(books).where(eq(books.id, id)).limit(1);
  return result[0];
}

export async function createBook(data: {
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  isbn?: string;
  language: "en" | "ml" | "both";
  genre?: string;
  publishedYear?: number;
  addedBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(books).values(data);
  return result[0];
}

// ─── Bookshelf ────────────────────────────────────────────────────────────────

export async function getUserBookshelf(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: bookshelf.id,
      userId: bookshelf.userId,
      bookId: bookshelf.bookId,
      status: bookshelf.status,
      progressPercent: bookshelf.progressPercent,
      rating: bookshelf.rating,
      review: bookshelf.review,
      startedAt: bookshelf.startedAt,
      completedAt: bookshelf.completedAt,
      updatedAt: bookshelf.updatedAt,
      book: {
        id: books.id,
        title: books.title,
        author: books.author,
        coverUrl: books.coverUrl,
        language: books.language,
        genre: books.genre,
      },
    })
    .from(bookshelf)
    .leftJoin(books, eq(bookshelf.bookId, books.id))
    .where(eq(bookshelf.userId, userId))
    .orderBy(desc(bookshelf.updatedAt));
}

export async function getBookshelfEntry(userId: number, bookId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(bookshelf)
    .where(and(eq(bookshelf.userId, userId), eq(bookshelf.bookId, bookId)))
    .limit(1);
  return result[0];
}

export async function upsertBookshelfEntry(data: {
  userId: number;
  bookId: number;
  status: "want_to_read" | "reading" | "completed";
  progressPercent?: number;
  rating?: number;
  review?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await getBookshelfEntry(data.userId, data.bookId);
  if (existing) {
    const updateData: Record<string, unknown> = {
      status: data.status,
      updatedAt: new Date(),
    };
    if (data.progressPercent !== undefined) updateData.progressPercent = data.progressPercent;
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.review !== undefined) updateData.review = data.review;
    if (data.status === "reading" && !existing.startedAt) updateData.startedAt = new Date();
    if (data.status === "completed") updateData.completedAt = new Date();
    await db.update(bookshelf).set(updateData).where(eq(bookshelf.id, existing.id));
    return existing.id;
  } else {
    const insertData: Record<string, unknown> = {
      userId: data.userId,
      bookId: data.bookId,
      status: data.status,
      progressPercent: data.progressPercent ?? 0,
    };
    if (data.rating !== undefined) insertData.rating = data.rating;
    if (data.review !== undefined) insertData.review = data.review;
    if (data.status === "reading") insertData.startedAt = new Date();
    if (data.status === "completed") {
      insertData.startedAt = new Date();
      insertData.completedAt = new Date();
    }
    const result = await db.insert(bookshelf).values(insertData as any);
    return result[0];
  }
}

export async function removeFromBookshelf(userId: number, bookId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(bookshelf)
    .where(and(eq(bookshelf.userId, userId), eq(bookshelf.bookId, bookId)));
}

// ─── Clubs ────────────────────────────────────────────────────────────────────

export async function listClubs(search?: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  const condition = search
    ? and(eq(clubs.isPrivate, false), like(clubs.name, `%${search}%`))
    : eq(clubs.isPrivate, false);
  return db
    .select({
      id: clubs.id,
      name: clubs.name,
      description: clubs.description,
      bannerUrl: clubs.bannerUrl,
      isPrivate: clubs.isPrivate,
      language: clubs.language,
      creatorId: clubs.creatorId,
      currentBookId: clubs.currentBookId,
      memberCount: clubs.memberCount,
      createdAt: clubs.createdAt,
    })
    .from(clubs)
    .where(condition)
    .orderBy(desc(clubs.memberCount))
    .limit(limit)
    .offset(offset);
}

export async function getClubById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clubs).where(eq(clubs.id, id)).limit(1);
  return result[0];
}

export async function createClub(data: {
  name: string;
  description?: string;
  isPrivate: boolean;
  language: "en" | "ml" | "both";
  creatorId: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(clubs).values({ ...data, memberCount: 1 });
  const insertId = (result[0] as any).insertId as number;
  // Auto-add creator as admin member
  await db.insert(clubMembers).values({
    clubId: insertId,
    userId: data.creatorId,
    role: "admin",
  });
  return insertId;
}

export async function getClubMember(clubId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(clubMembers)
    .where(and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)))
    .limit(1);
  return result[0];
}

export async function joinClub(clubId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await getClubMember(clubId, userId);
  if (existing) return;
  await db.insert(clubMembers).values({ clubId, userId, role: "member" });
  await db
    .update(clubs)
    .set({ memberCount: sql`${clubs.memberCount} + 1` })
    .where(eq(clubs.id, clubId));
}

export async function leaveClub(clubId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(clubMembers)
    .where(and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)));
  await db
    .update(clubs)
    .set({ memberCount: sql`GREATEST(${clubs.memberCount} - 1, 0)` })
    .where(eq(clubs.id, clubId));
}

export async function getClubMembers(clubId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: clubMembers.id,
      clubId: clubMembers.clubId,
      userId: clubMembers.userId,
      role: clubMembers.role,
      joinedAt: clubMembers.joinedAt,
      user: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
        username: users.username,
      },
    })
    .from(clubMembers)
    .leftJoin(users, eq(clubMembers.userId, users.id))
    .where(eq(clubMembers.clubId, clubId))
    .orderBy(clubMembers.joinedAt);
}

export async function getUserClubs(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: clubs.id,
      name: clubs.name,
      description: clubs.description,
      bannerUrl: clubs.bannerUrl,
      language: clubs.language,
      memberCount: clubs.memberCount,
      role: clubMembers.role,
    })
    .from(clubMembers)
    .leftJoin(clubs, eq(clubMembers.clubId, clubs.id))
    .where(eq(clubMembers.userId, userId));
}

export async function setClubCurrentBook(clubId: number, bookId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(clubs).set({ currentBookId: bookId }).where(eq(clubs.id, clubId));
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function listEvents(clubId?: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  let query = db
    .select({
      id: events.id,
      clubId: events.clubId,
      title: events.title,
      description: events.description,
      eventDate: events.eventDate,
      location: events.location,
      meetingLink: events.meetingLink,
      isVirtual: events.isVirtual,
      bookId: events.bookId,
      createdBy: events.createdBy,
      rsvpCount: events.rsvpCount,
      createdAt: events.createdAt,
      creator: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(events)
    .leftJoin(users, eq(events.createdBy, users.id));
  if (clubId) {
    query = query.where(eq(events.clubId, clubId)) as typeof query;
  }
  return query.orderBy(events.eventDate).limit(limit).offset(offset);
}

export async function getEventById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select({
      id: events.id,
      clubId: events.clubId,
      title: events.title,
      description: events.description,
      eventDate: events.eventDate,
      location: events.location,
      meetingLink: events.meetingLink,
      isVirtual: events.isVirtual,
      bookId: events.bookId,
      createdBy: events.createdBy,
      rsvpCount: events.rsvpCount,
      createdAt: events.createdAt,
      creator: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(events)
    .leftJoin(users, eq(events.createdBy, users.id))
    .where(eq(events.id, id))
    .limit(1);
  return result[0];
}

export async function createEvent(data: {
  clubId?: number;
  title: string;
  description?: string;
  eventDate: Date;
  location?: string;
  meetingLink?: string;
  isVirtual: boolean;
  bookId?: number;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(events).values(data);
  return (result[0] as any).insertId as number;
}

export async function getUserRsvp(eventId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(eventRsvps)
    .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)))
    .limit(1);
  return result[0];
}

export async function upsertRsvp(
  eventId: number,
  userId: number,
  status: "going" | "maybe" | "not_going"
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await getUserRsvp(eventId, userId);
  if (existing) {
    await db
      .update(eventRsvps)
      .set({ status })
      .where(eq(eventRsvps.id, existing.id));
  } else {
    await db.insert(eventRsvps).values({ eventId, userId, status });
    if (status === "going") {
      await db
        .update(events)
        .set({ rsvpCount: sql`${events.rsvpCount} + 1` })
        .where(eq(events.id, eventId));
    }
  }
}

export async function getEventRsvps(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: eventRsvps.id,
      status: eventRsvps.status,
      user: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(eventRsvps)
    .leftJoin(users, eq(eventRsvps.userId, users.id))
    .where(eq(eventRsvps.eventId, eventId));
}

// ─── AI Chats ─────────────────────────────────────────────────────────────────

export async function getUserAiChats(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: aiChats.id,
      userId: aiChats.userId,
      bookId: aiChats.bookId,
      title: aiChats.title,
      language: aiChats.language,
      createdAt: aiChats.createdAt,
      updatedAt: aiChats.updatedAt,
      book: {
        id: books.id,
        title: books.title,
        author: books.author,
        coverUrl: books.coverUrl,
      },
    })
    .from(aiChats)
    .leftJoin(books, eq(aiChats.bookId, books.id))
    .where(eq(aiChats.userId, userId))
    .orderBy(desc(aiChats.updatedAt));
}

export async function getAiChatById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(aiChats)
    .where(and(eq(aiChats.id, id), eq(aiChats.userId, userId)))
    .limit(1);
  return result[0];
}

export async function createAiChat(data: {
  userId: number;
  bookId?: number;
  title: string;
  language: "en" | "ml";
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(aiChats).values(data);
  return (result[0] as any).insertId as number;
}

export async function getChatMessages(chatId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(aiMessages)
    .where(eq(aiMessages.chatId, chatId))
    .orderBy(aiMessages.createdAt);
}

export async function saveAiMessage(data: {
  chatId: number;
  sender: "user" | "assistant";
  content: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(aiMessages).values(data);
  // Update chat updatedAt
  await db.update(aiChats).set({ updatedAt: new Date() }).where(eq(aiChats.id, data.chatId));
}
