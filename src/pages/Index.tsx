import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  // Check for auth tokens in URL when the page loads
  useEffect(() => {
    const checkForAuthTokens = async () => {
      // If hash includes access_token, we're in an OAuth flow
      if (window.location.hash && window.location.hash.includes('access_token')) {
        try {
          console.log('Found access token in URL hash on Index page, redirecting to /auth for handling');
          // Instead of processing here, redirect to auth page that knows how to handle it
          window.location.href = `${window.location.origin}/auth${window.location.hash}`;
          return;
        } catch (err) {
          console.error('Error handling auth token:', err);
          toast.error('Authentication error. Please try again.');
        }
      }
    };

    checkForAuthTokens();
  }, [navigate]);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const toggleVoiceOver = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (!isVoiceEnabled) {
      readWelcomeMessage();
    } else if (audioElement) {
      // Stop playing if turning off
      audioElement.pause();
      setIsPlaying(false);
      window.speechSynthesis.cancel(); // Cancel any ongoing speech synthesis
    }
  };

  // Use browser's built-in speech synthesis as fallback
  const useBrowserSpeechSynthesis = (text: string) => {
    // Check if browser supports speech synthesis
    if ('speechSynthesis' in window) {
      setIsPlaying(true);
      toast.info("Using browser's built-in voice capabilities");
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        setIsPlaying(false);
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        toast.error("Browser speech synthesis failed");
      };
      
      // Clear any previous utterances
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      
      return true;
    }
    return false;
  };

  const readWelcomeMessage = async () => {
    const welcomeText = "Welcome to Jobbify! Learn about our job search process where we make job opportunities accessible for everyone.";
    try {
      setIsPlaying(true);
      const {
        data,
        error
      } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: welcomeText
        }
      });
      
      if (error) {
        console.error('Supabase TTS Error:', error);
        throw error;
      }
      
      if (data && data.audio) {
        if (audioElement) {
          audioElement.pause();
        }
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        setAudioElement(audio);
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          console.error('Audio playback error');
          setIsPlaying(false);
          // Try browser fallback if audio playback fails
          if (!useBrowserSpeechSynthesis(welcomeText)) {
            toast.error("Voice playback is not supported in your browser");
          }
        };
        await audio.play();
      } else {
        throw new Error("No audio data received");
      }
    } catch (error) {
      console.error('TTS Error:', error);
      // Try browser fallback if Supabase function fails
      if (!useBrowserSpeechSynthesis(welcomeText)) {
        toast.error("Voice over is not available at the moment");
        setIsPlaying(false);
      }
    }
  };

  return <div className="min-h-screen bg-background p-4 flex flex-col items-center animate-fade-in">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        {/* Hero Image */}
        <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden">
          <img alt="Welcome illustration" src="/lovable-uploads/c20f19b1-7cd3-4216-ba84-2a41ca306628.png" className="w-full h-full object-scale-down" />
        </div>

        {/* Welcome Text */}
        <div className="text-center space-y-4 px-4">
          <h1 className="text-2xl font-semibold text-foreground">Welcome to Jobbify!</h1>
          <p className="text-muted-foreground">Learn about our job search process where we make job opportunities accessible for everyone.</p>
        </div>

        {/* CTA Buttons */}
        <div className="w-full space-y-4 px-4">
          <Button onClick={handleGetStarted} className="w-full text-base text-zinc-50 bg-gray-900 hover:bg-gray-800 py-[32px]">
            Get Started
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={toggleVoiceOver} 
            aria-pressed={isVoiceEnabled}
            className={`w-full text-base flex flex-col gap-1 items-center py-[32px] ${isVoiceEnabled ? 'bg-blue-100' : ''}`}
          >
            {isPlaying ? "Playing..." : isVoiceEnabled ? "Disable VoiceOver" : "Enable VoiceOver"}
            <span className="text-sm text-muted-foreground">
              Screen reader assistance available
            </span>
          </Button>
        </div>
      </div>
    </div>;
};

export default Index;
