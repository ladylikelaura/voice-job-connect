
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Square, FileText, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

export function VoiceApplicationUI() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedCV, setGeneratedCV] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef<number | null>(null);
  const elevenLabsRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Setup microphone access and permissions
  const requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Microphone access is required for this application");
      return false;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop the timer
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      
      // Stop microphone access
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Clean up any ElevenLabs connection
      if (elevenLabsRef.current) {
        // Clean up the connection (would be implementation specific)
        elevenLabsRef.current = null;
      }
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    if (isCallActive) {
      timerRef.current = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCallDuration(0);
    }
    
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    // Mute the microphone tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted; // Toggle: If currently muted, unmute and vice versa
      });
    }
    
    toast.info(isMuted ? "Microphone unmuted" : "Microphone muted");
  };

  // Start the conversation with the ElevenLabs agent
  const startConversation = async () => {
    try {
      // Request microphone access first
      const hasMicAccess = await requestMicrophoneAccess();
      if (!hasMicAccess) return;

      setIsProcessing(true);
      toast.info("Connecting to the interview agent...");

      // Call our Edge Function to get a signed URL from ElevenLabs
      const { data, error } = await supabase.functions.invoke('voice-application', {
        body: {
          action: 'start'
        }
      });

      if (error) throw error;

      // Check if we got the signed URL
      if (!data?.signedUrl) {
        throw new Error('Failed to get conversation URL');
      }

      // Here we would initialize the ElevenLabs WebSocket connection
      // This is a placeholder for the actual implementation
      // In a real app, this would connect to the ElevenLabs WebSocket API
      toast.success("Connected to the interview agent. The agent will now ask you questions about your experience.");
      setIsCallActive(true);
      setIsProcessing(false);

      // For demonstration, let's simulate a generated CV after some time
      // In a real implementation, this would come from the ElevenLabs agent
      setTimeout(() => {
        const sampleCV = `
Name: Job Applicant

Professional Experience:
- Software Engineer at Tech Solutions Inc. (2019-2023)
  * Led development of customer-facing web applications
  * Improved system performance by 40%
  * Mentored junior developers

- Junior Developer at StartUp Co. (2017-2019)
  * Developed and maintained company website
  * Collaborated with design team on UI improvements

Skills:
- Programming Languages: JavaScript, TypeScript, Python
- Frameworks: React, Node.js, Express
- Tools: Git, Docker, AWS
- Soft Skills: Communication, Teamwork, Problem-solving

Education:
- Bachelor of Science in Computer Science, University Tech (2013-2017)
        `;
        setGeneratedCV(sampleCV);
      }, 10000);

    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error("Failed to connect to the interview agent");
      setIsProcessing(false);
    }
  };

  // End the conversation with the ElevenLabs agent
  const endConversation = async () => {
    try {
      setIsCallActive(false);
      setIsProcessing(true);
      toast.info("Ending the interview...");

      // Call our Edge Function to end the conversation
      const { error } = await supabase.functions.invoke('voice-application', {
        body: {
          action: 'stop'
        }
      });

      if (error) throw error;

      // Stop microphone access
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }

      toast.success("Interview completed. Your CV has been generated.");

    } catch (error) {
      console.error('Error ending conversation:', error);
      toast.error("Failed to properly end the interview");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetApplication = () => {
    setGeneratedCV(null);
    setIsCallActive(false);
    setIsProcessing(false);
    setCallDuration(0);
    
    // Stop microphone access
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    toast.info("Application reset. Ready to start again.");
  };

  return (
    <Card className="p-6 space-y-6 max-w-3xl mx-auto shadow-lg">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold">AI Voice CV Generator</h3>
        <p className="text-sm text-muted-foreground">
          Have a conversation with our AI agent who will ask you questions and generate a professional CV based on your responses
        </p>
      </div>

      {isCallActive && (
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" 
                aria-hidden="true" />
            <span className="text-sm font-medium">Call in progress ({formatDuration(callDuration)})</span>
          </div>
          <Progress value={Math.min(callDuration, 100)} 
                  className="w-full" 
                  aria-label="Call duration" />
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4">
        {!isCallActive ? (
          <Button
            onClick={startConversation}
            disabled={isProcessing}
            className="flex items-center gap-2 py-6 px-8 text-base"
            size="lg"
          >
            <Mic className="w-5 h-5" />
            Start Interview
          </Button>
        ) : (
          <Button
            onClick={endConversation}
            variant="destructive"
            className="flex items-center gap-2 py-6 px-8 text-base"
            size="lg"
          >
            <Square className="w-5 h-5" />
            End Interview
          </Button>
        )}
        
        {isCallActive && (
          <Button
            onClick={toggleMute}
            variant="outline"
            className="flex items-center gap-2"
            aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isMuted ? "Unmute" : "Mute"}
          </Button>
        )}
        
        {generatedCV && (
          <Button
            onClick={resetApplication}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            New Interview
          </Button>
        )}
      </div>

      {isProcessing && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            {isCallActive ? "Ending interview..." : "Connecting to interview agent..."}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isCallActive ? "Generating your CV based on your responses" : "Initializing the voice interview"}
          </p>
        </div>
      )}

      {generatedCV && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg">Your Generated CV</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const blob = new Blob([generatedCV], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'my-generated-cv.txt';
                a.click();
                toast.success("CV downloaded successfully");
              }}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Download as Text
            </Button>
          </div>
          <div className="bg-muted p-4 rounded-lg overflow-auto max-h-80 border">
            <pre className="text-sm whitespace-pre-wrap font-mono">
              {generatedCV}
            </pre>
          </div>
        </div>
      )}
    </Card>
  );
}
