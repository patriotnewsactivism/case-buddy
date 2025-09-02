import { useState } from "react";
import { Header } from "@/components/layout/header";
import { DocumentCard } from "@/components/case/document-card";
import { TimelineEventComponent } from "@/components/case/timeline-event";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Search, Filter, X, FileText, Clock, Calendar, Tags, MapPin } from "lucide-react";
import { useCaseSearch } from "@/hooks/use-case-search";
import { CASE_DOCUMENTS, CASE_TIMELINE, Doc, TimelineEvent, formatDate, getDocumentById } from "@/lib/case-data";

export default function SearchPage() {
  const [selectedDocument, setSelectedDocument] = useState<Doc | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState({
    dateFrom: "",
    dateTo: "",
    tags: [] as string[],
    locations: [] as string[],
    hasEvidence: false,
    hasFOIA: false,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");

  const { query, setQuery, results, activeFilters, addFilter, removeFilter, clearFilters } = useCaseSearch();

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
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

  // Get unique tags and locations for filters
  const allTags = Array.from(new Set([
    ...results.flatMap(item => item.tags || [])
  ])).sort();

  const allLocations = Array.from(new Set([
    "Lafayette, LA",
    "Mississippi",
    "Texas", 
    "Utah",
    "Washington DC",
    "Federal Court"
  ])).sort();

  // Filter results based on advanced filters
  const filteredResults = results.filter(item => {
    if (advancedFilters.dateFrom && item.date && item.date < advancedFilters.dateFrom) return false;
    if (advancedFilters.dateTo && item.date && item.date > advancedFilters.dateTo) return false;
    
    if (advancedFilters.tags.length > 0) {
      const itemTags = item.tags || [];
      if (!advancedFilters.tags.some(tag => itemTags.includes(tag))) return false;
    }
    
    if (advancedFilters.hasEvidence && item.type === 'document') {
      if (item.docType !== 'image' && item.docType !== 'audio') return false;
    }
    
    if (advancedFilters.hasFOIA) {
      const itemTags = item.tags || [];
      if (!itemTags.includes('FOIA')) return false;
    }
    
    return true;
  });

  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.date || "").getTime() - new Date(a.date || "").getTime();
      case "title":
        return a.title.localeCompare(b.title);
      case "type":
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        return a.title.localeCompare(b.title);
      default:
        return 0; // relevance - keep search order
    }
  });

  // Convert SearchableItems back to original types for components
  const documentResults = sortedResults
    .filter(item => item.type === 'document')
    .map(item => {
      const originalDoc = CASE_DOCUMENTS.find(doc => doc.id === item.id);
      return originalDoc!;
    })
    .filter(Boolean);
    
  const timelineResults = sortedResults
    .filter(item => item.type === 'timeline')
    .map(item => {
      const originalEvent = CASE_TIMELINE.find(event => event.id === item.id);
      return originalEvent!;
    })
    .filter(Boolean);

  const searchStats = {
    total: sortedResults.length,
    documents: documentResults.length,
    timeline: timelineResults.length,
  };

  return (
    <div className="flex-1 overflow-hidden">
      <Header
        title="Advanced Search"
        onSearch={handleSearch}
        onExport={handleExport}
      />

      <div className="p-6 overflow-y-auto h-full bg-muted/30 print-friendly">
        {/* Search Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Advanced Case Search</h2>
            <p className="text-muted-foreground">
              Search across all documents, timeline events, and evidence with advanced filtering
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              data-testid="toggle-advanced-search"
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
            <Badge variant="outline" className="flex items-center gap-1">
              <Search className="w-3 h-3" />
              {searchStats.total} Results
            </Badge>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="rounded-xl mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="search"
                placeholder="Search documents, timeline events, tags, summaries..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg"
                data-testid="advanced-search-input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <Card className="rounded-xl mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Advanced Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateFrom">Date From</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={advancedFilters.dateFrom}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    data-testid="search-date-from"
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo">Date To</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={advancedFilters.dateTo}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    data-testid="search-date-to"
                  />
                </div>
              </div>

              {/* Content Type Filters */}
              <div className="space-y-3">
                <Label>Content Types</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasEvidence"
                      checked={advancedFilters.hasEvidence}
                      onCheckedChange={(checked) => 
                        setAdvancedFilters(prev => ({ ...prev, hasEvidence: !!checked }))
                      }
                    />
                    <Label htmlFor="hasEvidence" className="text-sm">Has Evidence</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasFOIA"
                      checked={advancedFilters.hasFOIA}
                      onCheckedChange={(checked) => 
                        setAdvancedFilters(prev => ({ ...prev, hasFOIA: !!checked }))
                      }
                    />
                    <Label htmlFor="hasFOIA" className="text-sm">FOIA Related</Label>
                  </div>
                </div>
              </div>

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div className="space-y-3">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {allTags.map(tag => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={advancedFilters.tags.includes(tag)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAdvancedFilters(prev => ({ 
                                ...prev, 
                                tags: [...prev.tags, tag] 
                              }));
                            } else {
                              setAdvancedFilters(prev => ({ 
                                ...prev, 
                                tags: prev.tags.filter(t => t !== tag) 
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={`tag-${tag}`} className="text-sm">
                          <Badge variant="outline" className="text-xs">{tag}</Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAdvancedFilters({
                      dateFrom: "",
                      dateTo: "",
                      tags: [],
                      locations: [],
                      hasEvidence: false,
                      hasFOIA: false,
                    });
                    clearFilters();
                  }}
                  data-testid="clear-advanced-filters"
                >
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Filters */}
        {(activeFilters.length > 0 || query) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm font-medium">Active filters:</span>
            {query && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Search className="w-3 h-3" />
                Search: "{query}"
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => setQuery("")}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
            {activeFilters.map(filter => (
              <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                {filter}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => removeFilter(filter)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Results Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>Sort by:</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32" data-testid="search-sort-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {searchStats.total} results ({searchStats.documents} documents, {searchStats.timeline} timeline events)
          </div>
        </div>

        {/* Search Results */}
        {sortedResults.length > 0 ? (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All Results
                <Badge variant="secondary" className="text-xs">{searchStats.total}</Badge>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                Documents
                <Badge variant="secondary" className="text-xs">{searchStats.documents}</Badge>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                Timeline
                <Badge variant="secondary" className="text-xs">{searchStats.timeline}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {/* Documents */}
              {documentResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documents ({documentResults.length})
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {documentResults.slice(0, 6).map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        onOpen={setSelectedDocument}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline Events */}
              {timelineResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Timeline Events ({timelineResults.length})
                  </h3>
                  <div className="space-y-6">
                    {timelineResults.slice(0, 5).map((event) => (
                      <TimelineEventComponent
                        key={event.id}
                        event={event}
                        onDocumentClick={handleDocumentClick}
                        showConnector={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {documentResults.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onOpen={setSelectedDocument}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline">
              <div className="space-y-6">
                {timelineResults.map((event) => (
                  <TimelineEventComponent
                    key={event.id}
                    event={event}
                    onDocumentClick={handleDocumentClick}
                    showConnector={false}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="rounded-xl">
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                {query 
                  ? `No items match your search for "${query}"`
                  : "Enter a search term to find documents and timeline events"
                }
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setQuery("FOIA")}>
                  Search FOIA
                </Button>
                <Button variant="outline" size="sm" onClick={() => setQuery("courthouse")}>
                  Search Courthouse
                </Button>
                <Button variant="outline" size="sm" onClick={() => setQuery("First Amendment")}>
                  Search First Amendment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
