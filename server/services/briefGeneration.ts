import Anthropic from '@anthropic-ai/sdk';

/*
The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
If the user doesn't specify a model, always prefer using "claude-sonnet-4-20250514" as it is the latest model. However, if the user has already selected "claude-3-7-sonnet-20250219", keep that selection unless they explicitly request a change.
*/

// <important_do_not_delete>
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";
// </important_do_not_delete>

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface BriefGenerationRequest {
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

export interface GeneratedBrief {
  title: string;
  sections: Array<{
    heading: string;
    content: string;
    citations?: string[];
  }>;
  tableOfContents: Array<{
    section: string;
    page: number;
  }>;
  wordCount: number;
  generatedAt: Date;
}

class BriefGenerationService {
  
  async generateLegalBrief(request: BriefGenerationRequest): Promise<GeneratedBrief> {
    const systemPrompt = this.createSystemPrompt(request.briefType, request.jurisdiction);
    const userPrompt = this.createUserPrompt(request);
    
    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        system: systemPrompt,
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      const briefContent = response.content[0].text;
      return this.parseBriefResponse(briefContent, request);
      
    } catch (error) {
      console.error('Error generating legal brief:', error);
      throw new Error('Failed to generate legal brief. Please try again.');
    }
  }

  private createSystemPrompt(briefType: string, jurisdiction: string): string {
    return `You are an expert legal brief writer with extensive experience in ${jurisdiction} law. You specialize in drafting ${briefType}s that are:

1. Legally sound and well-researched
2. Professionally formatted according to court rules
3. Persuasive and compelling in argument structure
4. Properly cited with relevant legal authorities
5. Clear and concise in language

Your task is to generate a comprehensive legal brief that follows proper legal writing conventions, includes appropriate headings and subheadings, and presents arguments in a logical, persuasive manner.

Format your response as a structured legal document with:
- Clear section headings (marked with ##)
- Proper legal citations where applicable
- Professional legal language and terminology
- Logical argument flow
- Supporting facts and evidence integration

Do not include placeholder text or incomplete sections. Generate a complete, professional brief ready for court filing.`;
  }

  private createUserPrompt(request: BriefGenerationRequest): string {
    let prompt = `Generate a ${request.briefType} for the following case:

**CASE INFORMATION:**
- Case Title: ${request.caseTitle}
${request.caseNumber ? `- Case Number: ${request.caseNumber}` : ''}
- Jurisdiction: ${request.jurisdiction}
- Court: ${request.courtName}
- Client: ${request.clientName}
- Attorney: ${request.attorneyName}${request.attorneyBar ? ` (${request.attorneyBar})` : ''}

**LEGAL ISSUES:**
${request.legalIssues.map(issue => `- ${issue}`).join('\n')}

**FACTUAL BACKGROUND:**
${request.factualBackground}`;

    if (request.timeline && request.timeline.length > 0) {
      prompt += `\n\n**TIMELINE OF EVENTS:**\n${request.timeline.map(event => 
        `- ${event.date}: ${event.event} (${event.significance})`
      ).join('\n')}`;
    }

    if (request.documents && request.documents.length > 0) {
      prompt += `\n\n**RELEVANT DOCUMENTS:**\n${request.documents.map(doc => 
        `- ${doc.title} (${doc.type}): ${doc.summary}`
      ).join('\n')}`;
    }

    if (request.evidence && request.evidence.length > 0) {
      prompt += `\n\n**EVIDENCE:**\n${request.evidence.map(evidence => 
        `- ${evidence.title} (${evidence.type}): ${evidence.summary}`
      ).join('\n')}`;
    }

    if (request.customSections && request.customSections.length > 0) {
      prompt += `\n\n**CUSTOM SECTIONS TO INCLUDE:**\n${request.customSections.map(section => 
        `- ${section.title}: ${section.content}`
      ).join('\n')}`;
    }

    prompt += `\n\nGenerate a complete, professional ${request.briefType} that includes:
1. Caption and case header
2. Table of contents
3. Statement of facts
4. Legal argument with proper headings
5. Conclusion and prayer for relief
6. Certificate of service (if applicable)

${request.includePrecedents ? 'Include relevant case law and precedents.' : ''}
${request.includeStatutes ? 'Include applicable statutes and regulations.' : ''}

Ensure the brief is persuasive, well-structured, and ready for court filing.`;

    return prompt;
  }

  private parseBriefResponse(briefContent: string, request: BriefGenerationRequest): GeneratedBrief {
    // Parse the AI response into structured sections
    const sections: Array<{heading: string; content: string; citations?: string[]}> = [];
    const lines = briefContent.split('\n');
    
    let currentSection: {heading: string; content: string; citations?: string[]} | null = null;
    let tableOfContents: Array<{section: string; page: number}> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for section headings (## format)
      if (line.startsWith('##')) {
        // Save previous section if exists
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          heading: line.replace(/^#+\s*/, ''),
          content: '',
          citations: []
        };
        
        tableOfContents.push({
          section: currentSection.heading,
          page: Math.ceil(sections.length / 2) + 1 // Estimate page numbers
        });
      } else if (currentSection && line) {
        // Add content to current section
        currentSection.content += (currentSection.content ? '\n' : '') + line;
        
        // Extract citations (simple pattern matching)
        const citations = line.match(/\b\d+\s+[A-Z][a-z]+\s+\d+/g);
        if (citations) {
          currentSection.citations = currentSection.citations || [];
          currentSection.citations.push(...citations);
        }
      }
    }
    
    // Add final section
    if (currentSection) {
      sections.push(currentSection);
    }

    // Generate title
    const title = `${(request.briefType || 'LEGAL BRIEF').toUpperCase()} - ${request.caseTitle || 'Untitled Case'}`;
    
    // Count words
    const wordCount = briefContent.split(/\s+/).length;

    return {
      title,
      sections,
      tableOfContents,
      wordCount,
      generatedAt: new Date()
    };
  }

  async generateBriefSummary(brief: GeneratedBrief): Promise<string> {
    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Provide a concise executive summary of this legal brief:\n\nTitle: ${brief.title}\n\nSections:\n${brief.sections.map(s => `${s.heading}: ${s.content.substring(0, 200)}...`).join('\n\n')}\n\nGenerate a 2-3 paragraph summary highlighting the key legal arguments and requested relief.`
          }
        ]
      });

      return (response.content[0] as any).text || 'Summary generation failed.';
    } catch (error) {
      console.error('Error generating brief summary:', error);
      return 'Summary generation failed. Please review the full brief content.';
    }
  }

  getBriefTemplates() {
    return [
      {
        id: 'motion-dismiss',
        name: 'Motion to Dismiss',
        type: 'motion' as const,
        description: 'Standard motion to dismiss for failure to state a claim',
        defaultSections: [
          'Statement of Facts',
          'Legal Argument',
          'Standard of Review',
          'Conclusion'
        ]
      },
      {
        id: 'summary-judgment',
        name: 'Motion for Summary Judgment',
        type: 'summary_judgment' as const,
        description: 'Motion for summary judgment with supporting facts',
        defaultSections: [
          'Statement of Undisputed Facts',
          'Legal Standard',
          'Argument',
          'Conclusion'
        ]
      },
      {
        id: 'complaint',
        name: 'Civil Rights Complaint',
        type: 'complaint' as const,
        description: 'Federal civil rights complaint under Section 1983',
        defaultSections: [
          'Jurisdiction and Venue',
          'Parties',
          'Factual Allegations',
          'Claims for Relief',
          'Prayer for Relief'
        ]
      },
      {
        id: 'injunction',
        name: 'Motion for Injunctive Relief',
        type: 'injunction' as const,
        description: 'Motion for temporary or preliminary injunction',
        defaultSections: [
          'Background',
          'Legal Standard',
          'Likelihood of Success',
          'Irreparable Harm',
          'Balance of Hardships',
          'Public Interest'
        ]
      },
      {
        id: 'response',
        name: 'Response Brief',
        type: 'response' as const,
        description: 'Response to opposing motion or brief',
        defaultSections: [
          'Introduction',
          'Counter-Statement of Facts',
          'Legal Argument',
          'Conclusion'
        ]
      }
    ];
  }
}

export const briefGenerationService = new BriefGenerationService();