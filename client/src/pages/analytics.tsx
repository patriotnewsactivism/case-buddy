import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { BarChart, TrendingUp, PieChart, Activity, FileText, Clock, Camera, AlertTriangle, Download } from "lucide-react";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";
import { CASE_DOCUMENTS, CASE_TIMELINE, FOIA_REQUESTS, LEGAL_ISSUES, formatDate } from "@/lib/case-data";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("all");
  const [chartType, setChartType] = useState("timeline");

  const handleSearch = (query: string) => {
    console.log("Searching analytics:", query);
  };

  const handleExport = () => {
    window.print();
  };

  // Calculate analytics data
  const documentsByType = CASE_DOCUMENTS.reduce((acc, doc) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const documentTypeData = Object.entries(documentsByType).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count,
    percentage: Math.round((count / CASE_DOCUMENTS.length) * 100),
  }));

  const timelineData = CASE_TIMELINE.reduce((acc, event) => {
    const month = new Date(event.date).toISOString().slice(0, 7);
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.events += 1;
    } else {
      acc.push({ 
        month, 
        events: 1,
        monthName: new Date(event.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      });
    }
    return acc;
  }, [] as { month: string; events: number; monthName: string }[])
  .sort((a, b) => a.month.localeCompare(b.month));

  const foiaStatusData = FOIA_REQUESTS.reduce((acc, request) => {
    acc[request.status] = (acc[request.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const foiaChartData = Object.entries(foiaStatusData).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
    percentage: Math.round((count / FOIA_REQUESTS.length) * 100),
  }));

  const legalIssuesByPriority = LEGAL_ISSUES.reduce((acc, issue) => {
    acc[issue.priority] = (acc[issue.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityData = Object.entries(legalIssuesByPriority).map(([priority, count]) => ({
    priority: priority.charAt(0).toUpperCase() + priority.slice(1),
    count,
    color: priority === "critical" ? "#ef4444" : 
           priority === "high" ? "#f97316" :
           priority === "medium" ? "#eab308" : "#22c55e"
  }));

  const caseMetrics = {
    caseStrength: 88,
    documentCompleteness: 92,
    timelineCoherence: 95,
    evidenceQuality: 89,
    legalCompliance: 85,
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="flex-1 overflow-hidden">
      <Header
        title="Analytics Dashboard"
        onSearch={handleSearch}
        onExport={handleExport}
      />

      <div className="p-6 overflow-y-auto h-full bg-muted/30 print-friendly">
        {/* Analytics Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Case Analytics & Insights</h2>
            <p className="text-muted-foreground">
              Comprehensive analysis of case progress, evidence, and legal strength
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32" data-testid="analytics-time-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="1m">Last Month</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="export-analytics">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs bg-chart-2/10 text-chart-2">
                  +12% vs baseline
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-primary">{caseMetrics.caseStrength}%</h3>
              <p className="text-sm text-muted-foreground">Overall Case Strength</p>
              <Progress value={caseMetrics.caseStrength} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-chart-2" />
                </div>
                <Badge variant="secondary" className="text-xs bg-chart-2/10 text-chart-2">
                  Excellent
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-chart-2">{caseMetrics.documentCompleteness}%</h3>
              <p className="text-sm text-muted-foreground">Document Completeness</p>
              <Progress value={caseMetrics.documentCompleteness} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-chart-3" />
                </div>
                <Badge variant="secondary" className="text-xs bg-chart-3/10 text-chart-3">
                  Strong
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-chart-3">{caseMetrics.timelineCoherence}%</h3>
              <p className="text-sm text-muted-foreground">Timeline Coherence</p>
              <Progress value={caseMetrics.timelineCoherence} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                  <Camera className="w-6 h-6 text-chart-4" />
                </div>
                <Badge variant="secondary" className="text-xs bg-chart-4/10 text-chart-4">
                  High Quality
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-chart-4">{caseMetrics.evidenceQuality}%</h3>
              <p className="text-sm text-muted-foreground">Evidence Quality</p>
              <Progress value={caseMetrics.evidenceQuality} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Timeline Activity Chart */}
          <Card className="rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Case Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <XAxis 
                      dataKey="monthName" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      allowDecimals={false} 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      cursor={{ fill: "transparent" }}
                      formatter={(value) => [value, "Events"]}
                    />
                    <Area 
                      type="monotone"
                      dataKey="events" 
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Document Distribution */}
          <Card className="rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Document Type Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={documentTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percentage }) => `${type} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {documentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Documents"]} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* FOIA Status */}
          <Card className="rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                FOIA Request Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={foiaChartData}>
                    <XAxis 
                      dataKey="status" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      allowDecimals={false} 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      cursor={{ fill: "hsl(var(--muted))" }}
                      formatter={(value) => [value, "Requests"]}
                    />
                    <Bar 
                      dataKey="count" 
                      radius={[6, 6, 0, 0]}
                      fill="hsl(var(--chart-2))"
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Legal Issues Priority */}
          <Card className="rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Legal Issues by Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {priorityData.map((item) => (
                  <div key={item.priority} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.priority} Priority</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{item.count}</span>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                    <Progress 
                      value={(item.count / LEGAL_ISSUES.length) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <Card className="rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Detailed Case Strength Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Evidence Quality</span>
                    <span className="text-sm font-semibold text-chart-2">{caseMetrics.evidenceQuality}%</span>
                  </div>
                  <Progress value={caseMetrics.evidenceQuality} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    High-quality documentation with clear chain of custody
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Documentation Completeness</span>
                    <span className="text-sm font-semibold text-primary">{caseMetrics.documentCompleteness}%</span>
                  </div>
                  <Progress value={caseMetrics.documentCompleteness} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Comprehensive record collection across multiple sources
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Timeline Coherence</span>
                    <span className="text-sm font-semibold text-chart-3">{caseMetrics.timelineCoherence}%</span>
                  </div>
                  <Progress value={caseMetrics.timelineCoherence} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Clear chronological sequence with cross-referenced events
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Legal Compliance</span>
                    <span className="text-sm font-semibold text-chart-4">{caseMetrics.legalCompliance}%</span>
                  </div>
                  <Progress value={caseMetrics.legalCompliance} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Adherence to procedural requirements and legal standards
                  </p>
                </div>

                <div className="bg-primary/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">Key Insights</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Strong evidence foundation with verifiable sources</li>
                    <li>• Timeline shows clear pattern of escalation</li>
                    <li>• FOIA responses support constitutional claims</li>
                    <li>• Multi-jurisdictional scope strengthens federal case</li>
                  </ul>
                </div>

                <div className="bg-chart-3/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-chart-3" />
                    <span className="font-medium text-sm">Recommendations</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Gather additional witness statements</li>
                    <li>• Expand documentation for jurisdictional claims</li>
                    <li>• Focus on constitutional law precedents</li>
                    <li>• Prepare expert testimony on civil rights violations</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
