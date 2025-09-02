import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Download, Upload, Grid, List, Camera, Video as VideoIcon, Mic } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { TranscriptionButton } from "@/components/TranscriptionButton";
import { CASE_DOCUMENTS, Doc } from "@/lib/case-data";
import type { UploadResult } from "@uppy/core";
import { useToast } from "@/hooks/use-toast";

export default function VideoEvidence() {
  const [selectedVideo, setSelectedVideo] = useState<Doc | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterQuality, setFilterQuality] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [transcripts, setTranscripts] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleExport = () => {
    window.print();
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    console.log("Video upload completed:", result);
    if (result.successful && result.successful.length > 0) {
      try {
        for (const file of result.successful) {
          const response = await fetch('/api/documents', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              documentURL: file.uploadURL,
              title: file.name,
              type: 'video',
              tags: ['video-evidence', 'uploaded'],
            }),
          });
          
          if (response.ok) {
            console.log(`Video ${file.name} processed successfully`);
          } else {
            console.error(`Failed to process video ${file.name}`);
          }
        }
        alert(`Successfully uploaded ${result.successful.length} video(s)!`);
        // Refresh the page to show new videos
        window.location.reload();
      } catch (error) {
        console.error('Error processing uploaded videos:', error);
        alert('Videos uploaded but there was an error processing them.');
      }
    } else if (result.failed && result.failed.length > 0) {
      alert(`Upload failed: ${result.failed.map(f => f.error).join(', ')}`);
    }
  };

  const getUploadParameters = async () => {
    try {
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      return { method: 'PUT' as const, url: data.uploadURL };
    } catch (error) {
      console.error('Failed to get upload URL:', error);
      throw error;
    }
  };

  // Filter video evidence items
  const videoItems = CASE_DOCUMENTS.filter(doc => doc.type === "video");

  const filteredVideos = videoItems.filter(item => {
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

  const videoStats = {
    total: videoItems.length,
    hours: Math.floor(videoItems.length * 1.5), // Estimated total hours
    evidence: videoItems.filter(item => item.tags?.includes("evidence")).length,
    surveillance: videoItems.filter(item => item.tags?.includes("surveillance")).length,
  };

  const renderVideoPreview = (item: Doc) => (
    <div className="w-full h-48 bg-gradient-to-br from-chart-4/20 to-chart-1/20 flex items-center justify-center rounded-lg border">
      <div className="text-center">
        <Play className="w-16 h-16 text-chart-4 mx-auto mb-3" />
        <span className="text-sm font-medium text-chart-4">Video Evidence</span>
        <p className="text-xs text-muted-foreground mt-1">Click to play</p>
      </div>
    </div>
  );

  const renderListView = (item: Doc) => (
    <Card key={item.id} className="rounded-xl mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-24 h-16 bg-chart-4/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Play className="w-6 h-6 text-chart-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1 line-clamp-1">{item.title}</h3>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.summary}</p>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {item.type.toUpperCase()}
              </Badge>
              <span className="text-xs text-muted-foreground">{item.date}</span>
            </div>
            {item.tags && (
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {item.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{item.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              onClick={() => setSelectedVideo(item)}
              data-testid={`video-view-${item.id}`}
            >
              <Play className="w-4 h-4 mr-2" />
              Play
            </Button>
            <TranscriptionButton
              audioUrl={item.path}
              buttonText="Transcribe"
              className="btn-sm"
              onTranscriptionComplete={(transcript, summary) => {
                setTranscripts(prev => ({ ...prev, [item.id]: transcript }));
                toast({
                  title: "Transcription Complete",
                  description: `Audio track transcribed successfully`,
                });
              }}
            />
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Header
        title="Video Evidence"
        subtitle="Video documentation and evidence files"
        onSearch={handleSearch}
        onExport={handleExport}
        searchPlaceholder="Search video evidence..."
      />

      {/* Video Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-xl">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <VideoIcon className="w-6 h-6 text-chart-4" />
            </div>
            <div className="text-2xl font-bold text-chart-4">{videoStats.total}</div>
            <div className="text-sm text-muted-foreground">Total Videos</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">{videoStats.hours}h</div>
            <div className="text-sm text-muted-foreground">Total Runtime</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Camera className="w-6 h-6 text-chart-2" />
            </div>
            <div className="text-2xl font-bold text-chart-2">{videoStats.evidence}</div>
            <div className="text-sm text-muted-foreground">Evidence Videos</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <VideoIcon className="w-6 h-6 text-destructive" />
            </div>
            <div className="text-2xl font-bold text-destructive">{videoStats.surveillance}</div>
            <div className="text-sm text-muted-foreground">Surveillance</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Quality:</label>
                <Select value={filterQuality} onValueChange={setFilterQuality}>
                  <SelectTrigger className="w-32" data-testid="video-quality-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quality</SelectItem>
                    <SelectItem value="4k">4K</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                    <SelectItem value="720p">720p</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Input
                placeholder="Search video evidence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
                data-testid="video-search-input"
              />
            </div>

            <div className="flex items-center gap-2">
              <ObjectUploader
                maxNumberOfFiles={5}
                maxFileSize={524288000} // 500MB for video files
                allowedFileTypes={['.mp4', '.mov', '.avi', '.mkv', '.webm']}
                onGetUploadParameters={getUploadParameters}
                onComplete={handleUploadComplete}
                buttonClassName="gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Videos
              </ObjectUploader>

              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  data-testid="video-grid-view"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  data-testid="video-list-view"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Gallery */}
      {filteredVideos.length > 0 ? (
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <VideoIcon className="w-5 h-5" />
              Video Evidence ({filteredVideos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === "grid" ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVideos.map((video) => (
                  <Card
                    key={video.id}
                    className="rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedVideo(video)}
                    data-testid={`video-card-${video.id}`}
                  >
                    <CardContent className="p-4">
                      {renderVideoPreview(video)}
                      <div className="mt-3">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{video.title}</h3>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{video.summary}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {video.type.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{video.date}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVideos.map(renderListView)}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-xl">
          <CardContent className="p-12 text-center">
            <VideoIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">No video evidence found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? `No videos match your search for "${searchQuery}"`
                : "Upload video evidence to get started"
              }
            </p>
            <ObjectUploader
              maxNumberOfFiles={5}
              maxFileSize={524288000} // 500MB
              allowedFileTypes={['.mp4', '.mov', '.avi', '.mkv', '.webm']}
              onGetUploadParameters={getUploadParameters}
              onComplete={handleUploadComplete}
              buttonClassName="gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload First Video
            </ObjectUploader>
          </CardContent>
        </Card>
      )}

      {/* Video Detail Modal */}
      {selectedVideo && (
        <Dialog open={true} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                {selectedVideo.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Video Player Placeholder */}
              <div className="w-full h-64 bg-gradient-to-br from-chart-4/20 to-chart-1/20 flex items-center justify-center rounded-lg border">
                <div className="text-center">
                  <Play className="w-20 h-20 text-chart-4 mx-auto mb-4" />
                  <p className="text-lg font-medium text-chart-4">Video Player</p>
                  <p className="text-sm text-muted-foreground">Video playback would appear here</p>
                </div>
              </div>

              {/* Video Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Type:</span> {selectedVideo.type}</div>
                    <div><span className="font-medium">Date:</span> {selectedVideo.date}</div>
                    <div><span className="font-medium">Source:</span> {selectedVideo.sourceNote}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVideo.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground">{selectedVideo.summary}</p>
              </div>

              <div className="flex gap-3">
                <Button>
                  <Play className="w-4 h-4 mr-2" />
                  Play Video
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}