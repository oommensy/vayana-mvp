import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { CalendarDays, ChevronLeft, MapPin, Video } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CreateEvent() {
  const { lang, t } = useLanguage();
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const clubIdParam = params.get("clubId");
  const utils = trpc.useUtils();

  const [form, setForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
    meetingLink: "",
    isVirtual: false,
    clubId: clubIdParam ? parseInt(clubIdParam) : undefined as number | undefined,
  });

  const createEvent = trpc.events.create.useMutation({
    onSuccess: (data) => {
      utils.events.list.invalidate();
      toast.success(lang === "ml" ? "പരിപാടി ഉണ്ടാക്കി!" : "Event created!");
      navigate(`/events/${data.eventId}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const { data: myClubs } = trpc.clubs.myClubs.useQuery();

  return (
    <div className="min-h-screen bg-background page-enter">
      <div className="container py-8 max-w-2xl">
        <Link href="/events">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            {lang === "ml" ? "പരിപാടികളിലേക്ക്" : "Back to Events"}
          </button>
        </Link>

        <div className="mb-8">
          <h1 className={cn("text-3xl font-serif font-bold text-foreground", lang === "ml" && "font-malayalam")}>
            {t("createEvent")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {lang === "ml" ? "ഒരു വായനാ പരിപാടി ആസൂത്രണം ചെയ്യൂ" : "Schedule a reading event or discussion"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-6 space-y-5">
            <div className="space-y-2">
              <Label className={cn("text-sm font-medium", lang === "ml" && "font-malayalam")}>{t("eventTitle")} *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={lang === "ml" ? "പരിപാടിയുടെ പേര്" : "e.g. Monthly Book Discussion"}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className={cn("text-sm font-medium", lang === "ml" && "font-malayalam")}>{t("eventDescription")}</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={lang === "ml" ? "പരിപാടിയെക്കുറിച്ച് വിവരിക്കൂ..." : "What will you discuss? Any agenda?"}
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className={cn("text-sm font-medium", lang === "ml" && "font-malayalam")}>{t("eventDate")} *</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="datetime-local"
                  value={form.eventDate}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>

            {/* Virtual Toggle */}
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
              <div className="flex items-center gap-3">
                {form.isVirtual ? (
                  <Video className="w-5 h-5 text-blue-600" />
                ) : (
                  <MapPin className="w-5 h-5 text-green-600" />
                )}
                <div>
                  <p className={cn("text-sm font-medium text-foreground", lang === "ml" && "font-malayalam")}>
                    {form.isVirtual ? t("virtualEvent") : t("physicalEvent")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {form.isVirtual
                      ? (lang === "ml" ? "ഓൺലൈൻ മീറ്റിംഗ്" : "Online meeting")
                      : (lang === "ml" ? "നേരിട്ടുള്ള കൂടിക്കാഴ്ച" : "Physical gathering")}
                  </p>
                </div>
              </div>
              <Switch
                checked={form.isVirtual}
                onCheckedChange={(v) => setForm({ ...form, isVirtual: v })}
              />
            </div>

            {form.isVirtual ? (
              <div className="space-y-2">
                <Label className={cn("text-sm font-medium", lang === "ml" && "font-malayalam")}>{t("meetingLink")}</Label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.meetingLink}
                    onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/..."
                    className="pl-10 rounded-xl"
                    type="url"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className={cn("text-sm font-medium", lang === "ml" && "font-malayalam")}>{t("location")}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder={lang === "ml" ? "സ്ഥലം, നഗരം" : "Venue, City"}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Club Association */}
            {myClubs && myClubs.length > 0 && (
              <div className="space-y-2">
                <Label className={cn("text-sm font-medium", lang === "ml" && "font-malayalam")}>
                  {lang === "ml" ? "ക്ലബ്ബ് (ഐച്ഛികം)" : "Reading Club (optional)"}
                </Label>
                <select
                  value={form.clubId !== undefined && form.clubId !== null ? form.clubId : ""}
                  onChange={(e) => setForm({ ...form, clubId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">{lang === "ml" ? "ക്ലബ്ബ് ഇല്ല" : "No club"}</option>
                  {myClubs.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-border bg-secondary/20 flex justify-end gap-3">
            <Link href="/events">
              <Button variant="outline">{t("cancel")}</Button>
            </Link>
            <Button
              className="bg-primary text-primary-foreground px-8"
              onClick={() => {
                if (!form.title || !form.eventDate) {
                  toast.error(lang === "ml" ? "ദയവായി ആവശ്യമായ ഫീൽഡുകൾ പൂരിപ്പിക്കൂ" : "Please fill in required fields");
                  return;
                }
                createEvent.mutate({
                  title: form.title,
                  description: form.description || undefined,
                  eventDate: new Date(form.eventDate).getTime(),
                  location: form.location || undefined,
                  meetingLink: form.meetingLink || undefined,
                  isVirtual: form.isVirtual,
                  clubId: form.clubId,
                });
              }}
              disabled={createEvent.isPending}
            >
              {createEvent.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : <CalendarDays className="w-4 h-4 mr-2" />}
              {t("createEvent")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
