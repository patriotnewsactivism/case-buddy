import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Calendar as CalendarIcon, Scale, Briefcase, Building, User, Clock, CheckCircle2, Archive } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { z } from "zod";

// Case form schema
const caseFormSchema = z.object({
  title: z.string().min(1, "Case title is required"),
  caseNumber: z.string().optional(),
  description: z.string().optional(),
  caseType: z.string().min(1, "Case type is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  court: z.string().optional(),
  jurisdiction: z.string().optional(),
  opposingParty: z.string().optional(),
  leadAttorney: z.string().optional(),
  dateOpened: z.date({
    required_error: "Date opened is required",
  }),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

type CaseFormData = z.infer<typeof caseFormSchema>;

// Sample case data - in real app this would come from the database
const SAMPLE_CASES = [
  {
    id: "1",
    title: "Federal Civil Rights Violation Case",
    caseNumber: "2025-CV-8901",
    description: "Constitutional violations by US Marshals, unlawful arrest, and First Amendment rights infringement at Lafayette federal courthouse.",
    caseType: "civil_rights",
    status: "active",
    priority: "urgent",
    court: "US District Court - Western District of Louisiana",
    jurisdiction: "Federal",
    opposingParty: "United States Marshals Service",
    leadAttorney: "Constitutional Rights Attorney",
    dateOpened: "2025-08-25",
    tags: ["constitutional", "federal", "civil-rights", "first-amendment"],
    notes: "High-profile case involving federal agent misconduct and constitutional violations.",
    isActive: true,
    createdAt: "2025-08-25",
  },
  {
    id: "2",
    title: "FOIA Appeal Case",
    caseNumber: "2025-FOIA-001",
    description: "Appeal of denied FOIA requests for surveillance records and inter-agency communications.",
    caseType: "administrative",
    status: "active",
    priority: "high",
    court: "Administrative Court",
    jurisdiction: "Federal",
    opposingParty: "US Marshals Service",
    leadAttorney: "FOIA Specialist",
    dateOpened: "2025-06-27",
    tags: ["foia", "transparency", "government-records"],
    notes: "Multiple agencies involved, seeking disclosure of surveillance operations.",
    isActive: true,
    createdAt: "2025-06-27",
  },
];

const CASE_TYPES = [
  { value: "civil_rights", label: "Civil Rights" },
  { value: "criminal", label: "Criminal" },
  { value: "administrative", label: "Administrative" },
  { value: "constitutional", label: "Constitutional" },
  { value: "tort", label: "Tort" },
  { value: "contract", label: "Contract" },
  { value: "employment", label: "Employment" },
  { value: "family", label: "Family" },
  { value: "immigration", label: "Immigration" },
  { value: "other", label: "Other" },
];

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const STATUS_COLORS = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  archived: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
};

export default function CaseManagement() {
  const [cases, setCases] = useState(SAMPLE_CASES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<typeof SAMPLE_CASES[0] | null>(null);
  const isMobile = useIsMobile();

  const form = useForm<CaseFormData>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      priority: "medium",
      tags: [],
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleExport = () => {
    window.print();
  };

  const onSubmit = (data: CaseFormData) => {
    const newCase = {
      id: Date.now().toString(),
      ...data,
      description: data.description || "",
      caseNumber: data.caseNumber || "",
      court: data.court || "",
      jurisdiction: data.jurisdiction || "",
      opposingParty: data.opposingParty || "",
      leadAttorney: data.leadAttorney || "",
      notes: data.notes || "",
      status: "active" as const,
      dateOpened: format(data.dateOpened, "yyyy-MM-dd"),
      isActive: true,
      createdAt: format(new Date(), "yyyy-MM-dd"),
    };
    
    setCases(prev => [newCase, ...prev]);
    setIsCreateDialogOpen(false);
    form.reset();
  };

  const toggleCaseStatus = (id: string) => {
    setCases(prev => prev.map(caseItem => 
      caseItem.id === id 
        ? { ...caseItem, status: caseItem.status === "active" ? "closed" : "active", isActive: caseItem.status !== "active" }
        : caseItem
    ));
  };

  // Filter cases
  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = searchQuery.trim() === "" || 
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || caseItem.status === statusFilter;
    const matchesType = typeFilter === "all" || caseItem.caseType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const caseStats = {
    total: cases.length,
    active: cases.filter(c => c.status === "active").length,
    pending: cases.filter(c => c.status === "pending").length,
    closed: cases.filter(c => c.status === "closed").length,
  };

  return (
    <div className={cn("h-screen overflow-y-auto", isMobile ? "pt-16" : "")}>
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <Header
          title="Case Management"
          onSearch={handleSearch}
          onExport={handleExport}
          searchPlaceholder="Search cases..."
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Card className="rounded-xl">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-primary">{caseStats.total}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Total Cases</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-green-600 dark:text-green-400">{caseStats.active}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{caseStats.pending}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Archive className="w-5 h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-gray-600 dark:text-gray-400">{caseStats.closed}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Closed</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="rounded-xl">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between md:gap-4">
              <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:gap-4">
                <div className="flex flex-col md:flex-row gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-32" data-testid="status-filter">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full md:w-40" data-testid="type-filter">
                      <SelectValue placeholder="Case Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {CASE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Input
                  placeholder="Search cases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64"
                  data-testid="case-search-input"
                />
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full md:w-auto" data-testid="create-case-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    New Case
                  </Button>
                </DialogTrigger>
                <DialogContent className={cn("max-w-2xl max-h-[90vh] overflow-y-auto", isMobile && "w-[95vw]")}>
                  <DialogHeader>
                    <DialogTitle>Create New Case</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Case Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter case title..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="caseNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Case Number</FormLabel>
                              <FormControl>
                                <Input placeholder="2025-CV-001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="caseType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Case Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select case type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {CASE_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the case details and legal issues..."
                                className="resize-none"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="court"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Court</FormLabel>
                              <FormControl>
                                <Input placeholder="US District Court..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="jurisdiction"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Jurisdiction</FormLabel>
                              <FormControl>
                                <Input placeholder="Federal, State, Local..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="opposingParty"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Opposing Party</FormLabel>
                              <FormControl>
                                <Input placeholder="Defendant/Plaintiff name..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="leadAttorney"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lead Attorney</FormLabel>
                              <FormControl>
                                <Input placeholder="Attorney name..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dateOpened"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date Opened</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Additional notes and considerations..."
                                className="resize-none"
                                rows={2}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex flex-col-reverse md:flex-row justify-end gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateDialogOpen(false)}
                          className="w-full md:w-auto"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="w-full md:w-auto">
                          Create Case
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Cases List */}
        {filteredCases.length > 0 ? (
          <div className="space-y-3 md:space-y-4">
            {filteredCases.map((caseItem) => (
              <Card 
                key={caseItem.id} 
                className={cn(
                  "rounded-xl hover:shadow-md transition-shadow cursor-pointer",
                  selectedCase?.id === caseItem.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedCase(caseItem)}
              >
                <CardContent className="p-3 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                        <h3 className="font-semibold text-sm md:text-base line-clamp-2">{caseItem.title}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={cn("text-xs", STATUS_COLORS[caseItem.status as keyof typeof STATUS_COLORS])}>
                            {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                          </Badge>
                          <Badge className={cn("text-xs", PRIORITY_COLORS[caseItem.priority as keyof typeof PRIORITY_COLORS])}>
                            {caseItem.priority.charAt(0).toUpperCase() + caseItem.priority.slice(1)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {CASE_TYPES.find(t => t.value === caseItem.caseType)?.label}
                          </Badge>
                        </div>
                      </div>
                      
                      {caseItem.description && (
                        <p className="text-xs md:text-sm text-muted-foreground mb-3 line-clamp-2">
                          {caseItem.description}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                        {caseItem.caseNumber && (
                          <div><span className="font-medium">Case #:</span> {caseItem.caseNumber}</div>
                        )}
                        {caseItem.court && (
                          <div><span className="font-medium">Court:</span> {caseItem.court}</div>
                        )}
                        {caseItem.dateOpened && (
                          <div><span className="font-medium">Opened:</span> {format(new Date(caseItem.dateOpened), "MMM d, yyyy")}</div>
                        )}
                      </div>

                      {caseItem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {caseItem.tags.slice(0, isMobile ? 2 : 5).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {caseItem.tags.length > (isMobile ? 2 : 5) && (
                            <Badge variant="secondary" className="text-xs">
                              +{caseItem.tags.length - (isMobile ? 2 : 5)}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col gap-2">
                      <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                        Select
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 md:flex-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCaseStatus(caseItem.id);
                        }}
                      >
                        {caseItem.status === "active" ? "Close" : "Reopen"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-xl">
            <CardContent className="p-8 md:p-12 text-center">
              <Briefcase className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No cases found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? `No cases match your search for "${searchQuery}"`
                  : "Create your first case to get started"
                }
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Case
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Selected Case Info */}
        {selectedCase && (
          <Card className="rounded-xl border-primary">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Selected Case: {selectedCase.title}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedCase(null)}
                >
                  Clear Selection
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Case Number:</span> {selectedCase.caseNumber || "Not assigned"}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {selectedCase.status}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {CASE_TYPES.find(t => t.value === selectedCase.caseType)?.label}
                </div>
                <div>
                  <span className="font-medium">Priority:</span> {selectedCase.priority}
                </div>
                {selectedCase.court && (
                  <div>
                    <span className="font-medium">Court:</span> {selectedCase.court}
                  </div>
                )}
                {selectedCase.opposingParty && (
                  <div>
                    <span className="font-medium">Opposing Party:</span> {selectedCase.opposingParty}
                  </div>
                )}
              </div>
              {selectedCase.description && (
                <div className="mt-4">
                  <span className="font-medium">Description:</span>
                  <p className="text-sm text-muted-foreground mt-1">{selectedCase.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}