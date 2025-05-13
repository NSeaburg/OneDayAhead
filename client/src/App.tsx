import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import ClaudeHelperPage from "@/pages/claude-helper";

// Navigation component
function Navigation() {
  return (
    <nav className="bg-slate-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="font-bold text-lg">Educational Platform</div>
        <ul className="flex space-x-6">
          <li>
            <Link href="/">
              <a className="hover:text-blue-300 transition-colors">Home</a>
            </Link>
          </li>
          <li>
            <Link href="/claude-helper">
              <a className="hover:text-blue-300 transition-colors">Claude Helper</a>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <div>
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/claude-helper" component={ClaudeHelperPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
