import { useState } from "react";
import { Header } from "@/components/layout/header";
import { DocumentCard } from "@/components/case/document-card";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderOpen, Upload, Filter, FileText, Download } from "lucide-react";
import { CASE_DOCUMENTS, Doc, DocType } from "@/lib/case-data";
import { useCaseSearch } from "@/hooks/use-case-search";
import type { UploadResult } from "@uppy/core";

export default function Documents() {
  const [selectedDocument, setSelectedDocument] = useState<Doc | null>(null);
  const [activeTab, setActiveTab] = useState<DocType | "all">("all");
  const [sortBy, setSortBy] = useState<string>("date");
  
  const { query, setQuery, results } = useCaseSearch();

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const handleExport = () => {
    window.print();
  };

  const handleDocumentOpen = (doc: Doc) => {
    setSelectedDocument(doc);
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    console.log("Upload completed with full result:", result);
    
    if (result.successful && result.successful.length > 0) {
      try {
        console.log(`Processing ${result.successful.length} uploaded files`);
        
        // Process each uploaded file
        for (const file of result.successful) {
          console.log('Processing uploaded file:', file);
          
          const response = await fetch('/api/documents', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              documentURL: file.uploadURL,
              title: file.name,
              type: getFileType(file.name || ''),
            }),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log(`File ${file.name} processed successfully:`, result);
          } else {
            console.error(`Failed to process file ${file.name}:`, response.status, response.statusText);
          }
        }
        
        alert(`Successfully uploaded ${result.successful.length} file(s)!`);
        console.log('All files processed successfully');
      } catch (error) {
        console.error('Error processing uploaded files:', error);
        alert('Files uploaded but there was an error processing them.');
      }
    } else {
      console.log('No successful uploads found');
      if (result.failed && result.failed.length > 0) {
        console.error('Failed uploads:', result.failed);
        alert(`Upload failed: ${result.failed.map(f => f.error).join(', ')}`);
      }
    }
  };

  const getFileType = (filename: string): string => {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf': return 'pdf';
      case 'jpg': case 'jpeg': case 'png': case 'gif': return 'image';
      case 'mp3': case 'wav': case 'ogg': return 'audio';
      case 'mp4': case 'mov': case 'avi': case 'mkv': return 'video';
      case 'doc': case 'docx': case 'txt': return 'letter';
      default: return 'pdf';
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

  // Filter documents based on active tab and search
  const filteredDocuments = CASE_DOCUMENTS.filter(doc => {
    if (activeTab !== "all" && doc.type !== activeTab) return false;
    
    if (query.trim()) {
      const searchResults = results.filter(r => r.type === 'document');
      return searchResults.some(r => r.id === doc.id);
    }
    
    return true;
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.date || "").getTime() - new Date(a.date || "").getTime();
      case "title":
        return a.title.localeCompare(b.title);
      case "type":
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  const docTypes: Array<{ value: DocType | "all"; label: string; count: number }> = [
    { value: "all", label: "All Documents", count: CASE_DOCUMENTS.length },
    { value: "pdf", label: "PDFs", count: CASE_DOCUMENTS.filter(d => d.type === "pdf").length },
    { value: "letter", label: "Letters", count: CASE_DOCUMENTS.filter(d => d.type === "letter").length },
    { value: "transcript", label: "Transcripts", count: CASE_DOCUMENTS.filter(d => d.type === "transcript").length },
    { value: "image", label: "Images", count: CASE_DOCUMENTS.filter(d => d.type === "image").length },
    { value: "audio", label: "Audio", count: CASE_DOCUMENTS.filter(d => d.type === "audio").length },
    { value: "video", label: "Videos", count: CASE_DOCUMENTS.filter(d => d.type === "video").length },
  ];

  return (
    <div className="flex-1 overflow-hidden">
      <Header
        title="Document Management"
        onSearch={handleSearch}
        onExport={handleExport}
      />

      <div className="p-4 sm:p-6 overflow-y-auto h-full bg-muted/30 print-friendly">
        {/* Documents Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Case Documents</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage and organize all case-related documents and evidence
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <ObjectUploader
              maxNumberOfFiles={5}
              maxFileSize={50 * 1024 * 1024} // 50MB
              onGetUploadParameters={getUploadParameters}
              onComplete={handleUploadComplete}
              buttonClassName="upload-button-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold text-sm w-full sm:w-auto"
            >
              <div className="flex items-center justify-center gap-2">
                <Upload className="w-4 sm:w-5 h-4 sm:h-5" />
                <span className="font-semibold">Upload Documents</span>
              </div>
            </ObjectUploader>
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <FolderOpen className="w-3 h-3" />
              {filteredDocuments.length} Documents
            </Badge>
          </div>
        </div>

        {/* Filters and Controls */}
        <Card className="rounded-xl mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter & Sort Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium whitespace-nowrap">Sort by:</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-32" data-testid="documents-sort-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Input
                  placeholder="Search documents, summaries, tags..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="max-w-md"
                  data-testid="documents-search-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DocType | "all")}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-6 h-auto">
            {docTypes.map(type => (
              <TabsTrigger
                key={type.value}
                value={type.value}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3"
                data-testid={`tab-${type.value}`}
              >
                <span className="truncate">{type.label}</span>
                <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                  {type.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {docTypes.map(type => (
            <TabsContent key={type.value} value={type.value}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {sortedDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onOpen={handleDocumentOpen}
                  />
                ))}
                
                {sortedDocuments.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No documents found</h3>
                    <p className="text-sm">
                      {query ? "Try adjusting your search terms" : "Upload documents to get started"}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Document Viewer Modal */}
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Document Viewer - {selectedDocument?.title}
              </DialogTitle>
            </DialogHeader>
            {selectedDocument && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {selectedDocument.date && <span>Date: {selectedDocument.date}</span>}
                    <Badge variant="outline" className="capitalize">
                      {selectedDocument.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" data-testid="annotate-document">
                      Annotate
                    </Button>
                    <Button size="sm" variant="outline" data-testid="download-document">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="document-viewer">
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
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No preview available for this document</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">{selectedDocument.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedDocument.summary}</p>
                  
                  {selectedDocument.tags && (
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {selectedDocument.sourceNote && (
                    <div className="text-xs text-muted-foreground italic border-t pt-2">
                      Source: {selectedDocument.sourceNote}
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
