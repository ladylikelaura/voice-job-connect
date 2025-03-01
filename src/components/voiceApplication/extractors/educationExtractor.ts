
/**
 * Extractor for education information from interview transcript
 */
import { extractContext, safeRegExp } from '../utils/extractionUtils';

/**
 * Extract education information from transcript text
 */
export const extractEducation = (agentText: string): string[] => {
  let education: string[] = [];
  
  // Education patterns
  const educationPatterns = [
    /(?:graduated from|studied at|degree from|education from|attended|alumni of)\s+([A-Z][A-Za-z\s&]+University|College|Institute|School)/i,
    /([A-Z][A-Za-z\s&]+(?:University|College|Institute|School))/i,
    /(?:earned|received|obtained|completed|holds|has)\s+(?:a|an)\s+([A-Za-z\s]+(?:degree|diploma|certificate))/i,
    /([A-Za-z]+\s+(?:of|in)\s+[A-Za-z\s]+)(?:\s+degree|\s+certificate)?/i
  ];
  
  for (const pattern of educationPatterns) {
    const matches = [...agentText.matchAll(new RegExp(pattern, 'gi'))];
    for (const match of matches) {
      if (match[1] && !education.includes(match[1].trim())) {
        education.push(match[1].trim());
      }
    }
  }
  
  if (education.length > 0) {
    console.log('Extracted education:', education);
  }
  
  // If education still empty, check for degree types
  if (education.length === 0) {
    const degreeTypes = [
      "Bachelor's", "Master's", "PhD", "Doctorate", "BSc", "BA", "BEng", "MSc", "MA", "MEng", "MBA"
    ];
    
    for (const degree of degreeTypes) {
      try {
        const regEx = new RegExp(`\\b${degree}\\b`, 'i');
        const match = agentText.match(regEx);
        if (match && match.index !== undefined) {
          const context = agentText.substring(Math.max(0, match.index - 50), Math.min(agentText.length, match.index + 50));
          education.push(context.trim());
          console.log('Extracted education from context:', context.trim());
          break;
        }
      } catch (error) {
        console.error(`Error creating regex for degree ${degree}:`, error);
      }
    }
  }
  
  return education;
};
