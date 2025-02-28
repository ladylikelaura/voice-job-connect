
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Square, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function VoiceApplicationUI() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedCV, setGeneratedCV] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        setAudioElement(null);
      }
    };
  }, [audioElement]);

  const startVoiceApplication = async () => {
    try {
      setIsRecording(true);
      toast.info("Starting voice application...");

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
      }

    } catch (error) {
      console.error('Error processing voice application:', error);
      toast.error("Failed to process voice application");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Voice Application</h3>
        <p className="text-sm text-muted-foreground">
          Apply using voice interface - our AI assistant will guide you through the process
        </p>
      </div>

      <div className="flex justify-center gap-4">
        {!isRecording ? (
          <Button
            onClick={startVoiceApplication}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <Mic className="w-4 h-4" />
            Start Voice Application
          </Button>
        ) : (
          <Button
            onClick={stopVoiceApplication}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Stop Recording
          </Button>
        )}
      </div>

      {isProcessing && (
        <div className="text-center text-sm text-muted-foreground animate-pulse">
          Processing your application...
        </div>
      )}

      {generatedCV && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Generated CV</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const blob = new Blob([generatedCV], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'generated-cv.txt';
                a.click();
              }}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Download CV
            </Button>
          </div>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-60">
            {generatedCV}
          </pre>
        </div>
      )}
    </Card>
  );
}
