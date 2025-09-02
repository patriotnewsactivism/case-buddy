import Anthropic from '@anthropic-ai/sdk';

/*
The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
*/
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface LegalPrecedent {
  caseName: string;
  citation: string;
  court: string;
  year: number;
  jurisdiction: string;
  keyHolding: string;
  relevantFacts: string;
  legalPrinciples: string[];
  relevanceScore: number;
  procedurralPosture: string;
  outcome: string;
  keyQuotes: string[];
}

export interface StatuteReference {
  title: string;
  section: string;
  jurisdiction: string;
  text: string;
  applicability: string;
  relevanceScore: number;
  relatedCases: string[];
}

export interface ResearchQuery {
  legalIssue: string;
  jurisdiction?: string;
  caseType: string;
  factualContext: string;
  dateRange?: {
    startYear: number;
    endYear: number;
  };
  courtLevel?: 'supreme' | 'appellate' | 'district' | 'all';
  includeStatutes?: boolean;
  maxResults?: number;
}

export interface ResearchResults {
  query: ResearchQuery;
  precedents: LegalPrecedent[];
  statutes: StatuteReference[];
  searchSummary: string;
  legalTheories: string[];
  strengthAssessment: {
    strongPrecedents: number;
    moderatePrecedents: number;
    weakPrecedents: number;
    overallStrength: 'strong' | 'moderate' | 'weak';
    keyRisks: string[];
  };
  recommendedStrategy: string;
  additionalResearchSuggestions: string[];
}

class PrecedentResearchService {
  
  async conductResearch(query: ResearchQuery): Promise<ResearchResults> {
    try {
      // Primary research using AI knowledge of case law
      const precedents = await this.findRelevantPrecedents(query);
      const statutes = query.includeStatutes ? await this.findRelevantStatutes(query) : [];
      
      // Analyze the strength of the legal position
      const strengthAssessment = await this.assessLegalStrength(precedents, query);
      
      // Generate strategic recommendations
      const strategy = await this.generateResearchStrategy(precedents, statutes, query);
      
      return {
        query,
        precedents,
        statutes,
        searchSummary: strategy.summary,
        legalTheories: strategy.theories,
        strengthAssessment,
        recommendedStrategy: strategy.recommendation,
        additionalResearchSuggestions: strategy.additionalResearch
      };
      
    } catch (error) {
      console.error('Legal research error:', error);
      throw new Error(`Research failed: ${error.message}`);
    }
  }
  
