import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createAiChat,
  createBook,
  createClub,
  createEvent,
  getAiChatById,
  getBookById,
  getChatMessages,
  getClubById,
  getClubMember,
  getClubMembers,
  getEventById,
  getEventRsvps,
  getUserAiChats,
  getUserBookshelf,
  getUserById,
  getUserClubs,
  getUserRsvp,
  joinClub,
  leaveClub,
  listBooks,
  listClubs,
  listEvents,
  removeFromBookshelf,
  saveAiMessage,
  setClubCurrentBook,
  updateUserProfile,
  upsertBookshelfEntry,
  upsertRsvp,
  upsertUser,
} from "./db";
import { invokeLLM } from "./_core/llm";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

// ─── Users Router ─────────────────────────────────────────────────────────────
const usersRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserById(ctx.user.id);
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    return user;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        username: z.string().min(2).max(64).optional(),
        bio: z.string().max(500).optional(),
        avatarUrl: z.string().url().optional().or(z.literal("")),
        preferredLanguage: z.enum(["en", "ml"]).optional(),
        name: z.string().min(1).max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),
});

// ─── Books Router ─────────────────────────────────────────────────────────────
const booksRouter = router({
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        language: z.enum(["en", "ml", "both"]).optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return listBooks(input.search, input.language, input.limit, input.offset);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const book = await getBookById(input.id);
      if (!book) throw new TRPCError({ code: "NOT_FOUND" });
      return book;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(500),
        author: z.string().min(1).max(300),
        description: z.string().max(2000).optional(),
        coverUrl: z.string().url().optional().or(z.literal("")),
        isbn: z.string().max(20).optional(),
        language: z.enum(["en", "ml", "both"]),
        genre: z.string().max(100).optional(),
        publishedYear: z.number().min(1000).max(2030).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await createBook({ ...input, addedBy: ctx.user.id });
      return { success: true };
    }),
});

// ─── Bookshelf Router ─────────────────────────────────────────────────────────
const bookshelfRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getUserBookshelf(ctx.user.id);
  }),

  upsert: protectedProcedure
    .input(
      z.object({
        bookId: z.number(),
        status: z.enum(["want_to_read", "reading", "completed"]),
        progressPercent: z.number().min(0).max(100).optional(),
        rating: z.number().min(1).max(5).optional(),
        review: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await upsertBookshelfEntry({ userId: ctx.user.id, ...input });
      return { success: true };
    }),

  remove: protectedProcedure
    .input(z.object({ bookId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await removeFromBookshelf(ctx.user.id, input.bookId);
      return { success: true };
    }),
});

// ─── Clubs Router ─────────────────────────────────────────────────────────────
const clubsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return listClubs(input.search, input.limit, input.offset);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const club = await getClubById(input.id);
      if (!club) throw new TRPCError({ code: "NOT_FOUND" });
      return club;
    }),

  getMembers: publicProcedure
    .input(z.object({ clubId: z.number() }))
    .query(async ({ input }) => {
      return getClubMembers(input.clubId);
    }),

  myClubs: protectedProcedure.query(async ({ ctx }) => {
    return getUserClubs(ctx.user.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(200),
        description: z.string().max(1000).optional(),
        isPrivate: z.boolean().default(false),
        language: z.enum(["en", "ml", "both"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const clubId = await createClub({ ...input, creatorId: ctx.user.id });
      return { success: true, clubId };
    }),

  join: protectedProcedure
    .input(z.object({ clubId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const club = await getClubById(input.clubId);
      if (!club) throw new TRPCError({ code: "NOT_FOUND" });
      if (club.isPrivate) throw new TRPCError({ code: "FORBIDDEN", message: "This club is private" });
      await joinClub(input.clubId, ctx.user.id);
      return { success: true };
    }),

  leave: protectedProcedure
    .input(z.object({ clubId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await leaveClub(input.clubId, ctx.user.id);
      return { success: true };
    }),

  setCurrentBook: protectedProcedure
    .input(z.object({ clubId: z.number(), bookId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const member = await getClubMember(input.clubId, ctx.user.id);
      if (!member || member.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can set the current book" });
      }
      await setClubCurrentBook(input.clubId, input.bookId);
      return { success: true };
    }),

  getMembership: protectedProcedure
    .input(z.object({ clubId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getClubMember(input.clubId, ctx.user.id);
    }),
});

// ─── Events Router ────────────────────────────────────────────────────────────
const eventsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        clubId: z.number().optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return listEvents(input.clubId, input.limit, input.offset);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const event = await getEventById(input.id);
      if (!event) throw new TRPCError({ code: "NOT_FOUND" });
      return event;
    }),

  getRsvps: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      return getEventRsvps(input.eventId);
    }),

  getMyRsvp: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getUserRsvp(input.eventId, ctx.user.id);
    }),

  create: protectedProcedure
    .input(
      z.object({
        clubId: z.number().optional(),
        title: z.string().min(2).max(300),
        description: z.string().max(2000).optional(),
        eventDate: z.number(), // Unix ms timestamp
        location: z.string().max(500).optional(),
        meetingLink: z.string().url().optional().or(z.literal("")),
        isVirtual: z.boolean().default(false),
        bookId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const eventId = await createEvent({
        ...input,
        eventDate: new Date(input.eventDate),
        createdBy: ctx.user.id,
      });
      return { success: true, eventId };
    }),

  rsvp: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
        status: z.enum(["going", "maybe", "not_going"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await upsertRsvp(input.eventId, ctx.user.id, input.status);
      return { success: true };
    }),
});

