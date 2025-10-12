import Anthropic from '@anthropic-ai/sdk';

interface TimelineEvent {
  title: string;
  description: string;
  date: string;
  type: string;
}

interface PredictedEvent {
  title: string;
  description: string;
  estimatedDate: string;
  confidence: number;
  reasoning: string;
  dependencies: string[];
  criticalPath: boolean;
}

interface TimelinePrediction {
  predictedEvents: PredictedEvent[];
  overallConfidence: number;
  recommendations: string[];
  risks: string[];
}

export class AITimelinePredictor {
  private anthropic: Anthropic | null = null;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
    if (apiKey && apiKey !== 'sk-placeholder') {
      this.anthropic = new Anthropic({ apiKey });
    }
  }

  async predictTimeline(
    caseType: string,
    existingEvents: TimelineEvent[],
    jurisdiction?: string
  ): Promise<TimelinePrediction> {
    if (!this.anthropic) {
      return this.getMockPrediction(caseType, existingEvents, jurisdiction);
    }

    try {
      const eventsText = existingEvents
        .map(e => `- ${e.date}: ${e.title} - ${e.description}`)
        .join('\n');

      const prompt = `You are a legal timeline prediction expert. Based on the case type and existing timeline events, predict future events that are likely to occur.

Case Type: ${caseType}
Jurisdiction: ${jurisdiction || 'Not specified'}

Existing Timeline Events:
${eventsText}

Please predict 5-10 future events that are likely to occur in this case, including:
1. Event title
2. Description
3. Estimated date (relative to today or last event)
4. Confidence score (0-100)
5. Reasoning for the prediction
6. Dependencies on other events
7. Whether it's on the critical path

Also provide:
- Overall confidence in predictions
- Recommendations for case management
- Potential risks to watch for

Format as JSON:
{
  "predictedEvents": [
    {
      "title": "...",
      "description": "...",
      "estimatedDate": "2024-03-15",
      "confidence": 85,
      "reasoning": "...",
      "dependencies": ["Event A", "Event B"],
      "criticalPath": true
    }
  ],
  "overallConfidence": 80,
  "recommendations": ["...", "..."],
  "risks": ["...", "..."]
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
      console.error('Error predicting timeline:', error);
      return this.getMockPrediction(caseType, existingEvents, jurisdiction);
    }
  }

  private getMockPrediction(
    caseType: string,
    existingEvents: TimelineEvent[],
    jurisdiction?: string
  ): TimelinePrediction {
    const today = new Date();
    const addDays = (days: number) => {
      const date = new Date(today);
      date.setDate(date.getDate() + days);
      return date.toISOString().split('T')[0];
    };

    const isCivil = /civil|contract|tort|property/i.test(caseType);
    const isCriminal = /criminal|felony|misdemeanor/i.test(caseType);

    const predictedEvents: PredictedEvent[] = [];

    if (isCivil) {
      predictedEvents.push(
        {
          title: 'Discovery Deadline',
          description: 'Final date for completing all discovery requests and depositions',
          estimatedDate: addDays(90),
          confidence: 85,
          reasoning: 'Standard civil procedure typically allows 90-120 days for discovery',
          dependencies: ['Case filing', 'Initial scheduling conference'],
          criticalPath: true
        },
        {
          title: 'Motion for Summary Judgment',
          description: 'Deadline for filing dispositive motions',
          estimatedDate: addDays(120),
          confidence: 75,
          reasoning: 'Typically filed after discovery completion',
          dependencies: ['Discovery Deadline'],
          criticalPath: true
        },
        {
          title: 'Pre-Trial Conference',
          description: 'Final conference before trial to resolve procedural matters',
          estimatedDate: addDays(150),
          confidence: 80,
          reasoning: 'Usually scheduled 30-60 days before trial',
          dependencies: ['Motion for Summary Judgment'],
          criticalPath: true
        },
        {
          title: 'Trial Date',
          description: 'Scheduled trial date for case resolution',
          estimatedDate: addDays(180),
          confidence: 70,
          reasoning: 'Average time to trial in civil cases is 6-12 months',
          dependencies: ['Pre-Trial Conference'],
          criticalPath: true
        }
      );
    } else if (isCriminal) {
      predictedEvents.push(
        {
          title: 'Preliminary Hearing',
          description: 'Hearing to determine if there is probable cause',
          estimatedDate: addDays(30),
          confidence: 90,
          reasoning: 'Must be held within 10-30 days of arraignment',
          dependencies: ['Arraignment'],
          criticalPath: true
        },
        {
          title: 'Plea Bargain Deadline',
          description: 'Final opportunity for plea negotiations',
          estimatedDate: addDays(60),
          confidence: 75,
          reasoning: 'Typically occurs before trial preparation begins',
          dependencies: ['Preliminary Hearing'],
          criticalPath: false
        },
        {
          title: 'Pre-Trial Motions',
          description: 'Filing of motions to suppress evidence or dismiss charges',
          estimatedDate: addDays(75),
          confidence: 80,
          reasoning: 'Standard timing for pre-trial motions',
          dependencies: ['Preliminary Hearing'],
          criticalPath: true
        },
        {
          title: 'Trial Date',
          description: 'Scheduled criminal trial date',
          estimatedDate: addDays(120),
          confidence: 75,
          reasoning: 'Speedy trial requirements typically mandate trial within 6 months',
          dependencies: ['Pre-Trial Motions'],
          criticalPath: true
        }
      );
    } else {
      // Generic case predictions
      predictedEvents.push(
        {
          title: 'Status Conference',
          description: 'Court conference to review case progress',
          estimatedDate: addDays(45),
          confidence: 85,
          reasoning: 'Standard scheduling for case management',
          dependencies: [],
          criticalPath: true
        },
        {
          title: 'Document Production',
          description: 'Exchange of relevant documents between parties',
          estimatedDate: addDays(60),
          confidence: 80,
          reasoning: 'Typical timing for initial document exchange',
          dependencies: ['Status Conference'],
          criticalPath: true
        },
        {
          title: 'Expert Witness Disclosure',
          description: 'Deadline for identifying expert witnesses',
          estimatedDate: addDays(90),
          confidence: 70,
          reasoning: 'Usually required well before trial',
          dependencies: ['Document Production'],
          criticalPath: false
        },
        {
          title: 'Settlement Conference',
          description: 'Court-ordered mediation or settlement discussion',
          estimatedDate: addDays(120),
          confidence: 75,
          reasoning: 'Courts often require settlement attempts before trial',
          dependencies: ['Expert Witness Disclosure'],
          criticalPath: false
        }
      );
    }

    return {
      predictedEvents,
      overallConfidence: 78,
      recommendations: [
        'Begin preparing for discovery immediately',
        'Identify and preserve all relevant evidence',
        'Consider early settlement discussions',
        'Maintain detailed timeline documentation',
        'Monitor all court deadlines closely',
        'Prepare witness lists and exhibits early'
      ],
      risks: [
        'Missing critical deadlines could result in sanctions',
        'Incomplete discovery may weaken case position',
        'Delays in expert witness retention could impact trial readiness',
        'Failure to respond to motions timely may result in default',
        'Inadequate trial preparation time if settlement fails'
      ]
    };
  }
}

export const aiTimelinePredictor = new AITimelinePredictor();