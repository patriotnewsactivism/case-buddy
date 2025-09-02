import { useState } from "react";
import { Header } from "@/components/layout/header";
import { TimelineEventComponent } from "@/components/case/timeline-event";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter, FileText, BarChart } from "lucide-react";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { CASE_TIMELINE, Doc, formatDate, getDocumentById } from "@/lib/case-data";

export default function Timeline() {
  const [selectedDocument, setSelectedDocument] = useState<Doc | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const handleSearch = (query: string) => {
    console.log("Searching timeline:", query);
  };

  const handleExport = () => {
    window.print();
  };

  const handleDocumentClick = (docId: string) => {
    const doc = getDocumentById(docId);
    if (doc) {
      setSelectedDocument(doc);
    }
  };

  // Filter timeline events
  const filteredTimeline = CASE_TIMELINE.filter(event => {
    if (filterType !== "all") {
      const hasTag = event.tags?.includes(filterType);
      if (!hasTag) return false;
    }

    if (dateRange.start && event.date < dateRange.start) return false;
    if (dateRange.end && event.date > dateRange.end) return false;

    return true;
  });

  // Create chart data
  const chartData = CASE_TIMELINE.reduce((acc, event) => {
    const month = new Date(event.date).toISOString().slice(0, 7);
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.events += 1;
    } else {
      acc.push({ month, events: 1 });
    }
    return acc;
  }, [] as { month: string; events: number }[])
  .sort((a, b) => a.month.localeCompare(b.month));

  const filterOptions = [
    { value: "all", label: "All Events" },
    { value: "courthouse", label: "Courthouse Events" },
    { value: "FOIA", label: "FOIA Related" },
    { value: "critical", label: "Critical Events" },
    { value: "recording", label: "Recordings" },
  ];

  return (
    <div className="flex-1 overflow-hidden">
      <Header
        title="Case Timeline"
        onSearch={handleSearch}
        onExport={handleExport}
      />

      <div className="p-4 sm:p-6 overflow-y-auto h-full bg-muted/30 print-friendly">
        {/* Timeline Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Case Timeline & Events</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Chronological view of all case developments and key events
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {filteredTimeline.length} Events
            </Badge>
          </div>
        </div>

        {/* Filters and Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Filters */}
          <Card className="lg:col-span-1 rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-3 sm:p-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Event Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger data-testid="timeline-filter-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    type="date"
                    placeholder="Start date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    data-testid="timeline-start-date"
                  />
                  <Input
                    type="date"
                    placeholder="End date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    data-testid="timeline-end-date"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setFilterType("all");
                  setDateRange({ start: "", end: "" });
                }}
                data-testid="clear-timeline-filters"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>

          {/* Events Chart */}
          <Card className="lg:col-span-2 rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Events by Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={chartData}>
                    <XAxis 
                      dataKey="month" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => new Date(value + "-01").toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                    />
                    <YAxis 
                      allowDecimals={false} 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      cursor={{ fill: "hsl(var(--muted))" }}
                      labelFormatter={(value) => new Date(value + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      formatter={(value) => [value, "Events"]}
                    />
                    <Bar 
                      dataKey="events" 
                      radius={[6, 6, 0, 0]}
                      fill="hsl(var(--primary))"
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Events */}
        <Card className="rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Timeline Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 timeline-line"></div>
              <div className="space-y-8">
                {filteredTimeline.map((event) => (
                  <TimelineEventComponent
                    key={event.id}
                    event={event}
                    onDocumentClick={handleDocumentClick}
                  />
                ))}
                {filteredTimeline.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No events match the current filters
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Viewer Modal */}
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Document Viewer
              </DialogTitle>
            </DialogHeader>
            {selectedDocument && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {selectedDocument.date && <span>{formatDate(selectedDocument.date)}</span>}
                  {selectedDocument.sourceNote && (
                    <>
                      <span>•</span>
                      <span>{selectedDocument.sourceNote}</span>
                    </>
                  )}
                </div>
                {selectedDocument.path ? (
                  selectedDocument.type === "image" ? (
                    <img
                      src={selectedDocument.path}
                      alt={selectedDocument.title}
                      className="w-full rounded-lg border max-h-[70vh] object-contain"
                    />
                  ) : (
                    <iframe
                      title={selectedDocument.title}
                      src={selectedDocument.path}
                      className="w-full h-[70vh] rounded-lg border"
                    />
                  )
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No preview available for this document
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{selectedDocument.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedDocument.summary}</p>
                  </div>
                  {selectedDocument.path && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={selectedDocument.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="open-document-source"
                      >
                        Open Source
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
