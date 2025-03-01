
/**
 * CV generator that extracts personal information from interview transcripts
 * and creates a professional CV based on the extracted information.
 */

// Extract information from agent's processed responses rather than user input
export const generateCVFromTranscript = (transcript: string[]): string => {
  // Join all transcript lines for easier processing
  const fullTranscript = transcript.join('\n');
  
  // Filter to only get agent messages that contain summarized information
  const agentLines = transcript.filter(line => line.startsWith('Agent:'));
  const agentText = agentLines.join('\n');

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
  }
  
  // Email
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = agentText.match(emailPattern) || fullTranscript.match(emailPattern);
  if (emailMatch) {
    email = emailMatch[0];
  }
  
  // Phone
  const phonePattern = /(?:\+\d{1,3}[-.\s]?)?(?:\(\d{1,4}\)|\d{1,4})[-.\s]?\d{1,4}[-.\s]?\d{1,4}(?:[-.\s]?\d{1,9})?/;
  const phoneMatch = agentText.match(phonePattern) || fullTranscript.match(phonePattern);
  if (phoneMatch) {
    phone = phoneMatch[0];
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
      break;
    }
  }
  
  // Experience
  const experiencePattern = /\b(\d+)(?:\+|\s+to\s+\d+)?\s+years?(?:\s+of)?\s+(?:experience|work)/i;
  const experienceMatch = agentText.match(experiencePattern) || fullTranscript.match(experiencePattern);
  if (experienceMatch && experienceMatch[1]) {
    yearsOfExperience = experienceMatch[1];
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
      break;
    }
  }
  
  // Skills - extract from agent's summary of skills
  const skillsSection = agentText.match(/(?:skills include|skills are|skilled in|proficient in|expertise in|experienced with|knowledge of|familiar with|competent in)(.*?)(?:education|experience|background|work history|projects|.\s+[A-Z])/is);
  if (skillsSection && skillsSection[1]) {
    const skillsText = skillsSection[1];
    // Look for comma or 'and' separated skills
    const potentialSkills = skillsText.split(/(?:,|\sand\s|;|\n|\r|\s+\/\s+)/).map(s => s.trim());
    skills = potentialSkills.filter(s => s.length > 0 && s.length < 25);
  }
  
  // If no skills found in a dedicated section, try looking for technology mentions
  if (skills.length === 0) {
    const techKeywords = [
      'React', 'Angular', 'Vue', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Sass', 'LESS',
      'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'ASP.NET', 'Laravel', 'Ruby on Rails',
      'Python', 'Java', 'C#', 'C++', 'PHP', 'Go', 'Rust', 'Swift', 'Kotlin',
      'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Oracle', 'Redis', 'GraphQL', 'REST',
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'CI/CD', 'Jenkins', 'Git',
      'Agile', 'Scrum', 'Kanban', 'UI/UX', 'Photoshop', 'Figma', 'Sketch', 'Adobe XD',
      'ML', 'AI', 'Data Science', 'TensorFlow', 'PyTorch', 'Keras', 'Computer Vision', 'NLP',
      'DevOps', 'SRE', 'Microservices', 'Serverless', 'Test Automation', 'Selenium', 'Cypress'
    ];
    
    for (const tech of techKeywords) {
      const regEx = new RegExp(`\\b${tech}\\b`, 'i');
      if (agentText.match(regEx)) {
        skills.push(tech);
      }
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
  
  // If education still empty, check for degree types
  if (education.length === 0) {
    const degreeTypes = [
      "Bachelor's", "Master's", "PhD", "Doctorate", "BSc", "BA", "BEng", "MSc", "MA", "MEng", "MBA"
    ];
    
    for (const degree of degreeTypes) {
      const regEx = new RegExp(`\\b${degree}\\b`, 'i');
      const match = agentText.match(regEx);
      if (match) {
        const context = agentText.substring(Math.max(0, match.index! - 50), Math.min(agentText.length, match.index! + 50));
        education.push(context.trim());
        break;
      }
    }
  }
  
  // Generate skills section
  let skillsSection = '';
  if (skills.length > 0) {
    skillsSection = '## Skills\n';
    skillsSection += skills.map(skill => `- ${skill}`).join('\n');
  } else {
    skillsSection = '## Skills\n- Professional skills to be added';
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
  return `# Professional CV: ${name}

## Contact Information
- Email: ${email}
- Phone: ${phone}

## Summary
${jobTitle} with ${experienceLabel ? experienceLabel : 'professional experience'}.

${skillsSection}${companySection}${educationSection}

*This CV was automatically generated from your interview with the AI agent.*`;
};
