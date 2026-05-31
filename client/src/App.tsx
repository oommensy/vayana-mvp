import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Bookshelf from "./pages/Bookshelf";
import Books from "./pages/Books";
import Clubs from "./pages/Clubs";
import ClubDetail from "./pages/ClubDetail";
import CreateClub from "./pages/CreateClub";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import CreateEvent from "./pages/CreateEvent";
import AiCoach from "./pages/AiCoach";
import AiChat from "./pages/AiChat";
import Navbar from "./components/Navbar";
import { useAuth } from "./_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { getLoginUrl } from "./const";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-serif text-lg">Loading Vayana...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/bookshelf" component={() => <ProtectedRoute component={Bookshelf} />} />
      <Route path="/books" component={Books} />
      <Route path="/clubs" component={Clubs} />
      <Route path="/clubs/create" component={() => <ProtectedRoute component={CreateClub} />} />
      <Route path="/clubs/:id" component={ClubDetail} />
      <Route path="/events" component={Events} />
      <Route path="/events/create" component={() => <ProtectedRoute component={CreateEvent} />} />
      <Route path="/events/:id" component={EventDetail} />
      <Route path="/ai" component={() => <ProtectedRoute component={AiCoach} />} />
      <Route path="/ai/chat/:id" component={() => <ProtectedRoute component={AiChat} />} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const [location] = useLocation();
  const isLanding = location === "/";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!isLanding && <Navbar />}
      <main className={!isLanding ? "pt-16" : ""}>
        <Router />
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster position="top-right" richColors />
            <AppLayout />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
