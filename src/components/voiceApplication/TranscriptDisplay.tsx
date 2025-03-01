
import React, { useRef, useEffect } from 'react';
import { Mic, User, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the bottom of the transcript container instead of the entire page
  useEffect(() => {
    if (transcriptEndRef.current && transcriptContainerRef.current) {
      // Only scroll the container, not the whole page
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [interviewTranscript]);
  
  if (!isVisible || interviewTranscript.length === 0) return null;
  
  return (
    <div className="mt-4 p-4 bg-gradient-to-br from-muted/60 to-muted/30 backdrop-blur-sm rounded-md max-h-60 overflow-y-auto border border-muted-foreground/10 shadow-inner"
         ref={transcriptContainerRef}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Mic className="h-4 w-4 text-primary" />
          Interview Transcript
        </h4>
        <Badge variant="outline" className="text-xs bg-primary/10">
          {interviewTranscript.length} exchanges
        </Badge>
      </div>
      
      <div className="space-y-3">
        {interviewTranscript.map((line, index) => {
          const isAgent = line.startsWith('Agent:');
          return (
            <div 
              key={index} 
              className={`flex items-start gap-2 p-2 rounded-lg transition-all ${
                isAgent 
                  ? 'bg-primary/5 border-l-2 border-primary' 
                  : 'bg-secondary/5 border-l-2 border-secondary'
              }`}
            >
              {isAgent ? (
                <Bot className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              ) : (
                <User className="h-4 w-4 mt-0.5 text-secondary shrink-0" />
              )}
              <p className="text-xs leading-relaxed">
                <span className={`font-medium ${isAgent ? 'text-primary' : 'text-secondary'}`}>
                  {isAgent ? 'Agent: ' : 'You: '}
                </span>
                {isAgent ? line.substring(6).trim() : line.substring(4).trim()}
              </p>
            </div>
          );
        })}
        <div ref={transcriptEndRef} />
      </div>
    </div>
  );
};
