import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Box,
  Paper,
} from '@mui/material';

interface DocumentDrafterProps {
  caseId: string;
  caseInfo: any;
  onDraftComplete: (draft: any) => void;
}

export const DocumentDrafter: React.FC<DocumentDrafterProps> = ({
  caseId,
  caseInfo,
  onDraftComplete,
}) => {
  const [selectedType, setSelectedType] = useState('');
  const [specificRequests, setSpecificRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<any>(null);

  const documentTypes = [
    { value: 'motion_summary_judgment', label: 'Motion for Summary Judgment' },
    { value: 'complaint_civil_rights', label: 'Civil Rights Complaint' },
    { value: 'discovery_requests', label: 'Discovery Requests' },
    { value: 'response_motion', label: 'Response to Motion' },
  ];

  const handleDraft = async () => {
    if (!selectedType) return;

    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/ai-document-drafter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: selectedType,
          caseInfo: { ...caseInfo, caseId },
          specificRequests,
          templatePreferences: {},
        }),
      });

      if (!response.ok) {
        throw new Error('Document drafting failed');
      }

      const draftData = await response.json();
      setDraft(draftData);
      onDraftComplete(draftData);
    } catch (err) {
      console.error('Drafting error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          AI Legal Document Drafter
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Document Type</InputLabel>
          <Select value={selectedType} onChange={(e) => setSelectedType(e.target.value as string)}>
            {documentTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Specific Requirements"
          multiline
          rows={3}
          fullWidth
          value={specificRequests}
          onChange={(e) => setSpecificRequests(e.target.value)}
          placeholder="Enter any specific requirements, arguments, or instructions for the document..."
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          onClick={handleDraft}
          disabled={!selectedType || loading}
          fullWidth
        >
          {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
          Draft Document
        </Button>

        {draft && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generated Document
            </Typography>

            <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 400, overflow: 'auto' }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {draft.draftContent}
              </Typography>
            </Paper>

            {draft.suggestedReviews && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Review Checklist:
                </Typography>
                {draft.suggestedReviews.map((item: string, index: number) => (
                  <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                    • {item}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
