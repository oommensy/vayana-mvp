import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Bot,
  CalendarDays,
  ChevronDown,
  LogOut,
  Menu,
  User,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  const navLinks = [
    { href: "/books", label: t("books"), icon: BookOpen },
    { href: "/clubs", label: t("clubs"), icon: Users },
    { href: "/events", label: t("events"), icon: CalendarDays },
    { href: "/ai", label: t("aiCoach"), icon: Bot },
  ];

  const isActive = (href: string) => location === href || location.startsWith(href + "/");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/60 shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? "/dashboard" : "/"}>
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <div className="w-8 h-8 rounded-lg vayana-gradient flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif font-semibold text-xl text-foreground tracking-tight">
                {lang === "ml" ? "വായന" : "Vayana"}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
                    isActive(href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </div>
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "ml" : "en")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
              title="Toggle language"
            >
              <span className={cn("transition-all", lang === "en" ? "text-foreground font-semibold" : "")}>EN</span>
              <span className="text-border">|</span>
              <span className={cn("transition-all font-malayalam", lang === "ml" ? "text-foreground font-semibold" : "")}>മ</span>
            </button>

            {isAuthenticated ? (
              <>
                {/* Bookshelf quick link */}
                <Link href="/bookshelf">
                  <Button variant="ghost" size="sm" className="hidden sm:flex gap-1.5 text-muted-foreground hover:text-foreground">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">{t("bookshelf")}</span>
                  </Button>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-secondary transition-colors">
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={user?.avatarUrl ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
                        {user?.name ?? "Reader"}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="w-4 h-4 mr-2" />
                        {t("profile")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookshelf">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {t("bookshelf")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logout.mutate()}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t("logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => { window.location.href = getLoginUrl(); }}
              >
                {t("login")}
              </Button>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="container py-3 flex flex-col gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                    isActive(href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </div>
              </Link>
            ))}
            <div className="pt-2 border-t border-border mt-1">
              <button
                onClick={() => { setLang(lang === "en" ? "ml" : "en"); setMobileOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground w-full"
              >
                <span>🌐</span>
                {lang === "en" ? "Switch to Malayalam" : "Switch to English"}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
