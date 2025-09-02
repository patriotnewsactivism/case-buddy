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
import { Calendar as CalendarIcon, Plus, Bell, AlertTriangle, CheckCircle2, Clock, Target } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, differenceInDays, isBefore, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { z } from "zod";

// Deadline form schema
const deadlineFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  category: z.string().min(1, "Category is required"),
  reminderDays: z.array(z.number()).default([7, 3, 1]),
});

type DeadlineFormData = z.infer<typeof deadlineFormSchema>;

// Sample deadline data
const SAMPLE_DEADLINES = [
  {
    id: "1",
    title: "File Motion to Dismiss",
    description: "Deadline to file motion to dismiss unlawful arrest charges",
    dueDate: new Date("2025-09-15"),
    priority: "urgent",
    category: "filing",
    status: "upcoming",
    reminderDays: [7, 3, 1],
    isCompleted: false,
    createdAt: new Date("2025-08-30"),
  },
  {
    id: "2",
    title: "Discovery Response Due",
    description: "Respond to government's discovery requests",
    dueDate: new Date("2025-09-10"),
    priority: "high",
    category: "discovery",
    status: "upcoming",
    reminderDays: [5, 2, 1],
    isCompleted: false,
    createdAt: new Date("2025-08-28"),
  },
  {
    id: "3",
    title: "FOIA Appeal Deadline",
    description: "Appeal deadline for USMS FOIA denial",
    dueDate: new Date("2025-10-01"),
    priority: "medium",
    category: "appeal",
    status: "upcoming",
    reminderDays: [14, 7, 3],
    isCompleted: false,
    createdAt: new Date("2025-08-25"),
  },
];

