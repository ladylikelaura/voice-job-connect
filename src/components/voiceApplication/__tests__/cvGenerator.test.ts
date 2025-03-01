
import { generateCVFromTranscript } from '../cvGenerator';

describe('cvGenerator', () => {
  it('generates basic CV with default values', () => {
    const transcript = ['Agent: Tell me about yourself', 'You: I am a developer'];
    const result = generateCVFromTranscript(transcript);
    
    expect(result).toContain('Professional CV');
    expect(result).toContain('Developer');
  });

  it('extracts job title from transcript', () => {
    const transcript = [
      'Agent: What is your role?', 
      'You: I work as a UI/UX Designer for tech companies'
    ];
    const result = generateCVFromTranscript(transcript);
    
    expect(result).toContain('UI/UX Designer');
  });

  it('extracts years of experience from transcript', () => {
    const transcript = [
      'Agent: How much experience do you have?', 
      'You: I have 8 years of experience in the field'
    ];
    const result = generateCVFromTranscript(transcript);
    
    expect(result).toContain('8+');
  });
  
  it('extracts name and contact information correctly', () => {
    const transcript = [
      'Agent: Can you introduce yourself?', 
      'You: My name is Jane Smith and my email is jane.smith@example.com. You can reach me at (555) 123-4567.'
    ];
    const result = generateCVFromTranscript(transcript);
    
    expect(result).toContain('Jane Smith');
    expect(result).toContain('jane.smith@example.com');
    expect(result).toContain('(555) 123-4567');
  });
  
  it('extracts education information correctly', () => {
    const transcript = [
      'Agent: Tell me about your education.', 
      'You: I graduated from Stanford University in 2019 with a Master of Science in Artificial Intelligence.'
    ];
    const result = generateCVFromTranscript(transcript);
    
    expect(result).toContain('Master of Science in Artificial Intelligence');
    expect(result).toContain('Stanford University');
    expect(result).toContain('2019');
  });
  
  it('extracts company information correctly', () => {
    const transcript = [
      'Agent: Where do you work?', 
      'You: I currently work at Google as a Software Engineer.'
    ];
    const result = generateCVFromTranscript(transcript);
    
    expect(result).toContain('Google');
  });
  
  it('extracts multiple skills from detailed conversation', () => {
    const transcript = [
      'Agent: What technologies are you familiar with?', 
      'You: I\'m proficient in React, TypeScript, and Node.js. I also have experience with AWS, Docker, and GraphQL.'
    ];
    const result = generateCVFromTranscript(transcript);
    
    expect(result).toContain('React');
    expect(result).toContain('TypeScript');
    expect(result).toContain('Node.js');
    expect(result).toContain('AWS');
    expect(result).toContain('Docker');
    expect(result).toContain('GraphQL');
  });
});
