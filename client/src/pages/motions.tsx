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
import { Scale, Plus, Search, Filter, Calendar as CalendarIcon, FileText, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

// Motion form schema
const motionFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Motion type is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  dueDate: z.date().optional(),
  court: z.string().optional(),
  caseNumber: z.string().optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

type MotionFormData = z.infer<typeof motionFormSchema>;

// Sample motion data - in real app this would come from the database
const SAMPLE_MOTIONS = [
  {
    id: "1",
    title: "Motion to Dismiss - Unlawful Arrest",
    type: "motion_to_dismiss",
    status: "draft",
    priority: "high",
    description: "Motion to dismiss charges based on Fourth Amendment violations during unlawful arrest at federal courthouse.",
    dueDate: "2025-09-15",
    court: "US District Court - Western District of Louisiana",
    caseNumber: "2025-CV-8901",
    assignedTo: "Lead Attorney",
    tags: ["constitutional", "fourth-amendment", "unlawful-arrest"],
    createdAt: "2025-08-30",
  },
  {
    id: "2", 
    title: "Motion for Summary Judgment - Civil Rights Violations",
    type: "motion_for_summary_judgment",
    status: "filed",
    priority: "urgent",
    description: "Summary judgment motion on federal civil rights violations by US Marshals.",
    dueDate: "2025-09-30",
    court: "US District Court - Western District of Louisiana",
    caseNumber: "2025-CV-8901",
    assignedTo: "Constitutional Law Specialist",
    tags: ["civil-rights", "federal", "summary-judgment"],
    createdAt: "2025-08-25",
  },
];

const MOTION_TYPES = [
  { value: "motion_to_dismiss", label: "Motion to Dismiss" },
  { value: "motion_for_summary_judgment", label: "Motion for Summary Judgment" },
  { value: "motion_to_suppress", label: "Motion to Suppress Evidence" },
  { value: "motion_for_injunctive_relief", label: "Motion for Injunctive Relief" },
  { value: "motion_to_compel", label: "Motion to Compel Discovery" },
  { value: "motion_for_sanctions", label: "Motion for Sanctions" },
  { value: "other", label: "Other Motion" },
];

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  filed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  granted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  denied: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function Motions() {
  const [motions, setMotions] = useState(SAMPLE_MOTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const form = useForm<MotionFormData>({
    resolver: zodResolver(motionFormSchema),
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

  const onSubmit = async (data: MotionFormData) => {
    const newMotion = {
      id: Date.now().toString(),
      ...data,
      description: data.description || "",
      court: data.court || "",
      caseNumber: data.caseNumber || "",
      assignedTo: data.assignedTo || "",
      notes: data.notes || "",
      status: "draft" as const,
      dueDate: data.dueDate ? format(data.dueDate, "yyyy-MM-dd") : "",
      createdAt: format(new Date(), "yyyy-MM-dd"),
    };
    
    setMotions(prev => [newMotion, ...prev]);
    setIsCreateDialogOpen(false);
    form.reset();
  };

  const generateMotionWithAI = async (motionId: string) => {
    const motion = motions.find(m => m.id === motionId);
    if (!motion) return;

    try {
      const response = await apiRequest('/api/brief-generation/generate', {
        method: 'POST',
        data: {
          caseTitle: motion.title,
          caseNumber: motion.caseNumber || "Case Number",
          jurisdiction: "federal",
          clientName: "Client",
          attorneyName: motion.assignedTo || "Attorney",
          courtName: motion.court || "Court",
          briefType: 'motion',
          legalIssues: motion.tags,
          factualBackground: motion.description || "Motion background",
          includePrecedents: true,
          includeStatutes: true,
        },
      });

      if (response.success) {
        alert('Motion generated successfully! Check the Brief Generator for the full document.');
      }
    } catch (error) {
      console.error('Error generating motion:', error);
      alert('Failed to generate motion. Please try again.');
    }
  };

  // Filter motions
  const filteredMotions = motions.filter(motion => {
    const matchesSearch = searchQuery.trim() === "" || 
      motion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      motion.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      motion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || motion.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || motion.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const motionStats = {
    total: motions.length,
    draft: motions.filter(m => m.status === "draft").length,
    filed: motions.filter(m => m.status === "filed").length,
    pending: motions.filter(m => m.status === "pending").length,
  };

  return (
    <div className={cn("h-screen overflow-y-auto", isMobile ? "pt-16" : "")}>
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <Header
          title="Motion Tracking"
          onSearch={handleSearch}
          onExport={handleExport}
          searchPlaceholder="Search motions..."
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Card className="rounded-xl">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Scale className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-primary">{motionStats.total}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Total Motions</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-gray-600 dark:text-gray-400">{motionStats.draft}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Drafts</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-blue-600 dark:text-blue-400">{motionStats.filed}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Filed</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{motionStats.pending}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Pending</div>
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
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="filed">Filed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="granted">Granted</SelectItem>
                      <SelectItem value="denied">Denied</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full md:w-32" data-testid="priority-filter">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Input
                  placeholder="Search motions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64"
                  data-testid="motion-search-input"
                />
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full md:w-auto" data-testid="create-motion-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    New Motion
                  </Button>
                </DialogTrigger>
                <DialogContent className={cn("max-w-2xl max-h-[90vh] overflow-y-auto", isMobile && "w-[95vw]")}>
                  <DialogHeader>
                    <DialogTitle>Create New Motion</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Motion Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter motion title..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Motion Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select motion type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {MOTION_TYPES.map((type) => (
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
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the motion and its legal basis..."
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
                          name="caseNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Case Number</FormLabel>
                              <FormControl>
                                <Input placeholder="2025-CV-8901" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="assignedTo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assigned To</FormLabel>
                              <FormControl>
                                <Input placeholder="Attorney name..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dueDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Due Date</FormLabel>
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
                                      date < new Date()
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
                          Create Motion
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Motions List */}
        {filteredMotions.length > 0 ? (
          <div className="space-y-3 md:space-y-4">
            {filteredMotions.map((motion) => (
              <Card key={motion.id} className="rounded-xl hover:shadow-md transition-shadow">
                <CardContent className="p-3 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                        <h3 className="font-semibold text-sm md:text-base line-clamp-2">{motion.title}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={cn("text-xs", STATUS_COLORS[motion.status as keyof typeof STATUS_COLORS])}>
                            {motion.status.charAt(0).toUpperCase() + motion.status.slice(1)}
                          </Badge>
                          <Badge className={cn("text-xs", PRIORITY_COLORS[motion.priority as keyof typeof PRIORITY_COLORS])}>
                            {motion.priority.charAt(0).toUpperCase() + motion.priority.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-xs md:text-sm text-muted-foreground mb-3 line-clamp-2">
                        {motion.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                        {motion.court && (
                          <div><span className="font-medium">Court:</span> {motion.court}</div>
                        )}
                        {motion.caseNumber && (
                          <div><span className="font-medium">Case:</span> {motion.caseNumber}</div>
                        )}
                        {motion.dueDate && (
                          <div><span className="font-medium">Due:</span> {format(new Date(motion.dueDate), "MMM d, yyyy")}</div>
                        )}
                      </div>

                      {motion.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {motion.tags.slice(0, isMobile ? 2 : 5).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {motion.tags.length > (isMobile ? 2 : 5) && (
                            <Badge variant="secondary" className="text-xs">
                              +{motion.tags.length - (isMobile ? 2 : 5)}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col gap-2">
                      <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                        View
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
              <Scale className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No motions found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? `No motions match your search for "${searchQuery}"`
                  : "Create your first motion to get started"
                }
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Motion
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}