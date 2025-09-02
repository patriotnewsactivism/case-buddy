import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, BarChart, Lightbulb, FileText, Download } from "lucide-react";
import { LEGAL_ISSUES } from "@/lib/case-data";

export function LegalAnalysis() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "chart-4";
      case "medium": return "chart-3";
      case "low": return "chart-2";
      default: return "muted";
    }
  };

  const getCaseStrengthMetrics = () => [
    { label: "Evidence Quality", value: 92, color: "chart-2" },
    { label: "Documentation Completeness", value: 88, color: "primary" },
    { label: "Timeline Coherence", value: 95, color: "chart-3" },
    { label: "Jurisdictional Coverage", value: 76, color: "chart-4" },
  ];

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Legal Analysis Dashboard</CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" data-testid="generate-legal-brief">
              <FileText className="w-4 h-4 mr-2" />
              Generate Brief
            </Button>
            <Button size="sm" variant="outline" data-testid="export-analysis">
              <Download className="w-4 h-4 mr-2" />
              Export Analysis
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Potential Violations */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="text-chart-4 w-5 h-5" />
              Identified Legal Issues
            </h4>
            
            <div className="space-y-3">
              {LEGAL_ISSUES.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-4 rounded-lg border border-${getPriorityColor(issue.priority)}/20 bg-${getPriorityColor(issue.priority)}/5`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{issue.title}</span>
                    <Badge
                      variant="secondary"
                      className={`text-xs bg-${getPriorityColor(issue.priority)} text-white`}
                    >
                      {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)} Priority
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{issue.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {issue.category.replace('-', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Case Strength Metrics */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <BarChart className="text-primary w-5 h-5" />
              Case Strength Analysis
            </h4>
            
            <div className="space-y-4">
              {getCaseStrengthMetrics().map((metric) => (
                <div key={metric.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <span className={`text-sm font-semibold text-${metric.color}`}>
                      {metric.value}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`bg-${metric.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="text-primary w-4 h-4" />
                <span className="font-medium text-sm">Recommendation</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Strong case foundation with excellent documentation. Focus on expanding 
                jurisdictional evidence and witness statements.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
