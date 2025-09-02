import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TranscriptionButton } from "@/components/TranscriptionButton";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Mic, Upload, Link, FileAudio, TestTube, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UploadResult } from "@uppy/core";

export default function TranscriptionTest() {
  const [audioUrl, setAudioUrl] = useState("");
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const { toast } = useToast();

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const file = result.successful[0];
      setUploadedAudioUrl(file.uploadURL || "");
      toast({
        title: "Upload Complete",
        description: `${file.name} uploaded successfully. Click "Transcribe Audio" to start.`,
      });
    }
  };

  const getUploadParameters = async () => {
    try {
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      return { method: 'PUT' as const, url: data.uploadURL };
    } catch (error) {
      console.error('Failed to get upload URL:', error);
      throw error;
    }
  };

  const handleTranscriptionComplete = (newTranscript: string, newSummary?: string) => {
    setTranscript(newTranscript);
    if (newSummary) {
      setSummary(newSummary);
    }
  };

  // Sample audio files for testing
  const sampleAudioFiles = [
    {
      name: "Legal Deposition Sample",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      description: "Sample audio for testing transcription",
      duration: "6:12",
    },
    {
      name: "Court Hearing Recording",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", 
      description: "Test audio with multiple speakers",
      duration: "7:02",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Header
        title="Audio Transcription Test"
        subtitle="Test the ElevateAI transcription functionality"
        onSearch={() => {}}
        onExport={() => window.print()}
        searchPlaceholder="Search transcripts..."
      />

      <Card className="bg-gradient-to-r from-primary/5 to-chart-1/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <TestTube className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Transcription Testing Area</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Test the AI-powered audio transcription using ElevateAI. You can upload your own audio file, 
                use a URL, or try one of our sample files.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">High Accuracy Mode</Badge>
                <Badge variant="outline">Legal Terminology Optimized</Badge>
                <Badge variant="outline">Speaker Identification</Badge>
                <Badge variant="outline">AI Summaries</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-2" />
            Upload Audio
          </TabsTrigger>
          <TabsTrigger value="url">
            <Link className="w-4 h-4 mr-2" />
            Audio URL
          </TabsTrigger>
          <TabsTrigger value="samples">
            <FileAudio className="w-4 h-4 mr-2" />
            Sample Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Audio File</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload an audio file (MP3, WAV, M4A, etc.) to transcribe. Maximum file size: 100MB.
              </p>
              
              <div className="flex items-center gap-4">
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={104857600} // 100MB
                  allowedFileTypes={['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac']}
                  onGetUploadParameters={getUploadParameters}
                  onComplete={handleUploadComplete}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Audio File
                </ObjectUploader>

                {uploadedAudioUrl && (
                  <TranscriptionButton
                    audioUrl={uploadedAudioUrl}
                    onTranscriptionComplete={handleTranscriptionComplete}
                    className="min-w-[150px]"
                  />
                )}
              </div>

              {uploadedAudioUrl && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">File uploaded successfully!</p>
                  <p className="text-xs text-muted-foreground mt-1">Click "Transcribe Audio" to start transcription.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audio URL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter a direct URL to an audio file for transcription.
              </p>
              
              <div className="flex items-center gap-4">
                <Input
                  placeholder="https://example.com/audio.mp3"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  className="flex-1"
                />
                
                <TranscriptionButton
                  audioUrl={audioUrl}
                  onTranscriptionComplete={handleTranscriptionComplete}
                  className="min-w-[150px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="samples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sample Audio Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Try transcription with these sample audio files.
              </p>
              
              <div className="space-y-3">
                {sampleAudioFiles.map((sample, idx) => (
                  <Card key={idx} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Play className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{sample.name}</h4>
                            <p className="text-sm text-muted-foreground">{sample.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {sample.duration}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <TranscriptionButton
                          audioUrl={sample.url}
                          onTranscriptionComplete={handleTranscriptionComplete}
                          buttonText="Transcribe"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results Section */}
      {(transcript || summary) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Transcription Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary && (
              <div>
                <h3 className="font-semibold mb-2">AI Summary</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">{summary}</p>
                </div>
              </div>
            )}
            
            {transcript && (
              <div>
                <h3 className="font-semibold mb-2">Full Transcript</h3>
                <div className="p-4 bg-muted rounded-lg max-h-96 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap">{transcript}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(transcript);
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
                  const blob = new Blob([transcript], { type: 'text/plain' });
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
                Download as Text
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}