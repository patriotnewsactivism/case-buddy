import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Moon, Sun, Download } from "lucide-react";
import { formatDate } from "@/lib/case-data";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { CaseSelector } from "@/components/case-selector";
import { useCurrentCase } from "@/lib/case-context";

interface HeaderProps {
  title: string;
  onSearch?: (query: string) => void;
  onExport?: () => void;
  searchPlaceholder?: string;
}

export function Header({ title, onSearch, onExport, searchPlaceholder = "Search..." }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(false);
  const isMobile = useIsMobile();
  const { currentCase } = useCurrentCase();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleExport = () => {
    onExport?.();
    // Fallback to browser print if no custom export handler
    if (!onExport) {
      window.print();
    }
  };

  return (
    <header className={cn(
      "bg-card border-b border-border print-friendly",
      isMobile ? "px-4 py-3" : "px-6 py-4",
      isMobile ? "flex-col space-y-3" : "flex items-center justify-between"
    )}>
      <div className={cn(
        "flex items-center",
        isMobile ? "justify-between w-full" : "gap-4"
      )}>
        <div className="flex items-center gap-3">
          <h2 className={cn(
            "font-bold",
            isMobile ? "text-lg" : "text-2xl"
          )}>{title}</h2>
          {currentCase && (
            <div className={cn(
              "text-sm text-muted-foreground",
              isMobile && "hidden"
            )}>
              • {currentCase.title}
            </div>
          )}
        </div>
        {!isMobile && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Last updated:</span>
            <span className="text-sm font-medium">{formatDate(new Date().toISOString())}</span>
          </div>
        )}
        {isMobile && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="theme-toggle-button"
            >
              {isDark ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            </Button>
            <Button
              size="sm"
              onClick={handleExport}
              data-testid="export-case-button"
            >
              <Download className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      <div className={cn(
        "flex items-center",
        isMobile ? "w-full gap-2" : "gap-3"
      )}>
        {!isMobile && <CaseSelector />}
        <div className={cn(
          "relative",
          isMobile ? "flex-1" : ""
        )}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={cn(
              "pl-10 pr-4 py-2",
              isMobile ? "w-full" : "w-80"
            )}
            data-testid="header-search-input"
          />
        </div>

        {!isMobile && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="theme-toggle-button"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Button
              onClick={handleExport}
              className="flex items-center gap-2"
              data-testid="export-case-button"
            >
              <Download className="w-4 h-4" />
              <span>Export Case</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
