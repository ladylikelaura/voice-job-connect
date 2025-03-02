import { useState } from 'react';
import { toast } from 'sonner';
import { generateCVFromTranscript } from './cvGenerator';
import { generateWordDocument, generatePdfDocument } from './services/documentService';
import { supabase } from '@/integrations/supabase/client';
import { ProcessedCV } from './types';

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
          
          const agentMessages = interviewTranscript
            .filter(line => line.startsWith('Agent:'))
            .slice(-5)
            .join('\n');
          
          const basicCV = generateCVFromTranscript(interviewTranscript);
          console.log('Basic CV generated successfully, setting state');
          setGeneratedCV(basicCV);
          
          const enhancedCVData = await processWithClaude(agentMessages);
          
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
   * Generate enhanced markdown from structured CV data
   */
  const generateEnhancedMarkdown = (cvData: ProcessedCV): string => {
    const { personalInfo, professionalSummary, jobTitle, skills, experience, education, certifications, languages } = cvData;
    
    let markdown = `# ${personalInfo?.name || 'Professional CV'}\n\n`;
    
    let contactInfo = '';
    if (personalInfo?.phone) contactInfo += `Phone No: ${personalInfo.phone}`;
    if (personalInfo?.email) {
      if (contactInfo) contactInfo += ' | ';
      contactInfo += `Email: ${personalInfo.email}`;
    }
    markdown += `${contactInfo}\n`;
    
    if (personalInfo?.location) {
      markdown += `${personalInfo.location}\n`;
    }
    
    markdown += `\n## PROFILE SUMMARY\n`;
    markdown += professionalSummary || 
      `Experienced ${jobTitle || 'professional'} with a strong track record of delivering high-quality results. ` +
      `Dedicated, detail-oriented, and committed to excellence. Proficient in utilizing relevant tools and ` +
      `technologies to achieve optimal outcomes. Seeking opportunities to apply expertise in a challenging position.`;
    
    markdown += `\n\n## SKILLS HIGHLIGHT\n`;
    if (skills && skills.length > 0) {
      const halfLength = Math.ceil(skills.length / 2);
      for (let i = 0; i < halfLength; i++) {
        markdown += `- ${skills[i]}\n`;
      }
      
      markdown += '\n';
      
      for (let i = halfLength; i < skills.length; i++) {
        markdown += `- ${skills[i]}\n`;
      }
    } else {
      markdown += `- Professional skills to be added\n`;
    }
    
    markdown += `\n## WORK EXPERIENCE\n`;
    if (experience && experience.length > 0) {
      experience.forEach(exp => {
        markdown += `${exp.role} - ${exp.company} | ${exp.duration}\n\n`;
        if (exp.responsibilities && exp.responsibilities.length > 0) {
          exp.responsibilities.forEach(resp => {
            markdown += `- ${resp}\n`;
          });
        }
        markdown += '\n';
      });
    } else {
      markdown += `[Position Title] - [Company Name] | [Duration]\n\n`;
      markdown += `- Key responsibility or achievement\n`;
      markdown += `- Another significant responsibility\n\n`;
    }
    
    markdown += `## EDUCATION\n`;
    if (education && education.length > 0) {
      education.forEach(edu => {
        markdown += `- ${edu.degree}\n`;
        markdown += `  ${edu.institution} | [${edu.year || 'Year Range'}]\n\n`;
      });
    } else {
      markdown += `- [Degree] in [Field of Study]\n`;
      markdown += `  [University/Institution Name] | [Year Range]\n\n`;
    }
    
    markdown += `## CERTIFICATIONS & TRAINING\n`;
    if (certifications && certifications.length > 0) {
      certifications.forEach(cert => {
        markdown += `- ${cert}\n`;
      });
    } else {
      markdown += `- [Certification/Training Program Name]\n`;
    }
    
    markdown += `\n\n*This CV was automatically generated and enhanced with AI based on your interview.*`;
    
    return markdown;
  };
  
  /**
   * Parse basic CV markdown to structured format
   */
  const parseBasicCV = (markdown: string): ProcessedCV => {
    const name = markdown.match(/# ([^\n]+)/)?.[1] || 'Candidate';
    
    const email = markdown.match(/Email: ([^\n|\]]+)/i)?.[1] || '';
    const phone = markdown.match(/Phone(?:\sNo)?:?\s([^\n|\]]+)/i)?.[1] || '';
    let location = '';
    
    const lines = markdown.split('\n');
    const contactIndex = lines.findIndex(line => line.includes('Email:') || line.includes('Phone'));
    if (contactIndex >= 0 && contactIndex < lines.length - 1) {
      const nextLine = lines[contactIndex + 1].trim();
      if (nextLine && !nextLine.startsWith('#') && !nextLine.includes(':')) {
        location = nextLine;
      }
    }
    
    const skillsSection = markdown.match(/## SKILLS HIGHLIGHT\n([\s\S]*?)(?=\n##|$)/i)?.[1] || '';
    const skills = skillsSection
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace('-', '').trim());
    
    const summarySection = markdown.match(/## PROFILE SUMMARY\n([\s\S]*?)(?=\n##|$)/i)?.[1]?.trim() || '';
    
    const experienceSection = markdown.match(/## WORK EXPERIENCE\n([\s\S]*?)(?=\n##|$)/i)?.[1] || '';
    const experienceBlocks = experienceSection.split('\n\n').filter(block => block.trim());
    
    const experience = [];
    for (let i = 0; i < experienceBlocks.length; i += 2) {
      if (i + 1 >= experienceBlocks.length) break;
      
      const headerLine = experienceBlocks[i].trim();
      const detailsBlock = experienceBlocks[i + 1];
      
      const headerMatch = headerLine.match(/([^-]+)-([^|]+)\|(.+)/);
      if (headerMatch) {
        const role = headerMatch[1].trim();
        const company = headerMatch[2].trim();
        const duration = headerMatch[3].trim();
        
        const responsibilities = detailsBlock
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.replace('-', '').trim());
        
        experience.push({ role, company, duration, responsibilities });
      }
    }
    
    const educationSection = markdown.match(/## EDUCATION\n([\s\S]*?)(?=\n##|$)/i)?.[1] || '';
    const educationLines = educationSection.split('\n').filter(line => line.trim());
    
    const education = [];
    for (let i = 0; i < educationLines.length; i += 2) {
      if (i + 1 >= educationLines.length) break;
      
      const degreeLine = educationLines[i].trim();
      const detailsLine = educationLines[i + 1].trim();
      
      if (degreeLine.startsWith('-')) {
        const degree = degreeLine.replace('-', '').trim();
        
        const detailsMatch = detailsLine.match(/([^|]+)\|(.+)/);
        if (detailsMatch) {
          const institution = detailsMatch[1].trim();
          const year = detailsMatch[2].trim().replace(/[\[\]]/g, '');
          
          education.push({ degree, institution, year });
        }
      }
    }
    
    const certSection = markdown.match(/## CERTIFICATIONS & TRAINING\n([\s\S]*?)(?=\n##|$)/i)?.[1] || '';
    const certifications = certSection
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace('-', '').trim());
    
    return {
      personalInfo: { name, email, phone, location },
      professionalSummary: summarySection,
      jobTitle: experience[0]?.role || 'Professional',
      skills,
      experience,
      education,
      certifications,
      languages: []
    };
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
      const dataToUse = processedCVData || parseBasicCV(generatedCV!);
      console.log('Generating Word document with data:', dataToUse);
      
      const blob = generateWordDocument(dataToUse);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataToUse.personalInfo.name || 'professional'}_cv.docx`;
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
      const dataToUse = processedCVData || parseBasicCV(generatedCV!);
      console.log('Generating PDF document with data:', dataToUse);
      
      const blob = generatePdfDocument(dataToUse);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataToUse.personalInfo.name || 'professional'}_cv.pdf`;
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
