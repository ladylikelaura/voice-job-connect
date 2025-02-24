
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const toggleVoiceOver = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (!isVoiceEnabled) {
      readWelcomeMessage();
    }
  };

  const readWelcomeMessage = async () => {
    const welcomeText = "Welcome to the Job Recruiting App! Learn about our job search process where we make job opportunities accessible for everyone.";
    
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: welcomeText }
      });

      if (error) throw error;

      if (data.audio) {
        if (audioElement) {
          audioElement.pause();
        }

        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        setAudioElement(audio);
        
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          setIsPlaying(false);
          toast.error("Error playing audio");
        };

        await audio.play();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to convert text to speech");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center animate-fade-in">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        {/* Hero Image */}
        <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden">
          <img
            src="/lovable-uploads/eeee9084-c901-4153-8a14-21c2a8bdc094.png"
            alt="Welcome illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Welcome Text */}
        <div className="text-center space-y-4 px-4">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome to the Job Recruiting App!
          </h1>
          <p className="text-muted-foreground">
            Learn about our job search process where we make job opportunities accessible for everyone.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="w-full space-y-4 px-4">
          <Button 
            className="w-full py-6 text-base"
            onClick={handleGetStarted}
          >
            Get Started
          </Button>
          
          <Button 
            variant="secondary"
            className="w-full py-4 text-base flex flex-col gap-1 items-center"
            onClick={toggleVoiceOver}
            aria-pressed={isVoiceEnabled}
          >
            {isPlaying ? "Playing..." : "Enable VoiceOver"}
            <span className="text-sm text-muted-foreground">
              Screen reader assistance available
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
