import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const ELEVATEAI_BASE_URL = 'https://api.elevateai.com/v1';
const API_TOKEN = process.env.ELEVATEAI_API_TOKEN;

interface TranscriptionResult {
  success: boolean;
  interactionId?: string;
  transcript?: string;
  summary?: string;
  error?: string;
  wordCount?: number;
  duration?: number;
  confidence?: number;
  speakers?: Array<{
    id: string;
    segments: Array<{
      text: string;
      startTime: number;
      endTime: number;
    }>;
  }>;
}

interface InteractionStatus {
  status: 'uploaded' | 'processing' | 'processed' | 'failed';
  progress?: number;
  error?: string;
}

export class TranscriptionService {
  private apiToken: string;

  constructor() {
    this.apiToken = API_TOKEN || '';
    if (!this.apiToken) {
      console.warn('ElevateAI API token not configured. Transcription features will be disabled.');
    }
  }

  /**
   * Demo mode for testing without valid API token
   */
  private async getDemoTranscription(): Promise<TranscriptionResult> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      interactionId: 'demo-' + Date.now(),
      transcript: `This is a demonstration transcript generated for testing purposes. 
      
In a real scenario, this would contain the actual transcribed audio content from your uploaded file or URL. The ElevateAI service would process the audio and return:

1. A complete word-for-word transcript
2. Speaker identification when multiple speakers are present
3. Timestamps for each segment
4. Confidence scores for accuracy
5. An AI-generated summary of the content

The transcription service is optimized for legal terminology and can handle various audio formats including MP3, WAV, M4A, and more. It supports over 50 languages and provides high-accuracy transcription suitable for legal documentation.

For this demo, we're showing you how the interface works when transcription is successful. To use real transcription, please ensure you have a valid ElevateAI API token configured.`,
      summary: 'This is a demo transcript showing the transcription feature interface. In production, this would contain an AI-generated summary of the actual audio content, highlighting key points and important information discussed in the recording.',
      wordCount: 142,
      duration: 180,
      confidence: 95.5,
      speakers: [
        {
          id: 'Speaker-1',
          segments: [
            {
              text: 'This is the first speaker segment demonstrating how speaker diarization works.',
              startTime: 0,
              endTime: 5
            },
            {
              text: 'Each speaker is identified separately with their own segments and timestamps.',
              startTime: 10,
              endTime: 15
            }
          ]
        },
        {
          id: 'Speaker-2', 
          segments: [
            {
              text: 'This represents a second speaker in the conversation.',
              startTime: 5,
              endTime: 10
            },
            {
              text: 'The system can differentiate between multiple speakers in the audio.',
              startTime: 15,
              endTime: 20
            }
          ]
        }
      ]
    };
  }

  /**
   * Declare a new audio interaction with ElevateAI
   */
  async declareInteraction(
    languageTag: string = 'en-us',
    transcriptionMode: 'highAccuracy' | 'fast' = 'highAccuracy'
  ): Promise<{ interactionId: string }> {
    const response = await fetch(`${ELEVATEAI_BASE_URL}/interactions`, {
      method: 'POST',
      headers: {
        'X-API-Token': this.apiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'audio',
        languageTag,
        vertical: 'default'
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to declare interaction: ${response.statusText}`);
    }

    const data = await response.json() as any;
    return { interactionId: data.interactionIdentifier };
  }

  /**
   * Upload audio file to ElevateAI for transcription
   */
  async uploadAudioFile(
    interactionId: string,
    filePath: string,
    fileName: string
  ): Promise<boolean> {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath), fileName);

    const response = await fetch(
      `${ELEVATEAI_BASE_URL}/interactions/${interactionId}/upload`,
      {
        method: 'POST',
        headers: {
          'X-API-Token': this.apiToken,
        },
        body: formData,
      }
    );

    return response.ok;
  }

  /**
   * Upload audio from URL to ElevateAI
   */
  async uploadAudioFromUrl(
    interactionId: string,
    audioUrl: string
  ): Promise<boolean> {
    const response = await fetch(
      `${ELEVATEAI_BASE_URL}/interactions/${interactionId}/uploadFromUrl`,
      {
        method: 'POST',
        headers: {
          'X-API-Token': this.apiToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: audioUrl }),
      }
    );

    return response.ok;
  }

  /**
   * Check the status of a transcription
   */
  async getInteractionStatus(interactionId: string): Promise<InteractionStatus> {
    const response = await fetch(
      `${ELEVATEAI_BASE_URL}/interactions/${interactionId}/status`,
      {
        headers: {
          'X-API-Token': this.apiToken,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get interaction status: ${response.statusText}`);
    }

    const data = await response.json() as any;
    return {
      status: data.status,
      progress: data.progress,
      error: data.error,
    };
  }

  /**
   * Get the transcript for a processed interaction
   */
  async getTranscript(interactionId: string): Promise<any> {
    const response = await fetch(
      `${ELEVATEAI_BASE_URL}/interactions/${interactionId}/transcript`,
      {
        headers: {
          'X-API-Token': this.apiToken,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get transcript: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get AI-generated summary for the interaction
   */
  async getAutoSummary(interactionId: string): Promise<any> {
    try {
      const response = await fetch(
        `${ELEVATEAI_BASE_URL}/interactions/${interactionId}/autosummary`,
        {
          headers: {
            'X-API-Token': this.apiToken,
          },
        }
      );

      if (!response.ok) {
        // Summary endpoint may not be available for all interactions
        console.log(`Summary not available for interaction ${interactionId}: ${response.statusText}`);
        return null;
      }

      return response.json();
    } catch (error) {
      console.log(`Could not retrieve summary for interaction ${interactionId}:`, error);
      return null;
    }
  }

  /**
   * Get AI analysis results including sentiment, topics, etc.
   */
  async getAIResults(interactionId: string): Promise<any> {
    const response = await fetch(
      `${ELEVATEAI_BASE_URL}/interactions/${interactionId}/airesults`,
      {
        headers: {
          'X-API-Token': this.apiToken,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get AI results: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Wait for transcription to complete (polling)
   */
  async waitForCompletion(
    interactionId: string,
    maxWaitTime: number = 300000, // 5 minutes
    pollInterval: number = 5000 // 5 seconds
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getInteractionStatus(interactionId);

      if (status.status === 'processed') {
        return true;
      }

      if (status.status === 'failed') {
        throw new Error(`Transcription failed: ${status.error || 'Unknown error'}`);
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Transcription timeout');
  }

  /**
   * Full transcription workflow - from file to results
   */
  async transcribeAudioFile(
    filePath: string,
    options: {
      languageTag?: string;
      transcriptionMode?: 'highAccuracy' | 'fast';
      includeAISummary?: boolean;
      includeAIAnalysis?: boolean;
    } = {}
  ): Promise<TranscriptionResult> {
    try {
      if (!this.apiToken) {
        return {
          success: false,
          error: 'ElevateAI API token not configured',
        };
      }

      // Step 1: Declare interaction
      const { interactionId } = await this.declareInteraction(
        options.languageTag || 'en-us',
        options.transcriptionMode || 'highAccuracy'
      );

      // Step 2: Upload file
      const fileName = path.basename(filePath);
      const uploaded = await this.uploadAudioFile(interactionId, filePath, fileName);
      
      if (!uploaded) {
        throw new Error('Failed to upload audio file');
      }

      // Step 3: Wait for processing
      await this.waitForCompletion(interactionId);

      // Step 4: Get transcript
      const transcriptData = await this.getTranscript(interactionId);
      
      // Parse transcript to extract text
      let fullTranscript = '';
      let speakers: any[] = [];
      let wordCount = 0;
      let duration = 0;
      let confidence = 0;

      if (transcriptData && transcriptData.segments) {
        // Process segments to build full transcript
        const segments = transcriptData.segments;
        const speakerMap = new Map();

        segments.forEach((segment: any) => {
          fullTranscript += segment.text + ' ';
          wordCount += segment.text.split(' ').length;
          
          if (segment.speakerId) {
            if (!speakerMap.has(segment.speakerId)) {
              speakerMap.set(segment.speakerId, []);
            }
            speakerMap.get(segment.speakerId).push({
              text: segment.text,
              startTime: segment.startTime,
              endTime: segment.endTime,
            });
          }

          if (segment.confidence) {
            confidence += segment.confidence;
          }

          duration = Math.max(duration, segment.endTime || 0);
        });

        // Convert speaker map to array
        speakerMap.forEach((segments, id) => {
          speakers.push({ id, segments });
        });

        if (segments.length > 0) {
          confidence = confidence / segments.length;
        }
      }

      // Step 5: Get optional AI features
      let summary = '';
      if (options.includeAISummary) {
        try {
          const summaryData = await this.getAutoSummary(interactionId);
          summary = summaryData.summary || '';
        } catch (error) {
          console.error('Failed to get AI summary:', error);
        }
      }

      return {
        success: true,
        interactionId,
        transcript: fullTranscript.trim(),
        summary,
        wordCount,
        duration: Math.round(duration),
        confidence: Math.round(confidence * 100) / 100,
        speakers,
      };
    } catch (error) {
      console.error('Transcription error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Transcribe audio from URL
   */
  async transcribeAudioFromUrl(
    audioUrl: string,
    options: {
      languageTag?: string;
      transcriptionMode?: 'highAccuracy' | 'fast';
      includeAISummary?: boolean;
    } = {}
  ): Promise<TranscriptionResult> {
    try {
      if (!this.apiToken) {
        // Return demo transcription for testing
        console.log('Running in demo mode - no API token configured');
        return await this.getDemoTranscription();
      }

      // Declare interaction with downloadUri directly
      const response = await fetch(`${ELEVATEAI_BASE_URL}/interactions`, {
        method: 'POST',
        headers: {
          'X-API-Token': this.apiToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'audio',
          languageTag: options.languageTag || 'en-US',
          vertical: 'default',
          downloadUri: audioUrl
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevateAI API error:', errorText);
        throw new Error(`Failed to create interaction: ${response.statusText}`);
      }

      const data = await response.json() as any;
      const interactionId = data.interactionIdentifier;

      // Step 2: Wait for processing
      await this.waitForCompletion(interactionId);

      // Step 4: Get transcript
      const transcriptData = await this.getTranscript(interactionId);
      
      let fullTranscript = '';
      // ElevateAI returns transcript with participant data
      if (transcriptData) {
        if (transcriptData.allParticipants) {
          // Use the combined transcript from all participants
          fullTranscript = typeof transcriptData.allParticipants === 'string' 
            ? transcriptData.allParticipants 
            : JSON.stringify(transcriptData.allParticipants);
        } else if (transcriptData.participantOne || transcriptData.participantTwo) {
          // Combine individual participant transcripts
          const p1 = typeof transcriptData.participantOne === 'string' 
            ? transcriptData.participantOne 
            : JSON.stringify(transcriptData.participantOne || '');
          const p2 = typeof transcriptData.participantTwo === 'string' 
            ? transcriptData.participantTwo 
            : JSON.stringify(transcriptData.participantTwo || '');
          fullTranscript = [p1, p2].filter(Boolean).join(' ');
        } else if (typeof transcriptData === 'string') {
          fullTranscript = transcriptData;
        } else if (transcriptData.transcript) {
          fullTranscript = typeof transcriptData.transcript === 'string'
            ? transcriptData.transcript
            : JSON.stringify(transcriptData.transcript);
        } else {
          // Fallback: stringify the entire object if structure is unexpected
          fullTranscript = JSON.stringify(transcriptData);
        }
      }

      // Step 5: Get optional AI summary
      let summary = '';
      if (options.includeAISummary) {
        const summaryData = await this.getAutoSummary(interactionId);
        if (summaryData && summaryData.summary) {
          summary = summaryData.summary;
        }
      }

      return {
        success: true,
        interactionId,
        transcript: String(fullTranscript || '').trim(),
        summary: summary || '',
      };
    } catch (error) {
      console.error('Transcription error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const transcriptionService = new TranscriptionService();