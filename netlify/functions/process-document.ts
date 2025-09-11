import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { createWorker } from 'tesseract.js'
import OpenAI from 'openai'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { documentId, filePath, caseId } = JSON.parse(event.body || '{}')

    // Download file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(filePath)

    if (downloadError) throw downloadError

    // Convert to buffer
    const buffer = await fileData.arrayBuffer()
    const fileBuffer = Buffer.from(buffer)

    // Extract text based on file type
    let extractedText = ''
    const fileExt = filePath.split('.').pop()?.toLowerCase()

    try {
      if (fileExt === 'pdf') {
        const pdfData = await pdfParse(fileBuffer)
        extractedText = pdfData.text
      } else if (fileExt === 'docx') {
        const { value } = await mammoth.extractRawText({ buffer: fileBuffer })
        extractedText = value
      } else if (['jpg', 'jpeg', 'png', 'tiff'].includes(fileExt || '')) {
        // Use Tesseract for OCR on images
        const worker = await createWorker('eng')
        const { data: { text } } = await worker.recognize(fileBuffer)
        await worker.terminate()
        extractedText = text
      } else {
        extractedText = fileBuffer.toString('utf-8')
      }
    } catch (extractionError) {
      console.error('Text extraction failed:', extractionError)
      extractedText = 'Text extraction failed for this file type'
    }

    // Perform AI analysis
    const analysis = await performAIAnalysis(extractedText, caseId)

    // Update document with extracted text and analysis
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        extracted_text: extractedText,
        analysis_result: analysis,
        confidence_score: analysis.confidence,
        status: 'analyzed'
      })
      .eq('id', documentId)

    if (updateError) throw updateError

    // Store detailed analysis results
    await supabase
      .from('analysis_results')
      .insert({
        document_id: documentId,
        case_id: caseId,
        analysis_type: 'comprehensive',
        result: analysis,
        confidence_score: analysis.confidence
      })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        documentId,
        extractedText: extractedText.substring(0, 500),
        analysis: analysis
      })
    }
  } catch (error) {
    console.error('Document processing error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Document processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

async function performAIAnalysis(text: string, caseId: string) {
  const prompt = `You are an expert civil rights attorney analyzing a legal document.

Document Text:
${text}

Analyze this document and provide a comprehensive legal analysis in JSON format:

{
"documentType": "string - type of legal document",
"confidence": "number - confidence score 0-100",
"keyFindings": ["array of key legal findings"],
"legalIssues": ["array of legal issues identified"],
"parties": ["array of parties mentioned"],
"citations": ["array of legal citations found"],
"dates": ["array of important dates"],
"constitutionalClaims": ["array of constitutional violations"],
"statutoryClaims": ["array of statutory violations"],
"damages": {
"type": "string - type of damages claimed",
"amount": "string - amount if specified",
"categories": ["array of damage categories"]
},
"proceduralIssues": ["array of procedural concerns"],
"evidenceNeeded": ["array of additional evidence needed"],
"strategicRecommendations": ["array of strategic recommendations"],
"riskAssessment": {
"strengths": ["array of case strengths"],
"weaknesses": ["array of case weaknesses"],
"successProbability": "number - estimated success probability 0-100"
},
"nextSteps": ["array of recommended next steps"]
}

Focus on civil rights law, constitutional violations, and federal court practice. Be specific and accurate.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert civil rights attorney. Respond only with valid JSON.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 3000
    })

    const analysisText = response.choices[0].message.content || '{}'

    // Clean up response to ensure valid JSON
    const cleanedText = analysisText
      .replace(/```json\s*/, '')
      .replace(/```\s*$/, '')
      .trim()

    const analysis = JSON.parse(cleanedText)

    // Add metadata
    analysis.analysisDate = new Date().toISOString()
    analysis.wordCount = text.split(/\s+/).length
    analysis.textLength = text.length

    return analysis
  } catch (error) {
    console.error('AI analysis failed:', error)

    // Return fallback analysis
    return {
      documentType: 'Unknown',
      confidence: 50,
      keyFindings: ['Document uploaded successfully'],
      error: 'AI analysis failed, manual review required',
      analysisDate: new Date().toISOString(),
      wordCount: text.split(/\s+/).length,
      textLength: text.length
    }
  }
}