// ─── AI Coach Router ──────────────────────────────────────────────────────────
const aiCoachRouter = router({
  listChats: protectedProcedure.query(async ({ ctx }) => {
    return getUserAiChats(ctx.user.id);
  }),

  getChat: protectedProcedure
    .input(z.object({ chatId: z.number() }))
    .query(async ({ ctx, input }) => {
      const chat = await getAiChatById(input.chatId, ctx.user.id);
      if (!chat) throw new TRPCError({ code: "NOT_FOUND" });
      const messages = await getChatMessages(input.chatId);
      return { chat, messages };
    }),

  createChat: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        bookId: z.number().optional(),
        language: z.enum(["en", "ml"]).default("en"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const chatId = await createAiChat({ userId: ctx.user.id, ...input });
      return { success: true, chatId };
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        chatId: z.number(),
        message: z.string().min(1).max(4000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const chat = await getAiChatById(input.chatId, ctx.user.id);
      if (!chat) throw new TRPCError({ code: "NOT_FOUND" });

      // Save user message
      await saveAiMessage({ chatId: input.chatId, sender: "user", content: input.message });

      // Get conversation history (last 20 messages for context)
      const history = await getChatMessages(input.chatId);
      const recentHistory = history.slice(-20);

      // Get book context if available
      let bookContext = "";
      if (chat.bookId) {
        const book = await getBookById(chat.bookId);
        if (book) {
          bookContext = `\n\nBook Context: "${book.title}" by ${book.author}${book.description ? `\nDescription: ${book.description}` : ""}`;
        }
      }

      const isML = chat.language === "ml";
      const systemPrompt = isML
        ? `നിങ്ങൾ "വായന ആശാൻ" ആണ്, ഒരു ദ്വിഭാഷ AI വായനാ സഹായി. നിങ്ങൾ മലയാള സാഹിത്യത്തിലും ലോക സാഹിത്യത്തിലും വിദഗ്ധനാണ്. തകഴി, ബഷീർ, എം.ടി. വാസുദേവൻ നായർ, മാധവിക്കുട്ടി, ഒ.വി. വിജയൻ, ബെന്യാമിൻ, കെ.ആർ. മീര, സുഭാഷ് ചന്ദ്രൻ തുടങ്ങിയ എഴുത്തുകാരെക്കുറിച്ച് നിങ്ങൾക്ക് ആഴമായ അറിവുണ്ട്. ഉപയോക്താവ് ആവശ്യപ്പെടുന്ന ഭാഷയിൽ (മലയാളം, ഇംഗ്ലീഷ്, അല്ലെങ്കിൽ മംഗ്ലീഷ്) ഉത്തരം നൽകൂ. സഹായകരവും ഉൾക്കാഴ്ചയുള്ളതും ആകർഷകവുമായ ഒരു ചർച്ച നടത്തൂ.${bookContext}`
        : `You are "Vayana Ashan" (വായന ആശാൻ), a bilingual AI reading companion for the Vayana reading community. You are deeply knowledgeable about Malayalam literature (Thakazhi, Basheer, MT Vasudevan Nair, Madhavikutty, O.V. Vijayan, Benyamin, K.R. Meera, Subhash Chandran) and world literature. You can discuss books in English, Malayalam, or Manglish (Malayalam in English script) based on the user's preference. Provide insightful literary analysis, chapter summaries, vocabulary help, cultural context, and engaging book discussions. Be warm, encouraging, and intellectually stimulating.${bookContext}`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...recentHistory.map((m) => ({
          role: m.sender as "user" | "assistant",
          content: m.content as string,
        })),
      ];

      const response = await invokeLLM({ messages });
      const rawContent = response.choices?.[0]?.message?.content;
      const assistantContent = typeof rawContent === 'string' ? rawContent : "I'm sorry, I couldn't generate a response.";

      // Save assistant message
      await saveAiMessage({ chatId: input.chatId, sender: "assistant", content: assistantContent });

      return { reply: assistantContent };
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  users: usersRouter,
  books: booksRouter,
  bookshelf: bookshelfRouter,
  clubs: clubsRouter,
  events: eventsRouter,
  aiCoach: aiCoachRouter,
});

export type AppRouter = typeof appRouter;
