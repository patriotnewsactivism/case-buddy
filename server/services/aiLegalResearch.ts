import Anthropic from '@anthropic-ai/sdk';

interface CaseCitation {
  caseName: string;
  citation: string;
  year: number;
  court: string;
  relevance: string;
  keyHolding: string;
}

interface LawCitation {
  statute: string;
  citation: string;
  jurisdiction: string;
  relevance: string;
  keyProvisions: string[];
}

interface ResearchResult {
  summary: string;
  relevantCases: CaseCitation[];
  relevantLaws: LawCitation[];
  legalTheories: string[];
  researchStrategy: string[];
  nextSteps: string[];
  confidence: number;
}

export class AILegalResearch {
  private anthropic: Anthropic | null = null;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
    if (apiKey && apiKey !== 'sk-placeholder') {
      this.anthropic = new Anthropic({ apiKey });
    }
  }

  async conductResearch(
    legalIssue: string,
    jurisdiction: string,
    caseType: string
  ): Promise<ResearchResult> {
    if (!this.anthropic) {
      return this.getMockResearch(legalIssue, jurisdiction, caseType);
    }

    try {
      const prompt = `You are a legal research expert. Conduct comprehensive legal research on the following issue.

Legal Issue: ${legalIssue}
Jurisdiction: ${jurisdiction}
Case Type: ${caseType}

Please provide:
1. A summary of the legal issue and applicable law
2. Relevant case citations with holdings
3. Relevant statutes and regulations
4. Applicable legal theories
5. Recommended research strategy
6. Next steps for case preparation

Format as JSON:
{
  "summary": "...",
  "relevantCases": [
    {
      "caseName": "Smith v. Jones",
      "citation": "123 F.3d 456 (9th Cir. 2020)",
      "year": 2020,
      "court": "9th Circuit Court of Appeals",
      "relevance": "...",
      "keyHolding": "..."
    }
  ],
  "relevantLaws": [
    {
      "statute": "Title VII of the Civil Rights Act",
      "citation": "42 U.S.C. § 2000e",
      "jurisdiction": "Federal",
      "relevance": "...",
      "keyProvisions": ["...", "..."]
    }
  ],
  "legalTheories": ["...", "..."],
  "researchStrategy": ["...", "..."],
  "nextSteps": ["...", "..."],
  "confidence": 85
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
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      throw new Error('Failed to parse AI response');
    } catch (error) {
      console.error('Error conducting legal research:', error);
      return this.getMockResearch(legalIssue, jurisdiction, caseType);
    }
  }

  private getMockResearch(
    legalIssue: string,
    jurisdiction: string,
    caseType: string
  ): ResearchResult {
    const isContract = /contract|breach|agreement/i.test(legalIssue);
    const isTort = /tort|negligence|injury|damages/i.test(legalIssue);
    const isEmployment = /employment|discrimination|wrongful termination/i.test(legalIssue);
    const isCriminal = /criminal|felony|misdemeanor/i.test(legalIssue);

    let relevantCases: CaseCitation[] = [];
    let relevantLaws: LawCitation[] = [];
    let legalTheories: string[] = [];

    if (isContract) {
      relevantCases = [
        {
          caseName: 'Hadley v. Baxendale',
          citation: '156 Eng. Rep. 145 (1854)',
          year: 1854,
          court: 'Court of Exchequer',
          relevance: 'Foundational case establishing the rule for consequential damages in contract law',
          keyHolding: 'Damages for breach of contract are limited to those that arise naturally or were reasonably foreseeable at the time of contract formation'
        },
        {
          caseName: 'Lucy v. Zehmer',
          citation: '196 Va. 493, 84 S.E.2d 516 (1954)',
          year: 1954,
          court: 'Supreme Court of Virginia',
          relevance: 'Establishes objective theory of contract formation',
          keyHolding: 'Contract formation is determined by objective manifestations of intent, not subjective intent'
        }
      ];

      relevantLaws = [
        {
          statute: 'Uniform Commercial Code Article 2',
          citation: 'U.C.C. § 2-101 et seq.',
          jurisdiction: 'Adopted in most states',
          relevance: 'Governs contracts for the sale of goods',
          keyProvisions: [
            'Statute of Frauds requirements',
            'Warranty provisions',
            'Remedies for breach'
          ]
        }
      ];

      legalTheories = [
        'Breach of Contract',
        'Anticipatory Repudiation',
        'Material Breach vs. Minor Breach',
        'Specific Performance',
        'Consequential Damages'
      ];
    } else if (isTort) {
      relevantCases = [
        {
          caseName: 'Palsgraf v. Long Island Railroad Co.',
          citation: '248 N.Y. 339, 162 N.E. 99 (1928)',
          year: 1928,
          court: 'New York Court of Appeals',
          relevance: 'Landmark case on proximate cause and duty in negligence',
          keyHolding: 'Duty of care is owed only to foreseeable plaintiffs within the zone of danger'
        },
        {
          caseName: 'Rylands v. Fletcher',
          citation: 'L.R. 3 H.L. 330 (1868)',
          year: 1868,
          court: 'House of Lords',
          relevance: 'Establishes strict liability for abnormally dangerous activities',
          keyHolding: 'One who brings something dangerous onto their land is strictly liable for damages if it escapes'
        }
      ];

      relevantLaws = [
        {
          statute: 'Restatement (Second) of Torts',
          citation: '§ 282 et seq.',
          jurisdiction: 'Persuasive authority nationwide',
          relevance: 'Comprehensive treatment of tort law principles',
          keyProvisions: [
            'Elements of negligence',
            'Duty of care standards',
            'Causation requirements'
          ]
        }
      ];

      legalTheories = [
        'Negligence',
        'Strict Liability',
        'Res Ipsa Loquitur',
        'Comparative Negligence',
        'Proximate Cause'
      ];
    } else if (isEmployment) {
      relevantCases = [
        {
          caseName: 'McDonnell Douglas Corp. v. Green',
          citation: '411 U.S. 792 (1973)',
          year: 1973,
          court: 'U.S. Supreme Court',
          relevance: 'Establishes burden-shifting framework for employment discrimination cases',
          keyHolding: 'Creates three-part test for proving discrimination through circumstantial evidence'
        }
      ];

      relevantLaws = [
        {
          statute: 'Title VII of the Civil Rights Act',
          citation: '42 U.S.C. § 2000e et seq.',
          jurisdiction: 'Federal',
          relevance: 'Prohibits employment discrimination based on protected characteristics',
          keyProvisions: [
            'Protected classes',
            'Disparate treatment and impact',
            'Remedies and enforcement'
          ]
        }
      ];

      legalTheories = [
        'Disparate Treatment',
        'Disparate Impact',
        'Hostile Work Environment',
        'Retaliation',
        'Constructive Discharge'
      ];
    }

    return {
      summary: `This legal issue involves ${caseType} in ${jurisdiction}. The primary legal question concerns ${legalIssue}. Based on applicable case law and statutes, the key considerations include establishing the elements of the claim, identifying relevant defenses, and understanding the burden of proof requirements.`,
      relevantCases,
      relevantLaws,
      legalTheories,
      researchStrategy: [
        'Review primary sources: statutes and regulations in your jurisdiction',
        'Shepardize or KeyCite all cases to ensure they are still good law',
        'Search for recent cases in your jurisdiction addressing similar issues',
        'Review secondary sources: treatises, law review articles, and practice guides',
        'Check for any pending legislation that might affect the case',
        'Research procedural requirements and deadlines in your jurisdiction'
      ],
      nextSteps: [
        'Compile a comprehensive case law memorandum',
        'Draft legal arguments based on strongest precedents',
        'Identify potential weaknesses in opposing party\'s position',
        'Prepare responses to anticipated counterarguments',
        'Consider settlement value based on legal research',
        'Update research regularly as case progresses'
      ],
      confidence: 82
    };
  }
}

export const aiLegalResearch = new AILegalResearch();