import Anthropic from '@anthropic-ai/sdk';
import { createReadStream } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

/*
The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
*/
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface OCRResult {
  extractedText: string;
  confidence: number;
  metadata: {
    pageCount?: number;
    documentType: string;
    language: string;
    processingTime: number;
    fileSize: number;
  };
  entities: {
    dates: string[];
    names: string[];
    organizations: string[];
    locations: string[];
    legalCitations: string[];
    caseNumbers: string[];
    statutes: string[];
  };
  summary: string;
  keyPoints: string[];
}

export interface DocumentAnalysis {
  documentType: 'complaint' | 'motion' | 'order' | 'brief' | 'contract' | 'correspondence' | 'evidence' | 'other';
  legalIssues: string[];
  parties: string[];
  importantDates: Array<{
    date: string;
    event: string;
    significance: string;
  }>;
  legalCitations: Array<{
    citation: string;
    type: 'case' | 'statute' | 'regulation' | 'rule';
    relevance: number;
  }>;
  keyTerms: string[];
  actionItems: string[];
  relevanceScore: number;
}

class OCRService {
  
  async extractTextFromDocument(filePath: string, fileName: string): Promise<OCRResult> {
    const startTime = Date.now();
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;
    
    try {
      let extractedText = '';
      let pageCount: number | undefined;
      
      // Determine file type and extract text accordingly
      const extension = path.extname(fileName).toLowerCase();
      
      if (extension === '.pdf') {
        const result = await this.extractFromPDF(filePath);
        extractedText = result.text;
        pageCount = result.pageCount;
      } else if (['.jpg', '.jpeg', '.png', '.tiff', '.bmp'].includes(extension)) {
        extractedText = await this.extractFromImage(filePath);
      } else if (['.doc', '.docx'].includes(extension)) {
        extractedText = await this.extractFromWord(filePath);
      } else if (extension === '.txt') {
        extractedText = await fs.readFile(filePath, 'utf-8');
      } else {
        throw new Error(`Unsupported file type: ${extension}`);
      }
      
      // Use AI to analyze and extract structured information
      const analysis = await this.analyzeDocumentWithAI(extractedText, fileName);
      
      const processingTime = Date.now() - startTime;
      
      return {
        extractedText,
        confidence: 0.95, // High confidence for text-based extraction
        metadata: {
          pageCount,
          documentType: analysis.documentType,
          language: 'en', // Default to English, could be enhanced with language detection
          processingTime,
          fileSize
        },
        entities: analysis.entities,
        summary: analysis.summary,
        keyPoints: analysis.keyPoints
      };
      
    } catch (error: any) {
      console.error('OCR extraction error:', error);
      throw new Error(`Failed to extract text from document: ${error?.message || 'Unknown error'}`);
    }
  }
  
  private async extractFromPDF(filePath: string): Promise<{text: string; pageCount: number}> {
    try {
      // Using pdftotext (part of poppler-utils) for PDF text extraction
      const { stdout } = await execAsync(`pdftotext -layout "${filePath}" -`);
      
      // Get page count
      const { stdout: pageInfo } = await execAsync(`pdfinfo "${filePath}" | grep Pages`);
      const pageCount = parseInt(pageInfo.match(/Pages:\s+(\d+)/)?.[1] || '1');
      
      return {
        text: stdout,
        pageCount
      };
    } catch (error) {
      // Fallback: try simple text extraction without layout
      try {
        const { stdout } = await execAsync(`pdftotext "${filePath}" -`);
        return {
          text: stdout,
          pageCount: 1
        };
      } catch (fallbackError) {
        throw new Error('PDF text extraction failed. Please ensure the PDF is not password-protected or corrupted.');
      }
    }
  }
  
  private async extractFromImage(filePath: string): Promise<string> {
    try {
      // Using tesseract for OCR on images
      const { stdout } = await execAsync(`tesseract "${filePath}" stdout -l eng`);
      return stdout;
    } catch (error) {
      throw new Error('Image OCR failed. Please ensure the image is clear and contains readable text.');
    }
  }
  
  private async extractFromWord(filePath: string): Promise<string> {
    try {
      // Using antiword for .doc files or python-docx2txt for .docx files
      const extension = path.extname(filePath).toLowerCase();
      
      if (extension === '.doc') {
        const { stdout } = await execAsync(`antiword "${filePath}"`);
        return stdout;
      } else {
        // For .docx files, we can use python-docx2txt if available
        const { stdout } = await execAsync(`python3 -c "import docx2txt; print(docx2txt.process('${filePath}'))"`);
        return stdout;
      }
    } catch (error) {
      throw new Error('Word document text extraction failed. Please ensure the document is not corrupted.');
    }
  }
  
