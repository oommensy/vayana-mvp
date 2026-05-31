import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { BookOpen, MessageSquare, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getLoginUrl } from "@/const";

export default function AiCoach() {
  const { lang, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: chats, isLoading } = trpc.aiCoach.listChats.useQuery(undefined, { enabled: isAuthenticated });

  const createChat = trpc.aiCoach.createChat.useMutation({
    onSuccess: (_data) => {
      utils.aiCoach.listChats.invalidate();
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center page-enter">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 rounded-3xl vayana-gradient flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className={cn("font-serif font-bold text-2xl text-foreground mb-3", lang === "ml" && "font-malayalam")}>
            {t("vayanaAshan")}
          </h1>
          <p className={cn("text-muted-foreground mb-6 leading-relaxed", lang === "ml" && "font-malayalam")}>
            {lang === "ml"
              ? "നിങ്ങളുടെ AI വായനാ സഖി. ഏതൊരു പുസ്തകത്തെക്കുറിച്ചും ചോദിക്കൂ."
              : "Your bilingual AI reading companion. Ask about any book, author, or literary topic in Malayalam or English."}
          </p>
          <Button
            className="bg-primary text-primary-foreground px-8"
            onClick={() => { window.location.href = getLoginUrl(); }}
          >
            {t("login")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-enter">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl vayana-gradient flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={cn("text-2xl font-serif font-bold text-foreground", lang === "ml" && "font-malayalam")}>
                {t("vayanaAshan")}
              </h1>
              <p className={cn("text-muted-foreground text-sm", lang === "ml" && "font-malayalam")}>
                {t("aiCoachSubtitle")}
              </p>
            </div>
          </div>
          <Link href="/ai/chat/new">
            <Button className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              {t("newChat")}
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: "📚",
              title: lang === "ml" ? "സാഹിത്യ വിശകലനം" : "Literary Analysis",
              desc: lang === "ml" ? "കഥകൾ, കഥാപാത്രങ്ങൾ, ഇതിവൃത്തം" : "Characters, themes, plot analysis",
            },
            {
              icon: "📖",
              title: lang === "ml" ? "അദ്ധ്യായ സംഗ്രഹം" : "Chapter Summaries",
              desc: lang === "ml" ? "ഏതൊരു അദ്ധ്യായത്തിന്റെയും ചുരുക്കം" : "Quick summaries of any chapter",
            },
            {
              icon: "🔤",
              title: lang === "ml" ? "പദ സഹായം" : "Vocabulary Help",
              desc: lang === "ml" ? "ഭാഷ, അർഥം, ഉദ്ധരണി" : "Meanings, etymology, quotes",
            },
          ].map((f) => (
            <Link key={f.title} href="/ai/chat/new">
              <div className="bg-white rounded-2xl border border-border shadow-sm p-5 hover:shadow-md transition-all duration-200 cursor-pointer group">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className={cn("font-serif font-semibold text-sm text-foreground mb-1", lang === "ml" && "font-malayalam")}>
                  {f.title}
                </h3>
                <p className={cn("text-xs text-muted-foreground", lang === "ml" && "font-malayalam")}>{f.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Chat History */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className={cn("font-serif font-semibold text-base text-foreground", lang === "ml" && "font-malayalam")}>
              {t("chatHistory")}
            </h2>
          </div>

          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary animate-pulse flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-secondary rounded animate-pulse mb-1.5 w-1/2" />
                    <div className="h-3 bg-secondary rounded animate-pulse w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : !chats || chats.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className={cn("text-muted-foreground text-sm mb-4", lang === "ml" && "font-malayalam")}>
                {t("noChatsDesc")}
              </p>
              <Link href="/ai/chat/new">
                <Button size="sm" className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-1" />
                  {t("newChat")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {chats.map((chat) => (
                <Link key={chat.id} href={`/ai/chat/${chat.id}`}>
                  <div className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl vayana-gradient flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {chat.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(chat.updatedAt).toLocaleDateString(lang === "ml" ? "ml-IN" : "en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    {chat.bookId && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
