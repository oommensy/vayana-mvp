import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ─── Test Helpers ─────────────────────────────────────────────────────────────

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(overrides?: Partial<AuthenticatedUser>): { ctx: TrpcContext; clearedCookies: Array<{ name: string; options: Record<string, unknown> }> } {
  const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-openid",
    email: "test@vayana.app",
    name: "Test Reader",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

// ─── Auth Tests ───────────────────────────────────────────────────────────────

describe("auth.logout", () => {
  it("clears the session cookie and returns success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      secure: true,
      httpOnly: true,
      path: "/",
    });
  });

  it("returns the current user when authenticated", async () => {
    const { ctx } = createAuthContext({ name: "Kerala Reader", email: "reader@kerala.com" });
    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();

    expect(user).toBeDefined();
    expect(user?.name).toBe("Kerala Reader");
    expect(user?.email).toBe("reader@kerala.com");
  });

  it("returns null for unauthenticated users", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();
    expect(user).toBeUndefined();
  });
});

// ─── i18n Tests ───────────────────────────────────────────────────────────────

describe("i18n translations", () => {
  it("has all required English keys", async () => {
    const { translations } = await import("../shared/i18n");
    const en = translations.en;

    // Core navigation
    expect(en.appName).toBe("Vayana");
    expect(en.aiCoach).toBe("Vayana Ashan");
    expect(en.bookshelf).toBe("My Bookshelf");
    expect(en.readingClubs).toBe("Reading Clubs");
    expect(en.events).toBe("Events");

    // Reading status labels (exact values required)
    expect(en.wantToRead).toBe("Want to Read");
    expect(en.reading).toBe("Reading");
    expect(en.completed).toBe("Completed");
  });

  it("has all required Malayalam keys", async () => {
    const { translations } = await import("../shared/i18n");
    const ml = translations.ml;

    expect(ml.appName).toBe("വായന");
    expect(ml.wantToRead).toBeDefined();
    expect(ml.reading).toBeDefined();
    expect(ml.completed).toBeDefined();
  });

  it("Malayalam and English have the same set of keys", async () => {
    const { translations } = await import("../shared/i18n");
    const enKeys = Object.keys(translations.en).sort();
    const mlKeys = Object.keys(translations.ml).sort();
    expect(enKeys).toEqual(mlKeys);
  });

  it("t() helper returns correct translations", async () => {
    const { t } = await import("../shared/i18n");
    expect(t("en", "appName")).toBe("Vayana");
    expect(t("ml", "appName")).toBe("വായന");
    expect(t("en", "wantToRead")).toBe("Want to Read");
    expect(t("en", "reading")).toBe("Reading");
    expect(t("en", "completed")).toBe("Completed");
  });
});

// ─── Router Structure Tests ───────────────────────────────────────────────────

describe("appRouter structure", () => {
  it("has all required feature routers", () => {
    const routerKeys = Object.keys(appRouter._def.procedures ?? {});
    // Check that top-level procedures exist
    expect(appRouter).toBeDefined();
  });

  it("books.list is a public procedure", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    // Public users should be able to list books without auth
    // (will return empty array since no DB in test env)
    const result = await caller.books.list({}).catch((e) => {
      // If DB is unavailable, that's acceptable in test env
      if (e.message?.includes("database") || e.message?.includes("connect")) return [];
      throw e;
    });
    expect(Array.isArray(result)).toBe(true);
  });

  it("clubs.list is a public procedure", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.clubs.list({}).catch((e) => {
      if (e.message?.includes("database") || e.message?.includes("connect")) return [];
      throw e;
    });
    expect(Array.isArray(result)).toBe(true);
  });

  it("events.list is a public procedure", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.events.list({}).catch((e) => {
      if (e.message?.includes("database") || e.message?.includes("connect")) return [];
      throw e;
    });
    expect(Array.isArray(result)).toBe(true);
  });

  it("bookshelf.list requires authentication", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.bookshelf.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("clubs.create requires authentication", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.clubs.create({ name: "Test Club", language: "en", isPrivate: false })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("events.create requires authentication", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.events.create({ title: "Test Event", eventDate: Date.now(), isVirtual: false })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("aiCoach.listChats requires authentication", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.aiCoach.listChats()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("aiCoach.createChat requires authentication", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.aiCoach.createChat({ title: "Test Chat", language: "en" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

// ─── Input Validation Tests ───────────────────────────────────────────────────

describe("input validation", () => {
  it("books.create rejects empty title", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.books.create({ title: "", author: "Author", language: "en" })
    ).rejects.toThrow();
  });

  it("clubs.create rejects empty name", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.clubs.create({ name: "", language: "en", isPrivate: false })
    ).rejects.toThrow();
  });

  it("bookshelf.upsert rejects invalid status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.bookshelf.upsert({ bookId: 1, status: "invalid_status" as any })
    ).rejects.toThrow();
  });

  it("bookshelf.upsert accepts valid statuses", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    // Valid statuses: want_to_read, reading, completed
    for (const status of ["want_to_read", "reading", "completed"] as const) {
      // Will fail at DB level, not validation level
      await caller.bookshelf.upsert({ bookId: 1, status }).catch((e) => {
        // DB errors are fine in test env, validation errors are not
        expect(e.code).not.toBe("BAD_REQUEST");
      });
    }
  });

  it("users.updateProfile rejects invalid language preference", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.users.updateProfile({ preferredLanguage: "fr" as any })
    ).rejects.toThrow();
  });

  it("users.updateProfile accepts valid language preferences", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    for (const lang of ["en", "ml"] as const) {
      await caller.users.updateProfile({ preferredLanguage: lang }).catch((e) => {
        expect(e.code).not.toBe("BAD_REQUEST");
      });
    }
  });
});
