import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, Users } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CreateClub() {
  const { lang, t } = useLanguage();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const [form, setForm] = useState({
    name: "",
    description: "",
    language: "en" as "en" | "ml" | "both",
    isPrivate: false,
  });

  const createClub = trpc.clubs.create.useMutation({
    onSuccess: (data) => {
      utils.clubs.list.invalidate();
      utils.clubs.myClubs.invalidate();
      toast.success(lang === "ml" ? "ക്ലബ്ബ് ഉണ്ടാക്കി!" : "Club created successfully!");
      navigate(`/clubs/${data.clubId}`);
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen bg-background page-enter">
      <div className="container py-8 max-w-2xl">
        <Link href="/clubs">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            {lang === "ml" ? "ക്ലബ്ബുകളിലേക്ക്" : "Back to Clubs"}
          </button>
        </Link>

        <div className="mb-8">
          <h1 className={cn("text-3xl font-serif font-bold text-foreground", lang === "ml" && "font-malayalam")}>
            {t("createClub")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {lang === "ml" ? "ഒരു പുതിയ വായനാ ക്ലബ്ബ് ആരംഭിക്കൂ" : "Start a new reading community"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-6 space-y-5">
            <div className="space-y-2">
              <Label className={cn("text-sm font-medium", lang === "ml" && "font-malayalam")}>{t("clubName")} *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={lang === "ml" ? "ക്ലബ്ബിന്റെ പേര്" : "e.g. Kerala Classics Book Club"}
                className="rounded-xl"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label className={cn("text-sm font-medium", lang === "ml" && "font-malayalam")}>{t("clubDescription")}</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={lang === "ml" ? "ക്ലബ്ബിനെക്കുറിച്ച് ഒന്ന് പറയൂ..." : "What will your club read? Who is it for?"}
                className="rounded-xl resize-none"
                rows={4}
                maxLength={1000}
              />
            </div>

            <div className="space-y-2">
              <Label className={cn("text-sm font-medium", lang === "ml" && "font-malayalam")}>{t("clubLanguage")}</Label>
              <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v as any })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t("english")}</SelectItem>
                  <SelectItem value="ml">{t("malayalam")}</SelectItem>
                  <SelectItem value="both">{t("bilingual")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
              <div>
                <p className={cn("text-sm font-medium text-foreground", lang === "ml" && "font-malayalam")}>
                  {t("privateClub")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lang === "ml" ? "ക്ഷണം മാത്രം" : "Invite-only membership"}
                </p>
              </div>
              <Switch
                checked={form.isPrivate}
                onCheckedChange={(v) => setForm({ ...form, isPrivate: v })}
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border bg-secondary/20 flex justify-end gap-3">
            <Link href="/clubs">
              <Button variant="outline">{t("cancel")}</Button>
            </Link>
            <Button
              className="bg-primary text-primary-foreground px-8"
              onClick={() => createClub.mutate(form)}
              disabled={!form.name || createClub.isPending}
            >
              {createClub.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : <Users className="w-4 h-4 mr-2" />}
              {t("createClub")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