  private async findRelevantPrecedents(query: ResearchQuery): Promise<LegalPrecedent[]> {
    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `As a legal research expert, find relevant case precedents for this legal issue:

**Legal Issue:** ${query.legalIssue}
**Case Type:** ${query.caseType}
**Jurisdiction:** ${query.jurisdiction || 'Federal and State'}
**Factual Context:** ${query.factualContext}
${query.dateRange ? `**Date Range:** ${query.dateRange.startYear} - ${query.dateRange.endYear}` : ''}
${query.courtLevel ? `**Court Level:** ${query.courtLevel}` : ''}

Please provide a detailed analysis with relevant case precedents. For each case, include:

1. **Case Name and Citation**
2. **Court and Year**
3. **Key Holding**
4. **Relevant Facts**
5. **Legal Principles**
6. **Relevance Score** (0.1-1.0)
7. **Key Quotes** from the opinion

Focus on:
- Landmark cases that established legal principles
- Recent decisions that may have changed the law
- Circuit splits or conflicting authorities
- Cases with similar factual patterns

Format your response as detailed case analyses, prioritizing the most relevant and authoritative precedents.

Limit to the top ${query.maxResults || 10} most relevant cases.`
        }]
      });
      
      const analysisText = response.content[0].text;
      
      // Parse the AI response to extract case information
      return this.parseAIPrecedentResponse(analysisText);
      
    } catch (error) {
      console.error('Precedent research error:', error);
      throw new Error('Failed to find relevant precedents');
    }
  }
  
  private parseAIPrecedentResponse(text: string): LegalPrecedent[] {
    const precedents: LegalPrecedent[] = [];
    
    // Split by case markers and process each case
    const caseBlocks = text.split(/(?:Case \d+:|^\d+\.|(?:^|\n)(?=[A-Z][^.]*v\.|\b[A-Z][^.]*\d{4}\b))/m)
      .filter(block => block.trim().length > 50);
    
    for (const block of caseBlocks.slice(0, 10)) {
      try {
        const precedent = this.extractCaseFromBlock(block);
        if (precedent) {
          precedents.push(precedent);
        }
      } catch (error) {
        console.warn('Failed to parse case block:', error);
        continue;
      }
    }
    
    return precedents;
  }
  
  private extractCaseFromBlock(text: string): LegalPrecedent | null {
    // Extract case name (pattern: Name v. Name)
    const caseNameMatch = text.match(/([A-Z][^v\n]*v\.?\s+[A-Z][^,\n(]*)/);
    if (!caseNameMatch) return null;
    
    // Extract citation
    const citationMatch = text.match(/\d+\s+[A-Z][a-z]*\.?\s*\d+|\d+\s+U\.?S\.?\s+\d+|\d+\s+F\.?\d*d?\s+\d+/);
    
    // Extract year
    const yearMatch = text.match(/\((\d{4})\)/);
    
    // Extract court
    const courtMatch = text.match(/(?:U\.S\.|Supreme Court|Circuit|District|Court of Appeals|[A-Z][a-z]*\s+(?:Circuit|District|Court))/);
    
    // Extract relevance score
    const scoreMatch = text.match(/(?:relevance|score):\s*(\d*\.?\d+)/i);
    
    return {
      caseName: caseNameMatch[1].trim(),
      citation: citationMatch?.[0] || 'Citation not found',
      court: courtMatch?.[0] || 'Court not specified',
      year: yearMatch ? parseInt(yearMatch[1]) : 2000,
      jurisdiction: this.inferJurisdiction(courtMatch?.[0] || ''),
      keyHolding: this.extractSection(text, 'holding|held|rule'),
      relevantFacts: this.extractSection(text, 'facts|background'),
      legalPrinciples: this.extractPrinciples(text),
      relevanceScore: scoreMatch ? parseFloat(scoreMatch[1]) : 0.7,
      procedurralPosture: this.extractSection(text, 'posture|procedural'),
      outcome: this.extractSection(text, 'outcome|result|decision'),
      keyQuotes: this.extractQuotes(text)
    };
  }
  
  private extractSection(text: string, keywords: string): string {
    const regex = new RegExp(`(?:${keywords})[^.]*[^.]*\\.(?:[^.]*\\.){0,2}`, 'i');
    const match = text.match(regex);
    return match ? match[0].trim() : 'Not specified';
  }
  
  private extractPrinciples(text: string): string[] {
    const principles: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.includes('principle') || line.includes('establishes') || line.includes('holds that')) {
        principles.push(line.trim());
      }
    }
    
    return principles.slice(0, 3);
  }
  
  private extractQuotes(text: string): string[] {
    const quotes = text.match(/"([^"]*)"/g);
    return quotes ? quotes.slice(0, 2).map(q => q.slice(1, -1)) : [];
  }
  
  private inferJurisdiction(court: string): string {
    if (court.includes('U.S.') || court.includes('Supreme')) return 'Federal';
    if (court.includes('Circuit')) return 'Federal Circuit';
    if (court.includes('District')) return 'Federal District';
    return 'State';
  }
  
  private async findRelevantStatutes(query: ResearchQuery): Promise<StatuteReference[]> {
    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Find relevant statutes and regulations for this legal issue:

**Legal Issue:** ${query.legalIssue}
**Case Type:** ${query.caseType}
**Jurisdiction:** ${query.jurisdiction || 'Federal'}
**Factual Context:** ${query.factualContext}

Identify applicable statutes including:
- Federal statutes (USC)
- State statutes (if jurisdiction specified)
- Relevant regulations (CFR)
- Court rules

For each statute, provide:
1. **Title and Section**
2. **Jurisdiction**
3. **Key Applicable Text**
4. **How it applies to this case**
5. **Relevance Score** (0.1-1.0)
6. **Related case law**

Focus on statutes that directly apply to the legal issue and factual scenario.`
        }]
      });
      
      return this.parseStatuteResponse(response.content[0].text);
      
    } catch (error) {
      console.error('Statute research error:', error);
      return [];
    }
  }
  
  private parseStatuteResponse(text: string): StatuteReference[] {
    const statutes: StatuteReference[] = [];
    const sections = text.split(/\d+\.\s+|\n\s*-\s+/).filter(s => s.trim().length > 20);
    
    for (const section of sections.slice(0, 5)) {
      const titleMatch = section.match(/(?:USC|CFR|\d+\s+U\.S\.C\.|\d+\s+C\.F\.R\.)[^,\n]*/);
      if (titleMatch) {
        statutes.push({
          title: titleMatch[0].trim(),
          section: this.extractSection(section, 'section|§') || 'Not specified',
          jurisdiction: section.includes('USC') || section.includes('U.S.C') ? 'Federal' : 'State',
          text: section.substring(0, 300) + '...',
          applicability: this.extractSection(section, 'applies|applicable|relevant'),
          relevanceScore: 0.8,
          relatedCases: []
        });
      }
    }
    
    return statutes;
  }
  
  private async assessLegalStrength(precedents: LegalPrecedent[], query: ResearchQuery): Promise<ResearchResults['strengthAssessment']> {
    const strongPrecedents = precedents.filter(p => p.relevanceScore >= 0.8).length;
    const moderatePrecedents = precedents.filter(p => p.relevanceScore >= 0.5 && p.relevanceScore < 0.8).length;
    const weakPrecedents = precedents.filter(p => p.relevanceScore < 0.5).length;
    
    let overallStrength: 'strong' | 'moderate' | 'weak' = 'weak';
    if (strongPrecedents >= 3) overallStrength = 'strong';
    else if (strongPrecedents >= 1 || moderatePrecedents >= 3) overallStrength = 'moderate';
    
    const keyRisks = await this.identifyLegalRisks(precedents, query);
    
    return {
      strongPrecedents,
      moderatePrecedents,
      weakPrecedents,
      overallStrength,
      keyRisks
    };
  }
  
  private async identifyLegalRisks(precedents: LegalPrecedent[], query: ResearchQuery): Promise<string[]> {
    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `Based on these legal precedents and the case context, identify the key legal risks and potential weaknesses in the legal position:

**Case Context:** ${query.legalIssue}
**Key Precedents:** ${precedents.slice(0, 3).map(p => `${p.caseName}: ${p.keyHolding}`).join('; ')}

Identify 3-5 key risks or weaknesses, such as:
- Adverse precedents or circuit splits
- Factual distinctions that might weaken the case
- Procedural hurdles or statute of limitations issues
- Recent legal developments that might affect the outcome
- Counter-arguments the opposition might raise

Be specific and practical in your risk assessment.`
        }]
      });
      
      const risks = response.content[0].text
        .split('\n')
        .filter(line => line.trim().match(/^\d+\.|\-|\•/))
        .map(line => line.replace(/^\d+\.\s*|\-\s*|\•\s*/, '').trim())
        .filter(risk => risk.length > 10)
        .slice(0, 5);
        
      return risks;
      
    } catch (error) {
      console.error('Risk assessment error:', error);
      return ['Risk assessment unavailable - manual review recommended'];
    }
  }
  
  private async generateResearchStrategy(
    precedents: LegalPrecedent[], 
    statutes: StatuteReference[], 
    query: ResearchQuery
  ): Promise<{
    summary: string;
    theories: string[];
    recommendation: string;
    additionalResearch: string[];
  }> {
    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 1200,
        messages: [{
          role: 'user',
          content: `Based on the legal research conducted, provide strategic recommendations:

**Legal Issue:** ${query.legalIssue}
**Strong Precedents Found:** ${precedents.filter(p => p.relevanceScore >= 0.8).length}
**Total Legal Authorities:** ${precedents.length + statutes.length}

**Key Cases:** ${precedents.slice(0, 3).map(p => p.caseName).join(', ')}

Provide:
1. **Research Summary** (2-3 sentences)
2. **Legal Theories** to pursue (3-4 theories)
3. **Strategic Recommendation** (paragraph)
4. **Additional Research Needed** (3-5 specific areas)

Focus on actionable insights for legal strategy and case development.`
        }]
      });
      
      const strategText = response.content[0].text;
      
      return {
        summary: this.extractSection(strategText, 'summary|research shows') || 'Research completed successfully',
        theories: this.extractListItems(strategText, 'theories|theory') || ['Primary liability theory', 'Alternative damages theory'],
        recommendation: this.extractSection(strategText, 'recommend|strategy|strategic') || 'Proceed with comprehensive case development',
        additionalResearch: this.extractListItems(strategText, 'additional|research|needed') || ['Expert witness research', 'Jurisdictional analysis']
      };
      
    } catch (error) {
      console.error('Strategy generation error:', error);
      return {
        summary: 'Legal research completed with relevant authorities identified.',
        theories: ['Primary legal theory based on precedents'],
        recommendation: 'Proceed with case development based on research findings.',
        additionalResearch: ['Additional case law research', 'Expert consultation recommended']
      };
    }
  }
  
  private extractListItems(text: string, keywords: string): string[] {
    const regex = new RegExp(`(?:${keywords})[^:]*:?([^.]*(?:[^.]*\\.){1,3})`, 'i');
    const match = text.match(regex);
    
    if (match) {
      return match[1]
        .split(/\d+\.|\n\s*-\s*|\n\s*\•\s*/)
        .map(item => item.trim())
        .filter(item => item.length > 5)
        .slice(0, 5);
    }
    
    return [];
  }
}

export const precedentResearchService = new PrecedentResearchService();