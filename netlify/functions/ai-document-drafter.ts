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
    const { documentType, caseInfo, specificRequests, templatePreferences } = JSON.parse(event.body || '{}');

    const draftedDocument = await draftLegalDocument({
      documentType,
      caseInfo,
      specificRequests,
      templatePreferences,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draftedDocument),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Document drafting failed', details: error.message }),
    };
  }
};

async function draftLegalDocument(params: any) {
  const templates: Record<string, string> = {
    motion_summary_judgment:
      `Draft a Motion for Summary Judgment in a civil rights case with the following requirements: - Proper caption and procedural formatting - Statement of undisputed material facts - Legal argument section with authorities - Conclusion and prayer for relief - Professional tone with persuasive but measured language`,
    complaint_civil_rights: `Draft a comprehensive civil rights complaint including:
- Proper federal court caption
- Jurisdiction and venue allegations
- Parties section with detailed descriptions
- Factual allegations in chronological order
- Claims for relief with elements
- Prayer for damages and injunctive relief`,
    discovery_requests: `Draft discovery requests (interrogatories/requests for production) focused on:
- Policy and practice evidence
- Training records
- Disciplinary history
- Communications about the incident
- Financial records for damages`,
    response_motion: `Draft a response in opposition to defendant's motion including:
- Procedural objections if applicable
- Statement of disputed facts
- Legal argument with controlling authority
- Policy arguments where appropriate
- Request for denial and attorney fees if warranted`,
  };

  const basePrompt = `You are a senior civil rights attorney drafting professional legal documents. Ensure all documents are:

- Procedurally compliant with federal and state rules
- Substantively strong with proper legal authorities
- Professionally formatted and written
- Strategically sound for civil rights litigation

Case Information: ${JSON.stringify(params.caseInfo)}
Specific Requirements: ${params.specificRequests}

${templates[params.documentType] || 'Draft the requested legal document with professional standards.'}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: 'You are an expert civil rights attorney drafting legal documents.' },
      { role: 'user', content: basePrompt },
    ],
    temperature: 0.2,
    max_tokens: 4000,
  });

  return {
    documentType: params.documentType,
    draftContent: response.choices[0].message.content,
    metadata: {
      generatedAt: new Date().toISOString(),
      wordCount: response.choices[0].message.content.split(/\s+/).length,
      caseId: params.caseInfo?.caseId,
    },
    suggestedReviews: generateReviewChecklist(params.documentType),
  };
}

function generateReviewChecklist(documentType: string): string[] {
  const checklists: Record<string, string[]> = {
    motion_summary_judgment: [
      'Verify all factual assertions are supported by evidence',
      'Confirm legal standards are accurately stated',
      'Check that opposing arguments are anticipated',
      'Ensure procedural deadlines are met',
      'Review for strategic considerations',
    ],
    complaint_civil_rights: [
      'Verify jurisdiction and venue allegations',
      'Confirm all required elements for each claim',
      'Check statute of limitations compliance',
      'Review for Twombly/Iqbal plausibility',
      'Ensure proper party descriptions',
    ],
    discovery_requests: [
      'Verify requests are reasonably calculated to lead to admissible evidence',
      'Check for privilege protections',
      'Ensure requests are not overly broad',
      'Confirm proper time limits',
      'Review for strategic priorities',
    ],
  };

  return (
    checklists[documentType] || [
      'Review for legal accuracy',
      'Check procedural compliance',
      'Verify factual support',
      'Assess strategic value',
    ]
  );
}
