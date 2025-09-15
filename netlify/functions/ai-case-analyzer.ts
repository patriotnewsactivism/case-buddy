import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { caseId, evidenceTexts, filings, timeline } = JSON.parse(event.body || '{}');

    const caseAnalysis = await performCaseAnalysis({
      caseId,
      evidenceTexts,
      filings,
      timeline,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseAnalysis),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Case analysis failed', details: error.message }),
    };
  }
};

async function performCaseAnalysis(caseData: any) {
  const prompt = `As an expert civil rights attorney, analyze this complete case file:

EVIDENCE DOCUMENTS:
${caseData.evidenceTexts?.join('\n\n—\n\n') || 'No evidence texts provided'}

FILINGS:
${caseData.filings?.map((f: any) => `${f.type}: ${f.caption}`).join('\n') || 'No filings'}

TIMELINE:
${caseData.timeline?.map((t: any) => `${t.at}: ${t.title}`).join('\n') || 'No timeline events'}

Provide a comprehensive case analysis including:

1. CASE THEORY DEVELOPMENT
- Primary legal theories
- Alternative theories
- Theory strengths and weaknesses
1. EVIDENCE ASSESSMENT
- Strongest evidence pieces
- Evidence gaps
- Credibility issues
- Admissibility concerns
1. LEGAL CLAIMS ANALYSIS
- Viable claims with elements analysis
- Damages theories
- Defenses to anticipate
- Procedural considerations
1. STRATEGIC RECOMMENDATIONS
- Discovery priorities
- Motion practice opportunities
- Settlement considerations
- Trial preparation focus
1. RISK ASSESSMENT
- Likelihood of success on each claim
- Potential adverse outcomes
- Cost-benefit analysis
- Timeline considerations

Format as structured JSON with detailed explanations.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: 'You are a senior civil rights attorney providing case analysis.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.1,
    max_tokens: 3000,
  });

  return {
    caseId: caseData.caseId,
    analysis: response.choices[0].message.content,
    confidence: calculateCaseConfidence(caseData),
    generatedAt: new Date().toISOString(),
    recommendations: extractRecommendations(response.choices[0].message.content),
  };
}

function calculateCaseConfidence(caseData: any): number {
  const evidenceScore = (caseData.evidenceTexts?.length || 0) * 10;
  const filingsScore = (caseData.filings?.length || 0) * 15;
  const timelineScore = (caseData.timeline?.length || 0) * 5;

  return Math.min(evidenceScore + filingsScore + timelineScore, 100);
}

function extractRecommendations(analysis: string): string[] {
  const lines = analysis.split('\n');
  const recommendations: string[] = [];

  for (const line of lines) {
    if (line.includes('recommend') || line.includes('should') || line.includes('priority')) {
      recommendations.push(line.trim());
    }
  }

  return recommendations.slice(0, 10);
}
