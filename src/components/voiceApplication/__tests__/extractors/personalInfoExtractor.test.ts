
import { extractPersonalInfo } from '../../extractors/personalInfoExtractor';

describe('personalInfoExtractor', () => {
  it('extracts name from agent text', () => {
    const agentText = 'The candidate name is John Smith and he has experience in web development.';
    const { name } = extractPersonalInfo(agentText, '');
    expect(name).toBe('John Smith');
  });
  
  it('extracts email from agent text', () => {
    const agentText = 'Your contact email is john.smith@example.com';
    const { email } = extractPersonalInfo(agentText, '');
    expect(email).toBe('john.smith@example.com');
  });
  
  it('extracts phone from agent text', () => {
    const agentText = 'Your phone number is (555) 123-4567';
    const { phone } = extractPersonalInfo(agentText, '');
    expect(phone).toBe('(555) 123-4567');
  });
  
  it('returns default values when no information is found', () => {
    const agentText = 'Thank you for your time today.';
    const { name, email, phone } = extractPersonalInfo(agentText, '');
    expect(name).toBe('Your Name');
    expect(email).toBe('your.email@example.com');
    expect(phone).toBe('(555) 123-4567');
  });
  
  it('extracts information from full transcript if not found in agent text', () => {
    const agentText = 'Thank you for your time today.';
    const fullTranscript = 'Agent: Hello\nYou: My name is Jane Doe and my email is jane.doe@example.com';
    const { name, email } = extractPersonalInfo(agentText, fullTranscript);
    expect(name).toBe('Jane Doe');
    expect(email).toBe('jane.doe@example.com');
  });
});
