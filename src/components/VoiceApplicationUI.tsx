
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Square, FileText, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

export function VoiceApplicationUI() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedCV, setGeneratedCV] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        setAudioElement(null);
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [audioElement]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingDuration(0);
    }
    
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (audioElement) {
      audioElement.muted = !audioElement.muted;
      setIsMuted(!isMuted);
      toast.info(audioElement.muted ? "Audio muted" : "Audio unmuted");
    }
  };

  const startVoiceApplication = async () => {
    try {
      setIsRecording(true);
      toast.info("Starting voice application...");

      // Use ElevenLabs voice API through Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('voice-application', {
        body: {
          action: 'start'
        }
      });

      if (error) throw error;

      console.log('Voice application started:', data);
      
      // Play the welcome audio if available
      if (data.audio) {
        if (audioElement) {
          audioElement.pause();
        }
        
        const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
        setAudioElement(audio);
        
        audio.onended = () => {
          toast.success("Please speak when ready. Click Stop when finished.");
        };
        
        audio.onerror = () => {
          console.error('Audio playback error');
          toast.error("Error playing audio. Please try again.");
          setIsRecording(false);
        };
        
        await audio.play();
      } else {
        toast.success("Voice application started. Please speak when ready.");
      }

    } catch (error) {
      console.error('Error starting voice application:', error);
      toast.error("Failed to start voice application");
      setIsRecording(false);
    }
  };

  const stopVoiceApplication = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);
      toast.info("Processing your application...");

      const { data, error } = await supabase.functions.invoke('voice-application', {
        body: {
          action: 'stop'
        }
      });

      if (error) throw error;

      if (data.cv) {
        setGeneratedCV(data.cv);
        toast.success("CV generated successfully!");
        
        // Play success audio if available
        if (data.audio) {
          if (audioElement) {
            audioElement.pause();
          }
          
          const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
          setAudioElement(audio);
          await audio.play();
        }
      }

    } catch (error) {
      console.error('Error processing voice application:', error);
      toast.error("Failed to process voice application");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetApplication = () => {
    setGeneratedCV(null);
    setIsRecording(false);
    setIsProcessing(false);
    setRecordingDuration(0);
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
    }
    toast.info("Application reset. Ready to start again.");
  };

  return (
    <Card className="p-6 space-y-6 max-w-3xl mx-auto shadow-lg">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold">AI Voice CV Generator</h3>
        <p className="text-sm text-muted-foreground">
          Speak about your experience, skills, and education - our AI will create a professional CV for you
        </p>
      </div>

      {isRecording && (
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" 
                aria-hidden="true" />
            <span className="text-sm font-medium">Recording ({formatDuration(recordingDuration)})</span>
          </div>
          <Progress value={Math.min(recordingDuration * 2, 100)} 
                  className="w-full" 
                  aria-label="Recording progress" />
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4">
        {!isRecording ? (
          <Button
            onClick={startVoiceApplication}
            disabled={isProcessing}
            className="flex items-center gap-2 py-6 px-8 text-base"
            size="lg"
          >
            <Mic className="w-5 h-5" />
            Start Voice Application
          </Button>
        ) : (
          <Button
            onClick={stopVoiceApplication}
            variant="destructive"
            className="flex items-center gap-2 py-6 px-8 text-base"
            size="lg"
          >
            <Square className="w-5 h-5" />
            Stop Recording
          </Button>
        )}
        
        {audioElement && (
          <Button
            onClick={toggleMute}
            variant="outline"
            className="flex items-center gap-2"
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
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
            New Application
          </Button>
        )}
      </div>

      {isProcessing && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Processing your voice input...
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Converting speech to text and generating your CV
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
