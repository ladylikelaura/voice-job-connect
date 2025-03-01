
/**
 * Generates a CV based on interview transcript with enhanced information extraction
 */
export const generateCVFromTranscript = (interviewTranscript: string[]): string => {
  // Extract the full transcript for processing
  const fullTranscript = interviewTranscript.join(" ");
  
  // Enhanced regex patterns for personal information extraction
  // Name extraction with multiple formats support
  const namePatterns = [
    /(?:my name is|I am|I'm|call me|known as) ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
    /(?:name[:\s]+)([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
    /(?:^|[\.\?\!]\s+)([A-Z][a-z]+(?: [A-Z][a-z]+){1,2})(?:\s+here)/i,
  ];
  
  let name = "John Doe";
  for (const pattern of namePatterns) {
    const match = fullTranscript.match(pattern);
    if (match && match[1] && match[1].length > 3) {
      name = match[1].trim();
      break;
    }
  }
  
  // Email extraction with validation
  const emailPatterns = [
    /(?:my email is|email[:\s]+|reach me at|contact me at|send email to)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
  ];
  
  let email = "john.doe@example.com";
  for (const pattern of emailPatterns) {
    const match = fullTranscript.match(pattern);
    if (match && match[1] && match[1].includes('@') && match[1].includes('.')) {
      email = match[1].trim();
      break;
    }
  }
  
  // Phone number extraction with multiple formats support
  const phonePatterns = [
    /(?:my phone|phone number|call me at|contact me at|reach me at)[:\s]+(\+?[0-9][ 0-9\-\(\)\.]{8,})/i,
    /(?:phone[:\s]+)(\+?[0-9][ 0-9\-\(\)\.]{8,})/i,
    /\b(\+?[0-9]{1,3}[ -]?[0-9]{3}[ -]?[0-9]{3}[ -]?[0-9]{4})\b/
  ];
  
  let phone = "(123) 456-7890";
  for (const pattern of phonePatterns) {
    const match = fullTranscript.match(pattern);
    if (match && match[1] && match[1].length >= 10) {
      phone = match[1].trim();
      break;
    }
  }
  
  // Enhanced job title extraction with industry context
  const jobTitleKeywords = {
    "developer": ["web", "software", "frontend", "backend", "fullstack", "mobile", "app", "game", "java", "python", "javascript", "react", "angular", "vue", "node"],
    "engineer": ["software", "systems", "data", "machine learning", "cloud", "devops", "security", "network", "qa", "test"],
    "designer": ["ui", "ux", "graphic", "web", "product", "interaction", "visual", "user experience", "user interface"],
    "manager": ["project", "product", "program", "technical", "engineering", "team", "senior", "junior"],
    "analyst": ["business", "data", "financial", "systems", "research", "market"],
    "scientist": ["data", "research", "machine learning", "ai", "computer vision", "nlp"],
    "specialist": ["marketing", "seo", "content", "social media", "digital", "it", "support", "hr"],
    "consultant": ["it", "management", "business", "strategy", "technical"],
    "architect": ["software", "solutions", "systems", "cloud", "data", "enterprise", "technical"],
    "director": ["technical", "art", "creative", "engineering", "product"]
  };
  
  let jobTitle = "Software Engineer";
  
  // Search for job titles in the transcript
  for (const [role, specifiers] of Object.entries(jobTitleKeywords)) {
    if (fullTranscript.toLowerCase().includes(role.toLowerCase())) {
      jobTitle = role.charAt(0).toUpperCase() + role.slice(1);
      
      // Check for specifiers to get more specific job title
      for (const specifier of specifiers) {
        if (fullTranscript.toLowerCase().includes(specifier.toLowerCase() + " " + role.toLowerCase()) ||
            fullTranscript.toLowerCase().includes(role.toLowerCase() + " " + specifier.toLowerCase())) {
          jobTitle = specifier.charAt(0).toUpperCase() + specifier.slice(1) + " " + role.charAt(0).toUpperCase() + role.slice(1);
          break;
        }
      }
      break;
    }
  }
  
  // More specific job title extraction
  const jobMatch = fullTranscript.match(/(?:I am|I'm|work as|position is|role is|job is|title is)(?:\s+an?|\s+the)?\s+([A-Za-z]+(?: [A-Za-z]+){0,3}(?:\s+at|\s+in|\s+for)?)/i);
  if (jobMatch && jobMatch[1] && jobMatch[1].length > 3) {
    jobTitle = jobMatch[1].replace(/\s+at|\s+in|\s+for/i, '').trim();
  }
  
  // Extract years of experience with range support
  const experiencePatterns = [
    /(\d+)(?:\s+to\s+\d+)?\s+(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)/i,
    /experience(?:\s+of)?\s+(\d+)(?:\s+to\s+\d+)?\s+(?:years?|yrs?)/i,
    /worked(?:\s+for)?\s+(\d+)(?:\s+to\s+\d+)?\s+(?:years?|yrs?)/i
  ];
  
  let yearsOfExperience = "5+";
  for (const pattern of experiencePatterns) {
    const match = fullTranscript.match(pattern);
    if (match && match[1]) {
      yearsOfExperience = `${match[1]}+`;
      break;
    }
  }
  
  // Enhanced company information extraction
  const companyPatterns = [
    /(?:work(?:ed|ing) (?:at|for|with)|employed (?:at|by|with)) ([A-Z][a-zA-Z0-9\s\&\-\.]+)(?:,|\.|in|\s+as|\s+where)/i,
    /(?:company|employer|firm|organization)(?:\s+is|\s+was|\s+named)?\s+([A-Z][a-zA-Z0-9\s\&\-\.]+)(?:,|\.|in|\s+where)/i,
    /(?:joined|started at) ([A-Z][a-zA-Z0-9\s\&\-\.]+)(?:,|\.|in|\s+as)/i
  ];
  
  let companyName = "Tech Company";
  for (const pattern of companyPatterns) {
    const match = fullTranscript.match(pattern);
    if (match && match[1] && match[1].length > 2) {
      companyName = match[1].trim();
      if (companyName.endsWith(',') || companyName.endsWith('.')) {
        companyName = companyName.slice(0, -1);
      }
      break;
    }
  }
  
  // Enhanced skills extraction with contextual awareness
  const skillsCategories = {
    "Programming Languages": [
      "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Swift", "Kotlin", 
      "PHP", "Ruby", "Go", "Rust", "Scala", "Perl", "Shell", "SQL", "R", "MATLAB"
    ],
    "Web Technologies": [
      "HTML", "CSS", "SASS", "LESS", "Bootstrap", "Tailwind", "Material UI", "jQuery", 
      "REST", "GraphQL", "SOAP", "WebSockets", "PWA", "Web Components"
    ],
    "Frameworks & Libraries": [
      "React", "Angular", "Vue", "Next.js", "Nuxt", "Svelte", "Express", "Django", 
      "Flask", "Spring", "Laravel", "Symphony", "ASP.NET", "Rails", "Node.js", 
      "TensorFlow", "PyTorch", "Keras", "Pandas", "NumPy", "Redux", "MobX"
    ],
    "Databases": [
      "MongoDB", "MySQL", "PostgreSQL", "SQLite", "Oracle", "SQL Server", "Redis", 
      "Elasticsearch", "Cassandra", "DynamoDB", "Firestore", "Neo4j"
    ],
    "Cloud & DevOps": [
      "AWS", "Azure", "GCP", "Heroku", "Netlify", "Vercel", "Docker", "Kubernetes", 
      "Jenkins", "CircleCI", "GitHub Actions", "Travis CI", "Terraform", "Ansible", 
      "Chef", "Puppet", "CI/CD"
    ],
    "Design & UI/UX": [
      "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator", "InDesign", 
      "Wireframing", "Prototyping", "User Research", "Accessibility", "Information Architecture"
    ],
    "Methodologies & Practices": [
      "Agile", "Scrum", "Kanban", "Waterfall", "TDD", "BDD", "DDD", "Object-Oriented Programming", 
      "Functional Programming", "Microservices", "Serverless", "Monolith"
    ],
    "Tools & Platforms": [
      "Git", "JIRA", "Confluence", "Notion", "Slack", "Trello", "BitBucket", "GitLab", 
      "VS Code", "IntelliJ", "Eclipse", "Postman", "Swagger"
    ]
  };
  
  const skillsMap: {[key: string]: boolean} = {};
  
  // Extract skills from the transcript
  for (const category of Object.values(skillsCategories)) {
    for (const skill of category) {
      // Match the exact skill name or when it's mentioned as part of a skill list
      const skillRegex = new RegExp(`\\b${skill}\\b`, 'i');
      if (skillRegex.test(fullTranscript)) {
        skillsMap[skill] = true;
      }
    }
  }
  
  // Look for mentions of skills in context
  const skillContextPatterns = [
    /(?:I know|I use|familiar with|proficient in|experienced with|skilled in|expertise in|knowledge of)(?:[^.]*?)((?:[A-Za-z]+(?:\s*,\s*|\s+and\s+|\s+|\s*&\s*))+)/gi,
    /(?:my skills include|my abilities include|I'm good at|I excel at)(?:[^.]*?)((?:[A-Za-z]+(?:\s*,\s*|\s+and\s+|\s+|\s*&\s*))+)/gi,
    /(?:technical skills|technologies|tech stack|programming languages)(?:[^.]*?)((?:[A-Za-z]+(?:\s*,\s*|\s+and\s+|\s+|\s*&\s*))+)/gi
  ];
  
  for (const pattern of skillContextPatterns) {
    let match;
    while ((match = pattern.exec(fullTranscript)) !== null) {
      if (match[1]) {
        const potentialSkills = match[1].split(/\s*,\s*|\s+and\s+|\s*&\s*|\s+/);
        for (const potentialSkill of potentialSkills) {
          const trimmedSkill = potentialSkill.trim().replace(/^and\s+/, '');
          if (trimmedSkill.length > 2) {
            // Check if this potential skill matches any in our categories
            for (const category of Object.values(skillsCategories)) {
              for (const skill of category) {
                if (skill.toLowerCase() === trimmedSkill.toLowerCase() || 
                    skill.toLowerCase().includes(trimmedSkill.toLowerCase()) || 
                    trimmedSkill.toLowerCase().includes(skill.toLowerCase())) {
                  skillsMap[skill] = true;
                }
              }
            }
          }
        }
      }
    }
  }
  
  // Convert skills map to array and sort by categories for better presentation
  const skills: string[] = Object.keys(skillsMap);
  
  // Provide default skills only if very few were detected
  const defaultSkills = skills.length < 3 ? ["JavaScript", "React", "Node.js"] : [];
  const finalSkills = [...skills, ...defaultSkills.filter(s => !skillsMap[s])];
  
  // Enhanced education extraction
  const degreePatterns = [
    /(?:I have|earned|received|completed|obtained|hold|got)(?:\s+a|\s+an|\s+my)?\s+([A-Za-z\s]+(?:degree|diploma|certification|bachelor'?s|master'?s|doctorate|phd|mba))(?:\s+in|\s+from|\s+at)?/i,
    /(?:degree|education)(?:\s+is|\s+in)?\s+([A-Za-z\s]+(?:bachelor'?s|master'?s|doctorate|phd|mba))(?:\s+in|\s+from)?/i,
    /(?:studied|majored in)(?:\s+for|\s+completed)?\s+([A-Za-z\s]+(?:degree|diploma|certification|bachelor'?s|master'?s|doctorate|phd|mba))/i
  ];
  
  let education = "Bachelor of Science in Computer Science";
  for (const pattern of degreePatterns) {
    const match = fullTranscript.match(pattern);
    if (match && match[1] && match[1].length > 3) {
      education = match[1].trim();
      
      // Check for field of study
      const fieldMatch = fullTranscript.match(/(?:in|specialized in|focused on|with focus on)\s+([A-Za-z][A-Za-z\s]+?)(?:,|\.|from|at|and)/i);
      if (fieldMatch && fieldMatch[1] && fieldMatch[1].length > 2 && !education.toLowerCase().includes(fieldMatch[1].toLowerCase())) {
        education += " in " + fieldMatch[1].trim();
      }
      
      break;
    }
  }
  
  // Enhanced university extraction
  const universityPatterns = [
    /(?:graduated|studied|attended|went to|from|at)(?:\s+the)?\s+([A-Za-z\s]+(?:University|College|Institute|School))(?:,|\.|in|where)?/i,
    /(?:university|college|institute|school)(?:\s+of|\s+at)?\s+([A-Za-z\s]+)(?:,|\.|in|where)?/i,
    /([A-Za-z\s]+(?:University|College|Institute|School))(?:,|\.|in|where)?/i
  ];
  
  let university = "University of Technology";
  for (const pattern of universityPatterns) {
    const match = fullTranscript.match(pattern);
    if (match && match[1] && match[1].length > 3) {
      university = match[1].trim();
      if (university.endsWith(',') || university.endsWith('.')) {
        university = university.slice(0, -1);
      }
      break;
    }
  }
  
  // Enhanced graduation year extraction
  const yearPatterns = [
    /graduated(?:\s+in|\s+on)?\s+(\d{4})/i,
    /(?:in|during|class of|batch of)\s+(\d{4})(?:\s+graduate)/i,
    /(?:earned|received|completed|obtained)(?:\s+my|\s+a|\s+an)?\s+degree(?:\s+in|\s+on)?\s+(\d{4})/i,
    /(\d{4})(?:\s+graduate)/i
  ];
  
  let graduationYear = "2017";
  for (const pattern of yearPatterns) {
    const match = fullTranscript.match(pattern);
    if (match && match[1] && /^\d{4}$/.test(match[1])) {
      const year = parseInt(match[1]);
      if (year > 1950 && year <= new Date().getFullYear()) {
        graduationYear = match[1];
        break;
      }
    }
  }
  
  // Extract achievements and projects
  const achievementPatterns = [
    /(?:accomplished|achieved|proud of|highlight|success|award|recognition)\s+([^.]+)/i,
    /(?:project|developed|built|created|designed|implemented)\s+([^.]+)/i,
    /(?:led|managed|coordinated|spearheaded)\s+([^.]+)/i
  ];
  
  const achievements: string[] = [];
  for (const pattern of achievementPatterns) {
    let match;
    while ((match = pattern.exec(fullTranscript)) !== null) {
      if (match[1] && match[1].length > 10 && match[1].length < 150) {
        achievements.push(match[1].trim());
      }
    }
  }
  
  // Select the top 3 most relevant achievements
  const topAchievements = achievements.slice(0, 3);
  
  // Generate CV content with enhanced personalization
  return `# Professional CV

## Personal Information
- Name: ${name}
- Email: ${email}
- Phone: ${phone}

## Professional Summary
Experienced ${jobTitle} with ${yearsOfExperience} years of experience in software development and problem-solving. Passionate about creating efficient and scalable solutions that address real-world challenges.

## Skills
${finalSkills.slice(0, 8).map(skill => `- ${skill}`).join('\n')}

## Experience
### Senior ${jobTitle} - ${companyName}
*January 2020 - Present*
${topAchievements.length > 0 ? topAchievements.map(a => `- ${a}`).join('\n') : `- Led development of customer-facing web applications
- Implemented CI/CD pipelines reducing deployment time by 40%
- Collaborated with cross-functional teams to deliver high-quality products`}

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
