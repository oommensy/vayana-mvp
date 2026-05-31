import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { BookOpen, Plus, Search, X } from "lucide-react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getLoginUrl } from "@/const";

export default function Books() {
  const { lang, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [search, setSearch] = useState("");
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [addShelfOpen, setAddShelfOpen] = useState<{ bookId: number; title: string } | null>(null);

  const { data: books, isLoading } = trpc.books.list.useQuery({ search: search || undefined, limit: 30 });

  const createBook = trpc.books.create.useMutation({
    onSuccess: () => {
      utils.books.list.invalidate();
      toast.success(lang === "ml" ? "പുസ്തകം ചേർത്തു" : "Book added to catalog");
      setAddBookOpen(false);
      setBookForm({ title: "", author: "", description: "", coverUrl: "", isbn: "", language: "en", genre: "", publishedYear: "" });
    },
  });

  const addToShelf = trpc.bookshelf.upsert.useMutation({
    onSuccess: () => {
      utils.bookshelf.list.invalidate();
      toast.success(lang === "ml" ? "ഷെൽഫിൽ ചേർത്തു" : "Added to your bookshelf");
      setAddShelfOpen(null);
    },
  });

  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    description: "",
    coverUrl: "",
    isbn: "",
    language: "en" as "en" | "ml" | "both",
    genre: "",
    publishedYear: "",
  });

  const [shelfStatus, setShelfStatus] = useState<"want_to_read" | "reading" | "completed">("want_to_read");

  return (
    <div className="min-h-screen bg-background page-enter">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={cn("text-3xl font-serif font-bold text-foreground", lang === "ml" && "font-malayalam")}>
              {t("bookCatalog")}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {lang === "ml" ? "പുസ്തകങ്ങൾ കണ്ടെത്തൂ, ഷെൽഫിൽ ചേർക്കൂ" : "Discover books and add them to your shelf"}
            </p>
          </div>
          {isAuthenticated && (
            <Button
              onClick={() => setAddBookOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("addNewBook")}
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchBooks")}
            className="pl-10 pr-10 rounded-xl h-11"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-secondary rounded-xl mb-3" />
                <div className="h-4 bg-secondary rounded mb-1.5" />
                <div className="h-3 bg-secondary rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : !books || books.length === 0 ? (
          <div className="py-20 text-center">
            <BookOpen className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className={cn("font-serif font-semibold text-xl text-foreground mb-2", lang === "ml" && "font-malayalam")}>
              {t("noResults")}
            </h3>
            <p className={cn("text-muted-foreground text-sm mb-6", lang === "ml" && "font-malayalam")}>
              {t("noResultsDesc")}
            </p>
            {isAuthenticated && (
              <Button onClick={() => setAddBookOpen(true)} className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                {t("addNewBook")}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {books.map((book) => (
              <div key={book.id} className="group cursor-pointer">
                <div className="relative aspect-[2/3] mb-3 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-200 book-shadow">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full vayana-gradient flex flex-col items-center justify-center p-4">
                      <BookOpen className="w-10 h-10 text-white/80 mb-2" />
                      <p className="text-white/90 text-xs font-serif text-center leading-tight line-clamp-3">
                        {book.title}
                      </p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-end">
                    <div className="w-full p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                      <Button
                        size="sm"
                        className="w-full bg-white text-foreground hover:bg-white/90 text-xs font-medium shadow-lg"
                        onClick={() => {
                          if (!isAuthenticated) {
                            window.location.href = getLoginUrl();
                            return;
                          }
                          setAddShelfOpen({ bookId: book.id, title: book.title });
                        }}
                      >
                        {t("addToBookshelf")}
                      </Button>
                    </div>
                  </div>
                  {/* Language badge */}
                  <div className="absolute top-2 left-2">
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded-md font-medium",
                      book.language === "ml" ? "bg-amber-500/90 text-white" : "bg-primary/90 text-white"
                    )}>
                      {book.language === "ml" ? "ML" : book.language === "both" ? "ML/EN" : "EN"}
                    </span>
                  </div>
                </div>
                <h3 className="font-serif font-medium text-sm text-foreground leading-tight line-clamp-2 mb-0.5">
                  {book.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                {book.genre && (
                  <p className="text-xs text-muted-foreground/70 mt-0.5">{book.genre}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Book Dialog */}
      <Dialog open={addBookOpen} onOpenChange={setAddBookOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={cn("font-serif", lang === "ml" && "font-malayalam")}>
              {t("addNewBook")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label className={cn("text-sm", lang === "ml" && "font-malayalam")}>{t("title")} *</Label>
                <Input
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  placeholder={lang === "ml" ? "പുസ്തകത്തിന്റെ പേര്" : "Book title"}
                  className="rounded-xl"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className={cn("text-sm", lang === "ml" && "font-malayalam")}>{t("author")} *</Label>
                <Input
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  placeholder={lang === "ml" ? "രചയിതാവ്" : "Author name"}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className={cn("text-sm", lang === "ml" && "font-malayalam")}>{t("language")} *</Label>
                <Select value={bookForm.language} onValueChange={(v) => setBookForm({ ...bookForm, language: v as any })}>
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
              <div className="space-y-1.5">
                <Label className={cn("text-sm", lang === "ml" && "font-malayalam")}>{t("genre")}</Label>
                <Input
                  value={bookForm.genre}
                  onChange={(e) => setBookForm({ ...bookForm, genre: e.target.value })}
                  placeholder={lang === "ml" ? "ഗണം" : "Fiction, Poetry..."}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className={cn("text-sm", lang === "ml" && "font-malayalam")}>{t("publishedYear")}</Label>
                <Input
                  value={bookForm.publishedYear}
                  onChange={(e) => setBookForm({ ...bookForm, publishedYear: e.target.value })}
                  placeholder="2024"
                  type="number"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">ISBN</Label>
                <Input
                  value={bookForm.isbn}
                  onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                  placeholder="978-..."
                  className="rounded-xl"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className={cn("text-sm", lang === "ml" && "font-malayalam")}>{t("coverImage")} (URL)</Label>
                <Input
                  value={bookForm.coverUrl}
                  onChange={(e) => setBookForm({ ...bookForm, coverUrl: e.target.value })}
                  placeholder="https://..."
                  className="rounded-xl"
                  type="url"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className={cn("text-sm", lang === "ml" && "font-malayalam")}>{t("description")}</Label>
                <Textarea
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  placeholder={lang === "ml" ? "പുസ്തക വിവരണം..." : "Book synopsis..."}
                  className="rounded-xl resize-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setAddBookOpen(false)}>
                {t("cancel")}
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={() => createBook.mutate({
                  title: bookForm.title,
                  author: bookForm.author,
                  description: bookForm.description || undefined,
                  coverUrl: bookForm.coverUrl || undefined,
                  isbn: bookForm.isbn || undefined,
                  language: bookForm.language,
                  genre: bookForm.genre || undefined,
                  publishedYear: bookForm.publishedYear ? parseInt(bookForm.publishedYear) : undefined,
                })}
                disabled={!bookForm.title || !bookForm.author || createBook.isPending}
              >
                {createBook.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : t("save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add to Shelf Dialog */}
      <Dialog open={!!addShelfOpen} onOpenChange={(open) => !open && setAddShelfOpen(null)}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className={cn("font-serif", lang === "ml" && "font-malayalam")}>
              {t("addToBookshelf")}
            </DialogTitle>
          </DialogHeader>
          {addShelfOpen && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {lang === "ml" ? "ഷെൽഫിൽ ചേർക്കൂ:" : "Adding to shelf:"}{" "}
                <span className="font-medium text-foreground">{addShelfOpen.title}</span>
              </p>
              <div className="space-y-2">
                <Label className={cn("text-sm font-medium", lang === "ml" && "font-malayalam")}>{lang === "ml" ? "നില" : "Reading Status"}</Label>
                <div className="grid grid-cols-1 gap-2">
                  {([
                    { value: "want_to_read", label: t("wantToRead") },
                    { value: "reading", label: t("reading") },
                    { value: "completed", label: t("completed") },
                  ] as const).map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setShelfStatus(value)}
                      className={cn(
                        "py-2.5 px-4 rounded-xl text-sm font-medium border-2 transition-all text-left",
                        shelfStatus === value ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40",
                        lang === "ml" && "font-malayalam"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setAddShelfOpen(null)}>
                  {t("cancel")}
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground"
                  onClick={() => addToShelf.mutate({ bookId: addShelfOpen.bookId, status: shelfStatus })}
                  disabled={addToShelf.isPending}
                >
                  {addToShelf.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : t("addToBookshelf")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
