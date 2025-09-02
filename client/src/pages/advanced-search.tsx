import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  FileText,
  Scale,
  Brain,
  BookOpen,
  Gavel,
  ArrowRight,
  Clock,
  Users,
  Building,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  Eye
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCurrentCase } from '@/lib/case-context';

// Form schemas
const semanticSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  searchType: z.enum(['general', 'legal_research', 'fact_finding', 'precedent_search', 'evidence_analysis']),
  documentTypes: z.array(z.string()).optional(),
  dateRange: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional()
  }).optional(),
  legalContext: z.string().optional(),
  maxResults: z.number().min(1).max(100).default(20)
});

const precedentResearchSchema = z.object({
  legalIssue: z.string().min(1, 'Legal issue is required'),
  jurisdiction: z.string().optional(),
  caseType: z.string().min(1, 'Case type is required'),
  factualContext: z.string().min(1, 'Factual context is required'),
  dateRange: z.object({
    startYear: z.number().min(1800).max(new Date().getFullYear()),
    endYear: z.number().min(1800).max(new Date().getFullYear())
  }).optional(),
  courtLevel: z.enum(['supreme', 'appellate', 'district', 'all']).optional(),
  includeStatutes: z.boolean().default(true),
  maxResults: z.number().min(1).max(50).default(10)
});

const ocrProcessingSchema = z.object({
  filePath: z.string().min(1, 'File path is required'),
  fileName: z.string().min(1, 'File name is required')
});

type SemanticSearchForm = z.infer<typeof semanticSearchSchema>;
type PrecedentResearchForm = z.infer<typeof precedentResearchSchema>;
type OCRProcessingForm = z.infer<typeof ocrProcessingSchema>;

interface SearchResult {
  documentId: string;
  title: string;
  documentType: string;
  relevanceScore: number;
  matchedContent: string[];
  keyTermsFound: string[];
  contextualSummary: string;
  legalSignificance?: string;
  relatedEntities: {
    people: string[];
    organizations: string[];
    dates: string[];
    locations: string[];
  };
  citationsFound: string[];
  actionableInsights: string[];
  extractedFacts: string[];
  filePath?: string;
  pageReferences?: number[];
}

interface PrecedentResult {
  caseName: string;
  citation: string;
  court: string;
  year: number;
  keyHolding: string;
  relevanceScore: number;
  keyQuotes: string[];
}

interface OCRResult {
  extractedText: string;
  confidence: number;
  metadata: {
    pageCount?: number;
    documentType: string;
    language: string;
    processingTime: number;
  };
  entities: {
    dates: string[];
    names: string[];
    organizations: string[];
    legalCitations: string[];
    caseNumbers: string[];
  };
  summary: string;
  keyPoints: string[];
}

