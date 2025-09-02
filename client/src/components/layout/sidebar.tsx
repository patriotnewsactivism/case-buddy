import { cn } from "@/lib/utils";
import { Shield, ChartPie, Clock, FolderOpen, Camera, FileText, BarChart, Search, Highlighter, Download, Video, Menu, Scale, Calendar, Briefcase, Wand2, Brain, User, LogOut, Crown, Ticket, Settings, Mic } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CaseSelector } from "@/components/case-selector";
import { useCurrentCase } from "@/lib/case-context";
import { useAuth } from "@/lib/auth-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { CASE_STATS, FOIA_REQUESTS } from "@/lib/case-data";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const getUserInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const pendingFoiaCount = FOIA_REQUESTS.filter(r => r.status === "pending").length;

  const navItems = [
    {
      title: "CASE OVERVIEW",
      items: [
        { href: "/", label: "Dashboard", icon: ChartPie },
        { href: "/timeline", label: "Timeline", icon: Clock },
        { href: "/documents", label: "Documents", icon: FolderOpen },
        { href: "/evidence", label: "Evidence Gallery", icon: Camera },
        { href: "/video-evidence", label: "Video Evidence", icon: Video },
        { href: "/transcribe", label: "Transcribe", icon: Mic },
      ]
    },
    {
      title: "CASE MANAGEMENT",
      items: [
        { href: "/cases", label: "Case Management", icon: Briefcase },
        { href: "/motions", label: "Motions", icon: Scale },
        { href: "/deadlines", label: "Deadlines", icon: Calendar },
        { href: "/brief-generator", label: "Brief Generator", icon: Wand2 },
        { href: "/legal-analytics", label: "AI Analytics", icon: Brain },
        { href: "/foia", label: "FOIA Requests", icon: FileText, badge: pendingFoiaCount },
        { href: "/analytics", label: "Analytics", icon: BarChart },
        { href: "/search", label: "Advanced Search", icon: Search },
        { href: "/advanced-search", label: "AI Research", icon: Brain },
      ]
    },
    {
      title: "ACCOUNT",
      items: [
        { href: "/subscription", label: "Subscription", icon: Crown },
      ]
    },
    {
      title: "LEGAL TOOLS",
      items: [
        { href: "/annotations", label: "Annotations", icon: Highlighter },
        { href: "/export", label: "Export Reports", icon: Download },
      ]
    },
    // Admin section - only show for admin users
    ...(user?.role === 'admin' ? [{
      title: "ADMINISTRATION",
      items: [
        { href: "/admin/coupons", label: "Coupon Management", icon: Ticket },
      ]
    }] : [])
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col overflow-y-auto sidebar-nav">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Shield className="text-sidebar-primary-foreground w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">CaseBuddy</h1>
            <p className="text-sm text-sidebar-foreground/70">Your Legal Case Assistant</p>
          </div>
        </div>

        <div className="space-y-3">
          <CaseSelector />
        </div>
      </div>

      <nav className="p-4 space-y-6 flex-1">
        {navItems.map((section) => (
          <div key={section.title} className="space-y-2">
            <div className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-3">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => isMobile && setIsOpen(false)}>
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground"
                  )}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border mt-auto">
        <div className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-3">
          CASE STATISTICS
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-sidebar-foreground/70">Documents</span>
            <span className="font-semibold text-sidebar-foreground">{CASE_STATS.totalDocuments}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sidebar-foreground/70">Evidence Items</span>
            <span className="font-semibold text-sidebar-foreground">{CASE_STATS.evidenceItems}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sidebar-foreground/70">Timeline Events</span>
            <span className="font-semibold text-sidebar-foreground">{CASE_STATS.timelineEvents}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sidebar-foreground/70">FOIA Requests</span>
            <span className="font-semibold text-sidebar-foreground">{CASE_STATS.foiaRequests}</span>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-auto p-3 hover:bg-sidebar-accent">
              <div className="flex items-center gap-3 w-full">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-sidebar-foreground">
                    {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || "User"}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70">{user?.email}</p>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  // Mobile navigation with sheet
  if (isMobile) {
    return (
      <>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="fixed top-4 left-4 z-50 md:hidden bg-background/80 backdrop-blur-sm border shadow-sm"
              data-testid="mobile-menu-toggle"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 bg-sidebar">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside className={cn(
      "w-80 bg-sidebar border-r border-sidebar-border overflow-y-auto sidebar-nav",
      className
    )}>
      <SidebarContent />
    </aside>
  );
}