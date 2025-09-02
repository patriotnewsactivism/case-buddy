import { useState } from "react";
import { Header } from "@/components/layout/header";
import { EvidenceGallery } from "@/components/case/evidence-gallery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Video, Play, Download, ZoomIn, Grid, List } from "lucide-react";
import { CASE_DOCUMENTS, Doc, formatDate } from "@/lib/case-data";

export default function Evidence() {
  const [selectedEvidence, setSelectedEvidence] = useState<Doc | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleExport = () => {
    window.print();
  };

  // Filter evidence items (images, audio, video)
  const evidenceItems = CASE_DOCUMENTS.filter(doc => 
    doc.type === "image" || doc.type === "audio" || doc.type === "video"
  );

  const filteredEvidence = evidenceItems.filter(item => {
    if (filterType !== "all" && item.type !== filterType) return false;
    
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.summary?.toLowerCase().includes(searchLower) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  const evidenceStats = {
    total: evidenceItems.length,
    images: evidenceItems.filter(item => item.type === "image").length,
    audio: evidenceItems.filter(item => item.type === "audio").length,
    video: evidenceItems.filter(item => item.type === "video").length,
  };

  const renderEvidencePreview = (item: Doc) => {
    if (item.type === "image") {
      return (
        <img
          src={item.path || "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
          alt={item.title}
          className="w-full h-48 object-cover"
        />
      );
    }

    if (item.type === "audio") {
      return (
        <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center">
          <div className="text-center">
            <Video className="w-12 h-12 text-primary mx-auto mb-3" />
            <span className="text-sm font-medium">Audio Evidence</span>
            <p className="text-xs text-muted-foreground mt-1">Click to play</p>
          </div>
        </div>
      );
    }

    if (item.type === "video") {
      return (
        <div className="w-full h-48 bg-gradient-to-br from-chart-4/20 to-chart-1/20 flex items-center justify-center">
          <div className="text-center">
            <Play className="w-12 h-12 text-chart-4 mx-auto mb-3" />
            <span className="text-sm font-medium">Video Evidence</span>
            <p className="text-xs text-muted-foreground mt-1">Click to play</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-48 bg-muted flex items-center justify-center">
        <span className="text-muted-foreground">Preview not available</span>
      </div>
    );
  };

  const renderListView = (item: Doc) => (
    <Card
      key={item.id}
      className="cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={() => setSelectedEvidence(item)}
      data-testid={`evidence-list-item-${item.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden border border-border">
            {renderEvidencePreview(item)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold line-clamp-1">{item.title}</h3>
              <Badge variant="outline" className="capitalize text-xs">
                {item.type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {item.summary}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {item.date && <span>{formatDate(item.date)}</span>}
              {item.tags && item.tags.length > 0 && (
                <div className="flex gap-1">
                  {item.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderGridView = (item: Doc) => (
    <Card
      key={item.id}
      className="evidence-zoom cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={() => setSelectedEvidence(item)}
      data-testid={`evidence-grid-item-${item.id}`}
    >
      <div className="relative overflow-hidden">
        {renderEvidencePreview(item)}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs bg-black/50 text-white">
            {item.type.toUpperCase()}
          </Badge>
        </div>
        {item.type === "audio" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Play className="w-8 h-8 text-white" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium text-sm mb-2 line-clamp-2">{item.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {item.summary}
        </p>
        {item.date && (
          <p className="text-xs text-muted-foreground mb-2">{formatDate(item.date)}</p>
        )}
        {item.tags && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 overflow-hidden">
      <Header
        title="Evidence Gallery"
        onSearch={handleSearch}
        onExport={handleExport}
      />

      <div className="p-4 sm:p-6 overflow-y-auto h-full bg-muted/30 print-friendly">
        {/* Evidence Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Evidence Gallery</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Visual and audio evidence collection with metadata tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-1">
              <Camera className="w-3 h-3" />
              {evidenceStats.total} Items
            </Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">{evidenceStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Evidence</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ZoomIn className="w-6 h-6 text-chart-2" />
              </div>
              <div className="text-2xl font-bold text-chart-2">{evidenceStats.images}</div>
              <div className="text-sm text-muted-foreground">Images</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Video className="w-6 h-6 text-chart-3" />
              </div>
              <div className="text-2xl font-bold text-chart-3">{evidenceStats.audio}</div>
              <div className="text-sm text-muted-foreground">Audio Files</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Play className="w-6 h-6 text-chart-4" />
              </div>
              <div className="text-2xl font-bold text-chart-4">{evidenceStats.video}</div>
              <div className="text-sm text-muted-foreground">Videos</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="rounded-xl mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Filter:</label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32" data-testid="evidence-filter-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="image">Images</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Input
                  placeholder="Search evidence..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                  data-testid="evidence-search-input"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  data-testid="evidence-grid-view"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  data-testid="evidence-list-view"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evidence Gallery */}
        <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
          {filteredEvidence.map((item) => 
            viewMode === "grid" ? renderGridView(item) : renderListView(item)
          )}
          
          {filteredEvidence.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No evidence found</h3>
              <p className="text-sm">
                {searchQuery ? "Try adjusting your search terms" : "Upload evidence files to get started"}
              </p>
            </div>
          )}
        </div>

        {/* Evidence Viewer Modal */}
        <Dialog open={!!selectedEvidence} onOpenChange={() => setSelectedEvidence(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ZoomIn className="w-5 h-5" />
                Evidence Viewer
              </DialogTitle>
            </DialogHeader>
            {selectedEvidence && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {selectedEvidence.date && <span>Date: {formatDate(selectedEvidence.date)}</span>}
                    <Badge variant="outline" className="capitalize">
                      {selectedEvidence.type}
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline" data-testid="download-evidence">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="rounded-lg border overflow-hidden">
                  {selectedEvidence.type === "image" ? (
                    <img
                      src={selectedEvidence.path || "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800"}
                      alt={selectedEvidence.title}
                      className="w-full max-h-[70vh] object-contain"
                    />
                  ) : selectedEvidence.type === "audio" ? (
                    <div className="bg-gradient-to-br from-primary/10 to-chart-2/10 p-12 text-center">
                      <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="w-12 h-12 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-4">{selectedEvidence.title}</h3>
                      <Button className="mb-4" data-testid="play-audio-modal">
                        Play Audio
                      </Button>
                      <div className="w-full bg-muted rounded-full h-2 max-w-md mx-auto">
                        <div className="bg-primary h-2 rounded-full" style={{ width: "30%" }}></div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center text-muted-foreground">
                      Preview not available for this evidence type
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{selectedEvidence.title}</h3>
                  <p className="text-muted-foreground">{selectedEvidence.summary}</p>
                  
                  {selectedEvidence.tags && (
                    <div className="flex flex-wrap gap-2">
                      {selectedEvidence.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {selectedEvidence.sourceNote && (
                    <div className="text-sm text-muted-foreground italic border-t pt-2">
                      Source: {selectedEvidence.sourceNote}
                    </div>
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