const DEADLINE_CATEGORIES = [
  { value: "filing", label: "Court Filing" },
  { value: "discovery", label: "Discovery" },
  { value: "hearing", label: "Hearing" },
  { value: "appeal", label: "Appeal" },
  { value: "foia", label: "FOIA Request" },
  { value: "response", label: "Response Due" },
  { value: "other", label: "Other" },
];

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function Deadlines() {
  const [deadlines, setDeadlines] = useState(SAMPLE_DEADLINES);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const form = useForm<DeadlineFormData>({
    resolver: zodResolver(deadlineFormSchema),
    defaultValues: {
      priority: "medium",
      reminderDays: [7, 3, 1],
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleExport = () => {
    window.print();
  };

  const onSubmit = (data: DeadlineFormData) => {
    const newDeadline = {
      id: Date.now().toString(),
      ...data,
      description: data.description || "",
      status: "upcoming" as const,
      isCompleted: false,
      createdAt: new Date(),
    };
    
    setDeadlines(prev => [newDeadline, ...prev]);
    setIsCreateDialogOpen(false);
    form.reset();
  };

  const toggleComplete = (id: string) => {
    setDeadlines(prev => prev.map(deadline => 
      deadline.id === id 
        ? { ...deadline, isCompleted: !deadline.isCompleted, status: deadline.isCompleted ? "upcoming" : "completed" }
        : deadline
    ));
  };

  // Filter deadlines
  const filteredDeadlines = deadlines.filter(deadline => {
    const matchesSearch = searchQuery.trim() === "" || 
      deadline.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deadline.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || deadline.category === categoryFilter;
    const matchesPriority = priorityFilter === "all" || deadline.priority === priorityFilter;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Sort deadlines by due date
  const sortedDeadlines = [...filteredDeadlines].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  // Calculate deadline status
  const getDeadlineStatus = (deadline: typeof SAMPLE_DEADLINES[0]) => {
    if (deadline.isCompleted) return "completed";
    
    const daysUntilDue = differenceInDays(deadline.dueDate, new Date());
    const isPastDue = isBefore(deadline.dueDate, new Date()) && !isToday(deadline.dueDate);
    
    if (isPastDue) return "overdue";
    if (daysUntilDue <= 1) return "urgent";
    if (daysUntilDue <= 7) return "warning";
    return "upcoming";
  };

  const deadlineStats = {
    total: deadlines.length,
    upcoming: deadlines.filter(d => !d.isCompleted && differenceInDays(d.dueDate, new Date()) > 7).length,
    warning: deadlines.filter(d => !d.isCompleted && differenceInDays(d.dueDate, new Date()) <= 7 && differenceInDays(d.dueDate, new Date()) > 1).length,
    urgent: deadlines.filter(d => !d.isCompleted && (differenceInDays(d.dueDate, new Date()) <= 1 || isToday(d.dueDate))).length,
    overdue: deadlines.filter(d => !d.isCompleted && isBefore(d.dueDate, new Date()) && !isToday(d.dueDate)).length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "overdue": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "urgent": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "warning": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  return (
    <div className={cn("h-screen overflow-y-auto", isMobile ? "pt-16" : "")}>
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <Header
          title="Deadline Reminders"
          onSearch={handleSearch}
          onExport={handleExport}
          searchPlaceholder="Search deadlines..."
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Card className="rounded-xl">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Target className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-blue-600 dark:text-blue-400">{deadlineStats.upcoming}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Upcoming</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{deadlineStats.warning}</div>
              <div className="text-xs md:text-sm text-muted-foreground">This Week</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-orange-600 dark:text-orange-400">{deadlineStats.urgent}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Urgent</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-red-600 dark:text-red-400">{deadlineStats.overdue}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Overdue</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="rounded-xl">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between md:gap-4">
              <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:gap-4">
                <div className="flex flex-col md:flex-row gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-32" data-testid="category-filter">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {DEADLINE_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
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
                  placeholder="Search deadlines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64"
                  data-testid="deadline-search-input"
                />
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full md:w-auto" data-testid="create-deadline-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    New Deadline
                  </Button>
                </DialogTrigger>
                <DialogContent className={cn("max-w-2xl max-h-[90vh] overflow-y-auto", isMobile && "w-[95vw]")}>
                  <DialogHeader>
                    <DialogTitle>Create New Deadline</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deadline Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter deadline title..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the deadline and requirements..."
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
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {DEADLINE_CATEGORIES.map((category) => (
                                  <SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                          Create Deadline
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Deadlines List */}
        {sortedDeadlines.length > 0 ? (
          <div className="space-y-3 md:space-y-4">
            {sortedDeadlines.map((deadline) => {
              const status = getDeadlineStatus(deadline);
              const daysUntilDue = differenceInDays(deadline.dueDate, new Date());
              
              return (
                <Card key={deadline.id} className={cn(
                  "rounded-xl transition-all",
                  status === "overdue" && "border-red-200 dark:border-red-800",
                  status === "urgent" && "border-orange-200 dark:border-orange-800",
                  deadline.isCompleted && "opacity-60"
                )}>
                  <CardContent className="p-3 md:p-6">
                    <div className="flex items-start gap-3 md:gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleComplete(deadline.id)}
                        className={cn(
                          "mt-1 p-1 h-6 w-6 rounded-full",
                          deadline.isCompleted && "bg-green-100 dark:bg-green-900"
                        )}
                        data-testid={`deadline-complete-${deadline.id}`}
                      >
                        {deadline.isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <div className="h-4 w-4 border-2 border-muted-foreground rounded-full" />
                        )}
                      </Button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                          <h3 className={cn(
                            "font-semibold text-sm md:text-base line-clamp-2",
                            deadline.isCompleted && "line-through text-muted-foreground"
                          )}>
                            {deadline.title}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={cn("text-xs", getStatusColor(status))}>
                              {status === "overdue" && "Overdue"}
                              {status === "urgent" && "Due Soon"}
                              {status === "warning" && "This Week"}
                              {status === "upcoming" && "Upcoming"}
                              {status === "completed" && "Completed"}
                            </Badge>
                            <Badge className={cn("text-xs", PRIORITY_COLORS[deadline.priority as keyof typeof PRIORITY_COLORS])}>
                              {deadline.priority.charAt(0).toUpperCase() + deadline.priority.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        
                        {deadline.description && (
                          <p className="text-xs md:text-sm text-muted-foreground mb-3 line-clamp-2">
                            {deadline.description}
                          </p>
                        )}

                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            <span className="font-medium">Due:</span> 
                            <span className={cn(
                              status === "overdue" && "text-red-600 dark:text-red-400 font-medium",
                              status === "urgent" && "text-orange-600 dark:text-orange-400 font-medium"
                            )}>
                              {format(deadline.dueDate, "MMM d, yyyy")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Category:</span> 
                            <span>{DEADLINE_CATEGORIES.find(c => c.value === deadline.category)?.label}</span>
                          </div>
                          {!deadline.isCompleted && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">
                                {daysUntilDue < 0 ? "Overdue by:" : "Days left:"}
                              </span>
                              <span className={cn(
                                daysUntilDue < 0 && "text-red-600 dark:text-red-400 font-medium",
                                daysUntilDue <= 1 && daysUntilDue >= 0 && "text-orange-600 dark:text-orange-400 font-medium"
                              )}>
                                {Math.abs(daysUntilDue)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm">
                          <Bell className="w-3 h-3 mr-1" />
                          {isMobile ? "" : "Remind"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="rounded-xl">
            <CardContent className="p-8 md:p-12 text-center">
              <CalendarIcon className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No deadlines found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? `No deadlines match your search for "${searchQuery}"`
                  : "Create your first deadline to get started"
                }
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Deadline
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}