
/**
 * Generates a CV based on interview transcript
 */
export const generateCVFromTranscript = (interviewTranscript: string[]): string => {
  // Extract the full transcript for processing
  const fullTranscript = interviewTranscript.join(" ");
  
  // Extract personal information
  const nameMatch = fullTranscript.match(/(?:my name is|I am|I'm) ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i);
  const name = nameMatch ? nameMatch[1] : "John Doe";
  
  const emailMatch = fullTranscript.match(/(?:my email is|email[:\s]+)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  const email = emailMatch ? emailMatch[1] : "john.doe@example.com";
  
  const phoneMatch = fullTranscript.match(/(?:my phone|phone number|call me at|contact me at)[:\s]+(\+?[0-9][ 0-9\-\(\)\.]{8,})/i);
  const phone = phoneMatch ? phoneMatch[1] : "(123) 456-7890";
  
  // Extract job title information
  let jobTitle = "Software Engineer";
  if (fullTranscript.toLowerCase().includes("developer")) {
    jobTitle = "Developer";
  } else if (fullTranscript.toLowerCase().includes("designer")) {
    jobTitle = "UI/UX Designer";
  } else if (fullTranscript.toLowerCase().includes("manager")) {
    jobTitle = "Project Manager";
  } else if (fullTranscript.toLowerCase().includes("data scientist")) {
    jobTitle = "Data Scientist";
  } else if (fullTranscript.toLowerCase().includes("analyst")) {
    jobTitle = "Business Analyst";
  }
  
  // Extract years of experience
  let yearsOfExperience = "5+";
  const experienceMatch = fullTranscript.match(/(\d+)(?:\s+years?|\s+yrs?)\s+(?:of\s+)?experience/i);
  if (experienceMatch && experienceMatch[1]) {
    yearsOfExperience = `${experienceMatch[1]}+`;
  }
  
  // Extract company information
  let companyName = "Tech Company";
  const companyMatch = fullTranscript.match(/(?:work(?:ed|ing) (?:at|for)|employed (?:at|by)) ([A-Z][a-zA-Z\s]+)(?:,|\.|in)/i);
  if (companyMatch && companyMatch[1]) {
    companyName = companyMatch[1].trim();
  }
  
  // Extract skills
  const skillsMap: {[key: string]: boolean} = {};
  const skillsKeywords = [
    "JavaScript", "TypeScript", "React", "Node.js", "Express", "SQL", "MongoDB", 
    "AWS", "Docker", "Python", "Java", "C#", "Ruby", "PHP", "HTML", "CSS",
    "UI/UX", "Figma", "Adobe", "Photoshop", "Illustrator", "Product Management",
    "Agile", "Scrum", "Kanban", "DevOps", "CI/CD", "Git", "Angular", "Vue", 
    "Next.js", "Redux", "GraphQL", "REST", "API", "Testing", "TDD", "ML", "AI"
  ];
  
  skillsKeywords.forEach(skill => {
    if (fullTranscript.toLowerCase().includes(skill.toLowerCase())) {
      skillsMap[skill] = true;
    }
  });
  
  // Convert skills map to array
  const skills = Object.keys(skillsMap);
  const defaultSkills = skills.length < 3 ? ["JavaScript", "React", "Node.js"] : [];
  const finalSkills = [...skills, ...defaultSkills.filter(s => !skillsMap[s])];
  
  // Extract education
  let education = "Bachelor of Science in Computer Science";
  let university = "University of Technology";
  let graduationYear = "2017";
  
  const degreeMatch = fullTranscript.match(/(?:I have a|earned a|my degree is|I graduated with a) ([A-Za-z\s]+) (?:in|from)/i);
  if (degreeMatch && degreeMatch[1]) {
    education = degreeMatch[1].trim();
  }
  
  const universityMatch = fullTranscript.match(/(?:graduated from|studied at|attend(?:ed)?) ([A-Za-z\s]+)(?:,|\.|in)/i);
  if (universityMatch && universityMatch[1]) {
    university = universityMatch[1].trim();
  }
  
  const yearMatch = fullTranscript.match(/graduated (?:in|on) (\d{4})/i);
  if (yearMatch && yearMatch[1]) {
    graduationYear = yearMatch[1];
  }
  
  // Generate CV content
  return `# Professional CV

## Personal Information
- Name: ${name}
- Email: ${email}
- Phone: ${phone}

## Professional Summary
Experienced ${jobTitle} with ${yearsOfExperience} years of experience in software development and problem-solving.

## Skills
${finalSkills.slice(0, 8).map(skill => `- ${skill}`).join('\n')}

## Experience
### Senior ${jobTitle} - ${companyName}
*January 2020 - Present*
- Led development of customer-facing web applications
- Implemented CI/CD pipelines reducing deployment time by 40%
- Collaborated with cross-functional teams to deliver high-quality products

### ${jobTitle} - Previous Company
*June 2017 - December 2019*
- Developed RESTful APIs for mobile applications
- Collaborated with cross-functional teams to deliver features
- Improved application performance by 35%

## Education
### ${education}
*${university}, ${graduationYear}*
`;
};
