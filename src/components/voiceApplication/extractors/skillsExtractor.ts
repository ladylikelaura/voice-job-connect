
/**
 * Extractor for skills from interview transcript
 */
import { safeRegExp, stringIncludes } from '../utils/extractionUtils';

/**
 * Extract skills from transcript text
 */
export const extractSkills = (agentText: string): string[] => {
  let skills: string[] = [];
  
  // First try to extract from a dedicated skills section
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
    // Properly escape special characters in technology names for RegExp
    const techKeywords = [
      'React', 'Angular', 'Vue', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Sass', 'LESS',
      'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'ASP.NET', 'Laravel', 'Ruby on Rails',
      'Python', 'Java', 'C#', 'C\\+\\+', 'PHP', 'Go', 'Rust', 'Swift', 'Kotlin',
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
  
  return skills;
};
