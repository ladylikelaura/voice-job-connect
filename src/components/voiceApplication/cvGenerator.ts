
/**
 * CV generator that extracts personal information from interview transcripts
 * and creates a professional CV based on the extracted information.
 */

import { extractPersonalInfo } from './extractors/personalInfoExtractor';
import { extractProfessionalInfo } from './extractors/professionalInfoExtractor';
import { extractSkills } from './extractors/skillsExtractor';
import { extractEducation } from './extractors/educationExtractor';

/**
 * Generate a CV from interview transcript
 * @param transcript Array of transcript lines
 * @returns Formatted CV as a markdown string
 */
export const generateCVFromTranscript = (transcript: string[]): string => {
  // Join all transcript lines for easier processing
  const fullTranscript = transcript.join('\n');
  console.log('Starting CV generation from transcript with', transcript.length, 'lines');
  
  // Filter to only get agent messages that contain summarized information
  const agentLines = transcript.filter(line => line.startsWith('Agent:'));
  const agentText = agentLines.join('\n');
  console.log('Found', agentLines.length, 'agent messages for CV generation');

  // Extract personal information
  const { name, email, phone } = extractPersonalInfo(agentText, fullTranscript);
  
  // Extract professional information
  const { jobTitle, yearsOfExperience, company } = extractProfessionalInfo(agentText, fullTranscript);
  
  // Extract skills
  const skills = extractSkills(agentText);
  
  // Extract education
  const education = extractEducation(agentText);
  
  // Generate skills section string
  let formattedSkillsSection = '';
  if (skills.length > 0) {
    formattedSkillsSection = '## Skills\n';
    formattedSkillsSection += skills.map(skill => `- ${skill}`).join('\n');
  } else {
    formattedSkillsSection = '## Skills\n- Professional skills to be added';
  }
  
  // Generate education section
  let educationSection = '';
  if (education.length > 0) {
    educationSection = '\n\n## Education\n';
    educationSection += education.map(edu => `- ${edu}`).join('\n');
  } else {
    educationSection = '\n\n## Education\n- Education details to be added';
  }
  
  // Generate experience label
  const experienceLabel = yearsOfExperience 
    ? `${yearsOfExperience}+ years of experience` 
    : 'Professional experience';
  
  // Generate company section
  const companySection = company 
    ? `\n\n## Experience\n- ${jobTitle} at ${company}\n  *${experienceLabel}*`
    : `\n\n## Experience\n- ${jobTitle}\n  *${experienceLabel}*`;
  
  // Construct the CV
  const cv = `# Professional CV: ${name}

## Contact Information
- Email: ${email}
- Phone: ${phone}

## Summary
${jobTitle} with ${experienceLabel ? experienceLabel : 'professional experience'}.

${formattedSkillsSection}${companySection}${educationSection}

*This CV was automatically generated from your interview with the AI agent.*`;

  console.log('CV generation completed successfully');
  return cv;
};
