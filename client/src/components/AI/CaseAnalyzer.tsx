import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Box,
} from '@mui/material';

interface CaseAnalyzerProps {
  caseId: string;
  evidenceItems: any[];
  filings: any[];
  timeline: any[];
}

export const CaseAnalyzer: React.FC<CaseAnalyzerProps> = ({
  caseId,
  evidenceItems,
  filings,
  timeline,
}) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const runCaseAnalysis = async () => {
    setLoading(true);
    setError('');

    try {
      const evidenceTexts = evidenceItems
        .filter((item) => item.extractedText)
        .map((item) => item.extractedText);

      const response = await fetch('/.netlify/functions/ai-case-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          evidenceTexts,
          filings,
          timeline,
        }),
      });

      if (!response.ok) {
        throw new Error('Case analysis failed');
      }

      const analysisData = await response.json();
      setAnalysis(analysisData);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Comprehensive Case Analysis
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          AI-powered analysis of your complete case file including evidence, filings, and timeline.
        </Typography>

        <Button
          variant="contained"
          onClick={runCaseAnalysis}
          disabled={loading || evidenceItems.length === 0}
          sx={{ mb: 2 }}
        >
          {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
          Run Case Analysis
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {analysis && (
          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              Analysis Results (Confidence: {analysis.confidence}%)
            </Typography>

            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
              {analysis.analysis}
            </Typography>

            {analysis.recommendations?.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Key Recommendations
                </Typography>
                {analysis.recommendations.map((rec: string, index: number) => (
                  <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                    • {rec}
                  </Typography>
                ))}
              </Box>
            )}
          </Paper>
        )}
      </CardContent>
    </Card>
  );
};
