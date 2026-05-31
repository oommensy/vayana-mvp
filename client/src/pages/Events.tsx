import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { CalendarDays, MapPin, Plus, Video } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Events() {
  const { lang, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { data: events, isLoading } = trpc.events.list.useQuery({ limit: 30 });

  return (
    <div className="min-h-screen bg-background page-enter">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={cn("text-3xl font-serif font-bold text-foreground", lang === "ml" && "font-malayalam")}>
              {t("eventsPage")}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {lang === "ml" ? "വരാനിരിക്കുന്ന വായനാ പരിപാടികൾ" : "Upcoming reading events and discussions"}
            </p>
          </div>
          {isAuthenticated && (
            <Link href="/events/create">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                {t("createEvent")}
              </Button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-border animate-pulse" />
            ))}
          </div>
        ) : !events || events.length === 0 ? (
          <div className="py-20 text-center">
            <CalendarDays className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className={cn("font-serif font-semibold text-xl text-foreground mb-2", lang === "ml" && "font-malayalam")}>
              {t("noEvents")}
            </h3>
            <p className={cn("text-muted-foreground text-sm mb-6", lang === "ml" && "font-malayalam")}>
              {t("noEventsDesc")}
            </p>
            {isAuthenticated && (
              <Link href="/events/create">
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("createEvent")}
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const date = new Date(event.eventDate);
              return (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group">
                    <div className="flex gap-0">
                      {/* Date Column */}
                      <div className="w-20 flex-shrink-0 vayana-gradient flex flex-col items-center justify-center py-4">
                        <span className="text-white/80 text-xs font-medium uppercase">
                          {date.toLocaleDateString("en", { month: "short" })}
                        </span>
                        <span className="text-white text-3xl font-serif font-bold leading-none mt-0.5">
                          {date.getDate()}
                        </span>
                        <span className="text-white/70 text-xs mt-1">
                          {date.toLocaleDateString("en", { weekday: "short" })}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-serif font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                              {event.title}
                            </h3>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{event.description}</p>
                            )}
                          </div>
                          <span className={cn(
                            "text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0",
                            event.isVirtual ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                          )}>
                            {event.isVirtual ? t("virtual") : t("inPerson")}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          {event.isVirtual && event.meetingLink && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Video className="w-3.5 h-3.5" />
                              {lang === "ml" ? "ഓൺലൈൻ" : "Online"}
                            </div>
                          )}
                          {!event.isVirtual && event.location && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[200px]">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
