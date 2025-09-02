import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, FileText } from "lucide-react";
import { TimelineEvent, formatDate, getDocumentById } from "@/lib/case-data";

interface TimelineEventProps {
  event: TimelineEvent;
  onDocumentClick?: (docId: string) => void;
  showConnector?: boolean;
}

export function TimelineEventComponent({ event, onDocumentClick, showConnector = true }: TimelineEventProps) {
  const getEventIcon = (tags?: string[] | null) => {
    if (tags?.includes("FOIA")) return "📄";
    if (tags?.includes("courthouse")) return "🏛️";
    if (tags?.includes("livestream")) return "📹";
    return "⚖️";
  };

  const getEventPriority = (tags?: string[] | null) => {
    if (tags?.includes("critical") || tags?.includes("criminal")) return "Critical Event";
    if (tags?.includes("FOIA")) return "FOIA Request";
    if (tags?.includes("response")) return "Response";
    return "Event";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical Event": return "destructive";
      case "FOIA Request": return "chart-2";
      case "Response": return "chart-3";
      default: return "primary";
    }
  };

  return (
    <div className="relative flex items-start gap-6">
      {showConnector && (
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center border-4 border-background relative z-10">
          <span className="text-lg">{getEventIcon(event.tags || undefined)}</span>
        </div>
      )}
      
      <Card className="flex-1 min-w-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-primary">
              {formatDate(event.date)}
            </div>
            <Badge 
              variant="secondary" 
              className={`text-xs bg-${getPriorityColor(getEventPriority(event.tags))}/10 text-${getPriorityColor(getEventPriority(event.tags))}`}
            >
              {getEventPriority(event.tags || undefined)}
            </Badge>
          </div>
          <CardTitle className="text-base font-semibold">
            {event.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {event.summary}
          </p>
          
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {event.docRefs && event.docRefs.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Related Documents:</div>
              <div className="flex flex-wrap gap-2">
                {event.docRefs.map((docId) => {
                  const doc = getDocumentById(docId);
                  if (!doc) return null;
                  
                  return (
                    <Button
                      key={docId}
                      variant="secondary"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => onDocumentClick?.(docId)}
                      data-testid={`document-ref-${docId}`}
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      {doc.title.length > 40 ? `${doc.title.slice(0, 40)}...` : doc.title}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
