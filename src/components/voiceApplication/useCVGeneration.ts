
import { useState } from 'react';
import { toast } from 'sonner';
import { generateCVFromTranscript } from './cvGenerator';

/**
 * Hook for handling CV generation functionality
 */
export const useCVGeneration = () => {
  const [generatedCV, setGeneratedCV] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  /**
   * Generate a CV based on the conversation transcript
   */
  const generateCV = (
    interviewTranscript: string[], 
    cvGenerationAttemptedRef: React.MutableRefObject<boolean>
  ): void => {
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
    console.log('Generating CV based on transcript with', interviewTranscript.length, 'lines');
    setIsProcessing(true);
    
    try {
      // Add a small delay to ensure all transcript data is processed
      setTimeout(() => {
        try {
          console.log('Transcript data for CV generation:', interviewTranscript);
          const sampleCV = generateCVFromTranscript(interviewTranscript);
          console.log('CV generated successfully, setting state');
          setGeneratedCV(sampleCV);
          toast.success("CV generated based on your responses!");
        } catch (error) {
          console.error('Error in CV generation timeout callback:', error);
          toast.error("Error generating CV. Please try again.");
          // Reset the flag to allow another attempt
          cvGenerationAttemptedRef.current = false;
        } finally {
          setIsProcessing(false);
        }
      }, 500);
    } catch (error) {
      console.error('Error setting up CV generation:', error);
      toast.error("Error generating CV. Please try again.");
      // Reset the flag to allow another attempt
      cvGenerationAttemptedRef.current = false;
      setIsProcessing(false);
    }
  };

  return {
    generatedCV,
    setGeneratedCV,
    isProcessing,
    setIsProcessing,
    generateCV
  };
};