export default function AdvancedSearchPage() {
  const [activeTab, setActiveTab] = useState('semantic');
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [precedentResults, setPrecedentResults] = useState<PrecedentResult[]>([]);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { currentCase } = useCurrentCase();

  const semanticForm = useForm<SemanticSearchForm>({
    resolver: zodResolver(semanticSearchSchema),
    defaultValues: {
      searchType: 'legal_research',
      maxResults: 20
    }
  });

  const precedentForm = useForm<PrecedentResearchForm>({
    resolver: zodResolver(precedentResearchSchema),
    defaultValues: {
      includeStatutes: true,
      maxResults: 10,
      courtLevel: 'all'
    }
  });

  const ocrForm = useForm<OCRProcessingForm>({
    resolver: zodResolver(ocrProcessingSchema)
  });

  const onSemanticSearch = async (data: SemanticSearchForm) => {
    setIsSearching(true);
    try {
      const response = await apiRequest('/api/documents/semantic-search', {
        method: 'POST',
        data: {
          ...data,
          caseId: currentCase?.id
        }
      });

      if (response.success) {
        setSearchResults(response.results.results || []);
        toast({
          title: 'Search Complete',
          description: `Found ${response.results.results?.length || 0} relevant documents`
        });
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      toast({
        title: 'Search Failed',
        description: error.message || 'Failed to perform semantic search',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const onPrecedentResearch = async (data: PrecedentResearchForm) => {
    setIsSearching(true);
    try {
      const response = await apiRequest('/api/legal-research/precedents', {
        method: 'POST',
        data: data
      });

      if (response.success) {
        setPrecedentResults(response.research.precedents || []);
        toast({
          title: 'Research Complete',
          description: `Found ${response.research.precedents?.length || 0} relevant precedents`
        });
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      toast({
        title: 'Research Failed',
        description: error.message || 'Failed to conduct legal research',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const onOCRProcessing = async (data: OCRProcessingForm) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const response = await apiRequest('/api/documents/ocr', {
        method: 'POST',
        data: data
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (response.success) {
        setOcrResult(response.ocr);
        toast({
          title: 'OCR Processing Complete',
          description: 'Document text extracted and analyzed successfully'
        });
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      toast({
        title: 'OCR Processing Failed',
        description: error.message || 'Failed to process document',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessingProgress(0), 2000);
    }
  };

  const renderSearchResults = () => (
    <div className="space-y-4">
      {searchResults.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Search className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No search results yet. Try performing a semantic search above.</p>
          </CardContent>
        </Card>
      ) : (
        searchResults.map((result, index) => (
          <Card key={result.documentId} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {result.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <Badge variant="secondary">{result.documentType}</Badge>
                    <div className="flex items-center gap-1">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        result.relevanceScore >= 0.8 ? 'bg-green-500' :
                        result.relevanceScore >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                      )} />
                      <span className="text-sm">
                        {(result.relevanceScore * 100).toFixed(0)}% relevant
                      </span>
                    </div>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {result.contextualSummary}
              </p>
              
              {result.legalSignificance && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Legal Significance</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{result.legalSignificance}</p>
                </div>
              )}
              
              {result.matchedContent.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Key Excerpts</h4>
                  <div className="space-y-2">
                    {result.matchedContent.slice(0, 2).map((excerpt, i) => (
                      <div key={i} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                        "{excerpt}..."
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {result.keyTermsFound.slice(0, 5).map((term, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {term}
                  </Badge>
                ))}
              </div>
              
              {result.relatedEntities && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {result.relatedEntities.people.length > 0 && (
                    <div>
                      <h5 className="font-medium flex items-center gap-1 mb-1">
                        <Users className="w-4 h-4" />
                        People
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {result.relatedEntities.people.slice(0, 3).map((person, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{person}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {result.relatedEntities.organizations.length > 0 && (
                    <div>
                      <h5 className="font-medium flex items-center gap-1 mb-1">
                        <Building className="w-4 h-4" />
                        Organizations
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {result.relatedEntities.organizations.slice(0, 3).map((org, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{org}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderPrecedentResults = () => (
    <div className="space-y-4">
      {precedentResults.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Scale className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No precedent research results yet. Try conducting legal research above.</p>
          </CardContent>
        </Card>
      ) : (
        precedentResults.map((precedent, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="w-5 h-5" />
                {precedent.caseName}
              </CardTitle>
              <CardDescription className="flex items-center gap-4">
                <span>{precedent.citation}</span>
                <span>{precedent.court} ({precedent.year})</span>
                <div className="flex items-center gap-1">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    precedent.relevanceScore >= 0.8 ? 'bg-green-500' :
                    precedent.relevanceScore >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                  )} />
                  <span className="text-sm">
                    {(precedent.relevanceScore * 100).toFixed(0)}% relevant
                  </span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Key Holding</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{precedent.keyHolding}</p>
              </div>
              
              {precedent.keyQuotes.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Key Quotes</h4>
                  <div className="space-y-2">
                    {precedent.keyQuotes.map((quote, i) => (
                      <div key={i} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm italic">
                        "{quote}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className={cn('h-screen overflow-y-auto', isMobile ? 'pt-16' : '')}>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-600" />
              Advanced Legal Research
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              AI-powered document processing, semantic search, and precedent research
            </p>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="semantic" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Semantic Search
            </TabsTrigger>
            <TabsTrigger value="precedent" className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Precedent Research
            </TabsTrigger>
            <TabsTrigger value="ocr" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Document OCR
            </TabsTrigger>
          </TabsList>

          {/* Semantic Search Tab */}
          <TabsContent value="semantic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Semantic Document Search</CardTitle>
                <CardDescription>
                  Search through documents using AI to understand context and legal concepts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...semanticForm}>
                  <form onSubmit={semanticForm.handleSubmit(onSemanticSearch)} className="space-y-4">
                    <FormField
                      control={semanticForm.control}
                      name="query"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Search Query</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your search query (e.g., 'Fourth Amendment violations in traffic stops')"
                              {...field}
                              data-testid="input-search-query"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={semanticForm.control}
                        name="searchType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Search Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-search-type">
                                  <SelectValue placeholder="Select search type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="general">General Search</SelectItem>
                                <SelectItem value="legal_research">Legal Research</SelectItem>
                                <SelectItem value="fact_finding">Fact Finding</SelectItem>
                                <SelectItem value="precedent_search">Precedent Search</SelectItem>
                                <SelectItem value="evidence_analysis">Evidence Analysis</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={semanticForm.control}
                        name="maxResults"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Results</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value))}
                                data-testid="input-max-results"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button type="submit" disabled={isSearching} className="w-full" data-testid="button-semantic-search">
                      {isSearching ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Search Documents
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {renderSearchResults()}
          </TabsContent>

          {/* Precedent Research Tab */}
          <TabsContent value="precedent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Legal Precedent Research</CardTitle>
                <CardDescription>
                  Find relevant case law and legal precedents using AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...precedentForm}>
                  <form onSubmit={precedentForm.handleSubmit(onPrecedentResearch)} className="space-y-4">
                    <FormField
                      control={precedentForm.control}
                      name="legalIssue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legal Issue</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the legal issue (e.g., 'Qualified immunity for police officers in excessive force cases')"
                              {...field}
                              data-testid="input-legal-issue"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={precedentForm.control}
                      name="factualContext"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Factual Context</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Provide relevant facts and context for the case"
                              {...field}
                              data-testid="input-factual-context"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={precedentForm.control}
                        name="caseType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Case Type</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Civil Rights" {...field} data-testid="input-case-type" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={precedentForm.control}
                        name="jurisdiction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Jurisdiction</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Federal, State" {...field} data-testid="input-jurisdiction" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={precedentForm.control}
                        name="courtLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Court Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-court-level">
                                  <SelectValue placeholder="All Courts" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="all">All Courts</SelectItem>
                                <SelectItem value="supreme">Supreme Court</SelectItem>
                                <SelectItem value="appellate">Appellate</SelectItem>
                                <SelectItem value="district">District</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button type="submit" disabled={isSearching} className="w-full" data-testid="button-precedent-research">
                      {isSearching ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Researching...
                        </>
                      ) : (
                        <>
                          <Scale className="w-4 h-4 mr-2" />
                          Research Precedents
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {renderPrecedentResults()}
          </TabsContent>

          {/* OCR Processing Tab */}
          <TabsContent value="ocr" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document OCR & Analysis</CardTitle>
                <CardDescription>
                  Extract text from documents and perform AI-powered legal analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...ocrForm}>
                  <form onSubmit={ocrForm.handleSubmit(onOCRProcessing)} className="space-y-4">
                    <FormField
                      control={ocrForm.control}
                      name="filePath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>File Path</FormLabel>
                          <FormControl>
                            <Input placeholder="/path/to/document.pdf" {...field} data-testid="input-file-path" />
                          </FormControl>
                          <FormDescription>
                            Enter the path to the document you want to process
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={ocrForm.control}
                      name="fileName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>File Name</FormLabel>
                          <FormControl>
                            <Input placeholder="document.pdf" {...field} data-testid="input-file-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Processing Document</span>
                          <span className="text-sm text-gray-500">{processingProgress}%</span>
                        </div>
                        <Progress value={processingProgress} className="w-full" />
                      </div>
                    )}
                    
                    <Button type="submit" disabled={isProcessing} className="w-full" data-testid="button-process-ocr">
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Process Document
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* OCR Results */}
            {ocrResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Document Processing Results
                  </CardTitle>
                  <CardDescription>
                    Confidence: {(ocrResult.confidence * 100).toFixed(1)}% • 
                    Processing Time: {ocrResult.metadata.processingTime}ms •
                    Document Type: {ocrResult.metadata.documentType}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{ocrResult.summary}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Key Points</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {ocrResult.keyPoints.map((point, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-300">{point}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ocrResult.entities.names.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">Names Found</h5>
                        <div className="flex flex-wrap gap-1">
                          {ocrResult.entities.names.map((name, i) => (
                            <Badge key={i} variant="secondary">{name}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {ocrResult.entities.legalCitations.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">Legal Citations</h5>
                        <div className="flex flex-wrap gap-1">
                          {ocrResult.entities.legalCitations.map((citation, i) => (
                            <Badge key={i} variant="secondary">{citation}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Extracted Text (Preview)</h4>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm max-h-40 overflow-y-auto">
                      {ocrResult.extractedText.substring(0, 1000)}
                      {ocrResult.extractedText.length > 1000 && '...'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}