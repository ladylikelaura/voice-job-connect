
/**
 * Extractor for basic personal information from interview transcript
 */
import { extractWithPatterns, safeRegExp } from '../utils/extractionUtils';

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location?: string;
}

/**
 * Extract basic personal information from transcript text
 */
export const extractPersonalInfo = (
  agentText: string,
  fullTranscript: string
): PersonalInfo => {
  // Default values
  let name = 'Your Name';
  let email = 'your.email@example.com';
  let phone = '(555) 123-4567';
  let location = '';
  
  // Look for name patterns in agent messages
  const namePattern = /(?:name is|candidate is|candidate's name is|candidate:|individual is|applicant is|called)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i;
  const nameMatch = agentText.match(namePattern) || fullTranscript.match(namePattern);
  if (nameMatch && nameMatch[1]) {
    name = nameMatch[1].trim();
    console.log('Extracted name:', name);
  }
  
  // Email
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = agentText.match(emailPattern) || fullTranscript.match(emailPattern);
  if (emailMatch) {
    email = emailMatch[0];
    console.log('Extracted email:', email);
  }
  
  // Phone
  const phonePattern = /(?:\+\d{1,3}[-.\s]?)?(?:\(\d{1,4}\)|\d{1,4})[-.\s]?\d{1,4}[-.\s]?\d{1,4}(?:[-.\s]?\d{1,9})?/;
  const phoneMatch = agentText.match(phonePattern) || fullTranscript.match(phonePattern);
  if (phoneMatch) {
    phone = phoneMatch[0];
    console.log('Extracted phone:', phone);
  }
  
  // Location
  const locationPattern = /(?:lives in|located in|based in|resides in|from|location is|address is)\s+([A-Z][a-z]+(?:[\s,]+[A-Z][a-z]+){0,3})/i;
  const locationMatch = agentText.match(locationPattern) || fullTranscript.match(locationPattern);
  if (locationMatch && locationMatch[1]) {
    location = locationMatch[1].trim();
    console.log('Extracted location:', location);
  }
  
  return { name, email, phone, location };
};
