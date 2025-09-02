import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, Camera, AlertTriangle } from "lucide-react";
import { CASE_STATS } from "@/lib/case-data";

export function StatsGrid() {
  const stats = [
    {
      title: "Total Documents",
      value: CASE_STATS.totalDocuments,
      description: "Legal filings, evidence, correspondence",
      icon: FileText,
      color: "primary",
    },
    {
      title: "Timeline Events",
      value: CASE_STATS.timelineEvents,
      description: "Chronological case developments",
      icon: Clock,
      color: "chart-2",
    },
    {
      title: "Evidence Items",
      value: CASE_STATS.evidenceItems,
      description: "Photos, recordings, physical evidence",
      icon: Camera,
      color: "chart-3",
    },
    {
      title: "Potential Violations",
      value: CASE_STATS.potentialViolations,
      description: "Identified legal infractions",
      icon: AlertTriangle,
      color: "chart-4",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="case-stat border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className={`w-12 h-12 bg-${stat.color}/10 rounded-lg flex items-center justify-center`}>
              <stat.icon className={`text-${stat.color} text-xl w-6 h-6`} />
            </div>
            <span className={`text-3xl font-bold text-${stat.color}`} data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
              {stat.value}
            </span>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-base font-semibold mb-1">{stat.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
