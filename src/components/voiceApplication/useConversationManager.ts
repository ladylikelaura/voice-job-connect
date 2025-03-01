
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Conversation } from '@11labs/client';
import { dispatchVoiceApplicationEvent } from './eventUtils';

// Replace with your actual agent ID
const ELEVENLABS_AGENT_ID = '6djrCK5KXmMSzayY3uwc';

/**
 * Hook for managing conversation with ElevenLabs agent
 */
export const useConversationManager = (
  setIsCallActive: (value: boolean) => void,
  setIsProcessing: (value: boolean) => void,
  setInterviewTranscript: (value: string[] | ((prev: string[]) => string[])) => void,
  shouldGenerateCVRef: React.MutableRefObject<boolean>,
  audioContextRef: React.MutableRefObject<AudioContext | null>
) => {
  const [isMuted, setIsMuted] = useState(false);
  const conversationRef = useRef<any>(null);
  
  // Toggle mute
  const toggleMute = (): void => {
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
  const startConversation = async (): Promise<void> => {
    try {
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
          shouldGenerateCVRef.current = true;
          console.log('Setting CV generation flag to true after disconnect');
        },
        onError: (error) => {
          console.error('Error:', error);
          setIsProcessing(false);
          toast.error(`Error: ${error}`);
          
          // Dispatch event to notify that voice application has ended (on error)
          dispatchVoiceApplicationEvent('voiceApplicationEnd');
          
          // Set flag to generate CV even on error if we have transcript data
          console.log('Setting flag to generate CV despite error');
          shouldGenerateCVRef.current = true;
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
              message.message.toLowerCase().includes('conclude') ||
              message.message.toLowerCase().includes('goodbye') ||
              message.message.toLowerCase().includes('end our conversation')
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
  const endConversation = async (): Promise<void> => {
    setIsProcessing(true);
    toast.info("Ending the interview...");
    
    try {
      // Set the flag to generate CV before ending session
      shouldGenerateCVRef.current = true;
      console.log('Setting CV generation flag to true before ending conversation');
      
      if (conversationRef.current) {
        await conversationRef.current.endSession();
      }
    } catch (error) {
      console.error('Error ending conversation:', error);
    } finally {
      conversationRef.current = null;
      setIsCallActive(false);
      setIsProcessing(false);
      
      // Dispatch event to notify that voice application has ended
      dispatchVoiceApplicationEvent('voiceApplicationEnd');
    }
  };

  return {
    isMuted,
    conversationRef,
    toggleMute,
    startConversation,
    endConversation
  };
};
