import { useState } from "react";
import { Header } from "@/components/layout/header";
import { StatsGrid } from "@/components/case/stats-grid";
import { TimelineEventComponent } from "@/components/case/timeline-event";
import { EvidenceGallery } from "@/components/case/evidence-gallery";
import { LegalAnalysis } from "@/components/case/legal-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Globe, MapPin } from "lucide-react";
import { CASE_TIMELINE, CASE_DOCUMENTS, FOIA_REQUESTS, Doc, formatDate, getDocumentById } from "@/lib/case-data";

export default function Dashboard() {
  const [selectedDocument, setSelectedDocument] = useState<Doc | null>(null);

  const handleSearch = (query: string) => {
    console.log("Searching:", query);
    // Search functionality will be implemented in the search context
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

  const recentTimeline = CASE_TIMELINE.slice(0, 3);
  const recentDocuments = CASE_DOCUMENTS
    .filter(doc => doc.date)
    .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
    .slice(0, 3);

  const activeFoiaRequests = FOIA_REQUESTS.filter(req => req.status !== "completed");

  return (
    <div className="flex-1 overflow-hidden">
      <Header
        title="CaseBuddy Dashboard"
        onSearch={handleSearch}
        onExport={handleExport}
      />

      <div className="p-4 sm:p-6 overflow-y-auto h-full bg-muted/30 print-friendly">
        {/* Case Overview Hero */}
        <div className="case-header text-white rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">CaseBuddy - Evidence Timeline</h1>
                <p className="text-sm sm:text-base lg:text-lg opacity-90 mb-4">Federal Civil Rights Violation Case</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>Case Initiated: June 23, 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Multiple Jurisdictions: LA, MS, TX, UT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Status: Active Investigation</span>
                  </div>
                </div>
              </div>
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-white/20 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
                  alt="Federal courthouse with classical columns"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        </div>

        {/* Statistics Grid */}
        <div className="mb-8">
          <StatsGrid />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Recent Timeline */}
          <div className="lg:col-span-2">
            <Card className="rounded-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Recent Timeline Events</CardTitle>
                  <Button variant="ghost" size="sm" data-testid="view-full-timeline">
                    View Full Timeline
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 timeline-line"></div>
                  <div className="space-y-8">
                    {recentTimeline.map((event) => (
                      <TimelineEventComponent
                        key={event.id}
                        event={event}
                        onDocumentClick={handleDocumentClick}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Evidence Gallery Preview */}
            <EvidenceGallery maxItems={4} />

            {/* Recent Documents */}
            <Card className="rounded-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Recent Documents</CardTitle>
                  <Button variant="ghost" size="sm" data-testid="manage-all-documents">
                    Manage All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => setSelectedDocument(doc)}
                      data-testid={`recent-document-${doc.id}`}
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="text-primary w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1 line-clamp-1">{doc.title}</h4>
                        <p className="text-xs text-muted-foreground mb-1 line-clamp-2">{doc.summary}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(doc.date || '')}</span>
                          <span>•</span>
                          <span className="capitalize">{doc.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FOIA Status */}
            <Card className="rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">FOIA Request Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeFoiaRequests.map((request) => (
                    <div
                      key={request.id}
                      className={`p-3 rounded-lg border ${
                        request.status === "completed" ? "border-chart-2/20 bg-chart-2/5" :
                        request.status === "pending" ? "border-chart-3/20 bg-chart-3/5" :
                        "border-border bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            request.status === "completed" ? "bg-chart-2" :
                            request.status === "pending" ? "bg-chart-3 animate-pulse" :
                            "bg-muted-foreground"
                          }`} />
                          <div>
                            <div className="font-medium text-sm">
                              {request.agency} #{request.requestNumber}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {request.responseSummary || request.description.slice(0, 50) + "..."}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Legal Analysis */}
        <LegalAnalysis />

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
