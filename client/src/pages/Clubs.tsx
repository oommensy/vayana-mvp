import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { BookOpen, Plus, Search, Users, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getLoginUrl } from "@/const";

export default function Clubs() {
  const { lang, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");

  const { data: clubs, isLoading } = trpc.clubs.list.useQuery({ search: search || undefined, limit: 30 });

  const join = trpc.clubs.join.useMutation({
    onSuccess: () => {
      utils.clubs.list.invalidate();
      utils.clubs.myClubs.invalidate();
      toast.success(lang === "ml" ? "ക്ലബ്ബിൽ ചേർന്നു!" : "Joined the club!");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen bg-background page-enter">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={cn("text-3xl font-serif font-bold text-foreground", lang === "ml" && "font-malayalam")}>
              {t("readingClubs")}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {lang === "ml" ? "ഒരു ക്ലബ്ബ് കണ്ടെത്തൂ, ചേരൂ" : "Find a club and start reading together"}
            </p>
          </div>
          {isAuthenticated && (
            <Link href="/clubs/create">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                {t("createClub")}
              </Button>
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchClubs")}
            className="pl-10 pr-10 rounded-xl h-11"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Clubs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-white rounded-2xl border border-border animate-pulse" />
            ))}
          </div>
        ) : !clubs || clubs.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className={cn("font-serif font-semibold text-xl text-foreground mb-2", lang === "ml" && "font-malayalam")}>
              {t("noClubs")}
            </h3>
            <p className={cn("text-muted-foreground text-sm mb-6", lang === "ml" && "font-malayalam")}>
              {lang === "ml" ? "ആദ്യ ക്ലബ്ബ് ഉണ്ടാക്കൂ!" : "Be the first to create a reading club!"}
            </p>
            {isAuthenticated && (
              <Link href="/clubs/create">
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("createClub")}
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {clubs.map((club) => (
              <div key={club.id} className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
                {/* Club Header */}
                <div className="h-24 vayana-gradient relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <Users className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium bg-white/20 text-white backdrop-blur-sm"
                    )}>
                      {club.language === "ml" ? "Malayalam" : club.language === "both" ? "ML/EN" : "English"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-serif font-semibold text-base text-foreground leading-tight line-clamp-2">
                      {club.name}
                    </h3>
                  </div>
                  {club.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                      {club.description}
                    </p>
                  )}
                  {club.currentBookId && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-secondary/50 rounded-lg">
                      <BookOpen className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <p className="text-xs text-muted-foreground truncate">
                        <span className="text-foreground font-medium">{lang === "ml" ? "ഇപ്പോൾ:" : "Now reading"}</span>
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      <span>{club.memberCount} {t("members")}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/clubs/${club.id}`}>
                        <Button variant="outline" size="sm" className="text-xs rounded-lg">
                          {lang === "ml" ? "കാണുക" : "View"}
                        </Button>
                      </Link>
                      {!club.isPrivate && (
                        <Button
                          size="sm"
                          className="text-xs bg-primary text-primary-foreground rounded-lg"
                          onClick={() => {
                            if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
                            join.mutate({ clubId: club.id });
                          }}
                          disabled={join.isPending}
                        >
                          {t("joinClub")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
