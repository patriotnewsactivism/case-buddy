// Legal Analytics AI Backend Service

import Anthropic from '@anthropic-ai/sdk';
import type { Request, Response } from 'express';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// The newest Anthropic model
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

export class LegalAnalyticsService {
  
  static async predictCaseOutcome(req: Request, res: Response) {
    try {
      const { case: caseData, timeline, documents, legalIssues } = req.body;
      
      const prompt = `You are a legal AI analyst specializing in case outcome prediction. Analyze the following case data and provide a comprehensive prediction.

Case Information:
- Title: ${caseData.title}
- Type: ${caseData.caseType}
- Description: ${caseData.description}
- Court: ${caseData.court}
- Opposing Party: ${caseData.opposingParty}

Timeline Events: ${JSON.stringify(timeline, null, 2)}

Documents: ${JSON.stringify(documents, null, 2)}

Legal Issues: ${JSON.stringify(legalIssues, null, 2)}

Provide a detailed analysis with:
1. Success likelihood (0-100%)
2. Confidence level in prediction (0-100%)
3. Key factors supporting success
4. Risk factors that could lead to unfavorable outcome
5. Case strengths
6. Strategic recommendations

Format your response as a JSON object with the structure:
{
  "successLikelihood": number,
  "confidence": number,
  "keyFactors": ["factor1", "factor2"],
  "riskFactors": ["risk1", "risk2"],
  "strengths": ["strength1", "strength2"],
  "recommendations": ["rec1", "rec2"],
  "similarCases": [
    {
      "id": "case-id",
      "title": "Case Title",
      "jurisdiction": "Court Name",
      "outcome": "won|lost|settled",
      "similarity": number,
      "keyFactors": ["factor1"],
      "year": number
    }
  ]
}`;

      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 2000,
        system: "You are a legal AI analyst with expertise in case outcome prediction and legal strategy. Provide accurate, detailed analysis based on the case information provided.",
        messages: [{ role: 'user', content: prompt }],
      });

      const analysisText = response.content[0].text;
      const analysis = JSON.parse(analysisText);
      
