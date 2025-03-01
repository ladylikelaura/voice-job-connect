
import { useState } from 'react';
import { toast } from 'sonner';
import { generateCVFromTranscript } from './cvGenerator';
import { generateWordDocument, generatePdfDocument } from './services/documentService';
import { supabase } from '@/integrations/supabase/client';

interface ProcessedCV {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
  };
  professionalSummary: string;
  jobTitle: string;
  skills: string[];
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    responsibilities: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  certifications: string[];
  languages: string[];
}

/**
 * Hook for handling CV generation functionality
 */
export const useCVGeneration = () => {
  const [generatedCV, setGeneratedCV] = useState<string | null>(null);
  const [processedCVData, setProcessedCVData] = useState<ProcessedCV | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  /**
   * Process transcript with Claude API to get structured CV data
   */
  const processWithClaude = async (agentSummary: string): Promise<ProcessedCV | null> => {
    try {
      console.log('Processing transcript with Claude API');
      
      const { data, error } = await supabase.functions.invoke('process-cv-with-claude', {
        body: { transcriptSummary: agentSummary }
      });
      
      if (error) {
        console.error('Error calling Claude processing function:', error);
        toast.error("Error enhancing CV with AI. Using basic format instead.");
        return null;
      }
      
      console.log('Received processed CV data from Claude:', data);
      return data.data as ProcessedCV;
    } catch (error) {
      console.error('Error in Claude processing:', error);
      toast.error("Error processing CV with AI. Using basic format instead.");
      return null;
    }
  };
  
  /**
   * Generate a CV based on the conversation transcript
   */
  const generateCV = async (
    interviewTranscript: string[], 
    cvGenerationAttemptedRef: React.MutableRefObject<boolean>
  ): Promise<void> => {
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
      setTimeout(async () => {
        try {
          console.log('Transcript data for CV generation:', interviewTranscript);
          
          // Extract the agent's summary (last few messages from agent)
          const agentMessages = interviewTranscript
            .filter(line => line.startsWith('Agent:'))
            .slice(-5)  // Get the last 5 agent messages which likely contain the summary
            .join('\n');
          
          // First generate basic CV to have something ready quickly
          const basicCV = generateCVFromTranscript(interviewTranscript);
          console.log('Basic CV generated successfully, setting state');
          setGeneratedCV(basicCV);
          
          // Process with Claude for enhanced CV in parallel
          const enhancedCVData = await processWithClaude(agentMessages);
          
          if (enhancedCVData) {
            setProcessedCVData(enhancedCVData);
            console.log('Enhanced CV data set:', enhancedCVData);
            
            // Create an updated markdown version with the enhanced data
            const enhancedMarkdown = generateEnhancedMarkdown(enhancedCVData);
            setGeneratedCV(enhancedMarkdown);
            
            toast.success("Enhanced CV generated successfully!");
          } else {
            toast.success("Basic CV generated based on your responses!");
          }
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
  
  /**
   * Generate enhanced markdown from structured CV data
   */
  const generateEnhancedMarkdown = (cvData: ProcessedCV): string => {
    const { personalInfo, professionalSummary, jobTitle, skills, experience, education, certifications, languages } = cvData;
    
    let markdown = `# Professional CV: ${personalInfo?.name || 'Candidate'}\n\n`;
    
    // Contact Information
    markdown += `## Contact Information\n`;
    if (personalInfo?.email) markdown += `- Email: ${personalInfo.email}\n`;
    if (personalInfo?.phone) markdown += `- Phone: ${personalInfo.phone}\n`;
    
    // Summary
    markdown += `\n## Professional Summary\n${professionalSummary || `${jobTitle} with professional experience.`}\n`;
    
    // Skills
    if (skills && skills.length > 0) {
      markdown += `\n## Skills\n`;
      skills.forEach(skill => {
        markdown += `- ${skill}\n`;
      });
    }
    
    // Experience
    if (experience && experience.length > 0) {
      markdown += `\n## Experience\n`;
      experience.forEach(exp => {
        markdown += `- ${exp.role} at ${exp.company}\n`;
        if (exp.duration) markdown += `  *${exp.duration}*\n`;
        if (exp.responsibilities && exp.responsibilities.length > 0) {
          exp.responsibilities.forEach(resp => {
            markdown += `  - ${resp}\n`;
          });
        }
        markdown += '\n';
      });
    }
    
    // Education
    if (education && education.length > 0) {
      markdown += `\n## Education\n`;
      education.forEach(edu => {
        markdown += `- ${edu.degree} from ${edu.institution}`;
        if (edu.year) markdown += ` (${edu.year})`;
        markdown += '\n';
      });
    }
    
    // Certifications
    if (certifications && certifications.length > 0) {
      markdown += `\n## Certifications\n`;
      certifications.forEach(cert => {
        markdown += `- ${cert}\n`;
      });
    }
    
    // Languages
    if (languages && languages.length > 0) {
      markdown += `\n## Languages\n`;
      markdown += `- ${languages.join(', ')}\n`;
    }
    
    markdown += `\n*This CV was automatically generated and enhanced with AI based on your interview.*`;
    
    return markdown;
  };
  
  /**
   * Generate Word document from CV data
   */
  const downloadWordDocument = () => {
    if (!processedCVData && !generatedCV) {
      toast.error("No CV data available to download");
      return;
    }
    
    try {
      // Use enhanced data if available, otherwise use basic parsed data
      const blob = generateWordDocument(processedCVData || parseBasicCV(generatedCV!));
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'professional_cv.doc';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Word document downloaded successfully");
    } catch (error) {
      console.error('Error generating Word document:', error);
      toast.error("Error generating Word document");
    }
  };
  
  /**
   * Generate PDF document from CV data
   */
  const downloadPdfDocument = () => {
    if (!processedCVData && !generatedCV) {
      toast.error("No CV data available to download");
      return;
    }
    
    try {
      // Use enhanced data if available, otherwise use basic parsed data
      const blob = generatePdfDocument(processedCVData || parseBasicCV(generatedCV!));
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'professional_cv.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("PDF document downloaded successfully");
    } catch (error) {
      console.error('Error generating PDF document:', error);
      toast.error("Error generating PDF document");
    }
  };
  
  /**
   * Parse basic CV markdown to structured format
   */
  const parseBasicCV = (markdown: string): any => {
    // Simple parser for the markdown format
    const name = markdown.match(/# Professional CV: (.*)/)?.[1] || 'Candidate';
    const email = markdown.match(/- Email: (.*)/)?.[1] || '';
    const phone = markdown.match(/- Phone: (.*)/)?.[1] || '';
    
    // Extract skills
    const skillsSection = markdown.match(/## Skills\n([\s\S]*?)(?=\n##|$)/)?.[1] || '';
    const skills = skillsSection
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace('-', '').trim());
    
    // Extract summary
    const summary = markdown.match(/## Summary\n([\s\S]*?)(?=\n##|$)/)?.[1]?.trim() || '';
    
    // Extract experience
    const experienceSection = markdown.match(/## Experience\n([\s\S]*?)(?=\n##|$)/)?.[1] || '';
    const experienceItems = experienceSection
      .split('\n- ')
      .slice(1)
      .map(item => {
        const lines = item.split('\n');
        const firstLine = lines[0] || '';
        const role = firstLine.split(' at ')[0]?.trim() || '';
        const company = firstLine.split(' at ')[1]?.trim() || '';
        const duration = lines[1]?.replace('*', '').replace('*', '').trim() || '';
        
        return { role, company, duration, responsibilities: [] };
      });
    
    // Extract education
    const educationSection = markdown.match(/## Education\n([\s\S]*?)(?=\n##|$)/)?.[1] || '';
    const education = educationSection
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => {
        const text = line.replace('-', '').trim();
        return { 
          degree: text.split(' from ')[0]?.trim() || '',
          institution: text.split(' from ')[1]?.split(' (')[0]?.trim() || '',
          year: text.match(/\((\d{4})\)/)?.[1] || ''
        };
      });
    
    return {
      personalInfo: { name, email, phone },
      professionalSummary: summary,
      jobTitle: role || 'Professional',
      skills,
      experience: experienceItems,
      education,
      certifications: [],
      languages: []
    };
  };

  return {
    generatedCV,
    setGeneratedCV,
    processedCVData,
    isProcessing,
    setIsProcessing,
    generateCV,
    downloadWordDocument,
    downloadPdfDocument
  };
};
