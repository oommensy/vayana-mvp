import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { BookOpen, Bot, CalendarDays, ChevronRight, Plus, Users } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const { data: bookshelf } = trpc.bookshelf.list.useQuery();
  const { data: myClubs } = trpc.clubs.myClubs.useQuery();
  const { data: events } = trpc.events.list.useQuery({ limit: 5 });
  const { data: aiChats } = trpc.aiCoach.listChats.useQuery();

  const reading = bookshelf?.filter((b) => b.status === "reading") ?? [];
  const completed = bookshelf?.filter((b) => b.status === "completed") ?? [];

  const greeting = () => {
    const hour = new Date().getHours();
    if (lang === "ml") {
      if (hour < 12) return "സുപ്രഭാതം";
      if (hour < 17) return "ഉച്ചകഴിഞ്ഞ് ശുഭദിനം";
      return "ശുഭ സന്ധ്യ";
    }
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-background page-enter">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-10">
          <p className="text-muted-foreground text-sm mb-1">{greeting()},</p>
          <h1 className={cn("text-3xl font-serif font-bold text-foreground", lang === "ml" && "font-malayalam")}>
            {user?.name ?? "Reader"} 👋
          </h1>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: lang === "ml" ? "വായിക്കുന്നത്" : "Reading", value: reading.length, icon: BookOpen, color: "text-emerald-600 bg-emerald-50" },
            { label: lang === "ml" ? "പൂർത്തിയായത്" : "Completed", value: completed.length, icon: BookOpen, color: "text-blue-600 bg-blue-50" },
            { label: lang === "ml" ? "ക്ലബ്ബുകൾ" : "Clubs", value: myClubs?.length ?? 0, icon: Users, color: "text-amber-600 bg-amber-50" },
            { label: lang === "ml" ? "AI ചർച്ചകൾ" : "AI Chats", value: aiChats?.length ?? 0, icon: Bot, color: "text-purple-600 bg-purple-50" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-border shadow-sm">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", color)}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="text-2xl font-serif font-bold text-foreground">{value}</div>
              <div className={cn("text-xs text-muted-foreground mt-0.5", lang === "ml" && "font-malayalam")}>{label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Currently Reading */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className={cn("font-serif font-semibold text-lg text-foreground", lang === "ml" && "font-malayalam")}>
                  {t("reading")}
                </h2>
                <Link href="/bookshelf">
                  <Button variant="ghost" size="sm" className="text-primary text-xs">
                    {t("viewAll")} <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
              {reading.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className={cn("text-muted-foreground text-sm", lang === "ml" && "font-malayalam")}>
                    {t("noBooks")}
                  </p>
                  <Link href="/books">
                    <Button size="sm" className="mt-4 bg-primary text-primary-foreground">
                      <Plus className="w-4 h-4 mr-1" />
                      {t("addBook")}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {reading.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors">
                      {item.book?.coverUrl ? (
                        <img
                          src={item.book.coverUrl}
                          alt={item.book.title ?? ""}
                          className="w-10 h-14 object-cover rounded-lg shadow-sm flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-14 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{item.book?.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.book?.author}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${item.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{item.progressPercent}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Clubs */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className={cn("font-serif font-semibold text-lg text-foreground", lang === "ml" && "font-malayalam")}>
                  {t("myClubs")}
                </h2>
                <Link href="/clubs">
                  <Button variant="ghost" size="sm" className="text-primary text-xs">
                    {t("viewAll")} <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
              {!myClubs || myClubs.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className={cn("text-muted-foreground text-sm", lang === "ml" && "font-malayalam")}>
                    {t("noClubs")}
                  </p>
                  <Link href="/clubs">
                    <Button size="sm" className="mt-4 bg-primary text-primary-foreground">
                      {t("discoverClubs")}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {myClubs.slice(0, 3).map((club) => (
                    <Link key={club.id} href={`/clubs/${club.id}`}>
                      <div className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{club.name}</p>
                          <p className="text-xs text-muted-foreground">{club.memberCount} {t("members")}</p>
                        </div>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          club.role === "admin" ? "bg-amber-50 text-amber-700" : "bg-secondary text-muted-foreground"
                        )}>
                          {club.role === "admin" ? t("admin") : t("member")}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
              <h2 className={cn("font-serif font-semibold text-base text-foreground mb-4", lang === "ml" && "font-malayalam")}>
                {lang === "ml" ? "ദ്രുത പ്രവർത്തനങ്ങൾ" : "Quick Actions"}
              </h2>
              <div className="space-y-2">
                {[
                  { href: "/books", icon: BookOpen, label: lang === "ml" ? "പുസ്തകം ചേർക്കുക" : "Add a Book", color: "bg-emerald-50 text-emerald-700" },
                  { href: "/clubs/create", icon: Users, label: lang === "ml" ? "ക്ലബ്ബ് ഉണ്ടാക്കുക" : "Create a Club", color: "bg-amber-50 text-amber-700" },
                  { href: "/events/create", icon: CalendarDays, label: lang === "ml" ? "പരിപാടി ഉണ്ടാക്കുക" : "Create an Event", color: "bg-blue-50 text-blue-700" },
                  { href: "/ai-coach", icon: Bot, label: lang === "ml" ? "Vayana Ashan" : "Chat with Vayana Ashan", color: "bg-purple-50 text-purple-700" },
                ].map(({ href, icon: Icon, label, color }) => (
                  <Link key={href} href={href}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={cn("text-sm font-medium text-foreground", lang === "ml" && "font-malayalam")}>{label}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className={cn("font-serif font-semibold text-base text-foreground", lang === "ml" && "font-malayalam")}>
                  {t("upcomingEvents")}
                </h2>
                <Link href="/events">
                  <Button variant="ghost" size="sm" className="text-primary text-xs">
                    {t("viewAll")} <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
              {!events || events.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <CalendarDays className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className={cn("text-muted-foreground text-xs", lang === "ml" && "font-malayalam")}>{t("noEvents")}</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {events.slice(0, 3).map((event) => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <div className="px-5 py-3 hover:bg-secondary/30 transition-colors cursor-pointer">
                        <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(event.eventDate).toLocaleDateString(lang === "ml" ? "ml-IN" : "en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded-md",
                            event.isVirtual ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                          )}>
                            {event.isVirtual ? t("virtual") : t("inPerson")}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
