
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Volume2, VolumeX, RefreshCw } from 'lucide-react';

interface ActionButtonsProps {
  isCallActive: boolean;
  isProcessing: boolean;
  isMuted: boolean;
  generatedCV: string | null;
  onStartConversation: () => void;
  onEndConversation: () => void;
  onToggleMute: () => void;
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
