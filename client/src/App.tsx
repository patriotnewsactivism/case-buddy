import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { CaseProvider } from "@/lib/case-context";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import Dashboard from "@/pages/dashboard";
import LoginPage from "@/pages/login";
import Timeline from "@/pages/timeline";
import Documents from "@/pages/documents";
import Evidence from "@/pages/evidence";
import VideoEvidence from "@/pages/video-evidence";
import TranscriptionTest from "@/pages/transcription-test";
import Motions from "@/pages/motions";
import Deadlines from "@/pages/deadlines";
import CaseManagement from "@/pages/case-management";
import BriefGenerator from "@/pages/brief-generator";
import LegalAnalytics from "@/pages/legal-analytics";
import FoiaRequests from "@/pages/foia";
import Analytics from "@/pages/analytics";
import Search from "@/pages/search";
import AdvancedSearch from "@/pages/advanced-search";
import SubscriptionPage from "@/pages/subscription";
import Documentation from "@/pages/documentation";
import AdminCoupons from "@/pages/admin-coupons";
import NotFound from "@/pages/not-found";

function ProtectedRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/timeline" component={Timeline} />
      <Route path="/documents" component={Documents} />
      <Route path="/evidence" component={Evidence} />
      <Route path="/video-evidence" component={VideoEvidence} />
      <Route path="/transcribe" component={TranscriptionTest} />
      <Route path="/transcription-test" component={TranscriptionTest} />
      <Route path="/motions" component={Motions} />
      <Route path="/deadlines" component={Deadlines} />
      <Route path="/cases" component={CaseManagement} />
      <Route path="/brief-generator" component={BriefGenerator} />
      <Route path="/legal-analytics" component={LegalAnalytics} />
      <Route path="/foia" component={FoiaRequests} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/search" component={Search} />
      <Route path="/advanced-search" component={AdvancedSearch} />
      <Route path="/subscription" component={SubscriptionPage} />
      <Route path="/documentation" component={Documentation} />
      <Route path="/admin/coupons" component={AdminCoupons} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <ProtectedRouter />;
  }

  return (
    <CaseProvider>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className={`flex-1 overflow-hidden ${isMobile ? 'pl-0' : ''}`}>
          <ProtectedRouter />
        </main>
      </div>
    </CaseProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;