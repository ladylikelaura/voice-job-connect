import React, { useState, useRef, useEffect } from 'react';
import { Mic, Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { useWhisper } from '@chengsokdara/use-whisper';
import { useCVGeneration } from './useCVGeneration';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { generateCVFromTranscript } from './cvGenerator';
import { generateWordDocument, generatePdfDocument } from './services/documentService';
import { ProcessedCV } from './types';

/**
 * UI component for voice-based CV generation
 */
export const VoiceApplicationUI: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [agentName, setAgentName] = useState('Interviewer');
  const [candidateName, setCandidateName] = useState('Candidate');
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isAssistantPanelOpen, setIsAssistantPanelOpen] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState(false);
  const cvGenerationAttemptedRef = useRef(false);
  
  const {
    generatedCV,
    setGeneratedCV,
    processedCVData,
    isProcessing,
    setIsProcessing,
    generateCV,
    downloadWordDocument,
    downloadPdfDocument
  } = useCVGeneration();
  
  const {
    recording,
    transcribing,
    transcript,
    startRecording,
    stopRecording,
    clearTranscript,
  } = useWhisper({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    whisperConfig: {
      language: 'en',
    },
  });
  
  useEffect(() => {
    setSpeechSynthesisSupported('speechSynthesis' in window);
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && document.activeElement !== inputRef.current) {
        event.preventDefault();
        setIsAssistantPanelOpen(!isAssistantPanelOpen);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAssistantPanelOpen]);
  
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcription]);
  
  useEffect(() => {
    if (transcript) {
      setTranscription(prevTranscription => {
        const newTranscript = `${candidateName}: ${transcript}`;
        return [...prevTranscription, newTranscript];
      });
    }
  }, [transcript, candidateName]);
  
  const startVoiceApplication = () => {
    const event = new Event('voiceApplicationStart');
    window.dispatchEvent(event);
  };
  
  const endVoiceApplication = () => {
    const event = new Event('voiceApplicationEnd');
    window.dispatchEvent(event);
  };
  
  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
      setIsRecording(false);
      endVoiceApplication();
    } else {
      startRecording();
      setIsRecording(true);
      startVoiceApplication();
    }
  };
  
  const handleAgentMessage = async (message: string) => {
    setIsAgentSpeaking(true);
    setTranscription(prevTranscription => {
      return [...prevTranscription, `${agentName}: ${message}`];
    });
    
    if (speechSynthesisSupported) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.onend = () => setIsAgentSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsAgentSpeaking(false);
      toast.error("Text-to-speech not supported in this browser");
    }
  };
  
  const handleClear = () => {
    clearTranscript();
    setTranscription([]);
    setGeneratedCV(null);
    setIsProcessing(false);
    cvGenerationAttemptedRef.current = false;
  };
  
  const handleGenerateCV = async () => {
    await generateCV(transcription, cvGenerationAttemptedRef);
  };
  
  const handleAssistantPanelToggle = () => {
    setIsAssistantPanelOpen(!isAssistantPanelOpen);
  };
  
  const handleNameUpdate = (type: 'agent' | 'candidate', name: string) => {
    if (type === 'agent') {
      setAgentName(name);
    } else {
      setCandidateName(name);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Voice Application</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAssistantPanelToggle}
              aria-label="Toggle Assistant Panel"
            >
              {isAssistantPanelOpen ? 'Hide Assistant' : 'Show Assistant'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClear}
              disabled={isRecording || isProcessing}
              aria-label="Clear Transcript"
            >
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-full flex flex-col">
          <div
            ref={transcriptRef}
            className="flex-1 overflow-y-auto mb-4 p-2 border rounded-md bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          >
            {transcription.map((line, index) => (
              <div key={index} className="mb-1 last:mb-0">
                {line}
              </div>
            ))}
            {transcribing && (
              <div className="italic text-muted-foreground">
                Transcribing...
              </div>
            )}
          </div>
          <div className="flex justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleRecord}
              disabled={isProcessing}
              aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
            >
              {isRecording ? (
                <>
                  Stop Recording <Mic className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Start Recording <Mic className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Status: {isRecording ? 'Recording...' : 'Idle'}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleGenerateCV}
            disabled={transcription.length === 0 || isProcessing}
            aria-label="Generate CV"
          >
            {isProcessing ? (
              <>
                Generating... <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              'Generate CV'
            )}
          </Button>
        </CardFooter>
      </Card>
      {isAssistantPanelOpen && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Assistant Panel</CardTitle>
            <CardDescription>
              Simulate the interviewer and candidate for testing purposes.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="agent-name">Interviewer Name</Label>
              <Input
                type="text"
                id="agent-name"
                value={agentName}
                onChange={(e) => handleNameUpdate('agent', e.target.value)}
                ref={inputRef}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="candidate-name">Candidate Name</Label>
              <Input
                type="text"
                id="candidate-name"
                value={candidateName}
                onChange={(e) => handleNameUpdate('candidate', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="agent-message">Interviewer Message</Label>
              <Textarea id="agent-message" onKeyDown={async (e) => {
                if (e.key === 'Enter' && !isAgentSpeaking) {
                  e.preventDefault();
                  await handleAgentMessage((e.target as HTMLTextAreaElement).value);
                  (e.target as HTMLTextAreaElement).value = '';
                }
              }} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
