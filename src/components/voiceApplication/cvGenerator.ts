
/**
 * Generates a CV based on interview transcript
 */
export const generateCVFromTranscript = (interviewTranscript: string[]): string => {
  // Extract some basic info from transcript if available
  const fullTranscript = interviewTranscript.join(" ");
  
  // Very simple extraction logic - in a real app, you'd use more sophisticated NLP
  let jobTitle = "Software Engineer";
  if (fullTranscript.toLowerCase().includes("developer")) {
    jobTitle = "Developer";
  } else if (fullTranscript.toLowerCase().includes("designer")) {
    jobTitle = "UI/UX Designer";
  } else if (fullTranscript.toLowerCase().includes("manager")) {
    jobTitle = "Project Manager";
  }
  
  // Extract years of experience
  let yearsOfExperience = "5+";
  const experienceMatch = fullTranscript.match(/(\d+)(?:\s+years?|\s+yrs?)\s+(?:of\s+)?experience/i);
  if (experienceMatch && experienceMatch[1]) {
    yearsOfExperience = `${experienceMatch[1]}+`;
  }
  
  const companyName = "Tech Company";
  
  // Generate CV content
  return `# Professional CV

## Personal Information
- Name: John Doe
- Email: john.doe@example.com
- Phone: (123) 456-7890

## Professional Summary
Experienced ${jobTitle} with ${yearsOfExperience} years of experience in web development.

## Skills
- JavaScript, TypeScript, React
- Node.js, Express
- SQL, MongoDB
- AWS, Docker

## Experience
### Senior ${jobTitle} - ${companyName}
*January 2020 - Present*
- Led development of customer-facing web applications
- Implemented CI/CD pipelines reducing deployment time by 40%

### ${jobTitle} - Startup Inc.
*June 2017 - December 2019*
- Developed RESTful APIs for mobile applications
- Collaborated with cross-functional teams to deliver features

## Education
### Bachelor of Science in Computer Science
*University of Technology, 2017*
`;
};
