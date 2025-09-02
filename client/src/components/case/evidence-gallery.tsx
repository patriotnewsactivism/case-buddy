import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, Download, Play, Pause } from "lucide-react";
import { CASE_DOCUMENTS, Doc, formatDate } from "@/lib/case-data";

interface EvidenceGalleryProps {
  maxItems?: number;
  showViewAll?: boolean;
}

export function EvidenceGallery({ maxItems = 4, showViewAll = true }: EvidenceGalleryProps) {
  const [selectedEvidence, setSelectedEvidence] = useState<Doc | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const evidenceItems = CASE_DOCUMENTS.filter(doc => 
    doc.type === "image" || doc.type === "audio"
  ).slice(0, maxItems);

  const renderEvidencePreview = (item: Doc) => {
    if (item.type === "image") {
      return (
        <img
          src={item.path || "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
          alt={item.title}
          className="w-full h-32 object-cover"
        />
      );
    }

    if (item.type === "audio") {
      return (
        <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center">
          <div className="text-center">
            <Play className="w-8 h-8 text-primary mx-auto mb-2" />
            <span className="text-sm font-medium">Audio Evidence</span>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-32 bg-muted flex items-center justify-center">
        <span className="text-muted-foreground">Preview not available</span>
      </div>
    );
  };

  const renderEvidenceModal = (item: Doc) => {
    if (item.type === "image") {
      return (
        <div className="space-y-4">
          <img
            src={item.path || "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800"}
            alt={item.title}
            className="w-full rounded-lg border border-border max-h-[70vh] object-contain"
          />
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium">{item.title}</p>
              {item.date && (
                <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
              )}
            </div>
            <Button size="sm" variant="outline" data-testid="download-evidence">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      );
    }

    if (item.type === "audio") {
      return (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary/10 to-chart-2/10 rounded-lg p-8 text-center">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              {isPlaying ? (
                <Pause className="w-12 h-12 text-primary" />
              ) : (
                <Play className="w-12 h-12 text-primary" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            {item.date && (
              <p className="text-sm text-muted-foreground mb-4">{formatDate(item.date)}</p>
            )}
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="mb-4"
              data-testid="play-audio-evidence"
            >
              {isPlaying ? "Pause" : "Play"} Audio
            </Button>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: "30%" }}></div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{item.summary}</p>
            <Button size="sm" variant="outline" data-testid="download-audio">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      );
    }

    return <div>Preview not available for this evidence type.</div>;
  };

  return (
    <>
      <Card className="rounded-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Key Evidence</CardTitle>
            {showViewAll && (
              <Button variant="ghost" size="sm" data-testid="view-all-evidence">
                View All
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {evidenceItems.map((item) => (
              <div
                key={item.id}
                className="evidence-zoom cursor-pointer rounded-lg overflow-hidden border border-border"
                onClick={() => setSelectedEvidence(item)}
                data-testid={`evidence-item-${item.id}`}
              >
                {renderEvidencePreview(item)}
                <div className="p-3">
                  <h4 className="font-medium text-sm mb-1 line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {item.summary}
                  </p>
                  {item.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ZoomIn className="text-primary w-4 h-4" />
              <span className="font-medium text-sm">Evidence Summary</span>
            </div>
            <p className="text-xs text-muted-foreground">
              All evidence items are categorized, timestamped, and cross-referenced with timeline events. 
              Digital chain of custody maintained.
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedEvidence} onOpenChange={() => setSelectedEvidence(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ZoomIn className="w-5 h-5" />
              Evidence Viewer
            </DialogTitle>
          </DialogHeader>
          {selectedEvidence && renderEvidenceModal(selectedEvidence)}
        </DialogContent>
      </Dialog>
    </>
  );
}
