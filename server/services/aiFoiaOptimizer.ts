import Anthropic from '@anthropic-ai/sdk';

interface FoiaOptimization {
  optimizedRequest: string;
  improvements: string[];
  keyImprovements: Array<{
    category: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  explanation: string;
  estimatedResponseTime: string;
  tips: string[];
}

export class AIFoiaOptimizer {
  private anthropic: Anthropic | null = null;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
    if (apiKey && apiKey !== 'sk-placeholder') {
      this.anthropic = new Anthropic({ apiKey });
    }
  }

  async optimizeFoiaRequest(
    originalRequest: string,
    agency: string,
    subject: string
  ): Promise<FoiaOptimization> {
    if (!this.anthropic) {
      return this.getMockOptimization(originalRequest, agency, subject);
    }

    try {
      const prompt = `You are a FOIA (Freedom of Information Act) request optimization expert. Optimize the following FOIA request to maximize the likelihood of receiving comprehensive and timely responses.

Agency: ${agency}
Subject: ${subject}

Original Request:
${originalRequest}

Please provide:
1. An optimized version of the request with improved language
2. List of specific improvements made
3. Key improvements with categories and impact levels
4. Explanation of why these changes improve the request
5. Estimated response time based on request complexity
6. Tips for follow-up and appeal if necessary

Format as JSON:
{
  "optimizedRequest": "...",
  "improvements": ["...", "..."],
  "keyImprovements": [
    {
      "category": "Specificity",
      "description": "...",
      "impact": "high"
    }
  ],
  "explanation": "...",
  "estimatedResponseTime": "30-60 days",
  "tips": ["...", "..."]
}`;

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3072,
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
      console.error('Error optimizing FOIA request:', error);
      return this.getMockOptimization(originalRequest, agency, subject);
    }
  }

  private getMockOptimization(
    originalRequest: string,
    agency: string,
    subject: string
  ): FoiaOptimization {
    const hasDateRange = /\d{4}|\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(originalRequest);
    const hasSpecificTerms = originalRequest.split(' ').length > 20;
    const hasFeeWaiver = /fee waiver|public interest/i.test(originalRequest);

    let optimizedRequest = `Pursuant to the Freedom of Information Act, 5 U.S.C. § 552, I hereby request access to the following records:\n\n`;

    // Add specific subject matter
    optimizedRequest += `Subject Matter: ${subject}\n\n`;

    // Add date range if missing
    if (!hasDateRange) {
      const currentYear = new Date().getFullYear();
      optimizedRequest += `Time Period: January 1, ${currentYear - 2} to present\n\n`;
    }

    // Add specific document types
    optimizedRequest += `Requested Records:\n`;
    optimizedRequest += `1. All correspondence, memoranda, emails, and other communications related to ${subject}\n`;
    optimizedRequest += `2. All reports, studies, analyses, and assessments concerning ${subject}\n`;
    optimizedRequest += `3. All policies, procedures, guidelines, and directives regarding ${subject}\n`;
    optimizedRequest += `4. All meeting minutes, notes, and agendas discussing ${subject}\n\n`;

    // Add format preference
    optimizedRequest += `Format: I request that records be provided in electronic format (PDF or native format) if available.\n\n`;

    // Add fee waiver if missing
    if (!hasFeeWaiver) {
      optimizedRequest += `Fee Waiver Request: I request a waiver of all fees associated with this request as disclosure of the requested information is in the public interest and will contribute significantly to public understanding of government operations. The information will be used for non-commercial purposes.\n\n`;
    }

    // Add expedited processing if relevant
    if (/urgent|immediate|time-sensitive/i.test(originalRequest)) {
      optimizedRequest += `Expedited Processing: I request expedited processing of this request as there is a compelling need for the information and urgency to inform the public about actual or alleged government activity.\n\n`;
    }

    optimizedRequest += `If any portion of this request is denied, please provide a detailed explanation citing the specific exemption(s) claimed and notify me of appeal procedures.\n\n`;
    optimizedRequest += `Please acknowledge receipt of this request within the statutory time period and provide an estimated date of completion.\n\n`;
    optimizedRequest += `Thank you for your attention to this matter.`;

    const improvements = [
      'Added proper FOIA statutory citation',
      'Specified clear subject matter and scope',
      'Included specific date range for records',
      'Listed specific types of documents requested',
      'Added format preference for electronic delivery',
      'Included fee waiver request with justification',
      'Added language for partial denials and appeals',
      'Requested acknowledgment and timeline'
    ];

    const keyImprovements = [
      {
        category: 'Specificity',
        description: 'Added detailed description of requested records with specific document types',
        impact: 'high' as const
      },
      {
        category: 'Legal Framework',
        description: 'Included proper FOIA statutory citation and legal language',
        impact: 'high' as const
      },
      {
        category: 'Time Period',
        description: 'Specified clear date range to narrow scope and improve response time',
        impact: 'high' as const
      },
      {
        category: 'Fee Waiver',
        description: 'Added fee waiver request with public interest justification',
        impact: 'medium' as const
      },
      {
        category: 'Format',
        description: 'Requested electronic format for faster delivery',
        impact: 'medium' as const
      },
      {
        category: 'Appeal Rights',
        description: 'Included language about partial denials and appeal procedures',
        impact: 'medium' as const
      }
    ];

    return {
      optimizedRequest,
      improvements,
      keyImprovements,
      explanation: `The optimized request improves upon the original by adding specific legal citations, clearly defining the scope of records sought, including a specific time period, and requesting a fee waiver. These changes increase the likelihood of a complete and timely response while reducing the chance of overly broad rejections. The request now follows FOIA best practices and includes language to protect your rights in case of denial.`,
      estimatedResponseTime: hasSpecificTerms ? '20-30 days' : '30-60 days',
      tips: [
        'Follow up if you don\'t receive acknowledgment within 10 business days',
        'Keep copies of all correspondence for your records',
        'If denied, file an administrative appeal within the specified timeframe',
        'Consider narrowing the request if you receive a "too broad" response',
        'Document all interactions with the agency',
        'Be prepared to negotiate the scope if necessary'
      ]
    };
  }
}

export const aiFoiaOptimizer = new AIFoiaOptimizer();