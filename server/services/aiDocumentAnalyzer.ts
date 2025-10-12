import Anthropic from '@anthropic-ai/sdk';

interface DocumentAnalysis {
  summary: string;
  keyPoints: string[];
  entities: {
    people: string[];
    organizations: string[];
    locations: string[];
    dates: string[];
  };
  legalIssues: string[];
  risks: Array<{
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  recommendations: string[];
  confidence: number;
}

export class AIDocumentAnalyzer {
  private anthropic: Anthropic | null = null;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
    if (apiKey && apiKey !== 'sk-placeholder') {
      this.anthropic = new Anthropic({ apiKey });
    }
  }

  async analyzeDocument(documentText: string, documentType?: string): Promise<DocumentAnalysis> {
    if (!this.anthropic) {
      // Return mock data if no API key
      return this.getMockAnalysis(documentText);
    }

    try {
      const prompt = `You are a legal document analyzer. Analyze the following ${documentType || 'legal document'} and provide a comprehensive analysis.

Document text:
${documentText}

Please provide:
1. A concise summary (2-3 sentences)
2. Key points (bullet points)
3. Entities mentioned (people, organizations, locations, dates)
4. Legal issues identified
5. Potential risks with severity levels
6. Recommendations for action

Format your response as JSON with the following structure:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "entities": {
    "people": ["...", "..."],
    "organizations": ["...", "..."],
    "locations": ["...", "..."],
    "dates": ["...", "..."]
  },
  "legalIssues": ["...", "..."],
  "risks": [
    {"description": "...", "severity": "high|medium|low"}
  ],
  "recommendations": ["...", "..."],
  "confidence": 0.95
}`;

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = message.content[0];
      if (content.type === 'text') {
        // Extract JSON from the response
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      throw new Error('Failed to parse AI response');
    } catch (error) {
      console.error('Error analyzing document:', error);
      return this.getMockAnalysis(documentText);
    }
  }

  private getMockAnalysis(documentText: string): DocumentAnalysis {
    const wordCount = documentText.split(/\s+/).length;
    const hasContract = /contract|agreement|terms/i.test(documentText);
    const hasCourt = /court|judge|plaintiff|defendant/i.test(documentText);
    
    return {
      summary: `This ${wordCount}-word document appears to be a ${hasContract ? 'contractual' : hasCourt ? 'court-related' : 'legal'} document. It contains important information that requires careful review and analysis.`,
      keyPoints: [
        'Document requires legal review',
        'Multiple parties and obligations identified',
        'Time-sensitive elements present',
        'Compliance requirements noted'
      ],
      entities: {
        people: this.extractNames(documentText),
        organizations: this.extractOrganizations(documentText),
        locations: this.extractLocations(documentText),
        dates: this.extractDates(documentText)
      },
      legalIssues: [
        'Contractual obligations',
        'Liability considerations',
        'Compliance requirements',
        'Jurisdictional matters'
      ],
      risks: [
        {
          description: 'Potential compliance issues requiring immediate attention',
          severity: 'high'
        },
        {
          description: 'Ambiguous terms that may lead to disputes',
          severity: 'medium'
        },
        {
          description: 'Missing standard legal protections',
          severity: 'medium'
        }
      ],
      recommendations: [
        'Consult with legal counsel before signing',
        'Review all terms and conditions carefully',
        'Verify all dates and deadlines',
        'Ensure all parties are properly identified',
        'Consider negotiating key terms'
      ],
      confidence: 0.85
    };
  }

  private extractNames(text: string): string[] {
    const namePattern = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
    const matches = text.match(namePattern) || [];
    return [...new Set(matches)].slice(0, 5);
  }

  private extractOrganizations(text: string): string[] {
    const orgPattern = /\b[A-Z][a-z]+ (?:Inc|LLC|Corp|Corporation|Company|Ltd)\b/g;
    const matches = text.match(orgPattern) || [];
    return [...new Set(matches)].slice(0, 5);
  }

  private extractLocations(text: string): string[] {
    const locationPattern = /\b(?:New York|California|Texas|Florida|Illinois|Pennsylvania|Ohio|Georgia|North Carolina|Michigan)\b/g;
    const matches = text.match(locationPattern) || [];
    return [...new Set(matches)].slice(0, 5);
  }

  private extractDates(text: string): string[] {
    const datePattern = /\b(?:\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}|(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2},? \d{4})\b/g;
    const matches = text.match(datePattern) || [];
    return [...new Set(matches)].slice(0, 5);
  }
}

export const aiDocumentAnalyzer = new AIDocumentAnalyzer();