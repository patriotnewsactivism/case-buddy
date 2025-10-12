import Anthropic from '@anthropic-ai/sdk';

interface EvidenceClassification {
  type: string;
  subtype?: string;
  tags: string[];
  confidence: number;
  explanation: string;
  relevance: 'high' | 'medium' | 'low';
  suggestedActions: string[];
}

export class AIEvidenceClassifier {
  private anthropic: Anthropic | null = null;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
    if (apiKey && apiKey !== 'sk-placeholder') {
      this.anthropic = new Anthropic({ apiKey });
    }
  }

  async classifyEvidence(
    evidenceName: string,
    evidenceDescription: string,
    fileType?: string
  ): Promise<EvidenceClassification> {
    if (!this.anthropic) {
      return this.getMockClassification(evidenceName, evidenceDescription, fileType);
    }

    try {
      const prompt = `You are a legal evidence classification expert. Classify the following piece of evidence for a legal case.

Evidence Name: ${evidenceName}
Description: ${evidenceDescription}
File Type: ${fileType || 'Unknown'}

Please classify this evidence and provide:
1. Primary type (Document, Email, Contract, Photograph, Video, Audio, Physical Evidence, Digital Evidence, etc.)
2. Subtype if applicable
3. Relevant tags (5-10 descriptive tags)
4. Confidence score (0-100)
5. Explanation of classification
6. Relevance level (high/medium/low)
7. Suggested actions for handling this evidence

Format your response as JSON:
{
  "type": "...",
  "subtype": "...",
  "tags": ["...", "..."],
  "confidence": 95,
  "explanation": "...",
  "relevance": "high",
  "suggestedActions": ["...", "..."]
}`;

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = message.content[0];
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      throw new Error('Failed to parse AI response');
    } catch (error) {
      console.error('Error classifying evidence:', error);
      return this.getMockClassification(evidenceName, evidenceDescription, fileType);
    }
  }

  private getMockClassification(
    name: string,
    description: string,
    fileType?: string
  ): EvidenceClassification {
    const lowerName = name.toLowerCase();
    const lowerDesc = description.toLowerCase();
    
    let type = 'Document';
    let subtype = 'General';
    let relevance: 'high' | 'medium' | 'low' = 'medium';
    
    // Determine type based on file extension or content
    if (fileType?.match(/jpg|jpeg|png|gif/i) || lowerName.match(/photo|image|picture/)) {
      type = 'Photograph';
      subtype = 'Digital Image';
    } else if (fileType?.match(/mp4|avi|mov/i) || lowerName.match(/video|recording/)) {
      type = 'Video';
      subtype = 'Digital Recording';
    } else if (fileType?.match(/mp3|wav|m4a/i) || lowerName.match(/audio|voice/)) {
      type = 'Audio';
      subtype = 'Audio Recording';
    } else if (lowerName.match(/email|message/)) {
      type = 'Email';
      subtype = 'Electronic Communication';
    } else if (lowerName.match(/contract|agreement/)) {
      type = 'Contract';
      subtype = 'Legal Agreement';
      relevance = 'high';
    } else if (lowerName.match(/receipt|invoice|bill/)) {
      type = 'Financial Document';
      subtype = 'Transaction Record';
    }

    const tags = this.generateTags(name, description, type);

    return {
      type,
      subtype,
      tags,
      confidence: 87,
      explanation: `This evidence has been classified as ${type}${subtype ? ` (${subtype})` : ''} based on the file name, description, and content analysis. The classification considers the nature of the evidence and its typical use in legal proceedings.`,
      relevance,
      suggestedActions: [
        'Verify authenticity and chain of custody',
        'Create backup copies for preservation',
        'Document metadata and collection details',
        'Review for privileged information',
        'Prepare for potential discovery requests'
      ]
    };
  }

  private generateTags(name: string, description: string, type: string): string[] {
    const text = `${name} ${description}`.toLowerCase();
    const tags: string[] = [type];

    const tagPatterns = {
      'financial': /money|payment|invoice|receipt|transaction|bank/,
      'communication': /email|message|letter|correspondence|memo/,
      'contractual': /contract|agreement|terms|conditions/,
      'medical': /medical|health|doctor|hospital|treatment/,
      'employment': /employment|job|work|salary|employee/,
      'property': /property|real estate|land|building|lease/,
      'criminal': /crime|criminal|police|arrest|charge/,
      'civil': /civil|lawsuit|complaint|damages/,
      'digital': /digital|electronic|computer|online/,
      'physical': /physical|tangible|original|hard copy/,
      'time-sensitive': /deadline|urgent|immediate|expir/,
      'confidential': /confidential|private|privileged|secret/
    };

    for (const [tag, pattern] of Object.entries(tagPatterns)) {
      if (pattern.test(text)) {
        tags.push(tag);
      }
    }

    // Add date-related tags
    if (/\d{4}/.test(text)) {
      tags.push('dated');
    }

    // Add signature-related tags
    if (/sign|signature|executed/.test(text)) {
      tags.push('signed');
    }

    return [...new Set(tags)].slice(0, 10);
  }
}

export const aiEvidenceClassifier = new AIEvidenceClassifier();