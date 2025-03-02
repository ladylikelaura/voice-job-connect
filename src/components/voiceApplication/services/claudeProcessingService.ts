
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ProcessedCV } from '../types';

/**
 * Process transcript with Claude API to get structured CV data
 */
export const processWithClaude = async (agentSummary: string, fullTranscript: string[]): Promise<ProcessedCV | null> => {
  try {
    console.log('Processing transcript with Claude API');
    
    // Extract key messages for optimal context
    const userMessages = fullTranscript
      .filter(line => !line.startsWith('Agent:'))
      .slice(-10); // Last 10 user messages
    
    const agentMessages = fullTranscript
      .filter(line => line.startsWith('Agent:'))
      .slice(-5); // Last 5 agent messages
    
    const combinedContext = [
      ...agentMessages,
      ...userMessages
    ].join('\n');
    
    // Create an optimized prompt with context and instructions
    const enhancedPrompt = `
You are a professional CV writer with expertise in extracting career information from conversations. 
Create a detailed, professional CV structure based on the following interview transcript.

Even if details are sparse, make intelligent inferences and create a polished, complete CV with:

TRANSCRIPT SUMMARY: ${agentSummary}

FULL CONTEXT: ${combinedContext}

Guidelines:
1. If specifics are missing, infer appropriate details based on context clues and industry standards
2. Structure the CV with all standard sections (Personal Info, Professional Summary, Skills, Experience, Education, Certifications)
3. Create a cohesive narrative that highlights strengths
4. Ensure all details are consistent and professional
5. For any missing dates or durations, use plausible estimates
6. For sparse skills, add relevant complementary skills based on the job role mentioned
7. If education details are minimal, complete with logical assumptions

Return ONLY a JSON object with the following structure (no explanation or preamble):
{
  "personalInfo": {
    "name": "...",
    "email": "...",
    "phone": "...",
    "location": "..."
  },
  "professionalSummary": "...",
  "jobTitle": "...",
  "skills": ["...", "...", "..."],
  "experience": [
    {
      "role": "...",
      "company": "...",
      "duration": "...",
      "responsibilities": ["...", "...", "..."]
    }
  ],
  "education": [
    {
      "degree": "...",
      "institution": "...",
      "year": "..."
    }
  ],
  "certifications": ["...", "...", "..."],
  "languages": ["...", "..."]
}`;

    const { data, error } = await supabase.functions.invoke('process-cv-with-claude', {
      body: { 
        transcriptSummary: agentSummary,
        enhancedPrompt: enhancedPrompt,
        fullContext: combinedContext
      }
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
