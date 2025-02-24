
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const toggleVoiceOver = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    // Here you would typically integrate with the device's accessibility services
    console.log("VoiceOver/TalkBack toggled");
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
          >
            Enable VoiceOver/TalkBack
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
