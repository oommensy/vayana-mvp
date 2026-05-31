import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { BookOpen, Plus, Star, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Status = "want_to_read" | "reading" | "completed";

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              "w-6 h-6 transition-colors",
              (hover || value) >= star ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function Bookshelf() {
  const { lang, t } = useLanguage();
  const utils = trpc.useUtils();
  const { data: bookshelf, isLoading } = trpc.bookshelf.list.useQuery();

  const upsert = trpc.bookshelf.upsert.useMutation({
    onSuccess: () => {
      utils.bookshelf.list.invalidate();
      toast.success(lang === "ml" ? "അപ്ഡേറ്റ് ചെയ്തു" : "Updated successfully");
      setEditItem(null);
    },
  });

  const remove = trpc.bookshelf.remove.useMutation({
    onSuccess: () => {
      utils.bookshelf.list.invalidate();
      toast.success(lang === "ml" ? "നീക്കം ചെയ്തു" : "Removed from bookshelf");
    },
  });

  const [editItem, setEditItem] = useState<{
    bookId: number;
    title: string;
    status: Status;
    progressPercent: number;
    rating: number;
    review: string;
  } | null>(null);

  const statusLabel = (s: Status) => {
    if (s === "want_to_read") return t("wantToRead");
    if (s === "reading") return t("reading");
    return t("completed");
  };

  const statusColor = (s: Status) => {
    if (s === "want_to_read") return "bg-secondary text-muted-foreground";
    if (s === "reading") return "bg-blue-50 text-blue-700";
    return "bg-green-50 text-green-700";
  };

  const byStatus = (status: Status) => bookshelf?.filter((b) => b.status === status) ?? [];

  const BookCard = ({ item }: { item: NonNullable<typeof bookshelf>[0] }) => (
    <div className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="flex gap-4 p-4">
        {item.book?.coverUrl ? (
          <img
            src={item.book.coverUrl}
            alt={item.book.title ?? ""}
            className="w-16 h-22 object-cover rounded-xl shadow-sm flex-shrink-0"
            style={{ height: "88px" }}
          />
        ) : (
          <div className="w-16 h-22 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ height: "88px" }}>
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-serif font-semibold text-base text-foreground leading-tight truncate">
                {item.book?.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{item.book?.author}</p>
            </div>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0", statusColor(item.status as Status))}>
              {statusLabel(item.status as Status)}
            </span>
          </div>

          {item.status === "reading" && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className={cn("text-xs text-muted-foreground", lang === "ml" && "font-malayalam")}>{t("progress")}</span>
                <span className="text-xs font-medium text-primary">{item.progressPercent}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${item.progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {item.rating && (
            <div className="flex gap-0.5 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn("w-3.5 h-3.5", i < item.rating! ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {item.review && (
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground italic line-clamp-2">"{item.review}"</p>
        </div>
      )}

      <div className="flex border-t border-border">
        <button
          onClick={() => setEditItem({
            bookId: item.bookId,
            title: item.book?.title ?? "",
            status: item.status as Status,
            progressPercent: item.progressPercent,
            rating: item.rating ?? 0,
            review: item.review ?? "",
          })}
          className="flex-1 py-2.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
        >
          {t("edit")}
        </button>
        <div className="w-px bg-border" />
        <button
          onClick={() => remove.mutate({ bookId: item.bookId })}
          className="flex-1 py-2.5 text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors flex items-center justify-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {t("removeFromShelf")}
        </button>
      </div>
    </div>
  );

  const EmptyState = ({ status }: { status: Status }) => (
    <div className="col-span-full py-16 text-center">
      <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
      <p className={cn("text-muted-foreground font-medium", lang === "ml" && "font-malayalam")}>
        {status === "want_to_read"
          ? lang === "ml" ? "വായിക്കാൻ ആഗ്രഹിക്കുന്ന പുസ്തകങ്ങൾ ഇല്ല" : "No books in your want-to-read list"
          : status === "reading"
          ? lang === "ml" ? "ഇപ്പോൾ വായിക്കുന്ന പുസ്തകങ്ങൾ ഇല്ല" : "You're not currently reading any books"
          : lang === "ml" ? "ഇതുവരെ ഒരു പുസ്തകവും പൂർത്തിയാക്കിയില്ല" : "No completed books yet"}
      </p>
      <Link href="/books">
        <Button size="sm" className="mt-4 bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" />
          {t("addBook")}
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background page-enter">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={cn("text-3xl font-serif font-bold text-foreground", lang === "ml" && "font-malayalam")}>
              {t("myBookshelf")}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {bookshelf?.length ?? 0} {lang === "ml" ? "പുസ്തകങ്ങൾ" : "books"}
            </p>
          </div>
          <Link href="/books">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              {t("addBook")}
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 bg-white rounded-2xl border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <Tabs defaultValue="reading">
            <TabsList className="mb-6 bg-secondary/50 p-1 rounded-xl">
              {[
                { value: "reading", label: t("reading"), count: byStatus("reading").length },
                { value: "want_to_read", label: t("wantToRead"), count: byStatus("want_to_read").length },
                { value: "completed", label: t("completed"), count: byStatus("completed").length },
              ].map(({ value, label, count }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={cn("rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm", lang === "ml" && "font-malayalam")}
                >
                  {label}
                  <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{count}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {(["reading", "want_to_read", "completed"] as Status[]).map((status) => (
              <TabsContent key={status} value={status}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {byStatus(status).length === 0 ? (
                    <EmptyState status={status} />
                  ) : (
                    byStatus(status).map((item) => <BookCard key={item.id} item={item} />)
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className={cn("font-serif", lang === "ml" && "font-malayalam")}>
              {editItem?.title}
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-5">
              {/* Status */}
              <div className="space-y-2">
                <label className={cn("text-sm font-medium", lang === "ml" && "font-malayalam")}>{lang === "ml" ? "നില" : "Status"}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["want_to_read", "reading", "completed"] as Status[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditItem({ ...editItem, status: s })}
                      className={cn(
                        "py-2 px-2 rounded-xl text-xs font-medium border-2 transition-all",
                        editItem.status === s ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40",
                        lang === "ml" && "font-malayalam"
                      )}
                    >
                      {statusLabel(s)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress */}
              {editItem.status === "reading" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className={cn("text-sm font-medium", lang === "ml" && "font-malayalam")}>{t("progress")}</label>
                    <span className="text-sm font-semibold text-primary">{editItem.progressPercent}%</span>
                  </div>
                  <Slider
                    value={[editItem.progressPercent]}
                    onValueChange={([v]) => setEditItem({ ...editItem, progressPercent: v })}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}

              {/* Rating */}
              <div className="space-y-2">
                <label className={cn("text-sm font-medium", lang === "ml" && "font-malayalam")}>{t("rating")}</label>
                <StarRating
                  value={editItem.rating}
                  onChange={(v) => setEditItem({ ...editItem, rating: v })}
                />
              </div>

              {/* Review */}
              <div className="space-y-2">
                <label className={cn("text-sm font-medium", lang === "ml" && "font-malayalam")}>{t("review")}</label>
                <Textarea
                  value={editItem.review}
                  onChange={(e) => setEditItem({ ...editItem, review: e.target.value })}
                  placeholder={t("writeReview")}
                  className="rounded-xl resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditItem(null)}
                >
                  {t("cancel")}
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground"
                  onClick={() =>
                    upsert.mutate({
                      bookId: editItem.bookId,
                      status: editItem.status,
                      progressPercent: editItem.progressPercent,
                      rating: editItem.rating || undefined,
                      review: editItem.review || undefined,
                    })
                  }
                  disabled={upsert.isPending}
                >
                  {upsert.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : t("save")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
