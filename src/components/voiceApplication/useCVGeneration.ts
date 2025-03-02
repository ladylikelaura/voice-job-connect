
import { useState } from 'react';
import { toast } from 'sonner';
import { generateCVFromTranscript } from './cvGenerator';
import { ProcessedCV } from './types';
import { processWithClaude } from './services/claudeProcessingService';
import { generateEnhancedMarkdown } from './utils/cvFormatUtils';
import { downloadWordDocument, downloadPdfDocument } from './services/downloadService';

/**
 * Hook for handling CV generation functionality
 */
export const useCVGeneration = () => {
  const [generatedCV, setGeneratedCV] = useState<string | null>(null);
  const [processedCVData, setProcessedCVData] = useState<ProcessedCV | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  /**
   * Generate a CV based on the conversation transcript
   */
  const generateCV = async (
    interviewTranscript: string[], 
    cvGenerationAttemptedRef: React.MutableRefObject<boolean>
  ): Promise<void> => {
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
      setTimeout(async () => {
        try {
          console.log('Transcript data for CV generation:', interviewTranscript);
          
          // Extract agent summaries for context
          const agentMessages = interviewTranscript
            .filter(line => line.startsWith('Agent:'))
            .slice(-5)
            .join('\n');
          
          const basicCV = generateCVFromTranscript(interviewTranscript);
          console.log('Basic CV generated successfully, setting state');
          setGeneratedCV(basicCV);
          
          // Pass both agent summary and full transcript for better context
          const enhancedCVData = await processWithClaude(agentMessages, interviewTranscript);
          
          if (enhancedCVData) {
            setProcessedCVData(enhancedCVData);
            console.log('Enhanced CV data set:', enhancedCVData);
            
            const enhancedMarkdown = generateEnhancedMarkdown(enhancedCVData);
            setGeneratedCV(enhancedMarkdown);
            
            toast.success("Enhanced CV generated successfully!");
          } else {
            toast.success("Basic CV generated based on your responses!");
          }
        } catch (error) {
          console.error('Error in CV generation timeout callback:', error);
          toast.error("Error generating CV. Please try again.");
          cvGenerationAttemptedRef.current = false;
        } finally {
          setIsProcessing(false);
        }
      }, 500);
    } catch (error) {
      console.error('Error setting up CV generation:', error);
      toast.error("Error generating CV. Please try again.");
      cvGenerationAttemptedRef.current = false;
      setIsProcessing(false);
    }
  };
  
  /**
   * Wrapper for downloadWordDocument that provides state
   */
  const handleDownloadWordDocument = () => {
    downloadWordDocument(processedCVData, generatedCV);
  };
  
  /**
   * Wrapper for downloadPdfDocument that provides state
   */
  const handleDownloadPdfDocument = () => {
    downloadPdfDocument(processedCVData, generatedCV);
  };

  return {
    generatedCV,
    setGeneratedCV,
    processedCVData,
    isProcessing,
    setIsProcessing,
    generateCV,
    downloadWordDocument: handleDownloadWordDocument,
    downloadPdfDocument: handleDownloadPdfDocument
  };
};