      res.json(analysis);
    } catch (error) {
      console.error('Error predicting case outcome:', error);
      res.status(500).json({ error: 'Failed to predict case outcome' });
    }
  }

  static async analyzeJudge(req: Request, res: Response) {
    try {
      const { judgeName, court } = req.body;
      
      const prompt = `You are a legal AI analyst specializing in judicial analytics. Analyze the following judge and provide comprehensive insights.

Judge: ${judgeName}
Court: ${court}

Provide detailed analytics including:
1. Ruling tendencies and patterns
2. Average case duration
3. Success rates for different case types
4. Recent trends in rulings
5. Strategic recommendations for appearing before this judge

Format your response as JSON:
{
  "judgeName": "${judgeName}",
  "court": "${court}",
  "totalCases": number,
  "rulingTendencies": {
    "plaintiffFavorable": number,
    "defendantFavorable": number,
    "settlements": number
  },
  "averageCaseDuration": number,
  "caseTypes": [
    {
      "type": "case type",
      "count": number,
      "successRate": number
    }
  ],
  "recentTrends": ["trend1", "trend2"],
  "recommendations": ["rec1", "rec2"]
}`;

      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 1500,
        system: "You are a judicial analytics expert with access to comprehensive court data and judicial behavior patterns. Provide realistic and helpful insights.",
        messages: [{ role: 'user', content: prompt }],
      });

      const analysisText = response.content[0].text;
      const analysis = JSON.parse(analysisText);
      
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing judge:', error);
      res.status(500).json({ error: 'Failed to analyze judge' });
    }
  }

  static async findRelevantPrecedents(req: Request, res: Response) {
    try {
      const { case: caseData, legalIssues } = req.body;
      
      const prompt = `You are a legal research AI specializing in finding relevant case precedents. Analyze the case and identify the most relevant precedential cases.

Case Information:
- Title: ${caseData.title}
- Type: ${caseData.caseType}
- Description: ${caseData.description}
- Legal Issues: ${JSON.stringify(legalIssues, null, 2)}

Find and analyze relevant precedents, focusing on:
1. Cases with similar legal issues
2. Cases in the same jurisdiction or circuit
3. Landmark cases that established relevant principles
4. Recent cases that may have changed the legal landscape

Format response as JSON array:
[
  {
    "id": "unique-id",
    "caseName": "Case Name",
    "citation": "Citation",
    "year": number,
    "court": "Court Name",
    "relevanceScore": number,
    "keyHolding": "Key legal holding",
    "factualSimilarity": number,
    "legalPrinciples": ["principle1", "principle2"],
    "applicationSuggestions": ["suggestion1", "suggestion2"]
  }
]`;

      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 2000,
        system: "You are a legal research expert with comprehensive knowledge of case law, precedents, and legal principles. Provide accurate citations and relevant legal analysis.",
        messages: [{ role: 'user', content: prompt }],
      });

      const analysisText = response.content[0].text;
      const precedents = JSON.parse(analysisText);
      
      res.json(precedents);
    } catch (error) {
      console.error('Error finding precedents:', error);
      res.status(500).json({ error: 'Failed to find precedents' });
    }
  }

  static async generateStrategyRecommendations(req: Request, res: Response) {
    try {
      const { case: caseData, timeline, documents, legalIssues } = req.body;
      
      const prompt = `You are a legal strategy AI advisor. Analyze the case and provide comprehensive strategic recommendations.

Case Information:
- Title: ${caseData.title}
- Type: ${caseData.caseType}
- Description: ${caseData.description}
- Timeline: ${JSON.stringify(timeline, null, 2)}
- Documents: ${JSON.stringify(documents, null, 2)}
- Legal Issues: ${JSON.stringify(legalIssues, null, 2)}

Provide strategic recommendations covering:
1. Motions to file
2. Discovery strategies
3. Settlement considerations
4. Trial preparation
5. Appeal possibilities

Format as JSON array:
[
  {
    "priority": "high|medium|low",
    "category": "motion|discovery|settlement|trial|appeal",
    "title": "Strategy Title",
    "description": "Detailed description",
    "reasoning": "Why this strategy is recommended",
    "expectedOutcome": "Expected result",
    "timeframe": "When to implement",
    "risks": ["risk1", "risk2"],
    "benefits": ["benefit1", "benefit2"],
    "nextSteps": ["step1", "step2"]
  }
]`;

      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 2500,
        system: "You are a senior legal strategist with expertise in case management, litigation strategy, and legal tactics. Provide practical, actionable recommendations.",
        messages: [{ role: 'user', content: prompt }],
      });

      const analysisText = response.content[0].text;
      const strategies = JSON.parse(analysisText);
      
      res.json(strategies);
    } catch (error) {
      console.error('Error generating strategy recommendations:', error);
      res.status(500).json({ error: 'Failed to generate strategy recommendations' });
    }
  }

  static async analyzeEvidence(req: Request, res: Response) {
    try {
      const { evidence } = req.body;
      
      const prompt = `You are a legal evidence analyst. Analyze the provided evidence and assess its strength and weaknesses.

Evidence Items: ${JSON.stringify(evidence, null, 2)}

Provide analysis including:
1. Overall strength score (0-100)
2. Weaknesses in the evidence
3. Recommendations for strengthening the case

Format as JSON:
{
  "strengthScore": number,
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["rec1", "rec2"]
}`;

      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 1000,
        system: "You are an evidence analysis expert with deep knowledge of legal standards, admissibility rules, and evidence evaluation.",
        messages: [{ role: 'user', content: prompt }],
      });

      const analysisText = response.content[0].text;
      const analysis = JSON.parse(analysisText);
      
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing evidence:', error);
      res.status(500).json({ error: 'Failed to analyze evidence' });
    }
  }

  static async findSimilarCases(req: Request, res: Response) {
    try {
      const { case: caseData, legalIssues } = req.body;
      
      const prompt = `You are a legal case comparison AI. Find and analyze cases similar to the provided case.

Case Information:
- Title: ${caseData.title}
- Type: ${caseData.caseType}
- Description: ${caseData.description}
- Legal Issues: ${JSON.stringify(legalIssues, null, 2)}

Find similar cases and rate their similarity. Focus on:
1. Factual similarity
2. Legal issues overlap
3. Jurisdictional relevance
4. Outcomes and their relevance

Format as JSON array:
[
  {
    "id": "case-id",
    "title": "Case Title",
    "jurisdiction": "Court/Jurisdiction",
    "outcome": "won|lost|settled",
    "similarity": number,
    "keyFactors": ["factor1", "factor2"],
    "year": number
  }
]`;

      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 1500,
        system: "You are a case comparison expert with access to comprehensive legal databases. Provide accurate case comparisons and similarity assessments.",
        messages: [{ role: 'user', content: prompt }],
      });

      const analysisText = response.content[0].text;
      const similarCases = JSON.parse(analysisText);
      
      res.json(similarCases);
    } catch (error) {
      console.error('Error finding similar cases:', error);
      res.status(500).json({ error: 'Failed to find similar cases' });
    }
  }
}