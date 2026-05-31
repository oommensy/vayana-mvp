import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { BookOpen, CalendarDays, ChevronLeft, Crown, Plus, Settings, Users } from "lucide-react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getLoginUrl } from "@/const";

export default function ClubDetail() {
  const { id } = useParams<{ id: string }>();
  const clubId = parseInt(id ?? "0");
  const { lang, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: club, isLoading } = trpc.clubs.getById.useQuery({ id: clubId });
  const { data: members } = trpc.clubs.getMembers.useQuery({ clubId });
  const { data: membership } = trpc.clubs.getMembership.useQuery({ clubId }, { enabled: isAuthenticated });
  const { data: events } = trpc.events.list.useQuery({ clubId, limit: 5 });

  const join = trpc.clubs.join.useMutation({
    onSuccess: () => {
      utils.clubs.getMembership.invalidate({ clubId });
      utils.clubs.getMembers.invalidate({ clubId });
      toast.success(lang === "ml" ? "ക്ലബ്ബിൽ ചേർന്നു!" : "Joined the club!");
    },
    onError: (e) => toast.error(e.message),
  });

  const leave = trpc.clubs.leave.useMutation({
    onSuccess: () => {
      utils.clubs.getMembership.invalidate({ clubId });
      utils.clubs.getMembers.invalidate({ clubId });
      toast.success(lang === "ml" ? "ക്ലബ്ബ് വിട്ടു" : "Left the club");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="h-48 bg-white rounded-2xl border border-border animate-pulse mb-6" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-white rounded-2xl border border-border animate-pulse" />
            <div className="h-64 bg-white rounded-2xl border border-border animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Club not found</p>
          <Link href="/clubs"><Button className="mt-4">Back to Clubs</Button></Link>
        </div>
      </div>
    );
  }

  const isAdmin = membership?.role === "admin";
  const isMember = !!membership;

  return (
    <div className="min-h-screen bg-background page-enter">
      <div className="container py-8">
        {/* Back */}
        <Link href="/clubs">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            {lang === "ml" ? "ക്ലബ്ബുകളിലേക്ക്" : "Back to Clubs"}
          </button>
        </Link>

        {/* Club Header */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
          <div className="h-32 vayana-gradient relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <Users className="w-24 h-24 text-white" />
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm font-medium">
                {club.language === "ml" ? "Malayalam" : club.language === "both" ? "ML/EN" : "English"}
              </span>
              {club.isPrivate && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm font-medium">
                  {t("privateClub")}
                </span>
              )}
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-serif font-bold text-2xl text-foreground mb-1">{club.name}</h1>
                {club.description && (
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">{club.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{club.memberCount} {t("members")}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {isAdmin && (
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Settings className="w-4 h-4" />
                    {t("manageClub")}
                  </Button>
                )}
                {!isMember && !club.isPrivate && (
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground"
                    onClick={() => {
                      if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
                      join.mutate({ clubId });
                    }}
                    disabled={join.isPending}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {t("joinClub")}
                  </Button>
                )}
                {isMember && !isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm(t("leaveClubConfirm"))) leave.mutate({ clubId });
                    }}
                    disabled={leave.isPending}
                  >
                    {t("leaveClub")}
                  </Button>
                )}
                {isMember && (
                  <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-medium">
                    {isAdmin && <Crown className="w-3.5 h-3.5" />}
                    {isAdmin ? t("admin") : t("member")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Book */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
              <h2 className={cn("font-serif font-semibold text-lg text-foreground mb-4", lang === "ml" && "font-malayalam")}>
                {t("currentBook")}
              </h2>
              {club.currentBookId ? (
                <CurrentBookDisplay bookId={club.currentBookId} lang={lang} isAdmin={isAdmin} clubId={clubId} />
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className={cn("text-muted-foreground text-sm", lang === "ml" && "font-malayalam")}>
                    {t("noCurrentBook")}
                  </p>
                  {isAdmin && (
                    <Link href="/books">
                      <Button size="sm" className="mt-3 bg-primary text-primary-foreground">
                        <Plus className="w-4 h-4 mr-1" />
                        {t("setCurrentBook")}
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Events */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className={cn("font-serif font-semibold text-lg text-foreground", lang === "ml" && "font-malayalam")}>
                  {t("clubEvents")}
                </h2>
                {isMember && (
                  <Link href={`/events/create?clubId=${clubId}`}>
                    <Button size="sm" className="bg-primary text-primary-foreground text-xs">
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      {t("createEvent")}
                    </Button>
                  </Link>
                )}
              </div>
              {!events || events.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <CalendarDays className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className={cn("text-muted-foreground text-sm", lang === "ml" && "font-malayalam")}>{t("noEvents")}</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {events.map((event) => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <div className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {new Date(event.eventDate).toLocaleDateString("en", { month: "short" })}
                          </span>
                          <span className="text-lg font-serif font-bold text-primary leading-none">
                            {new Date(event.eventDate).getDate()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(event.eventDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {event.isVirtual ? ` · ${t("virtual")}` : event.location ? ` · ${event.location}` : ""}
                          </p>
                        </div>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          event.isVirtual ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                        )}>
                          {event.isVirtual ? t("virtual") : t("inPerson")}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Members Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className={cn("font-serif font-semibold text-base text-foreground", lang === "ml" && "font-malayalam")}>
                  {t("clubMembers")} ({members?.length ?? 0})
                </h2>
              </div>
              <div className="divide-y divide-border max-h-80 overflow-y-auto">
                {members?.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={m.user?.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {m.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{m.user?.name ?? "Reader"}</p>
                    </div>
                    {m.role === "admin" && (
                      <span className="flex items-center gap-1 text-xs text-amber-600">
                        <Crown className="w-3 h-3" />
                        {t("admin")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CurrentBookDisplay({ bookId, lang, isAdmin, clubId }: { bookId: number; lang: string; isAdmin: boolean; clubId: number }) {
  const { data: book } = trpc.books.getById.useQuery({ id: bookId });
  const { t } = useLanguage();
  if (!book) return <div className="h-20 animate-pulse bg-secondary rounded-xl" />;
  return (
    <div className="flex gap-4">
      {book.coverUrl ? (
        <img src={book.coverUrl} alt={book.title} className="w-16 h-24 object-cover rounded-xl shadow-sm flex-shrink-0" />
      ) : (
        <div className="w-16 h-24 vayana-gradient rounded-xl flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-7 h-7 text-white" />
        </div>
      )}
      <div>
        <h3 className="font-serif font-semibold text-lg text-foreground">{book.title}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{book.author}</p>
        {book.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{book.description}</p>
        )}
      </div>
    </div>
  );
}
