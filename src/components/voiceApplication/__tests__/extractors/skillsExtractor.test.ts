
import { extractSkills } from '../../extractors/skillsExtractor';

describe('skillsExtractor', () => {
  it('extracts skills from a dedicated skills section', () => {
    const agentText = 'Your skills include JavaScript, React, and Node.js. Now about your education...';
    const skills = extractSkills(agentText);
    expect(skills).toContain('JavaScript');
    expect(skills).toContain('React');
    expect(skills).toContain('Node.js');
  });
  
  it('extracts skills from technology mentions', () => {
    const agentText = 'You have experience with Python programming and have worked with TypeScript.';
    const skills = extractSkills(agentText);
    expect(skills).toContain('Python');
    expect(skills).toContain('TypeScript');
  });
  
  it('handles C++ special characters correctly', () => {
    const agentText = 'You mentioned you have experience with C++ programming.';
    const skills = extractSkills(agentText);
    expect(skills).toContain('C++');
  });
  
  it('returns empty array when no skills are found', () => {
    const agentText = 'Thank you for your time today.';
    const skills = extractSkills(agentText);
    expect(skills).toEqual([]);
  });
});
