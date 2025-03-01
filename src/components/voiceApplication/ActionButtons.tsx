
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Volume2, VolumeX, RefreshCw } from 'lucide-react';

interface ActionButtonsProps {
  /**
   * Indicates whether a call is currently active
   */
  isCallActive: boolean;
  /**
   * Indicates whether the application is in a processing state
   */
  isProcessing: boolean;
  /**
   * Indicates whether the microphone is muted
   */
  isMuted: boolean;
  /**
   * The generated CV content, or null if not generated yet
   */
  generatedCV: string | null;
  /**
   * Handler for starting a new conversation
   */
  onStartConversation: () => void;
  /**
   * Handler for ending the current conversation
   */
  onEndConversation: () => void;
  /**
   * Handler for toggling microphone mute state
   */
  onToggleMute: () => void;
  /**
   * Handler for resetting the application to its initial state
   */
  onResetApplication: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isCallActive,
  isProcessing,
  isMuted,
  generatedCV,
  onStartConversation,
  onEndConversation,
  onToggleMute,
  onResetApplication
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {!isCallActive ? (
        <Button 
          onClick={onStartConversation}
          disabled={isProcessing}
          className="flex items-center gap-2 py-6 px-8 text-base"
          size="lg"
        >
          <Mic className="w-5 h-5" />
          Start Interview
        </Button>
      ) : (
        <Button
          onClick={onEndConversation}
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
          onClick={onToggleMute}
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
          onClick={onResetApplication}
          variant="outline"
          className="flex items-center gap-2 py-6 px-8 text-base"
          size="lg"
        >
          <RefreshCw className="w-5 h-5" />
          Start Over
        </Button>
      )}
    </div>
  );
};
