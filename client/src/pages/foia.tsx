import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileText, Plus, Clock, CheckCircle, XCircle, AlertCircle, Calendar, Building } from "lucide-react";
import { FOIA_REQUESTS, FoiaRequest, formatDate } from "@/lib/case-data";

export default function FoiaRequests() {
  const [selectedRequest, setSelectedRequest] = useState<FoiaRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleExport = () => {
    window.print();
  };

  const filteredRequests = FOIA_REQUESTS.filter(request => {
    if (filterStatus !== "all" && request.status !== filterStatus) return false;
    
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      return (
        request.agency.toLowerCase().includes(searchLower) ||
        request.description.toLowerCase().includes(searchLower) ||
        request.requestNumber?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-chart-2" />;
      case "pending":
        return <Clock className="w-4 h-4 text-chart-3" />;
      case "denied":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "submitted":
        return <AlertCircle className="w-4 h-4 text-primary" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "chart-2";
      case "pending":
        return "chart-3";
      case "denied":
        return "destructive";
      case "submitted":
        return "primary";
      default:
        return "muted";
    }
  };

  const foiaStats = {
    total: FOIA_REQUESTS.length,
    completed: FOIA_REQUESTS.filter(r => r.status === "completed").length,
    pending: FOIA_REQUESTS.filter(r => r.status === "pending").length,
    submitted: FOIA_REQUESTS.filter(r => r.status === "submitted").length,
    denied: FOIA_REQUESTS.filter(r => r.status === "denied").length,
  };

  return (
    <div className="flex-1 overflow-hidden">
      <Header
        title="FOIA Requests"
        onSearch={handleSearch}
        onExport={handleExport}
      />

      <div className="p-6 overflow-y-auto h-full bg-muted/30 print-friendly">
        {/* FOIA Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">FOIA Request Management</h2>
            <p className="text-muted-foreground">
              Track and manage Freedom of Information Act requests and responses
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button data-testid="create-foia-request">
                  <Plus className="w-4 h-4 mr-2" />
                  New FOIA Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New FOIA Request</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="agency">Agency</Label>
                      <Input id="agency" placeholder="e.g., US Marshals Service" />
                    </div>
                    <div>
                      <Label htmlFor="requestNumber">Request Number (optional)</Label>
                      <Input id="requestNumber" placeholder="e.g., 2025-FOIA-08901" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Request Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Detailed description of requested records..."
                      className="min-h-24"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="submittedDate">Submitted Date</Label>
                      <Input id="submittedDate" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select defaultValue="submitted">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="denied">Denied</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Create Request</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {filteredRequests.length} Requests
            </Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">{foiaStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Requests</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-chart-2" />
              </div>
              <div className="text-2xl font-bold text-chart-2">{foiaStats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-chart-3" />
              </div>
              <div className="text-2xl font-bold text-chart-3">{foiaStats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">{foiaStats.submitted}</div>
              <div className="text-sm text-muted-foreground">Submitted</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <div className="text-2xl font-bold text-destructive">{foiaStats.denied}</div>
              <div className="text-sm text-muted-foreground">Denied</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="rounded-xl mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>Filter by Status:</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32" data-testid="foia-status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Input
                placeholder="Search by agency, description, or request number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
                data-testid="foia-search-input"
              />
            </div>
          </CardContent>
        </Card>

        {/* FOIA Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="rounded-xl cursor-pointer hover:shadow-md transition-all duration-200"
              onClick={() => setSelectedRequest(request)}
              data-testid={`foia-request-${request.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{request.agency}</h3>
                      {request.requestNumber && (
                        <Badge variant="outline" className="text-xs">
                          {request.requestNumber}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {request.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Submitted: {formatDate(request.submittedDate)}</span>
                      </div>
                      {request.responseDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Response: {formatDate(request.responseDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <Badge 
                        variant="secondary" 
                        className={`bg-${getStatusColor(request.status)}/10 text-${getStatusColor(request.status)} capitalize`}
                      >
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {request.responseSummary && (
                  <div className="border-t pt-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">Response Summary</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.responseSummary}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredRequests.length === 0 && (
            <Card className="rounded-xl">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">No FOIA requests found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Try adjusting your search terms" : "Create your first FOIA request to get started"}
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create FOIA Request
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New FOIA Request</DialogTitle>
                    </DialogHeader>
                    {/* Same form content as above */}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Request Details Modal */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                FOIA Request Details
              </DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Agency</Label>
                    <p className="text-lg font-semibold">{selectedRequest.agency}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Request Number</Label>
                    <p className="text-lg font-semibold">
                      {selectedRequest.requestNumber || "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(selectedRequest.status)}
                      <Badge 
                        variant="secondary" 
                        className={`bg-${getStatusColor(selectedRequest.status)}/10 text-${getStatusColor(selectedRequest.status)} capitalize`}
                      >
                        {selectedRequest.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Submitted Date</Label>
                    <p className="text-lg font-semibold">{formatDate(selectedRequest.submittedDate)}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Request Description</Label>
                  <p className="mt-2 text-sm">{selectedRequest.description}</p>
                </div>

                {selectedRequest.responseSummary && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Response Summary</Label>
                    <div className="mt-2 bg-muted/50 rounded-lg p-4">
                      <p className="text-sm">{selectedRequest.responseSummary}</p>
                    </div>
                  </div>
                )}

                {selectedRequest.documentsReceived && selectedRequest.documentsReceived.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Documents Received</Label>
                    <div className="mt-2 space-y-2">
                      {selectedRequest.documentsReceived.map((docId, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="text-sm">{docId}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                    Close
                  </Button>
                  <Button>
                    Edit Request
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
