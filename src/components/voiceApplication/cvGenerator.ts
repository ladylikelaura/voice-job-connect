
/**
 * CV generator that extracts personal information from interview transcripts
 * and creates a professional CV based on the extracted information.
 */

// Extract information from agent's processed responses rather than user input
export const generateCVFromTranscript = (transcript: string[]): string => {
  // Join all transcript lines for easier processing
  const fullTranscript = transcript.join('\n');
  console.log('Starting CV generation from transcript with', transcript.length, 'lines');
  
  // Filter to only get agent messages that contain summarized information
  const agentLines = transcript.filter(line => line.startsWith('Agent:'));
  const agentText = agentLines.join('\n');
  console.log('Found', agentLines.length, 'agent messages for CV generation');

  // Default values
  let name = 'Your Name';
  let email = 'your.email@example.com';
  let phone = '(555) 123-4567';
  let jobTitle = 'Professional';
  let yearsOfExperience = '';
  let company = '';
  let skills: string[] = [];
  let education: string[] = [];
  
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
  
  // Skills - extract from agent's summary of skills
  const skillsMatches = agentText.match(/(?:skills include|skills are|skilled in|proficient in|expertise in|experienced with|knowledge of|familiar with|competent in)(.*?)(?:education|experience|background|work history|projects|.\s+[A-Z])/is);
  if (skillsMatches && skillsMatches[1]) {
    const skillsText = skillsMatches[1];
    // Look for comma or 'and' separated skills
    const potentialSkills = skillsText.split(/(?:,|\sand\s|;|\n|\r|\s+\/\s+)/).map(s => s.trim());
    skills = potentialSkills.filter(s => s.length > 0 && s.length < 25);
    console.log('Extracted skills:', skills);
  }
  
  // If no skills found in a dedicated section, try looking for technology mentions
  if (skills.length === 0) {
    // FIX: Properly escape special characters in technology names for RegExp
    const techKeywords = [
      'React', 'Angular', 'Vue', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Sass', 'LESS',
      'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'ASP.NET', 'Laravel', 'Ruby on Rails',
      'Python', 'Java', 'C#', 'C\\+\\+', 'PHP', 'Go', 'Rust', 'Swift', 'Kotlin', // Fixed C++ regex
      'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Oracle', 'Redis', 'GraphQL', 'REST',
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'CI/CD', 'Jenkins', 'Git',
      'Agile', 'Scrum', 'Kanban', 'UI/UX', 'Photoshop', 'Figma', 'Sketch', 'Adobe XD',
      'ML', 'AI', 'Data Science', 'TensorFlow', 'PyTorch', 'Keras', 'Computer Vision', 'NLP',
      'DevOps', 'SRE', 'Microservices', 'Serverless', 'Test Automation', 'Selenium', 'Cypress'
    ];
    
    for (const tech of techKeywords) {
      try {
        // Safely create RegExp by escaping any existing special regex characters
        const regExPattern = `\\b${tech}\\b`;
        const regEx = new RegExp(regExPattern, 'i');
        if (agentText.match(regEx)) {
          // For display, use the original tech name without escaping
          const displayTech = tech.replace(/\\/g, '');
          skills.push(displayTech);
        }
      } catch (error) {
        console.error(`Error creating regex for ${tech}:`, error);
        // Still try to detect the technology using simple string includes
        if (agentText.toLowerCase().includes(tech.toLowerCase().replace(/\\/g, ''))) {
          const displayTech = tech.replace(/\\/g, '');
          skills.push(displayTech);
          console.log(`Added ${displayTech} using string includes fallback`);
        }
      }
    }
    
    if (skills.length > 0) {
      console.log('Extracted skills from keywords:', skills);
    }
  }
  
  // Education
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
