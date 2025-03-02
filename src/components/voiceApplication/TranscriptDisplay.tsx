
import React, { useRef, useEffect } from 'react';
import { MessageCircleMore } from 'lucide-react';

interface TranscriptDisplayProps {
  interviewTranscript: string[];
  isVisible: boolean;
  isScreenReaderMode?: boolean;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ 
  interviewTranscript, 
  isVisible,
  isScreenReaderMode = false
}) => {
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    if (isVisible && transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [interviewTranscript, isVisible]);
  
  // Announce new messages for screen readers
  useEffect(() => {
    if (isScreenReaderMode && isVisible && interviewTranscript.length > 0) {
      const lastMessage = interviewTranscript[interviewTranscript.length - 1];
      
      // Check if it's a new agent message to announce it
      if (lastMessage && lastMessage.startsWith("Agent:")) {
        const cleanMessage = lastMessage.replace("Agent:", "");
        
        // Create an announcement that will be read by screen readers
        const srAnnouncement = document.createElement('div');
        srAnnouncement.setAttribute('aria-live', 'polite');
        srAnnouncement.className = 'sr-only';
        srAnnouncement.textContent = `Agent says: ${cleanMessage}`;
        
        // Add to DOM, then remove after it's been announced
        document.body.appendChild(srAnnouncement);
        setTimeout(() => {
          if (srAnnouncement.parentNode) {
            document.body.removeChild(srAnnouncement);
          }
        }, 5000);
      }
    }
  }, [interviewTranscript, isScreenReaderMode, isVisible]);

  if (!isVisible || interviewTranscript.length === 0) {
    return null;
  }

  const formatMessage = (message: string, index: number) => {
    if (message.startsWith("Agent:")) {
      return (
        <div 
          key={index} 
          className="bg-primary/10 p-3 rounded-lg mb-2"
          role="listitem"
        >
          <span className="font-semibold text-primary">Agent: </span>
          {message.replace("Agent:", "")}
        </div>
      );
    } else if (message.startsWith("You:")) {
      return (
        <div 
          key={index} 
          className="bg-muted/30 p-3 rounded-lg ml-4 mb-2"
          role="listitem"
        >
          <span className="font-semibold">You: </span>
          {message.replace("You:", "")}
        </div>
      );
    }
    return <div key={index}>{message}</div>;
  };

  return (
    <div 
      ref={containerRef}
      className="mt-4 border rounded-lg p-4 max-h-80 overflow-y-auto" 
      role="region"
      aria-label="Interview Transcript"
    >
      <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
        <MessageCircleMore className="w-4 h-4 text-primary" />
        Interview Transcript
      </h4>
      
      <div 
        className="space-y-1"
        role="list"
        aria-live={isScreenReaderMode ? "polite" : "off"}
      >
        {interviewTranscript.map((message, index) => formatMessage(message, index))}
        <div ref={transcriptEndRef} />
      </div>
      
      {isScreenReaderMode && (
        <button 
          className="sr-only"
          aria-label="Jump to latest message"
          onClick={() => transcriptEndRef.current?.scrollIntoView()}
        >
          Jump to latest message
        </button>
      )}
    </div>
  );
};
