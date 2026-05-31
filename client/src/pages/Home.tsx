import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { BookOpen, Bot, CalendarDays, ChevronRight, Globe, Star, Users } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const features = [
    {
      icon: BookOpen,
      title: t("featureBookshelf"),
      desc: t("featureBookshelfDesc"),
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      icon: Users,
      title: t("featureClubs"),
      desc: t("featureClubsDesc"),
      color: "bg-amber-50 text-amber-700",
    },
    {
      icon: CalendarDays,
      title: t("featureEvents"),
      desc: t("featureEventsDesc"),
      color: "bg-blue-50 text-blue-700",
    },
    {
      icon: Bot,
      title: t("featureAI"),
      desc: t("featureAIDesc"),
      color: "bg-purple-50 text-purple-700",
    },
  ];

  const testimonials = [
    {
      name: "Priya Menon",
      location: "Dubai, UAE",
      text: "Vayana brought me back to Malayalam literature. Vayana Ashan helped me understand MT's novels in a completely new way.",
      rating: 5,
    },
    {
      name: "Arun Krishnan",
      location: "Thrissur, Kerala",
      text: "Our book club uses Vayana every week. The events feature makes organizing discussions so easy.",
      rating: 5,
    },
    {
      name: "Meera Nair",
      location: "London, UK",
      text: "Finally a platform that understands the Malayali reader. The bilingual support is seamless.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/60 shadow-sm">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg vayana-gradient flex items-center justify-center shadow-sm">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif font-semibold text-xl text-foreground tracking-tight">
                {lang === "ml" ? "വായന" : "Vayana"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLang(lang === "en" ? "ml" : "en")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
                {lang === "en" ? "മലയാളം" : "English"}
              </button>
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="sm" className="bg-primary text-primary-foreground">
                    {t("dashboard")}
                  </Button>
                </Link>
              ) : (
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => { window.location.href = getLoginUrl(); }}
                >
                  {t("login")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-brand-100/60 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-50 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="container">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
              <Bot className="w-3.5 h-3.5" />
              AI-Powered Reading Community
            </div>

            {/* Hero Title */}
            <h1 className={cn(
              "text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-foreground leading-tight mb-6",
              lang === "ml" && "font-malayalam"
            )}>
              {lang === "ml" ? (
                <>
                  ഒരുമിച്ച് വായിക്കാം,<br />
                  <span className="text-primary">ഒരുമിച്ച് വളരാം</span>
                </>
              ) : (
                <>
                  Read Together,<br />
                  <span className="text-primary">Grow Together</span>
                </>
              )}
            </h1>

            <p className={cn(
              "text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed",
              lang === "ml" && "font-malayalam"
            )}>
              {t("heroSubtitle")}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 px-8"
                onClick={() => { window.location.href = getLoginUrl(); }}
              >
                {t("getStarted")}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Link href="/clubs">
                <Button size="lg" variant="outline" className="px-8 border-border hover:bg-secondary">
                  {t("featureClubs")}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-14 pt-8 border-t border-border/60">
              {[
                { value: "500+", label: lang === "ml" ? "വായനക്കാർ" : "Readers" },
                { value: "50+", label: lang === "ml" ? "ക്ലബ്ബുകൾ" : "Reading Clubs" },
                { value: "1000+", label: lang === "ml" ? "പുസ്തകങ്ങൾ" : "Books" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="text-3xl font-serif font-bold text-foreground">{value}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className={cn("text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4", lang === "ml" && "font-malayalam")}>
              {lang === "ml" ? "എല്ലാം ഒരിടത്ത്" : "Everything You Need"}
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              {lang === "ml"
                ? "വായനയുടെ ആനന്ദം പൂർണ്ണമാക്കാൻ ആവശ്യമായ എല്ലാ ഉപകരണങ്ങളും"
                : "All the tools you need to make reading a richer, more connected experience"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-border/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className={cn("font-serif font-semibold text-lg text-foreground mb-2", lang === "ml" && "font-malayalam")}>
                  {title}
                </h3>
                <p className={cn("text-sm text-muted-foreground leading-relaxed", lang === "ml" && "font-malayalam")}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vayana Ashan Section */}
      <section className="py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-medium mb-6">
                <Bot className="w-3.5 h-3.5" />
                AI Reading Coach
              </div>
              <h2 className={cn("text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4", lang === "ml" && "font-malayalam")}>
                {lang === "ml" ? "വായന ആശാൻ" : "Meet Vayana Ashan"}
              </h2>
              <p className={cn("text-lg text-muted-foreground mb-6 leading-relaxed", lang === "ml" && "font-malayalam")}>
                {lang === "ml"
                  ? "നിങ്ങളുടെ ദ്വിഭാഷ AI വായനാ സഖി. മലയാള, ഇംഗ്ലീഷ് സാഹിത്യം ചർച്ച ചെയ്യൂ, അദ്ധ്യായ സംഗ്രഹം ലഭിക്കൂ, പദ സഹായം നേടൂ."
                  : "Your bilingual AI reading companion. Discuss Malayalam and English literature, get chapter summaries, vocabulary help, and deep literary analysis."}
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  lang === "ml" ? "മലയാളം, ഇംഗ്ലീഷ്, മംഗ്ലീഷ് ഭാഷകളിൽ ചർച്ച" : "Chat in Malayalam, English, or Manglish",
                  lang === "ml" ? "ക്ലാസിക്, ആധുനിക മലയാള സാഹിത്യ വിദഗ്ധൻ" : "Expert in classic and modern Malayalam literature",
                  lang === "ml" ? "അദ്ധ്യായ സംഗ്രഹവും സാഹിത്യ വിശകലനവും" : "Chapter summaries and literary analysis",
                  lang === "ml" ? "പദ സഹായവും സാംസ്കാരിക സന്ദർഭവും" : "Vocabulary help and cultural context",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span className={cn("text-muted-foreground text-sm", lang === "ml" && "font-malayalam")}>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => { window.location.href = getLoginUrl(); }}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Bot className="w-4 h-4 mr-2" />
                {lang === "ml" ? "വായന ആശാനോട് സംസാരിക്കൂ" : "Chat with Vayana Ashan"}
              </Button>
            </div>

            {/* Chat Preview */}
            <div className="bg-white rounded-2xl border border-border shadow-lg overflow-hidden">
              <div className="bg-primary/5 border-b border-border px-4 py-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full vayana-gradient flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Vayana Ashan</p>
                  <p className="text-xs text-muted-foreground">AI Reading Coach</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>
              <div className="p-4 space-y-3 min-h-[280px]">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full vayana-gradient flex-shrink-0 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                    <p className="text-sm text-foreground">
                      {lang === "ml"
                        ? "നമസ്കാരം! ഞാൻ വായന ആശാൻ. ഏത് പുസ്തകത്തെക്കുറിച്ചും ചർച്ച ചെയ്യാൻ ഞാൻ ഇവിടെ ഉണ്ട്."
                        : "Namaskaram! I'm Vayana Ashan. I'm here to help you explore the world of books — in Malayalam or English!"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <div className="bg-primary rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%]">
                    <p className="text-sm text-primary-foreground">
                      {lang === "ml"
                        ? "ചെമ്മീൻ നോവലിനെക്കുറിച്ച് പറഞ്ഞുതരൂ"
                        : "Tell me about Thakazhi's Chemmeen"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full vayana-gradient flex-shrink-0 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                    <p className="text-sm text-foreground">
                      {lang === "ml"
                        ? "ചെമ്മീൻ (1956) — തകഴി ശിവശങ്കരപ്പിള്ളയുടെ ഈ ക്ലാസിക് നോവൽ കേരളത്തിലെ കടലോര ജീവിതത്തെ ആഴത്തിൽ ചിത്രീകരിക്കുന്നു..."
                        : "Chemmeen (1956) is Thakazhi Sivasankara Pillai's masterpiece set in the fishing communities of Kerala's coast. The novel weaves together love, fate, and the unwritten laws of the sea..."}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-border px-4 py-3">
                <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
                  <input
                    type="text"
                    placeholder={lang === "ml" ? "ഒരു ചോദ്യം ചോദിക്കൂ..." : "Ask about any book..."}
                    className="flex-1 bg-transparent text-sm outline-none text-muted-foreground"
                    readOnly
                  />
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center cursor-pointer">
                    <ChevronRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
              {lang === "ml" ? "വായനക്കാർ പറയുന്നത്" : "What Readers Say"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-border shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <div className="vayana-gradient rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-8 text-8xl font-serif">വ</div>
              <div className="absolute bottom-4 right-8 text-8xl font-serif">ന</div>
            </div>
            <div className="relative z-10">
              <h2 className={cn("text-3xl sm:text-4xl font-serif font-bold mb-4", lang === "ml" && "font-malayalam")}>
                {lang === "ml" ? "ഇന്ന് ആരംഭിക്കൂ" : "Start Your Reading Journey Today"}
              </h2>
              <p className={cn("text-white/80 text-lg mb-8 max-w-xl mx-auto", lang === "ml" && "font-malayalam")}>
                {lang === "ml"
                  ? "ലോകമെമ്പാടുമുള്ള മലയാളി വായനക്കാരുടെ സമൂഹത്തിൽ ചേരൂ"
                  : "Join thousands of Malayali readers worldwide on Vayana"}
              </p>
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg px-10 font-semibold"
                onClick={() => { window.location.href = getLoginUrl(); }}
              >
                {lang === "ml" ? "ഇപ്പോൾ ചേരൂ" : "Join Vayana Free"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg vayana-gradient flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-serif font-semibold text-foreground">
                {lang === "ml" ? "വായന" : "Vayana"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {lang === "ml"
                ? "© 2026 വായന. കേരളത്തിൽ ❤️ നിർമ്മിച്ചത്."
                : "© 2026 Vayana. Made with ❤️ for Malayali readers worldwide."}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
