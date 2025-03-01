
/**
 * Extractor for professional information (job, experience, company)
 */
import { extractWithPatterns } from '../utils/extractionUtils';

interface ProfessionalInfo {
  jobTitle: string;
  yearsOfExperience: string;
  company: string;
}

/**
 * Extract professional information from transcript text
 */
export const extractProfessionalInfo = (
  agentText: string,
  fullTranscript: string
): ProfessionalInfo => {
  // Default values
  let jobTitle = 'Professional';
  let yearsOfExperience = '';
  let company = '';
  
  // Job Title - prioritize agent's assessment
  const jobPatterns = [
    /(?:works as|profession is|job title is|position is|role is|job is|occupation is|career is|employed as|working as)\s+(?:an?\s+)?([A-Za-z]+(?:\s+[A-Za-z]+){0,4}?(?:Developer|Engineer|Designer|Manager|Analyst|Consultant|Specialist|Director|Architect|Administrator|Coordinator|Executive|Officer|Lead|Head|Chief|Supervisor|Assistant|Technician|Programmer|Researcher))/i,
    /(?:is an?\s+|is currently an?\s+)([A-Za-z]+(?:\s+[A-Za-z]+){0,4}?(?:Developer|Engineer|Designer|Manager|Analyst|Consultant|Specialist|Director|Architect|Administrator|Coordinator|Executive|Officer|Lead|Head|Chief|Supervisor|Assistant|Technician|Programmer|Researcher))/i,
    /([A-Za-z]+(?:\s+[A-Za-z]+){0,4}?(?:Developer|Engineer|Designer|Manager|Analyst|Consultant|Specialist|Director|Architect|Administrator|Coordinator|Executive|Officer|Lead|Head|Chief|Supervisor|Assistant|Technician|Programmer|Researcher))/i
  ];
  
  for (const pattern of jobPatterns) {
    const match = agentText.match(pattern);
    if (match && match[1]) {
      jobTitle = match[1].trim();
      console.log('Extracted job title:', jobTitle);
      break;
    }
  }
  
  // Experience
  const experiencePattern = /\b(\d+)(?:\+|\s+to\s+\d+)?\s+years?(?:\s+of)?\s+(?:experience|work)/i;
  const experienceMatch = agentText.match(experiencePattern) || fullTranscript.match(experiencePattern);
  if (experienceMatch && experienceMatch[1]) {
    yearsOfExperience = experienceMatch[1];
    console.log('Extracted years of experience:', yearsOfExperience);
  }
  
  // Company
  const companyPatterns = [
    /(?:works at|employed at|working at|employed by|working for|company is|organization is|firm is|employer is|works for)\s+([A-Z][A-Za-z0-9\s&]+?(?:Inc|LLC|Ltd|Company|Corp|Corporation|Group|Technologies|Solutions|Systems|International|Associates|Partners|Agency)?)/i,
    /(?:at|with|for)\s+([A-Z][A-Za-z0-9\s&]+?(?:Inc|LLC|Ltd|Company|Corp|Corporation|Group|Technologies|Solutions|Systems|International|Associates|Partners|Agency)?)\b/i
  ];
  
  for (const pattern of companyPatterns) {
    const match = agentText.match(pattern);
    if (match && match[1]) {
      company = match[1].trim();
      console.log('Extracted company:', company);
      break;
    }
  }
  
  return { jobTitle, yearsOfExperience, company };
};
