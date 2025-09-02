import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Loader2, FileAudio, CheckCircle, XCircle, Clock, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TranscriptionButtonProps {
  audioUrl?: string;
  filePath?: string;
  onTranscriptionComplete?: (transcript: string, summary?: string) => void;
  buttonText?: string;
  className?: string;
}

export function TranscriptionButton({
  audioUrl,
  filePath,
  onTranscriptionComplete,
  buttonText = "Transcribe Audio",
  className = "",
}: TranscriptionButtonProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const startTranscription = async () => {
    if (!audioUrl && !filePath) {
      toast({
        title: "Error",
        description: "No audio file provided for transcription",
        variant: "destructive",
      });
      return;
    }

    setIsTranscribing(true);
    setShowDialog(true);
    setProgress(10);

    try {
      // Start transcription
      const response = await apiRequest('/api/transcription/audio', {
        method: 'POST',
        data: {
          audioUrl,
          filePath,
          languageTag: 'en-us',
          includeAISummary: true,
        },
      });

      setProgress(50);

      if (response.success) {
        setTranscriptionResult(response);
        setProgress(100);
        
        toast({
          title: "Transcription Complete",
          description: `Successfully transcribed ${response.wordCount || 0} words`,
        });

        if (onTranscriptionComplete) {
          onTranscriptionComplete(response.transcript, response.summary);
        }
      } else {
        throw new Error(response.error || 'Transcription failed');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Transcription Failed",
        description: error instanceof Error ? error.message : "Failed to transcribe audio",
        variant: "destructive",
      });
      setShowDialog(false);
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Button
        onClick={startTranscription}
        disabled={isTranscribing || (!audioUrl && !filePath)}
        className={className}
        data-testid="transcription-button"
      >
        {isTranscribing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Transcribing...
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 mr-2" />
            {buttonText}
          </>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileAudio className="w-5 h-5" />
              Audio Transcription
            </DialogTitle>
            <DialogDescription>
              AI-powered transcription using ElevateAI technology
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isTranscribing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing audio...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {transcriptionResult && (
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card>
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {transcriptionResult.wordCount || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Words</div>
                    </CardContent>
                  </Card>
                  
                  {transcriptionResult.duration && (
                    <Card>
                      <CardContent className="p-3 text-center">
                        <div className="text-2xl font-bold text-primary">
                          {formatDuration(transcriptionResult.duration)}
                        </div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {transcriptionResult.confidence && (
                    <Card>
                      <CardContent className="p-3 text-center">
                        <div className="text-2xl font-bold text-primary">
                          {transcriptionResult.confidence}%
                        </div>
                        <div className="text-xs text-muted-foreground">Confidence</div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {transcriptionResult.speakers && (
                    <Card>
                      <CardContent className="p-3 text-center">
                        <div className="text-2xl font-bold text-primary">
                          {transcriptionResult.speakers.length}
                        </div>
                        <div className="text-xs text-muted-foreground">Speakers</div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* AI Summary */}
                {transcriptionResult.summary && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        AI Summary
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {transcriptionResult.summary}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Full Transcript */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileAudio className="w-4 h-4" />
                      Full Transcript
                    </h3>
                    
                    {transcriptionResult.speakers && transcriptionResult.speakers.length > 0 ? (
                      <div className="space-y-3">
                        {transcriptionResult.speakers.map((speaker: any, idx: number) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <Badge variant="outline">Speaker {speaker.id}</Badge>
                            </div>
                            {speaker.segments.map((segment: any, segIdx: number) => (
                              <div key={segIdx} className="pl-6">
                                <p className="text-sm">
                                  {segment.startTime && (
                                    <span className="text-xs text-muted-foreground mr-2">
                                      [{formatDuration(Math.round(segment.startTime))}]
                                    </span>
                                  )}
                                  {segment.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="prose max-w-none">
                        <p className="text-sm whitespace-pre-wrap">
                          {transcriptionResult.transcript}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(transcriptionResult.transcript);
                      toast({
                        title: "Copied",
                        description: "Transcript copied to clipboard",
                      });
                    }}
                  >
                    Copy Transcript
                  </Button>
                  <Button
                    onClick={() => {
                      const blob = new Blob([transcriptionResult.transcript], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'transcript.txt';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Download Transcript
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}