
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
});
