
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Conversation } from '@11labs/client';
import { generateCVFromTranscript } from './cvGenerator';

// Replace with your actual agent ID
const ELEVENLABS_AGENT_ID = '6djrCK5KXmMSzayY3uwc';

export const useVoiceConversation = () => {
  // State management
  const [isCallActive, setIsCallActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedCV, setGeneratedCV] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [interviewTranscript, setInterviewTranscript] = useState<string[]>([]);
  
  // Refs
  const conversationRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const cvGenerationAttemptedRef = useRef<boolean>(false);
  const disconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldGenerateCVRef = useRef<boolean>(false);

  // Dispatch custom events for controlling page behavior
  const dispatchVoiceApplicationEvent = (eventName: string) => {
    window.dispatchEvent(new CustomEvent(eventName));
  };

  // Initialize AudioContext
  useEffect(() => {
    // Create AudioContext only when needed and only once
    if (!audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
        console.log('AudioContext initialized successfully');
      } catch (error) {
        console.error('Failed to initialize AudioContext:', error);
        toast.error('Audio system initialization failed. Please try again.');
      }
    }
    
    return () => {
      // Cleanup AudioContext when component unmounts
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(err => console.error('Error closing AudioContext:', err));
        audioContextRef.current = null;
      }
    };
  }, []);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (disconnectTimeoutRef.current) {
        clearTimeout(disconnectTimeoutRef.current);
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

  // Ensure CV generation after conversation ends
  useEffect(() => {
    if (!isCallActive && !generatedCV && interviewTranscript.length > 0 && shouldGenerateCVRef.current) {
      console.log('End of call detected with transcript data - generating CV');
      // Add a slight delay to ensure all transcript data is processed
      const timeoutId = setTimeout(() => {
        generateCV();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isCallActive, generatedCV, interviewTranscript]);

  // Generate a CV based on the conversation
  const generateCV = () => {
    // Prevent duplicate generation
    if (generatedCV || cvGenerationAttemptedRef.current) {
      console.log('CV already generated or attempted, skipping');
      return;
    }
    
    if (interviewTranscript.length === 0) {
      console.log('No transcript data available, cannot generate CV');
      toast.error("No conversation data available to generate CV");
      return;
    }
    
    cvGenerationAttemptedRef.current = true;
    console.log('Generating CV based on transcript');
    setIsProcessing(true);
    
    try {
      console.log('Transcript data for CV generation:', interviewTranscript);
      const sampleCV = generateCVFromTranscript(interviewTranscript);
      setGeneratedCV(sampleCV);
      toast.success("CV generated based on your responses!");
    } catch (error) {
      console.error('Error generating CV:', error);
      toast.error("Error generating CV. Please try again.");
      // Reset the flag to allow another attempt
      cvGenerationAttemptedRef.current = false;
    } finally {
      setIsProcessing(false);
    }
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
      // Reset CV generation state
      setGeneratedCV(null);
      cvGenerationAttemptedRef.current = false;
      shouldGenerateCVRef.current = false;
      
      // Resume AudioContext if it was suspended (required by browsers)
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        console.log('AudioContext resumed successfully');
      }
      
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setIsCallActive(true);
      setIsProcessing(true);
      setInterviewTranscript([]);
      
      // Dispatch event to notify that voice application has started
      dispatchVoiceApplicationEvent('voiceApplicationStart');
      
      toast.info("Connecting to the interview agent...");
      
      console.log('Starting conversation with agent ID:', ELEVENLABS_AGENT_ID);
      
      // Initialize ElevenLabs conversation
      conversationRef.current = await Conversation.startSession({
        agentId: ELEVENLABS_AGENT_ID, // Make sure this is your actual agent ID
        onConnect: () => {
          console.log('Connected to ElevenLabs');
          setIsProcessing(false);
          toast.success("Connected to the interview agent. The agent will now ask you questions about your experience.");
        },
        onDisconnect: () => {
          console.log('Disconnected from ElevenLabs');
          setIsCallActive(false);
          setIsProcessing(false);
          
          // Dispatch event to notify that voice application has ended
          dispatchVoiceApplicationEvent('voiceApplicationEnd');
          
          // Set flag to generate CV after disconnect
          if (interviewTranscript.length > 0) {
            console.log('Setting flag to generate CV after disconnect');
            shouldGenerateCVRef.current = true;
          }
        },
        onError: (error) => {
          console.error('Error:', error);
          setIsProcessing(false);
          toast.error(`Error: ${error}`);
          
          // Dispatch event to notify that voice application has ended (on error)
          dispatchVoiceApplicationEvent('voiceApplicationEnd');
          
          // Set flag to generate CV even on error if we have transcript data
          if (interviewTranscript.length > 0) {
            console.log('Setting flag to generate CV despite error');
            shouldGenerateCVRef.current = true;
          }
        },
        onMessage: (message) => {
          console.log('Message received:', message);
          
          // Save message to transcript
          if ((message.source === 'ai' || message.source === 'user') && message.message) {
            setInterviewTranscript(prev => [
              ...prev, 
              `${message.source === 'ai' ? 'Agent' : 'You'}: ${message.message}`
            ]);
          }
          
          // If the agent mentions generating a CV, we'll create one
          if (
            message.source === 'ai' && 
            message.message && (
              message.message.toLowerCase().includes('generate your cv') ||
              message.message.toLowerCase().includes('create your resume') ||
              message.message.toLowerCase().includes('prepare your cv') ||
              message.message.toLowerCase().includes('thank you for your time') ||
              message.message.toLowerCase().includes('ended') ||
              message.message.toLowerCase().includes('conclude')
            )
          ) {
            console.log('Agent mentioned CV generation or session conclusion - flagging for generation');
            shouldGenerateCVRef.current = true;
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
      
      // Dispatch event to notify that voice application has ended (on error)
      dispatchVoiceApplicationEvent('voiceApplicationEnd');
      
      toast.error("Failed to access microphone. Please ensure microphone permissions are granted.");
    }
  };

  // End the conversation
  const endConversation = async () => {
    setIsProcessing(true);
    toast.info("Ending the interview...");
    
    if (conversationRef.current) {
      try {
        await conversationRef.current.endSession();
      } catch (error) {
        console.error('Error ending conversation:', error);
      }
      conversationRef.current = null;
    }
    
    setIsCallActive(false);
    setIsProcessing(false);
    
    // Dispatch event to notify that voice application has ended
    dispatchVoiceApplicationEvent('voiceApplicationEnd');
    
    // Flag CV generation after ending conversation
    if (interviewTranscript.length > 0) {
      console.log('Flagging CV generation after endConversation');
      shouldGenerateCVRef.current = true;
      
      // Set a timeout to ensure CV generation happens 
      disconnectTimeoutRef.current = setTimeout(() => {
        if (!generatedCV && !cvGenerationAttemptedRef.current) {
          console.log('Forcing CV generation after timeout');
          generateCV();
        }
      }, 1500);
    } else {
      toast.success("Interview completed.");
    }
  };

  // Reset the application
  const resetApplication = () => {
    if (disconnectTimeoutRef.current) {
      clearTimeout(disconnectTimeoutRef.current);
    }
    setGeneratedCV(null);
    setCallDuration(0);
    setInterviewTranscript([]);
    cvGenerationAttemptedRef.current = false;
    shouldGenerateCVRef.current = false;
    toast.info("Application reset. Ready to start again.");
  };

  return {
    isCallActive,
    isProcessing,
    generatedCV,
    callDuration,
    isMuted,
    interviewTranscript,
    startConversation,
    endConversation,
    toggleMute,
    resetApplication
  };
};
