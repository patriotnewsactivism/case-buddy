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
    const { documentText, analysisType, caseContext } = JSON.parse(event.body || '{}');

    if (!documentText) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Document text required' }) };
    }

    const analysis = await performDocumentAnalysis(documentText, analysisType, caseContext);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analysis),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Analysis failed', details: error.message }),
    };
  }
};

async function performDocumentAnalysis(text: string, type: string, context?: any) {
  const basePrompt = `You are an expert civil rights attorney analyzing legal documents. Provide detailed, accurate analysis with attention to legal precedent and procedural requirements.`;

  const analysisPrompts: Record<string, string> = {
    summary: `${basePrompt}

Analyze this legal document and provide:
1. Executive summary (2-3 sentences)
2. Key legal issues identified
3. Parties involved and their positions
4. Critical facts and timeline
5. Legal standards applicable
6. Potential strengths and weaknesses
7. Next steps and strategic considerations

Document: ${text}`,

    discovery: `${basePrompt}

Review this document for discovery purposes:
1. Identify all factual assertions that require verification
2. List potential witnesses mentioned or implied
3. Identify documents referenced that should be requested
4. Flag any admissions or damaging statements
5. Note any privilege issues
6. Suggest follow-up discovery requests

Document: ${text}`,

    motion_review: `${basePrompt}

Analyze this motion for:
1. Legal sufficiency of arguments
2. Procedural compliance (standing, jurisdiction, etc.)
3. Strength of legal authority cited
4. Factual support for claims
5. Potential counterarguments
6. Strategic response recommendations

Document: ${text}`,

    civil_rights: `${basePrompt}

Analyze this document specifically for civil rights violations:
1. Constitutional claims (§1983, Equal Protection, Due Process)
2. Statutory violations (Title VII, ADA, Fair Housing, etc.)
3. Elements analysis for each potential claim
4. Damages theories (compensatory, punitive, injunctive relief)
5. Qualified immunity considerations
6. Municipal liability issues (Monell claims)
7. Statute of limitations analysis

Document: ${text}`,
  };

  const prompt = analysisPrompts[type] || analysisPrompts.summary;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: 'You are an expert civil rights attorney.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.1,
    max_tokens: 2000,
  });

  return {
    analysis: response.choices[0].message.content,
    analysisType: type,
    confidence: calculateConfidence(text),
    timestamp: new Date().toISOString(),
  };
}

function calculateConfidence(text: string): number {
  const factors = {
    length: Math.min(text.length / 5000, 1) * 20,
    legalTerms:
      (text.match(/\b(plaintiff|defendant|court|motion|order|jurisdiction|statute|precedent|violation|damages|relief)\b/gi) || []).length *
      2,
    structure: text.includes('WHEREFORE') || text.includes('CONCLUSION') ? 20 : 0,
    citations: (text.match(/\d+\s+[A-Z][a-z]+.?\s+\d+/g) || []).length * 5,
  };

  return Math.min(Object.values(factors).reduce((a, b) => a + b, 0), 100);
}
