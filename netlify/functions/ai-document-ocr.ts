import { Handler } from '@netlify/functions';
import { createWorker } from 'tesseract.js';
import formidable from 'formidable';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const form = formidable({ multiples: false, maxFileSize: 50 * 1024 * 1024 });
    const [fields, files] = await form.parse(event.body as any);

    const file = Array.isArray((files as any).document)
      ? (files as any).document[0]
      : (files as any).document;
    if (!file) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No file uploaded' }) };
    }

    const worker = await createWorker('eng+spa+fra');
    await worker.setParameters({
      tessedit_char_whitelist:
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:!?-()[]{}\"\'@#$%^&*+=<>|\\~`',
      tessedit_pageseg_mode: '1',
    });

    const {
      data: { text, confidence },
    } = await worker.recognize((file as any).filepath);
    await worker.terminate();

    const documentStructure = analyzeDocumentStructure(text);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        extractedText: text,
        confidence,
        structure: documentStructure,
        wordCount: text.split(/\s+/).length,
        extractedAt: new Date().toISOString(),
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'OCR processing failed', details: error.message }),
    };
  }
};

function analyzeDocumentStructure(text: string) {
  const lines = text.split('\n').filter((line) => line.trim());

  return {
    hasHeader: /^(IN THE|UNITED STATES|STATE OF|COURT OF)/i.test(lines[0] || ''),
    hasCaseNumber: /case\s+no\.?\s*:?\s*[\w\d-]+/i.test(text),
    hasParties: /plaintiff|defendant|petitioner|respondent/i.test(text),
    documentType: identifyDocumentType(text),
    sections: extractSections(text),
    citations: extractCitations(text),
    dates: extractDates(text),
  };
}

function identifyDocumentType(text: string): string {
  const patterns: Record<string, RegExp> = {
    Motion: /\bmotion\s+(for|to)\b/i,
    Complaint: /\bcomplaint\b.*\b(civil\s+rights|discrimination|violation)/i,
    Order: /\border\b.*\b(granting|denying|sustaining)/i,
    Deposition: /\bdeposition\b.*\btaken\b/i,
    Brief: /\bbrief\b.*\b(support|opposition)/i,
    Affidavit: /\baffidavit\b.*\bsworn\b/i,
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) return type;
  }
  return 'Unknown';
}

function extractSections(text: string): string[] {
  const sectionPattern = /^[IVX]+\.\s+[A-Z][^\.]*$|^\d+\.\s+[A-Z][^\.]*$/gm;
  return text.match(sectionPattern) || [];
}

function extractCitations(text: string): string[] {
  const citationPattern = /\d+\s+[A-Z][a-z]+.?\s+\d+.*?(\d{4})|[A-Z][a-z]+\s+v\.\s+[A-Z][a-z]+.*?\d{4}/g;
  return text.match(citationPattern) || [];
}

function extractDates(text: string): string[] {
  const datePattern = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b|\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/g;
  return text.match(datePattern) || [];
}
