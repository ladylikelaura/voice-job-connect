
import React from 'react';

interface TranscriptDisplayProps {
  /**
   * Array of transcript lines from the interview
   */
  interviewTranscript: string[];
  /**
   * Whether the transcript should be visible
   */
  isVisible: boolean;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ 
  interviewTranscript, 
  isVisible 
}) => {
  if (!isVisible || interviewTranscript.length === 0) return null;
  
  return (
    <div className="mt-4 p-4 bg-muted/50 rounded-md max-h-60 overflow-y-auto">
      <h4 className="text-sm font-medium mb-2">Interview Progress:</h4>
      <div className="space-y-2">
        {interviewTranscript.map((line, index) => (
          <p key={index} className="text-xs">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};
