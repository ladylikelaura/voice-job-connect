
import React from 'react';
import { Card } from '@/components/ui/card';
import { ActionButtons } from './voiceApplication/ActionButtons';
import { CallStatus } from './voiceApplication/CallStatus';
import { TranscriptDisplay } from './voiceApplication/TranscriptDisplay';
import { CVDisplay } from './voiceApplication/CVDisplay';
import { LoadingOverlay } from './voiceApplication/LoadingOverlay';
import { useVoiceConversation } from './voiceApplication/useVoiceConversation';

export function VoiceApplicationUI() {
  const {
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
  } = useVoiceConversation();

  return (
    <Card className="p-6 space-y-6 max-w-3xl mx-auto shadow-lg relative">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold">AI Voice CV Generator</h3>
        <p className="text-sm text-muted-foreground">
          Have a conversation with our AI agent who will ask you questions and generate a professional CV based on your responses
        </p>
      </div>
      
      <CallStatus 
        isCallActive={isCallActive} 
        callDuration={callDuration} 
      />
      
      <ActionButtons 
        isCallActive={isCallActive}
        isProcessing={isProcessing}
        isMuted={isMuted}
        generatedCV={generatedCV}
        onStartConversation={startConversation}
        onEndConversation={endConversation}
        onToggleMute={toggleMute}
        onResetApplication={resetApplication}
      />

      <TranscriptDisplay 
        interviewTranscript={interviewTranscript} 
        isVisible={isCallActive} 
      />

      <CVDisplay generatedCV={generatedCV} />

      <LoadingOverlay isProcessing={isProcessing} />
    </Card>
  );
}