  private async analyzeDocumentWithAI(text: string, fileName: string): Promise<{
    documentType: string;
    entities: OCRResult['entities'];
    summary: string;
    keyPoints: string[];
  }> {
    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Analyze this legal document and extract structured information:

**Document Name:** ${fileName}

**Document Text:**
${text.substring(0, 8000)} ${text.length > 8000 ? '...[truncated]' : ''}

Please analyze and return a JSON response with the following structure:
{
  "documentType": "complaint|motion|order|brief|contract|correspondence|evidence|other",
  "entities": {
    "dates": ["array of important dates found"],
    "names": ["array of person/entity names"],
    "organizations": ["array of organizations/companies"],
    "locations": ["array of locations mentioned"],
    "legalCitations": ["array of case citations, statutes, etc."],
    "caseNumbers": ["array of case numbers found"],
    "statutes": ["array of statute references"]
  },
  "summary": "2-3 sentence summary of the document",
  "keyPoints": ["array of 3-5 key points or findings"]
}

Focus on legal accuracy and extract only information that is clearly stated in the document.`
        }]
      });
      
      const analysisText = (response.content[0] as any).text || '';
      
      // Extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return {
        documentType: 'other',
        entities: {
          dates: [],
          names: [],
          organizations: [],
          locations: [],
          legalCitations: [],
          caseNumbers: [],
          statutes: []
        },
        summary: 'Document analysis failed - manual review required.',
        keyPoints: ['Unable to extract key points automatically']
      };
      
    } catch (error) {
      console.error('AI document analysis error:', error);
      
      // Return basic analysis if AI fails
      return {
        documentType: 'other',
        entities: {
          dates: this.extractDatesFromText(text),
          names: [],
          organizations: [],
          locations: [],
          legalCitations: this.extractLegalCitations(text),
          caseNumbers: this.extractCaseNumbers(text),
          statutes: []
        },
        summary: 'Basic text extraction completed. Full analysis unavailable.',
        keyPoints: ['Text extracted successfully', 'Manual review recommended']
      };
    }
  }
  
  private extractDatesFromText(text: string): string[] {
    const dateRegex = /\b(?:\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})\b/gi;
    const matches = text.match(dateRegex);
    return matches ? Array.from(new Set(matches)) : [];
  }
  
  private extractLegalCitations(text: string): string[] {
    // Basic legal citation patterns
    const citationRegex = /\b\d+\s+[A-Z][a-z]+\.?\s+\d+|\b\d+\s+U\.?S\.?\s+\d+|\b\d+\s+F\.?\d*d?\s+\d+/g;
    const matches = text.match(citationRegex);
    return matches ? Array.from(new Set(matches)) : [];
  }
  
  private extractCaseNumbers(text: string): string[] {
    // Common case number patterns
    const caseNumberRegex = /\b(?:Case\s+No\.?|Civil\s+Action\s+No\.?|Docket\s+No\.?)\s*:?\s*([A-Z0-9-:]+)/gi;
    const matches = text.match(caseNumberRegex);
    return matches ? Array.from(new Set(matches)) : [];
  }
  
  async performDetailedDocumentAnalysis(ocrResult: OCRResult): Promise<DocumentAnalysis> {
    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `Perform a detailed legal analysis of this document:

**Extracted Text:**
${ocrResult.extractedText.substring(0, 6000)}

**Previously Identified Entities:**
- Legal Citations: ${ocrResult.entities.legalCitations.join(', ')}
- Case Numbers: ${ocrResult.entities.caseNumbers.join(', ')}
- Key Names: ${ocrResult.entities.names.join(', ')}

Please provide a detailed legal analysis in JSON format:
{
  "documentType": "specific document type",
  "legalIssues": ["array of legal issues identified"],
  "parties": ["array of parties involved"],
  "importantDates": [
    {
      "date": "date string",
      "event": "what happened",
      "significance": "why it matters"
    }
  ],
  "legalCitations": [
    {
      "citation": "full citation",
      "type": "case|statute|regulation|rule",
      "relevance": 0.1-1.0
    }
  ],
  "keyTerms": ["important legal terms"],
  "actionItems": ["things that need to be done"],
  "relevanceScore": 0.1-1.0
}`
        }]
      });
      
      const analysisText = (response.content[0] as any).text || '';
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback analysis
      return {
        documentType: ocrResult.metadata.documentType as any,
        legalIssues: ['Analysis pending'],
        parties: ocrResult.entities.names.slice(0, 5),
        importantDates: [],
        legalCitations: ocrResult.entities.legalCitations.map(citation => ({
          citation,
          type: 'case' as const,
          relevance: 0.5
        })),
        keyTerms: [],
        actionItems: [],
        relevanceScore: 0.5
      };
      
    } catch (error) {
      console.error('Detailed document analysis error:', error);
      throw new Error('Failed to perform detailed document analysis');
    }
  }
}

export const ocrService = new OCRService();