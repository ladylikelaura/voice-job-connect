
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ActionButtons } from './voiceApplication/ActionButtons';
import { CallStatus } from './voiceApplication/CallStatus';
import { TranscriptDisplay } from './voiceApplication/TranscriptDisplay';
import { CVDisplay } from './voiceApplication/CVDisplay';
import { LoadingOverlay } from './voiceApplication/LoadingOverlay';
import { useVoiceConversation } from './voiceApplication/useVoiceConversation';
import { AccessibilityControls } from './voiceApplication/AccessibilityControls';
import { SkillsAssessment } from './voiceApplication/SkillsAssessment';
import { Info } from 'lucide-react';
import { useAccessibilitySettings } from './voiceApplication/useAccessibilitySettings';

export function VoiceApplicationUI() {
  const [showSkillsAssessment, setShowSkillsAssessment] = useState(false);
  
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
    resetApplication,
    downloadWordDocument,
    downloadPdfDocument
  } = useVoiceConversation();

  const { 
    isScreenReaderMode,
    highContrast,
    toggleScreenReaderMode,
    toggleHighContrast,
    keyboardShortcuts,
    lastAnnouncement
  } = useAccessibilitySettings();

  return (
    <Card className={`p-6 space-y-6 max-w-3xl mx-auto shadow-lg relative ${highContrast ? 'bg-black text-white border-yellow-400 border-2' : ''}`} 
          aria-live="polite"
          role="region"
          aria-label="AI Voice CV Generator application">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold" id="app-title">AI Voice CV Generator</h3>
        <p className="text-sm text-muted-foreground">
          Have a conversation with our AI agent who will ask you questions and generate a professional CV based on your responses
        </p>
        <button 
          onClick={() => setShowSkillsAssessment(!showSkillsAssessment)}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary"
          aria-expanded={showSkillsAssessment}
          aria-controls="skills-assessment-section"
        >
          <Info size={16} />
          {showSkillsAssessment ? 'Hide Skills Assessment' : 'Show Skills Assessment Tool'}
        </button>
      </div>
      
      <AccessibilityControls 
        isScreenReaderMode={isScreenReaderMode}
        highContrast={highContrast}
        toggleScreenReaderMode={toggleScreenReaderMode}
        toggleHighContrast={toggleHighContrast}
        keyboardShortcuts={keyboardShortcuts}
        lastAnnouncement={lastAnnouncement}
      />

      {showSkillsAssessment && (
        <SkillsAssessment 
          isActive={isCallActive} 
          isScreenReaderMode={isScreenReaderMode}
          transcript={interviewTranscript}
        />
      )}
      
      <CallStatus 
        isCallActive={isCallActive} 
        callDuration={callDuration} 
        isScreenReaderMode={isScreenReaderMode}
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
        isScreenReaderMode={isScreenReaderMode}
      />

      <TranscriptDisplay 
        interviewTranscript={interviewTranscript} 
        isVisible={isCallActive} 
        isScreenReaderMode={isScreenReaderMode}
      />

      <CVDisplay 
        generatedCV={generatedCV} 
        downloadWordDocument={downloadWordDocument}
        downloadPdfDocument={downloadPdfDocument}
        isScreenReaderMode={isScreenReaderMode}
      />

      <LoadingOverlay isProcessing={isProcessing} isScreenReaderMode={isScreenReaderMode} />
    </Card>
  );
}
