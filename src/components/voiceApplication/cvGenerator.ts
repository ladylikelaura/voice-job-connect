
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
  const { name, email, phone, location } = extractPersonalInfo(agentText, fullTranscript);
  
  // Extract professional information
  const { jobTitle, yearsOfExperience, company, responsibilities } = extractProfessionalInfo(agentText, fullTranscript);
  
  // Extract skills
  const skills = extractSkills(agentText);
  
  // Extract education
  const education = extractEducation(agentText);
  
  // Format name as header
  const nameHeader = name ? `# ${name}` : '# Professional CV';
  
  // Format contact information
  const contactInfo = `Phone No: ${phone || '[Your Phone Number]'} | Email: ${email || '[Your Email]'}`;
  const locationInfo = location ? `${location}` : '[Your Location]';
  
  // Generate profile summary
  let profileSummary = `## PROFILE SUMMARY\n`;
  profileSummary += `Experienced ${jobTitle || 'professional'} ${yearsOfExperience ? `with ${yearsOfExperience} years of expertise` : 'with professional experience'} in delivering outstanding results. `;
  profileSummary += `Dedicated and detail-oriented, committed to providing excellent service. `;
  profileSummary += `Proficient in utilizing relevant tools and technologies to achieve optimal outcomes. `;
  profileSummary += `Seeking opportunities to apply skills and expertise in a challenging position within an innovative organization.`;
  
  // Generate skills section
  let skillsSection = `## SKILLS HIGHLIGHT\n`;
  if (skills.length > 0) {
    // Split skills into two columns
    const halfLength = Math.ceil(skills.length / 2);
    const firstColumn = skills.slice(0, halfLength);
    const secondColumn = skills.slice(halfLength);
    
    // First column
    firstColumn.forEach(skill => {
      skillsSection += `- ${skill}\n`;
    });
    
    // Add separator for markdown
    skillsSection += '\n';
    
    // Second column
    secondColumn.forEach(skill => {
      skillsSection += `- ${skill}\n`;
    });
  } else {
    skillsSection += `- Proficient in relevant industry tools and software\n`;
    skillsSection += `- Excellent communication and interpersonal skills\n`;
    skillsSection += `- Problem-solving and analytical thinking\n`;
    skillsSection += `- Time management and organizational abilities\n`;
  }
  
  // Generate work experience section
  let experienceSection = `## WORK EXPERIENCE\n`;
  if (company) {
    const duration = `Jan ${new Date().getFullYear() - (yearsOfExperience || 1)} - Present`;
    experienceSection += `${jobTitle || 'Professional'} - ${company} | ${duration}\n\n`;
    experienceSection += `Effectively managed responsibilities and delivered excellent results in a professional environment.\n\n`;
    
    if (responsibilities && responsibilities.length > 0) {
      responsibilities.forEach(duty => {
        experienceSection += `- ${duty}\n`;
      });
    } else {
      experienceSection += `- Managed key projects and initiatives with attention to detail and timeliness\n`;
      experienceSection += `- Collaborated with team members to achieve organizational objectives\n`;
      experienceSection += `- Maintained high standards of quality and professionalism in all tasks\n`;
      experienceSection += `- Contributed to process improvements and efficiency enhancements\n`;
    }
  } else {
    experienceSection += `[Position Title] - [Company Name] | [Start Date] - [End Date]\n\n`;
    experienceSection += `- Responsibility or achievement description with measurable results\n`;
    experienceSection += `- Another key responsibility or notable accomplishment\n`;
    experienceSection += `- Additional detail about your contributions or skills demonstrated\n`;
  }
  
  // Generate education section
  let educationSection = `## EDUCATION\n`;
  if (education.length > 0) {
    education.forEach((edu, index) => {
      const yearRange = `[${2010 + index * 4}] - [${2014 + index * 4}]`;
      educationSection += `- ${edu}\n`;
      educationSection += `  [University/Institution Name] | ${yearRange}\n\n`;
    });
  } else {
    educationSection += `- [Degree Name] in [Field of Study]\n`;
    educationSection += `  [University/Institution Name] | [Start Year] - [End Year]\n`;
  }
  
  // Generate certifications section
  const certificationsSection = `## CERTIFICATIONS & TRAINING\n` +
    `- [Certification Name] from [Issuing Organization]\n` +
    `- [Training Program] - [Institution/Provider]\n`;
  
  // Construct the CV with improved spacing and formatting
  const cv = `${nameHeader}

${contactInfo}
${locationInfo}

${profileSummary}

${skillsSection}

${experienceSection}

${educationSection}

${certificationsSection}

*This CV was automatically generated from your interview. You can download it in various formats for further customization.*`;

  console.log('CV generation completed successfully');
  return cv;
};
