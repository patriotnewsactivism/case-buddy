import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FileText, Download, Eye, Settings, Wand2, Copy, RefreshCw, Printer, FileDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrentCase } from "@/lib/case-context";
import { apiRequest } from "@/lib/queryClient";
import type { GeneratedBrief, BriefTemplate } from "@shared/types";
import {
  exportBriefAsText,
  exportBriefAsHTML,
  exportBriefForPrint,
  exportBriefAsWord,
  copyBriefToClipboard,
  getFormattedFilename
} from "@/utils/briefExport";

// Form schema for brief generation
const briefFormSchema = z.object({
  templateId: z.string().min(1, "Please select a template"),
  attorneyName: z.string().min(1, "Attorney name is required"),
  attorneyBar: z.string().optional(),
  clientName: z.string().optional(),
  courtName: z.string().optional(),
  includeTimeline: z.boolean().default(true),
  includeDocuments: z.boolean().default(true),
  includeLegalIssues: z.boolean().default(true),
  customIntroduction: z.string().optional(),
  customArgument: z.string().optional(),
  customConclusion: z.string().optional(),
});

type BriefFormData = z.infer<typeof briefFormSchema>;

interface BriefGenerationRequest {
  caseTitle: string;
  caseNumber?: string;
  jurisdiction: string;
  clientName: string;
  attorneyName: string;
  attorneyBar?: string;
  courtName: string;
  briefType: 'motion' | 'complaint' | 'response' | 'appeal' | 'summary_judgment' | 'injunction';
  legalIssues: string[];
  factualBackground: string;
  timeline?: Array<{
    date: string;
    event: string;
    significance: string;
  }>;
  documents?: Array<{
    title: string;
    type: string;
    summary: string;
  }>;
  evidence?: Array<{
    title: string;
    type: string;
    summary: string;
  }>;
  customSections?: Array<{
    title: string;
    content: string;
  }>;
  includePrecedents?: boolean;
  includeStatutes?: boolean;
}

