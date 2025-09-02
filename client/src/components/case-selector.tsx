import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCase } from "@/lib/case-context";
import { useIsMobile } from "@/hooks/use-mobile";

interface CaseSelectorProps {
  onCreateNew?: () => void;
}

export function CaseSelector({ onCreateNew }: CaseSelectorProps) {
  const [open, setOpen] = useState(false);
  const { currentCase, setCurrentCase, cases } = useCase();
  const isMobile = useIsMobile();

  const handleCaseSelect = (caseItem: any) => {
    setCurrentCase(caseItem);
    setOpen(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "medium": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "low": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "closed": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  const activeCases = cases.filter(c => c.status === "active");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between",
            isMobile ? "w-full max-w-[200px]" : "w-72",
            "text-left"
          )}
          data-testid="case-selector"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Folder className="w-4 h-4 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              {currentCase ? (
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate">
                    {currentCase.title}
                  </span>
                  {currentCase.caseNumber && (
                    <span className="text-xs text-muted-foreground">
                      {currentCase.caseNumber}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground">Select case...</span>
              )}
            </div>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", isMobile ? "w-[300px]" : "w-80")} align="start">
        <Command>
          <CommandInput placeholder="Search cases..." className="h-9" />
          <CommandList>
            <CommandEmpty>No cases found.</CommandEmpty>
            <CommandGroup heading="Active Cases">
              {activeCases.map((caseItem) => (
                <CommandItem
                  key={caseItem.id}
                  value={`${caseItem.title} ${caseItem.caseNumber || ""}`}
                  onSelect={() => handleCaseSelect(caseItem)}
                  className="cursor-pointer p-3"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Check
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          currentCase?.id === caseItem.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">
                          {caseItem.title}
                        </div>
                        {caseItem.caseNumber && (
                          <div className="text-xs text-muted-foreground">
                            {caseItem.caseNumber}
                          </div>
                        )}
                        <div className="flex gap-1 mt-1">
                          <Badge 
                            className={cn("text-xs", getPriorityColor(caseItem.priority))}
                          >
                            {caseItem.priority}
                          </Badge>
                          <Badge 
                            className={cn("text-xs", getStatusColor(caseItem.status))}
                          >
                            {caseItem.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {cases.filter(c => c.status !== "active").length > 0 && (
              <CommandGroup heading="Other Cases">
                {cases.filter(c => c.status !== "active").map((caseItem) => (
                  <CommandItem
                    key={caseItem.id}
                    value={`${caseItem.title} ${caseItem.caseNumber || ""}`}
                    onSelect={() => handleCaseSelect(caseItem)}
                    className="cursor-pointer p-3"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Check
                          className={cn(
                            "h-4 w-4 flex-shrink-0",
                            currentCase?.id === caseItem.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">
                            {caseItem.title}
                          </div>
                          {caseItem.caseNumber && (
                            <div className="text-xs text-muted-foreground">
                              {caseItem.caseNumber}
                            </div>
                          )}
                          <div className="flex gap-1 mt-1">
                            <Badge 
                              className={cn("text-xs", getPriorityColor(caseItem.priority))}
                            >
                              {caseItem.priority}
                            </Badge>
                            <Badge 
                              className={cn("text-xs", getStatusColor(caseItem.status))}
                            >
                              {caseItem.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {onCreateNew && (
              <>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      onCreateNew();
                    }}
                    className="cursor-pointer"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create new case
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}