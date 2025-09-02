import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Image, Video, List, Info, ExternalLink } from "lucide-react";
import { Doc, DocType, formatDate } from "@/lib/case-data";

interface DocumentCardProps {
  document: Doc;
  onOpen?: (doc: Doc) => void;
}

export function DocumentCard({ document, onOpen }: DocumentCardProps) {
  const getTypeIcon = (type: DocType) => {
    switch (type) {
      case "pdf":
      case "letter":
        return <FileText className="h-4 w-4" />;
      case "image":
        return <Image className="h-4 w-4" />;
      case "audio":
        return <Video className="h-4 w-4" />;
      case "transcript":
        return <List className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: DocType) => {
    switch (type) {
      case "pdf":
      case "letter":
        return "chart-4";
      case "image":
        return "chart-3";
      case "audio":
        return "chart-2";
      case "transcript":
        return "primary";
      default:
        return "muted-foreground";
    }
  };

  return (
    <Card className="rounded-xl sm:rounded-2xl hover:shadow-md transition-all duration-200 evidence-zoom">
      <CardHeader className="pb-2 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm sm:text-base leading-tight line-clamp-2">
              {document.title}
            </CardTitle>
            {document.date && (
              <div className="text-xs text-muted-foreground mt-1">
                {formatDate(document.date)}
              </div>
            )}
          </div>
          <div className={`text-${getTypeColor(document.type)} flex-shrink-0`}>
            {getTypeIcon(document.type)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 p-3 sm:p-4 pt-0">
        <p className="text-sm line-clamp-2 sm:line-clamp-3 min-h-[2.5rem] sm:min-h-[3.5rem] text-muted-foreground">
          {document.summary}
        </p>
        
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {document.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs sm:text-sm"
            onClick={() => onOpen?.(document)}
            data-testid={`open-document-${document.id}`}
          >
            Open
          </Button>
          
          {document.path && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              data-testid={`view-source-${document.id}`}
            >
              <a
                href={document.path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Source
              </a>
            </Button>
          )}
        </div>
        
        {document.sourceNote && (
          <div className="text-xs text-muted-foreground italic border-t pt-2">
            {document.sourceNote}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
