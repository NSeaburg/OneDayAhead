import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminCreate from "@/pages/admin-create";
import NewIntake from "@/pages/new-intake";
import AiUsageDashboard from "@/pages/ai-usage-dashboard";
import ContentManagerScreen from "@/components/ContentManagerScreen";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/create" component={AdminCreate} />
      <Route path="/admin/new-intake" component={NewIntake} />
      <Route path="/new-intake" component={NewIntake} />
      <Route path="/intake" component={NewIntake} />
      <Route path="/admin/ai-usage" component={AiUsageDashboard} />
      <Route path="/admin/edit/:district/:course/:topic" component={ContentManagerScreen} />
      <Route component={NotFound} />
    </Switch>
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
