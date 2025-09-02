import Anthropic from '@anthropic-ai/sdk';
import { ocrService, type OCRResult } from './ocrService';

/*
The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
*/
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface SemanticSearchQuery {
  query: string;
  caseId?: string;
  documentTypes?: string[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  legalContext?: string;
  searchType: 'general' | 'legal_research' | 'fact_finding' | 'precedent_search' | 'evidence_analysis';
  maxResults?: number;
  includeRelevanceScoring?: boolean;
}

export interface SearchResult {
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

export interface SemanticAnalysis {
  conceptualSimilarity: number;
  legalRelevance: number;
  factualAlignment: number;
  evidentiaryValue: number;
  strategicImportance: number;
  overallRelevance: number;
}

export interface SearchResults {
  query: SemanticSearchQuery;
  results: SearchResult[];
  totalResults: number;
  searchAnalysis: {
    conceptsCovered: string[];
    legalIssuesIdentified: string[];
    evidenceTypes: string[];
    researchGaps: string[];
  };
  relatedQueries: string[];
  searchSuggestions: string[];
}

// Mock document storage - in a real application, this would connect to your document database
interface DocumentIndex {
  id: string;
  title: string;
  type: string;
  content: string;
  ocrResult?: OCRResult;
  caseId?: string;
  uploadDate: string;
  filePath?: string;
  metadata: Record<string, any>;
}

class SemanticSearchService {
  private documentIndex: DocumentIndex[] = [];
  
  // Initialize with sample legal documents for demonstration
  constructor() {
    this.initializeSampleDocuments();
  }
  
  async addDocumentToIndex(document: {
    id: string;
    title: string;
    type: string;
    content?: string;
    filePath?: string;
    caseId?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      let content = document.content || '';
      let ocrResult: OCRResult | undefined;
      
      // If file path provided, extract text using OCR
      if (document.filePath && !content) {
        ocrResult = await ocrService.extractTextFromDocument(document.filePath, document.title);
        content = ocrResult.extractedText;
      }
      
      const indexEntry: DocumentIndex = {
        id: document.id,
        title: document.title,
        type: document.type,
        content,
        ocrResult,
        caseId: document.caseId,
        uploadDate: new Date().toISOString(),
        filePath: document.filePath,
        metadata: document.metadata || {}
      };
      
      // Remove existing entry if updating
      this.documentIndex = this.documentIndex.filter(doc => doc.id !== document.id);
      this.documentIndex.push(indexEntry);
      
    } catch (error: any) {
      console.error('Error adding document to index:', error);
      throw new Error(`Failed to index document: ${error.message}`);
    }
  }
  
  async performSemanticSearch(query: SemanticSearchQuery): Promise<SearchResults> {
    try {
      // Filter documents based on query parameters
      let candidateDocuments = this.documentIndex;
      
      if (query.caseId) {
        candidateDocuments = candidateDocuments.filter(doc => doc.caseId === query.caseId);
      }
      
      if (query.documentTypes && query.documentTypes.length > 0) {
        candidateDocuments = candidateDocuments.filter(doc => 
          query.documentTypes!.includes(doc.type)
        );
      }
      
      if (query.dateRange) {
        candidateDocuments = candidateDocuments.filter(doc => {
          const docDate = new Date(doc.uploadDate);
          const startDate = new Date(query.dateRange!.startDate);
          const endDate = new Date(query.dateRange!.endDate);
          return docDate >= startDate && docDate <= endDate;
        });
      }
      
      // Perform semantic analysis on each candidate document
      const searchResults: SearchResult[] = [];
      
      for (const doc of candidateDocuments) {
        const result = await this.analyzeDocumentRelevance(doc, query);
        if (result && result.relevanceScore > 0.2) { // Minimum relevance threshold
          searchResults.push(result);
        }
      }
      
      // Sort by relevance score
      searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // Limit results
      const maxResults = query.maxResults || 20;
      const limitedResults = searchResults.slice(0, maxResults);
      
      // Generate search analysis
      const searchAnalysis = await this.generateSearchAnalysis(query, limitedResults);
      
      return {
        query,
        results: limitedResults,
        totalResults: searchResults.length,
        searchAnalysis,
        relatedQueries: await this.generateRelatedQueries(query, limitedResults),
        searchSuggestions: await this.generateSearchSuggestions(query, limitedResults)
      };
      
    } catch (error: any) {
      console.error('Semantic search error:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  }
  
  private async analyzeDocumentRelevance(document: DocumentIndex, query: SemanticSearchQuery): Promise<SearchResult | null> {
    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `Analyze the relevance of this legal document to the search query:

**Search Query:** ${query.query}
**Search Type:** ${query.searchType}
**Legal Context:** ${query.legalContext || 'General legal research'}

**Document Title:** ${document.title}
**Document Type:** ${document.type}
**Document Content:** ${document.content.substring(0, 3000)}${document.content.length > 3000 ? '...' : ''}

Please analyze and provide a JSON response:
{
  "relevanceScore": 0.0-1.0,
  "matchedContent": ["array of relevant text snippets"],
  "keyTermsFound": ["important terms that match the query"],
  "contextualSummary": "brief summary of how this document relates to the query",
  "legalSignificance": "why this document matters legally",
  "relatedEntities": {
    "people": ["names found"],
    "organizations": ["organizations mentioned"],
    "dates": ["important dates"],
    "locations": ["locations mentioned"]
  },
  "citationsFound": ["legal citations in the document"],
  "actionableInsights": ["insights that could inform legal strategy"],
  "extractedFacts": ["key facts from the document"]
}

Focus on legal relevance, factual alignment, and strategic value for the query.`
        }]
      });
      
      const analysisText = (response.content[0] as any).text;
      console.log('Raw Claude response:', analysisText);
      
      // Clean up the response text to extract valid JSON (handle markdown code blocks)
      let cleanedText = analysisText.replace(/```json\s*|\s*```/g, '').trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*?\}/);
      
      if (jsonMatch) {
        try {
          // Clean up common JSON parsing issues
          let cleanJson = jsonMatch[0]
            .replace(/,\s*}/g, '}') // Remove trailing commas before }
            .replace(/,\s*]/g, ']') // Remove trailing commas before ]
            .replace(/\n/g, ' ') // Replace newlines with spaces
            .replace(/\s+/g, ' '); // Normalize whitespace
          
          console.log('Attempting to parse JSON...');
          const analysis = JSON.parse(cleanJson);
          
          return {
            documentId: document.id,
            title: document.title,
            documentType: document.type,
            relevanceScore: analysis.relevanceScore || 0.5,
            matchedContent: analysis.matchedContent || [],
            keyTermsFound: analysis.keyTermsFound || [],
            contextualSummary: analysis.contextualSummary || '',
            legalSignificance: analysis.legalSignificance,
            relatedEntities: analysis.relatedEntities || { people: [], organizations: [], dates: [], locations: [] },
            citationsFound: analysis.citationsFound || [],
            actionableInsights: analysis.actionableInsights || [],
            extractedFacts: analysis.extractedFacts || [],
            filePath: document.filePath,
            pageReferences: [] // Could be enhanced with page-level analysis
          };
        } catch (parseError) {
          console.error('Failed to parse JSON, using fallback:', parseError);
          // Return a simple fallback result when AI analysis fails
          return {
            documentId: document.id,
            title: document.title,
            documentType: document.type,
            relevanceScore: 0.5,
            matchedContent: [document.content.substring(0, 200) + '...'],
            keyTermsFound: [query.query],
            contextualSummary: `Document matches search query: ${query.query}`,
            legalSignificance: 'Document may be relevant to the legal matter.',
            relatedEntities: { people: [], organizations: [], dates: [], locations: [] },
            citationsFound: [],
            actionableInsights: ['Review document for relevant information'],
            extractedFacts: ['Document content available for analysis'],
            filePath: document.filePath,
            pageReferences: []
          };
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('Document relevance analysis error:', error);
      return null;
    }
  }
  
  private async generateSearchAnalysis(query: SemanticSearchQuery, results: SearchResult[]): Promise<SearchResults['searchAnalysis']> {
    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `Analyze these search results to identify patterns and gaps:

**Search Query:** ${query.query}
**Results Found:** ${results.length}
**Top Results:** ${results.slice(0, 3).map(r => r.title).join(', ')}

**Key Insights from Results:** ${results.slice(0, 5).map(r => r.contextualSummary).join('; ')}

Provide analysis in JSON format:
{
  "conceptsCovered": ["main legal concepts found in results"],
  "legalIssuesIdentified": ["legal issues surfaced by the search"],
  "evidenceTypes": ["types of evidence found"],
  "researchGaps": ["areas that need more research"]
}`
        }]
      });
      
      const analysisText = (response.content[0] as any).text;
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
    } catch (error) {
      console.error('Search analysis error:', error);
    }
    
    return {
      conceptsCovered: ['Legal research completed'],
      legalIssuesIdentified: ['Primary legal issues'],
      evidenceTypes: ['Documentary evidence'],
      researchGaps: ['Additional research recommended']
    };
  }
  
  private async generateRelatedQueries(query: SemanticSearchQuery, results: SearchResult[]): Promise<string[]> {
    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `Based on the search query "${query.query}" and the results found, suggest 5 related search queries that would help with comprehensive legal research:

Consider:
- Related legal concepts
- Different perspectives on the same issue
- Broader or narrower search terms
- Procedural or substantive law variations

Provide just the query strings, one per line.`
        }]
      });
      
      return ((response.content[0] as any).text as string)
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 5 && !line.match(/^\d+\./))
        .slice(0, 5);
        
    } catch (error) {
      console.error('Related queries generation error:', error);
      return [];
    }
  }
  
  private async generateSearchSuggestions(query: SemanticSearchQuery, results: SearchResult[]): Promise<string[]> {
    const suggestions = [
      'Try searching for related legal precedents',
      'Search for expert witness materials on this topic',
      'Look for procedural requirements and deadlines',
      'Research opposing arguments and counter-authorities',
      'Find similar cases in your jurisdiction'
    ];
    
    return suggestions.slice(0, 3);
  }
  
  async findSimilarDocuments(documentId: string, maxResults: number = 10): Promise<SearchResult[]> {
    const sourceDocument = this.documentIndex.find(doc => doc.id === documentId);
    if (!sourceDocument) {
      throw new Error('Source document not found');
    }
    
    // Use the document content as a query to find similar documents
    const query: SemanticSearchQuery = {
      query: sourceDocument.content.substring(0, 500) + '...',
      searchType: 'general',
      maxResults
    };
    
    const results = await this.performSemanticSearch(query);
    return results.results.filter(result => result.documentId !== documentId);
  }
  
  private initializeSampleDocuments(): void {
    // Add some sample documents for demonstration
    const sampleDocs = [
      {
        id: 'sample-1',
        title: 'Civil Rights Complaint Template',
        type: 'complaint',
        content: 'This is a sample civil rights complaint under 42 U.S.C. § 1983 alleging constitutional violations by government officials...',
        metadata: { isTemplate: true }
      },
      {
        id: 'sample-2',
        title: 'Motion to Dismiss Example',
        type: 'motion',
        content: 'Pursuant to Federal Rule of Civil Procedure 12(b)(6), defendant respectfully moves to dismiss plaintiff\'s complaint for failure to state a claim upon which relief can be granted...',
        metadata: { isTemplate: true }
      }
    ];
    
    sampleDocs.forEach(doc => {
      this.documentIndex.push({
        ...doc,
        uploadDate: new Date().toISOString()
      } as DocumentIndex);
    });
  }
  
  // Advanced search methods
  async searchByLegalConcept(concept: string, caseId?: string): Promise<SearchResult[]> {
    const query: SemanticSearchQuery = {
      query: concept,
      searchType: 'legal_research',
      caseId,
      legalContext: `Legal concept analysis for: ${concept}`,
      maxResults: 15
    };
    
    const results = await this.performSemanticSearch(query);
    return results.results;
  }
  
  async findEvidence(factPattern: string, caseId?: string): Promise<SearchResult[]> {
    const query: SemanticSearchQuery = {
      query: factPattern,
      searchType: 'evidence_analysis',
      caseId,
      legalContext: `Evidence search for fact pattern: ${factPattern}`,
      maxResults: 20
    };
    
    const results = await this.performSemanticSearch(query);
    return results.results;
  }
  
  async researchPrecedents(legalIssue: string): Promise<SearchResult[]> {
    const query: SemanticSearchQuery = {
      query: legalIssue,
      searchType: 'precedent_search',
      legalContext: `Precedent research for: ${legalIssue}`,
      maxResults: 25
    };
    
    const results = await this.performSemanticSearch(query);
    return results.results;
  }
}

export const semanticSearchService = new SemanticSearchService();