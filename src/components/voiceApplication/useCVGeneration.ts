
import { useState } from 'react';
import { toast } from 'sonner';
import { ProcessedCV } from './types';
import { useCV } from '@/contexts/CVContext';

/**
 * Hook for handling CV generation functionality
 */
export const useCVGeneration = () => {
  const [generatedCVMarkdown, setGeneratedCVMarkdown] = useState<string | null>(null);
  const { generatedCV: processedCVData, setGeneratedCV: setProcessedCVData } = useCV();
  const [isProcessing, setIsProcessing] = useState(false);
  
  /**
   * Generate a CV based on the conversation transcript
   */
  const generateCV = async (
    interviewTranscript: string[], 
    cvGenerationAttemptedRef: React.MutableRefObject<boolean>
  ): Promise<void> => {
    if (generatedCVMarkdown || cvGenerationAttemptedRef.current) {
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
      setTimeout(() => {
        try {
          // Simulate CV generation with basic template
          const basicCV = "# Generated CV\n\nBased on your conversation, we've prepared this CV.";
          setGeneratedCVMarkdown(basicCV);
          
          // Create a simplified CV structure
          const mockCV: ProcessedCV = {
            personalInfo: {
              name: "John Doe",
              email: "john.doe@example.com",
              phone: "123-456-7890"
            },
            professionalSummary: "Experienced professional with skills in...",
            jobTitle: "Software Developer",
            skills: ["JavaScript", "React", "TypeScript"],
            experience: [{
              company: "Tech Company",
              role: "Developer",
              duration: "2020-Present",
              responsibilities: ["Developed web applications"]
            }],
            education: [{
              degree: "Computer Science",
              institution: "University",
              year: "2019"
            }],
            certifications: [],
            languages: ["English"]
          };
          
          setProcessedCVData(mockCV);
          toast.success("CV generated successfully!");
        } catch (error) {
          console.error('Error in CV generation:', error);
          toast.error("Error generating CV. Please try again.");
          cvGenerationAttemptedRef.current = false;
        } finally {
          setIsProcessing(false);
        }
      }, 1000);
    } catch (error) {
      console.error('Error setting up CV generation:', error);
      toast.error("Error generating CV. Please try again.");
      cvGenerationAttemptedRef.current = false;
      setIsProcessing(false);
    }
  };

  /**
   * Generate Word document from CV data
   */
  const downloadWordDocument = () => {
    if (!processedCVData) {
      toast.error("No CV data available to download");
      return;
    }
    
    try {
      toast.success("Word document would be downloaded here (mock implementation)");
    } catch (error) {
      console.error('Error generating Word document:', error);
      toast.error("Error generating Word document");
    }
  };
  
  /**
   * Generate PDF document from CV data
   */
  const downloadPdfDocument = () => {
    if (!processedCVData) {
      toast.error("No CV data available to download");
      return;
    }
    
    try {
      toast.success("PDF document would be downloaded here (mock implementation)");
    } catch (error) {
      console.error('Error generating PDF document:', error);
      toast.error("Error generating PDF document");
    }
  };

  return {
    generatedCV: generatedCVMarkdown,
    setGeneratedCV: setGeneratedCVMarkdown,
    processedCVData,
    isProcessing,
    setIsProcessing,
    generateCV,
    downloadWordDocument,
    downloadPdfDocument
  };
};
