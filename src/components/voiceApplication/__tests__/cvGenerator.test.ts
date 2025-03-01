
import { generateCVFromTranscript } from '../cvGenerator';

describe('cvGenerator', () => {
  it('generates basic CV with default values', () => {
    const transcript = ['Agent: Tell me about yourself', 'You: I am a developer'];
    const result = generateCVFromTranscript(transcript);
    
    expect(result).toContain('Professional CV');
    expect(result).toContain('Developer');
  });

  it('extracts job title from agent summary', () => {
    const transcript = [
      'Agent: Based on our conversation, you are a UI/UX Designer for tech companies', 
      'You: Yes, that is correct'
    ];
    const result = generateCVFromTranscript(transcript);
    
    expect(result).toContain('UI/UX Designer');
  });

  it('extracts years of experience from agent summary', () => {
    const transcript = [
      'Agent: You mentioned having 8 years of experience in the field', 
      'You: Yes, I do'
    ];
    const result = generateCVFromTranscript(transcript);
    
    expect(result).toContain('8+');
  });
  
  it('extracts name and contact information from agent summary', () => {
    const transcript = [
      'Agent: So your name is Jane Smith and your contact information includes jane.smith@example.com and phone (555) 123-4567', 
      'You: That is correct'
    ];
    const result = generateCVFromTranscript(transcript);
    
    expect(result).toContain('Jane Smith');
    expect(result).toContain('jane.smith@example.com');
    expect(result).toContain('(555) 123-4567');
  });
  
  it('extracts education information from agent summary', () => {
    const transcript = [
      'Agent: You graduated from Stanford University in 2019 with a Master of Science in Artificial Intelligence.', 
      'You: Yes, that is accurate'
    ];
    const result = generateCVFromTranscript(transcript);
    
    expect(result).toContain('Master of Science in Artificial Intelligence');
    expect(result).toContain('Stanford University');
  });
  
  it('extracts company information from agent summary', () => {
    const transcript = [
      'Agent: You currently work at Google as a Software Engineer.', 
      'You: That is right'
    ];
    const result = generateCVFromTranscript(transcript);
    
    expect(result).toContain('Google');
  });
  
  it('extracts multiple skills from agent summary', () => {
    const transcript = [
      'Agent: Your skills include React, TypeScript, and Node.js. You also have experience with AWS, Docker, and GraphQL.', 
      'You: Yes, that is a good summary of my technical skills'
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
