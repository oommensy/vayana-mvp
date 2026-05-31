import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Camera, Check, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { user } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const utils = trpc.useUtils();

  const { data: profile } = trpc.users.getProfile.useQuery();
  const { data: bookshelf } = trpc.bookshelf.list.useQuery();
  const { data: myClubs } = trpc.clubs.myClubs.useQuery();

  const updateProfile = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      utils.users.getProfile.invalidate();
      toast.success(lang === "ml" ? "പ്രൊഫൈൽ അപ്ഡേറ്റ് ചെയ്തു" : "Profile updated successfully");
    },
    onError: () => {
      toast.error(lang === "ml" ? "അപ്ഡേറ്റ് ചെയ്യാൻ കഴിഞ്ഞില്ല" : "Failed to update profile");
    },
  });

  const [form, setForm] = useState({
    name: "",
    username: "",
    bio: "",
    avatarUrl: "",
    preferredLanguage: "en" as "en" | "ml",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? "",
        username: profile.username ?? "",
        bio: profile.bio ?? "",
        avatarUrl: profile.avatarUrl ?? "",
        preferredLanguage: profile.preferredLanguage ?? "en",
      });
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile.mutate({
      name: form.name,
      username: form.username,
      bio: form.bio,
      avatarUrl: form.avatarUrl || undefined,
      preferredLanguage: form.preferredLanguage,
    });
    if (form.preferredLanguage !== lang) {
      setLang(form.preferredLanguage);
    }
  };

  const booksRead = bookshelf?.filter((b) => b.status === "completed").length ?? 0;

  return (
    <div className="min-h-screen bg-background page-enter">
      <div className="container py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className={cn("text-3xl font-serif font-bold text-foreground", lang === "ml" && "font-malayalam")}>
            {t("editProfile")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {lang === "ml" ? "നിങ്ങളുടെ വ്യക്തിഗത വിവരങ്ങൾ അപ്ഡേറ്റ് ചെയ്യൂ" : "Update your personal information and preferences"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: t("booksRead"), value: booksRead, icon: BookOpen },
            { label: t("clubsJoined"), value: myClubs?.length ?? 0, icon: Users },
            { label: t("memberSince"), value: profile?.createdAt ? new Date(profile.createdAt).getFullYear() : "—", icon: Check },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-border shadow-sm text-center">
              <div className="text-2xl font-serif font-bold text-foreground">{value}</div>
              <div className={cn("text-xs text-muted-foreground mt-1", lang === "ml" && "font-malayalam")}>{label}</div>
            </div>
          ))}
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          {/* Avatar Section */}
          <div className="px-6 py-6 border-b border-border bg-secondary/20">
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar className="w-20 h-20 border-2 border-white shadow-md">
                  <AvatarImage src={form.avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-serif font-bold">
                    {form.name?.charAt(0)?.toUpperCase() ?? user?.name?.charAt(0)?.toUpperCase() ?? "V"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div>
                <h2 className="font-serif font-semibold text-xl text-foreground">
                  {form.name || user?.name || "Reader"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {form.username ? `@${form.username}` : user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="px-6 py-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="name" className={cn("text-sm font-medium", lang === "ml" && "font-malayalam")}>
                  {t("displayName")}
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={lang === "ml" ? "നിങ്ങളുടെ പേര്" : "Your display name"}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className={cn("text-sm font-medium", lang === "ml" && "font-malayalam")}>
                  {t("username")}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                  <Input
                    id="username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                    placeholder="yourhandle"
                    className="rounded-xl pl-7"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className={cn("text-sm font-medium", lang === "ml" && "font-malayalam")}>
                {t("bio")}
              </Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder={lang === "ml" ? "നിങ്ങളെക്കുറിച്ച് ഒന്ന് പറയൂ..." : "Tell us about yourself and your reading interests..."}
                className="rounded-xl resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{form.bio.length}/500</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl" className="text-sm font-medium">
                {t("coverImage")} (URL)
              </Label>
              <Input
                id="avatarUrl"
                value={form.avatarUrl}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                placeholder="https://example.com/your-photo.jpg"
                className="rounded-xl"
                type="url"
              />
            </div>

            {/* Language Preference */}
            <div className="space-y-3">
              <Label className={cn("text-sm font-medium", lang === "ml" && "font-malayalam")}>
                {t("preferredLanguage")}
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "en", label: "English", sublabel: "ഇംഗ്ലീഷ്" },
                  { value: "ml", label: "Malayalam", sublabel: "മലയാളം" },
                ].map(({ value, label, sublabel }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, preferredLanguage: value as "en" | "ml" })}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                      form.preferredLanguage === value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      form.preferredLanguage === value ? "border-primary" : "border-muted-foreground/40"
                    )}>
                      {form.preferredLanguage === value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground font-malayalam">{sublabel}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="px-6 py-4 border-t border-border bg-secondary/20 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
            >
              {updateProfile.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {t("saveChanges")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
