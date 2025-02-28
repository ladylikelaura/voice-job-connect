import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Square, FileText, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Conversation } from '@11labs/client';

// Replace with your actual agent ID
const ELEVENLABS_AGENT_ID = '6djrCK5KXmMSzayY3uwc';

export function VoiceApplicationUI() {
  // State management
  const [isCallActive, setIsCallActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedCV, setGeneratedCV] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  // Refs
  const conversationRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (conversationRef.current) {
        conversationRef.current.endSession();
      }
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isCallActive]);

  // Format duration as mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle mute
  const toggleMute = () => {
    if (conversationRef.current) {
      if (isMuted) {
        // When unmuting, we set volume back to 1
        conversationRef.current.setVolume({ volume: 1 });
        toast.info("Microphone unmuted");
      } else {
        // When muting, we set volume to 0
        conversationRef.current.setVolume({ volume: 0 });
        toast.info("Microphone muted");
      }
      setIsMuted(!isMuted);
    }
  };

  // Start conversation with ElevenLabs
  const startConversation = async () => {
    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setIsCallActive(true);
      setIsProcessing(true);
      toast.info("Connecting to the interview agent...");
      
      // Initialize ElevenLabs conversation
      conversationRef.current = await Conversation.startSession({
        agentId: ELEVENLABS_AGENT_ID,
        onConnect: () => {
          console.log('Connected to ElevenLabs');
          setIsProcessing(false);
          toast.success("Connected to the interview agent. The agent will now ask you questions about your experience.");
        },
        onDisconnect: () => {
          console.log('Disconnected from ElevenLabs');
          setIsCallActive(false);
          setIsProcessing(false);
        },
        onError: (error) => {
          console.error('Error:', error);
          setIsProcessing(false);
          toast.error(`Error: ${error}`);
        },
        onMessage: (message) => {
          console.log('Message:', message);
          
          // If the agent mentions generating a CV, we'll create one
          if (
            message.source === 'ai' && 
            (message.message.toLowerCase().includes('generate your cv') ||
            message.message.toLowerCase().includes('create your resume') ||
            message.message.toLowerCase().includes('prepare your cv'))
          ) {
            generateCV();
          }
        },
        onModeChange: ({ mode }) => {
          console.log('Mode changed:', mode);
        },
        onStatusChange: ({ status }) => {
          console.log('Status changed:', status);
        }
      });
      
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setIsCallActive(false);
      setIsProcessing(false);
      toast.error("Failed to access microphone. Please ensure microphone permissions are granted.");
    }
  };

  // Generate a sample CV based on the conversation
  const generateCV = () => {
    setIsProcessing(true);
    
    // This is a mock CV generation - in a real app, this would be based on the conversation
    setTimeout(() => {
      const sampleCV = `# Professional CV

## Personal Information
- Name: John Doe
- Email: john.doe@example.com
- Phone: (123) 456-7890

## Professional Summary
Experienced software engineer with 5+ years of experience in web development.

## Skills
- JavaScript, TypeScript, React
- Node.js, Express
- SQL, MongoDB
- AWS, Docker

## Experience
### Senior Software Engineer - Tech Company
*January 2020 - Present*
- Led development of customer-facing web applications
- Implemented CI/CD pipelines reducing deployment time by 40%

### Software Engineer - Startup Inc.
*June 2017 - December 2019*
- Developed RESTful APIs for mobile applications
- Collaborated with cross-functional teams to deliver features

## Education
### Bachelor of Science in Computer Science
*University of Technology, 2017*
`;
      
      setGeneratedCV(sampleCV);
      setIsProcessing(false);
      toast.success("CV generated based on your responses!");
    }, 2000);
  };

  // End the conversation
  const endConversation = async () => {
    setIsProcessing(true);
    toast.info("Ending the interview...");
    
    if (conversationRef.current) {
      await conversationRef.current.endSession();
      conversationRef.current = null;
    }
    
    setIsCallActive(false);
    setIsProcessing(false);
    toast.success("Interview completed. Your CV has been generated.");
    
    // Generate CV after conversation ends
    generateCV();
  };

  // Reset the application
  const resetApplication = () => {
    setGeneratedCV(null);
    setCallDuration(0);
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
            className="flex items-center gap-2 py-6 px-8 text-base"
            size="lg"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-5 h-5" />
                Unmute
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" />
                Mute
              </>
            )}
          </Button>
        )}

        {generatedCV && (
          <Button
            onClick={resetApplication}
            variant="outline"
            className="flex items-center gap-2 py-6 px-8 text-base"
            size="lg"
          >
            <RefreshCw className="w-5 h-5" />
            Start Over
          </Button>
        )}
      </div>

      {generatedCV && (
        <div className="mt-6 p-4 bg-muted rounded-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Generated CV
            </h4>
          </div>
          <pre className="whitespace-pre-wrap text-sm">{generatedCV}</pre>
        </div>
      )}

      {isProcessing && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-sm font-medium">Processing...</p>
          </div>
        </div>
      )}
    </Card>
  );
}
