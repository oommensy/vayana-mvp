import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { BookOpen, ChevronLeft, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

export default function AiChat() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const chatId = isNew ? null : parseInt(id ?? "0");
  const { lang, t } = useLanguage();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const [message, setMessage] = useState("");
  const [activeChatId, setActiveChatId] = useState<number | null>(chatId);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<number | undefined>();
  const [chatTitle, setChatTitle] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatData, isLoading: chatLoading } = trpc.aiCoach.getChat.useQuery(
    { chatId: activeChatId! },
    { enabled: !!activeChatId }
  );

  const { data: books } = trpc.books.list.useQuery({ limit: 50 });

  const createChat = trpc.aiCoach.createChat.useMutation({
    onSuccess: (data) => {
      setActiveChatId(data.chatId);
      utils.aiCoach.listChats.invalidate();
      navigate(`/ai/chat/${data.chatId}`, { replace: true });
    },
    onError: (e) => {
      toast.error(e.message);
      setPendingMessage(null);
    },
  });

  const sendMessage = trpc.aiCoach.sendMessage.useMutation({
    onSuccess: () => {
      utils.aiCoach.getChat.invalidate({ chatId: activeChatId! });
      setPendingMessage(null);
    },
    onError: (e) => {
      toast.error(e.message);
      setPendingMessage(null);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatData?.messages, pendingMessage]);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setMessage("");
    setPendingMessage(trimmed);

    if (!activeChatId) {
      // Create chat first, then send
      const title = chatTitle || trimmed.slice(0, 60);
      createChat.mutate(
        { title, bookId: selectedBookId, language: lang as "en" | "ml" },
        {
          onSuccess: (data) => {
            sendMessage.mutate({ chatId: data.chatId, message: trimmed });
          },
        }
      );
    } else {
      sendMessage.mutate({ chatId: activeChatId, message: trimmed });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const messages = chatData?.messages ?? [];
  const isThinking = sendMessage.isPending || createChat.isPending;

  return (
    <div className="min-h-screen bg-background flex flex-col page-enter">
      {/* Header */}
      <div className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-3 flex items-center gap-4">
          <Link href="/ai">
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" />
              {lang === "ml" ? "തിരിച്ച്" : "Back"}
            </button>
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-xl vayana-gradient flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className={cn("font-serif font-semibold text-sm text-foreground", lang === "ml" && "font-malayalam")}>
                {chatData?.chat?.title ?? t("vayanaAshan")}
              </p>
              {chatData?.chat?.bookId && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {lang === "ml" ? "പുസ്തക സന്ദർഭം" : "Book context active"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container py-6 max-w-3xl space-y-4">
          {/* New chat setup */}
          {isNew && messages.length === 0 && !pendingMessage && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-3xl vayana-gradient flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className={cn("font-serif font-bold text-xl text-foreground mb-2", lang === "ml" && "font-malayalam")}>
                {t("vayanaAshan")}
              </h2>
              <p className={cn("text-muted-foreground text-sm mb-6 max-w-md mx-auto", lang === "ml" && "font-malayalam")}>
                {lang === "ml"
                  ? "ഏതൊരു പുസ്തകത്തെക്കുറിച്ചും, സാഹിത്യ വിഷയത്തെക്കുറിച്ചും ചോദിക്കൂ."
                  : "Ask me about any book, author, or literary topic in Malayalam or English."}
              </p>

              {/* Book selector */}
              {books && books.length > 0 && (
                <div className="max-w-sm mx-auto mb-6">
                  <label className={cn("block text-xs text-muted-foreground mb-2", lang === "ml" && "font-malayalam")}>
                    {t("selectBook")}
                  </label>
                  <select
                    value={selectedBookId ?? ""}
                    onChange={(e) => setSelectedBookId(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">{lang === "ml" ? "ഒരു പുസ്തകം തിരഞ്ഞെടുക്കൂ..." : "Select a book..."}</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>{b.title} — {b.author}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Suggested prompts */}
              <div className="grid sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {(lang === "ml" ? [
                  "ഈ പുസ്തകത്തിന്റെ ഇതിവൃത്തം എന്ത്?",
                  "ഒ.വി. വിജയന്റെ ഖസാക്കിന്റെ ഇതിഹാസം വിശകലനം ചെയ്യൂ",
                  "ബഷീർ കൃതികളിലെ ഹ്യൂമർ",
                  "ഈ അദ്ധ്യായം ചുരുക്കി പറയൂ",
                ] : [
                  "Summarize the themes of this book",
                  "Analyze Basheer's writing style",
                  "Explain the symbolism in this chapter",
                  "Recommend similar Malayalam novels",
                ]).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => { setMessage(prompt); }}
                    className={cn(
                      "text-left text-xs px-3 py-2.5 rounded-xl border border-border bg-white hover:bg-secondary/50 hover:border-primary/30 transition-all text-muted-foreground hover:text-foreground",
                      lang === "ml" && "font-malayalam"
                    )}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {chatLoading && activeChatId && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "justify-end" : "")}>
                  {i % 2 !== 0 && <div className="w-8 h-8 rounded-xl bg-secondary animate-pulse flex-shrink-0" />}
                  <div className={cn("h-12 rounded-2xl animate-pulse", i % 2 === 0 ? "bg-primary/20 w-48" : "bg-secondary w-64")} />
                </div>
              ))}
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex gap-3", msg.sender === "user" ? "justify-end" : "justify-start")}
            >
              {msg.sender === "assistant" && (
                <div className="w-8 h-8 rounded-xl vayana-gradient flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-white border border-border shadow-sm rounded-tl-sm text-foreground"
                )}
              >
                {msg.sender === "assistant" ? (
                  <div className="prose prose-sm max-w-none prose-headings:font-serif">
                    <Streamdown>{msg.content as string}</Streamdown>
                  </div>
                ) : (
                  <p className={cn(lang === "ml" && "font-malayalam")}>{msg.content as string}</p>
                )}
                <p className={cn(
                  "text-xs mt-1.5 opacity-60",
                  msg.sender === "user" ? "text-right" : ""
                )}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {/* Pending user message */}
          {pendingMessage && (
            <div className="flex gap-3 justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm bg-primary text-primary-foreground">
                <p className={cn(lang === "ml" && "font-malayalam")}>{pendingMessage}</p>
              </div>
            </div>
          )}

          {/* Thinking indicator */}
          {isThinking && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl vayana-gradient flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-border shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <p className={cn("text-xs text-muted-foreground mt-1", lang === "ml" && "font-malayalam")}>
                  {t("thinking")}
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-white/80 backdrop-blur-sm sticky bottom-0">
        <div className="container py-4 max-w-3xl">
          <div className="flex gap-3 items-end">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("chatPlaceholder")}
              className={cn(
                "flex-1 rounded-2xl resize-none min-h-[44px] max-h-32 py-3 px-4 text-sm",
                lang === "ml" && "font-malayalam"
              )}
              rows={1}
              disabled={isThinking}
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isThinking}
              className="bg-primary text-primary-foreground rounded-2xl h-11 w-11 p-0 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {lang === "ml" ? "Enter അമർത്തൂ അല്ലെങ്കിൽ ↑ ക്ലിക്ക് ചെയ്യൂ" : "Press Enter to send · Shift+Enter for new line"}
          </p>
        </div>
      </div>
    </div>
  );
}
