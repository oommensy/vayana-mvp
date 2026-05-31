import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { CalendarDays, ChevronLeft, ExternalLink, MapPin, Users, Video } from "lucide-react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getLoginUrl } from "@/const";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const eventId = parseInt(id ?? "0");
  const { lang, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: event, isLoading } = trpc.events.getById.useQuery({ id: eventId });
  const { data: rsvps } = trpc.events.getRsvps.useQuery({ eventId });
  const { data: myRsvp } = trpc.events.getMyRsvp.useQuery({ eventId }, { enabled: isAuthenticated });

  const rsvpMutation = trpc.events.rsvp.useMutation({
    onSuccess: () => {
      utils.events.getRsvps.invalidate({ eventId });
      utils.events.getMyRsvp.invalidate({ eventId });
      toast.success(lang === "ml" ? "RSVP അപ്ഡേറ്റ് ചെയ്തു" : "RSVP updated!");
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8 max-w-3xl">
          <div className="h-64 bg-white rounded-2xl border border-border animate-pulse" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Event not found</p>
          <Link href="/events"><Button className="mt-4">Back to Events</Button></Link>
        </div>
      </div>
    );
  }

  const date = new Date(event.eventDate);
  const goingCount = rsvps?.filter((r) => r.status === "going").length ?? 0;
  const maybeCount = rsvps?.filter((r) => r.status === "maybe").length ?? 0;

  const rsvpButtons = [
    { status: "going" as const, label: t("rsvpGoing"), color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" },
    { status: "maybe" as const, label: t("rsvpMaybe"), color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
    { status: "not_going" as const, label: t("rsvpNotGoing"), color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" },
  ];

  return (
    <div className="min-h-screen bg-background page-enter">
      <div className="container py-8 max-w-3xl">
        <Link href="/events">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            {lang === "ml" ? "പരിപാടികളിലേക്ക്" : "Back to Events"}
          </button>
        </Link>

        {/* Event Header */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
          <div className="h-3 vayana-gradient" />
          <div className="p-6">
            <div className="flex items-start gap-4">
              {/* Date Block */}
              <div className="w-16 h-16 rounded-2xl vayana-gradient flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white/80 text-xs font-medium uppercase leading-none">
                  {date.toLocaleDateString("en", { month: "short" })}
                </span>
                <span className="text-white text-2xl font-serif font-bold leading-none mt-0.5">
                  {date.getDate()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="font-serif font-bold text-2xl text-foreground leading-tight">{event.title}</h1>
                  <span className={cn(
                    "text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0",
                    event.isVirtual ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                  )}>
                    {event.isVirtual ? t("virtual") : t("inPerson")}
                  </span>
                </div>
                {event.description && (
                  <p className="text-muted-foreground mt-2 leading-relaxed">{event.description}</p>
                )}
              </div>
            </div>

            {/* Event Details */}
            <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{lang === "ml" ? "തീയതിയും സമയവും" : "Date & Time"}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {date.toLocaleDateString(lang === "ml" ? "ml-IN" : "en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {event.isVirtual && event.meetingLink ? (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Video className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{lang === "ml" ? "ഓൺലൈൻ" : "Virtual Meeting"}</p>
                    <a
                      href={event.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline flex items-center gap-1 mt-0.5"
                    >
                      {t("joinMeeting")}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : event.location ? (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4.5 h-4.5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("location")}</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{event.location}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* RSVP Section */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <h2 className={cn("font-serif font-semibold text-base text-foreground mb-4", lang === "ml" && "font-malayalam")}>
              {t("rsvp")}
            </h2>
            {isAuthenticated ? (
              <div className="space-y-2">
                {rsvpButtons.map(({ status, label, color }) => (
                  <button
                    key={status}
                    onClick={() => rsvpMutation.mutate({ eventId, status })}
                    disabled={rsvpMutation.isPending}
                    className={cn(
                      "w-full py-2.5 px-4 rounded-xl text-sm font-medium border-2 transition-all",
                      myRsvp?.status === status
                        ? "border-primary bg-primary/5 text-primary"
                        : `border-transparent ${color}`,
                      lang === "ml" && "font-malayalam"
                    )}
                  >
                    {myRsvp?.status === status && "✓ "}{label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className={cn("text-sm text-muted-foreground mb-3", lang === "ml" && "font-malayalam")}>
                  {lang === "ml" ? "RSVP ചെയ്യാൻ ലോഗിൻ ചെയ്യൂ" : "Sign in to RSVP"}
                </p>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground"
                  onClick={() => { window.location.href = getLoginUrl(); }}
                >
                  {t("login")}
                </Button>
              </div>
            )}
          </div>

          {/* Attendees */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <h2 className={cn("font-serif font-semibold text-base text-foreground mb-1", lang === "ml" && "font-malayalam")}>
              {t("attendees")}
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              {goingCount} {lang === "ml" ? "പോകുന്നു" : "going"} · {maybeCount} {lang === "ml" ? "ഒരുപക്ഷേ" : "maybe"}
            </p>
            {rsvps && rsvps.filter((r) => r.status === "going").length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {rsvps.filter((r) => r.status === "going").slice(0, 12).map((r) => (
                  <Avatar key={r.id} className="w-8 h-8 border-2 border-white shadow-sm">
                    <AvatarImage src={r.user?.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {r.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {rsvps.filter((r) => r.status === "going").length > 12 && (
                  <div className="w-8 h-8 rounded-full bg-secondary border-2 border-white flex items-center justify-center text-xs text-muted-foreground font-medium">
                    +{rsvps.filter((r) => r.status === "going").length - 12}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <p className={cn("text-sm", lang === "ml" && "font-malayalam")}>
                  {lang === "ml" ? "ഇതുവരെ ആരും RSVP ചെയ്തിട്ടില്ല" : "No RSVPs yet — be the first!"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
