// Legal Analytics and AI Intelligence System

import { Case } from "@/lib/case-context";
import { CASE_TIMELINE, CASE_DOCUMENTS, LEGAL_ISSUES } from "@/lib/case-data";

export interface CaseOutcomePrediction {
  successLikelihood: number; // 0-100 percentage
  confidence: number; // 0-100 confidence in prediction
  keyFactors: string[];
  similarCases: SimilarCase[];
  riskFactors: string[];
  strengths: string[];
  recommendations: string[];
}

export interface SimilarCase {
  id: string;
  title: string;
  jurisdiction: string;
  outcome: 'won' | 'lost' | 'settled';
  similarity: number; // 0-100 similarity score
  keyFactors: string[];
  year: number;
}

export interface JudgeAnalytics {
  judgeName: string;
  court: string;
  totalCases: number;
  rulingTendencies: {
    plaintiffFavorable: number; // percentage
    defendantFavorable: number; // percentage
    settlements: number; // percentage
  };
  averageCaseDuration: number; // days
  caseTypes: {
    type: string;
    count: number;
    successRate: number;
  }[];
  recentTrends: string[];
  recommendations: string[];
}

export interface LegalPrecedent {
  id: string;
  caseName: string;
  citation: string;
  year: number;
  court: string;
  relevanceScore: number; // 0-100
  keyHolding: string;
  factualSimilarity: number; // 0-100
  legalPrinciples: string[];
  applicationSuggestions: string[];
}

export interface StrategyRecommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'motion' | 'discovery' | 'settlement' | 'trial' | 'appeal';
  title: string;
  description: string;
  reasoning: string;
  expectedOutcome: string;
  timeframe: string;
  risks: string[];
  benefits: string[];
  nextSteps: string[];
}

export class LegalAnalyticsEngine {
  
  static async predictCaseOutcome(caseData: Case): Promise<CaseOutcomePrediction> {
    try {
      const response = await fetch('/api/legal-analytics/predict-outcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case: caseData,
          timeline: CASE_TIMELINE,
          documents: CASE_DOCUMENTS,
          legalIssues: LEGAL_ISSUES,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to predict case outcome');
      }

      return await response.json();
    } catch (error) {
      console.error('Error predicting case outcome:', error);
      throw error;
    }
  }

  static async analyzeJudge(judgeName: string, court: string): Promise<JudgeAnalytics> {
    try {
      const response = await fetch('/api/legal-analytics/judge-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          judgeName,
          court,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze judge');
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing judge:', error);
      throw error;
    }
  }

  static async findRelevantPrecedents(caseData: Case): Promise<LegalPrecedent[]> {
    try {
      const response = await fetch('/api/legal-analytics/find-precedents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case: caseData,
          legalIssues: LEGAL_ISSUES,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to find precedents');
      }

      return await response.json();
    } catch (error) {
      console.error('Error finding precedents:', error);
      throw error;
    }
  }

  static async generateStrategyRecommendations(caseData: Case): Promise<StrategyRecommendation[]> {
    try {
      const response = await fetch('/api/legal-analytics/strategy-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case: caseData,
          timeline: CASE_TIMELINE,
          documents: CASE_DOCUMENTS,
          legalIssues: LEGAL_ISSUES,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate strategy recommendations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating strategy recommendations:', error);
      throw error;
    }
  }

  static async analyzeEvidence(evidenceItems: any[]): Promise<{
    strengthScore: number;
    weaknesses: string[];
    recommendations: string[];
  }> {
    try {
      const response = await fetch('/api/legal-analytics/analyze-evidence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          evidence: evidenceItems,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze evidence');
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing evidence:', error);
      throw error;
    }
  }

  static async compareWithSimilarCases(caseData: Case): Promise<SimilarCase[]> {
    try {
      const response = await fetch('/api/legal-analytics/similar-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case: caseData,
          legalIssues: LEGAL_ISSUES,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to find similar cases');
      }

      return await response.json();
    } catch (error) {
      console.error('Error finding similar cases:', error);
      throw error;
    }
  }
}

// Utility functions for legal analytics
export const calculateConfidenceLevel = (factors: string[]): number => {
  // Simple confidence calculation based on available data
  const baseConfidence = 60;
  const factorBonus = Math.min(factors.length * 5, 30);
  return Math.min(baseConfidence + factorBonus, 95);
};

export const categorizeRisk = (riskScore: number): 'low' | 'medium' | 'high' => {
  if (riskScore < 30) return 'low';
  if (riskScore < 70) return 'medium';
  return 'high';
};

export const formatSuccessRate = (rate: number): string => {
  return `${rate.toFixed(1)}%`;
};

export const prioritizeRecommendations = (recommendations: StrategyRecommendation[]): StrategyRecommendation[] => {
  const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

// Legal analytics data models
export interface AnalyticsSession {
  id: string;
  caseId: string;
  timestamp: string;
  predictions: CaseOutcomePrediction | null;
  judgeAnalytics: JudgeAnalytics | null;
  precedents: LegalPrecedent[];
  strategies: StrategyRecommendation[];
  status: 'pending' | 'analyzing' | 'completed' | 'error';
}

// Mock data for development/demo purposes
export const MOCK_SIMILAR_CASES: SimilarCase[] = [
  {
    id: 'case-001',
    title: 'United States v. Thompson',
    jurisdiction: 'Western District of Louisiana',
    outcome: 'won',
    similarity: 87,
    keyFactors: ['Federal property violation', 'Similar CFR regulation', 'Comparable evidence'],
    year: 2023,
  },
  {
    id: 'case-002',
    title: 'United States v. Martinez',
    jurisdiction: 'Eastern District of Louisiana',
    outcome: 'settled',
    similarity: 73,
    keyFactors: ['Property damage', 'Government facility', 'Plea negotiation'],
    year: 2022,
  },
  {
    id: 'case-003',
    title: 'United States v. Davis',
    jurisdiction: 'Middle District of Louisiana',
    outcome: 'lost',
    similarity: 69,
    keyFactors: ['CFR violation', 'Insufficient evidence', 'Procedural issues'],
    year: 2021,
  },
];

export const MOCK_PRECEDENTS: LegalPrecedent[] = [
  {
    id: 'prec-001',
    caseName: 'United States v. Johnson',
    citation: '542 F.3d 991 (5th Cir. 2008)',
    year: 2008,
    court: 'Fifth Circuit Court of Appeals',
    relevanceScore: 92,
    keyHolding: 'Federal property regulations under 41 C.F.R. § 102-74.390 require specific intent for criminal liability',
    factualSimilarity: 88,
    legalPrinciples: ['Specific intent requirement', 'Federal property protection', 'Regulatory interpretation'],
    applicationSuggestions: [
      'Challenge intent element in prosecution',
      'Motion to dismiss for failure to prove specific intent',
      'Request jury instruction on intent requirement'
    ],
  },
  {
    id: 'prec-002',
    caseName: 'United States v. Williams',
    citation: '789 F.3d 456 (5th Cir. 2015)',
    year: 2015,
    court: 'Fifth Circuit Court of Appeals',
    relevanceScore: 85,
    keyHolding: 'Government must prove defendant knew property was federal and that actions were unauthorized',
    factualSimilarity: 81,
    legalPrinciples: ['Knowledge requirement', 'Federal jurisdiction', 'Burden of proof'],
    applicationSuggestions: [
      'Challenge knowledge element',
      'Request limiting instruction on federal property identification',
      'Cross-examine on signage and notice'
    ],
  },
];