import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AnalyticsIcon from '@mui/icons-material/Analytics';

interface DocumentAnalyzerProps {
  caseId: string;
  onAnalysisComplete: (analysis: any) => void;
}

export const DocumentAnalyzer: React.FC<DocumentAnalyzerProps> = ({ caseId, onAnalysisComplete }) => {
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setLoading(true);
      setError('');

      try {
        const formData = new FormData();
        formData.append('document', file);

        const ocrResponse = await fetch('/.netlify/functions/ai-document-ocr', {
          method: 'POST',
          body: formData,
        });

        if (!ocrResponse.ok) {
          throw new Error('OCR processing failed');
        }

        const ocrData = await ocrResponse.json();
        setOcrResult(ocrData);

        const analysisResponse = await fetch('/.netlify/functions/ai-document-analyzer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentText: ocrData.extractedText,
            analysisType: 'civil_rights',
            caseContext: { caseId },
          }),
        });

        if (!analysisResponse.ok) {
          throw new Error('Document analysis failed');
        }

        const analysisData = await analysisResponse.json();
        setAnalysis(analysisData);
        onAnalysisComplete(analysisData);
      } catch (err: any) {
        setError(err instanceof Error ? err.message : 'Processing failed');
      } finally {
        setLoading(false);
      }
    },
    [caseId, onAnalysisComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff'],
      'text/*': ['.txt', '.doc', '.docx'],
    },
    maxFiles: 1,
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        AI Document Analyzer
      </Typography>

      {/* Upload Area */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          mb: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          bgcolor: isDragActive ? 'primary.50' : 'grey.50',
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        <input {...getInputProps()} />
        <UploadFileIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop the document here' : 'Upload Legal Document'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supports PDF, images, and text documents. Advanced OCR and AI analysis included.
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Processing document...</Typography>
        </Box>
      )}

      {(ocrResult || analysis) && (
        <Paper sx={{ p: 0 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="OCR Results" />
            <Tab label="Legal Analysis" />
            <Tab label="Document Structure" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && ocrResult && <OCRResultsPanel ocrResult={ocrResult} />}
            {tabValue === 1 && analysis && <AnalysisResultsPanel analysis={analysis} />}
            {tabValue === 2 && ocrResult && <DocumentStructurePanel structure={ocrResult.structure} />}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

const OCRResultsPanel: React.FC<{ ocrResult: any }> = ({ ocrResult }) => (
  <Box>
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <Chip label={`Confidence: ${ocrResult.confidence?.toFixed(1)}%`} color="primary" />
      <Chip label={`Words: ${ocrResult.wordCount}`} />
      <Chip label={`Extracted: ${new Date(ocrResult.extractedAt).toLocaleString()}`} />
    </Box>

    <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 400, overflow: 'auto' }}>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
        {ocrResult.extractedText}
      </Typography>
    </Paper>
  </Box>
);

const AnalysisResultsPanel: React.FC<{ analysis: any }> = ({ analysis }) => (
  <Box>
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <Chip label={`Analysis: ${analysis.analysisType}`} color="secondary" />
      <Chip label={`Confidence: ${analysis.confidence}%`} />
    </Box>

    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
        {analysis.analysis}
      </Typography>
    </Paper>
  </Box>
);

const DocumentStructurePanel: React.FC<{ structure: any }> = ({ structure }) => (
  <Box>
    <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
      <Chip label={`Document Type: ${structure.documentType}`} color="primary" />
      <Chip
        label={structure.hasHeader ? 'Has Header' : 'No Header'}
        variant={structure.hasHeader ? 'filled' : 'outlined'}
      />
      <Chip
        label={structure.hasCaseNumber ? 'Has Case Number' : 'No Case Number'}
        variant={structure.hasCaseNumber ? 'filled' : 'outlined'}
      />
      <Chip
        label={structure.hasParties ? 'Has Parties' : 'No Parties'}
        variant={structure.hasParties ? 'filled' : 'outlined'}
      />
    </Box>

    {structure.sections?.length > 0 && (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Document Sections ({structure.sections.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {structure.sections.map((section: string, index: number) => (
            <Typography key={index} variant="body2" sx={{ mb: 1 }}>
              {section}
            </Typography>
          ))}
        </AccordionDetails>
      </Accordion>
    )}

    {structure.citations?.length > 0 && (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Citations Found ({structure.citations.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {structure.citations.map((citation: string, index: number) => (
            <Typography key={index} variant="body2" sx={{ mb: 1 }}>
              {citation}
            </Typography>
          ))}
        </AccordionDetails>
      </Accordion>
    )}

    {structure.dates?.length > 0 && (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Dates Extracted ({structure.dates.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {structure.dates.map((date: string, index: number) => (
            <Typography key={index} variant="body2" sx={{ mb: 1 }}>
              {date}
            </Typography>
          ))}
        </AccordionDetails>
      </Accordion>
    )}
  </Box>
);