export default function BriefGeneratorPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<BriefTemplate | null>(null);
  const [generatedBrief, setGeneratedBrief] = useState<GeneratedBrief | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("templates");
  const [templates, setTemplates] = useState<BriefTemplate[]>([]);
  const isMobile = useIsMobile();
  const { currentCase } = useCurrentCase();

  const form = useForm<BriefFormData>({
    resolver: zodResolver(briefFormSchema),
    defaultValues: {
      includeTimeline: true,
      includeDocuments: true,
      includeLegalIssues: true,
      attorneyName: "",
      attorneyBar: "",
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleExport = (format: 'txt' | 'html' | 'word' | 'print' = 'txt') => {
    if (!generatedBrief) return;
    
    const filename = getFormattedFilename(
      selectedTemplate?.name || 'Legal Brief',
      currentCase?.caseNumber
    );
    
    switch (format) {
      case 'txt':
        exportBriefAsText(generatedBrief, filename);
        break;
      case 'html':
        exportBriefAsHTML(generatedBrief, filename, {
          includeHeader: true,
          includeFooter: true,
          pageNumbers: true
        });
        break;
      case 'word':
        exportBriefAsWord(generatedBrief, filename);
        break;
      case 'print':
        exportBriefForPrint(generatedBrief);
        break;
    }
  };

  const onSubmit = async (data: BriefFormData) => {
    if (!currentCase) {
      alert("Please select a case first");
      return;
    }

    setIsGenerating(true);
    try {
      const briefRequest: BriefGenerationRequest = {
        caseTitle: currentCase.title || "Untitled Case",
        caseNumber: currentCase.caseNumber,
        jurisdiction: currentCase.jurisdiction,
        clientName: data.clientName || "Client Name",
        attorneyName: data.attorneyName,
        attorneyBar: data.attorneyBar,
        courtName: data.courtName || "Superior Court",
        briefType: (selectedTemplate?.type as any) || 'motion',
        legalIssues: ["Civil rights violation"],
        factualBackground: currentCase.description || "Case facts to be provided",
        customSections: [
          ...(data.customIntroduction ? [{ title: "Introduction", content: data.customIntroduction }] : []),
          ...(data.customArgument ? [{ title: "Argument", content: data.customArgument }] : []),
          ...(data.customConclusion ? [{ title: "Conclusion", content: data.customConclusion }] : []),
        ],
        includePrecedents: true,
        includeStatutes: true,
      };

      console.log('Generating brief with AI...', briefRequest);
      const response = await apiRequest('/api/brief-generation/generate', {
        method: 'POST',
        data: briefRequest,
      });

      if (response.success) {
        // Fix date parsing
        const brief = {
          ...response.brief,
          generatedAt: new Date(response.brief.generatedAt)
        };
        setGeneratedBrief(brief);
        setActiveTab("preview");
      } else {
        throw new Error(response.error || 'Failed to generate brief');
      }
    } catch (error: any) {
      console.error("Error generating brief:", error);
      alert(`Error generating brief: ${error.message || 'Please try again.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (generatedBrief) {
      try {
        await copyBriefToClipboard(generatedBrief);
        // You could add a toast notification here
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  const regenerateBrief = () => {
    form.handleSubmit(onSubmit)();
  };

  // Filter templates based on search query
  const availableTemplates = templates.filter(template => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const templateStats = {
    total: templates.length,
    available: availableTemplates.length,
    motions: templates.filter(t => t.name.toLowerCase().includes('motion')).length,
    complaints: templates.filter(t => t.name.toLowerCase().includes('complaint')).length,
  };

  // Load templates on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await apiRequest('/api/brief-generation/templates');
        if (response.success) {
          setTemplates(response.templates);
          
          // Set default template if none selected
          if (response.templates.length > 0 && !selectedTemplate) {
            setSelectedTemplate(response.templates[0]);
            form.setValue("templateId", response.templates[0].id);
          }
        }
      } catch (error) {
        console.error("Error loading brief templates:", error);
      }
    };
    
    loadTemplates();
  }, []);

  const getTemplateById = (id: string) => {
    return templates.find(t => t.id === id);
  };

  return (
    <div className={cn("h-screen overflow-y-auto", isMobile ? "pt-16" : "")}>
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <Header
          title="CaseBuddy Brief Generator"
          onSearch={handleSearch}
          onExport={handleExport}
          searchPlaceholder="Search brief templates..."
        />

        {!currentCase && (
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">No Case Selected</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Please select a case to generate legal briefs with case-specific data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Card className="rounded-xl stats-card">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-primary">{templateStats.available}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Available Templates</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl stats-card">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Wand2 className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-blue-600 dark:text-blue-400">{templateStats.motions}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Motions</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl stats-card">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-green-600 dark:text-green-400">{templateStats.complaints}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Complaints</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl stats-card">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Settings className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-purple-600 dark:text-purple-400">Auto</div>
              <div className="text-xs md:text-sm text-muted-foreground">Generation</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates" data-testid="templates-tab">Templates</TabsTrigger>
            <TabsTrigger value="generator" data-testid="generator-tab">Generate</TabsTrigger>
            <TabsTrigger value="preview" data-testid="preview-tab">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <Card className="rounded-xl brief-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Brief Templates
                  <Badge variant="secondary">{availableTemplates.length} available</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {availableTemplates.map((template) => (
                    <Card 
                      key={template.id} 
                      className={cn(
                        "cursor-pointer brief-card",
                        selectedTemplate?.id === template.id && "ring-2 ring-primary"
                      )}
                      onClick={() => {
                        setSelectedTemplate(template);
                        form.setValue("templateId", template.id);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{template.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {template.caseTypes.map((type) => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {type.replace("_", " ")}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              {template.sections.length} sections
                            </div>
                            {selectedTemplate?.id === template.id && (
                              <Badge className="mt-1">Selected</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generator" className="space-y-4">
            <Card className="rounded-xl brief-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Generate Brief
                  {selectedTemplate && <Badge variant="secondary">{selectedTemplate.name}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Template Selection */}
                    <FormField
                      control={form.control}
                      name="templateId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brief Template</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            const template = getTemplateById(value);
                            setSelectedTemplate(template || null);
                          }} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a brief template" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableTemplates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Attorney Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="attorneyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Attorney Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Attorney Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="attorneyBar"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bar Number (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Bar Number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Case Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="clientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Name (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Client Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="courtName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Court Name (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={currentCase?.court || "Court Name"} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Include Options */}
                    <div className="space-y-4">
                      <Label className="text-base font-medium">Include in Brief:</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="includeTimeline"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Timeline Events</FormLabel>
                                <p className="text-xs text-muted-foreground">
                                  Include chronological case events
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="includeDocuments"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Document References</FormLabel>
                                <p className="text-xs text-muted-foreground">
                                  Include supporting documents
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="includeLegalIssues"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Legal Issues</FormLabel>
                                <p className="text-xs text-muted-foreground">
                                  Include legal analysis
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Custom Sections */}
                    <div className="space-y-4">
                      <Label className="text-base font-medium">Custom Content (Optional):</Label>
                      
                      <FormField
                        control={form.control}
                        name="customIntroduction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Introduction</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Add custom introduction content..."
                                className="resize-none"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customArgument"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Argument</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Add custom argument content..."
                                className="resize-none"
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customConclusion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Conclusion</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Add custom conclusion content..."
                                className="resize-none"
                                rows={2}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 pt-4">
                      <Button 
                        type="submit" 
                        disabled={isGenerating || !currentCase}
                        className="flex-1 md:flex-none"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Generate Brief
                          </>
                        )}
                      </Button>
                      
                      {generatedBrief && (
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setActiveTab("preview")}
                          className="flex-1 md:flex-none"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Preview
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card className="rounded-xl brief-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Generated Brief Preview
                    {selectedTemplate && <Badge variant="secondary">{selectedTemplate.name}</Badge>}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!generatedBrief}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={regenerateBrief} disabled={!generatedBrief}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" disabled={!generatedBrief}>
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleExport('txt')}>
                          <FileText className="w-4 h-4 mr-2" />
                          Export as Text
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('html')}>
                          <FileDown className="w-4 h-4 mr-2" />
                          Export as HTML
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('word')}>
                          <FileText className="w-4 h-4 mr-2" />
                          Export as Word
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('print')}>
                          <Printer className="w-4 h-4 mr-2" />
                          Print Preview
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {generatedBrief ? (
                  <ScrollArea className="h-96 w-full border rounded-lg p-4">
                    <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                      {generatedBrief && (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold mb-4">{generatedBrief.title}</h2>
                {generatedBrief.sections.map((section, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">{section.heading}</h3>
                    <div className="whitespace-pre-wrap">{section.content}</div>
                    {section.citations && section.citations.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Citations:</strong> {section.citations.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
                <div className="mt-4 text-sm text-gray-500">
                  <p>Word Count: {generatedBrief.wordCount}</p>
                  <p>Generated: {generatedBrief.generatedAt.toLocaleString()}</p>
                </div>
              </div>
            )}
                    </pre>
                  </ScrollArea>
                ) : (
                  <div className="h-96 flex items-center justify-center border rounded-lg bg-muted/50">
                    <div className="text-center space-y-4">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="font-medium text-muted-foreground">No Brief Generated</p>
                        <p className="text-sm text-muted-foreground">
                          Use the Generator tab to create your legal brief
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("generator")}
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        Go to Generator
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}