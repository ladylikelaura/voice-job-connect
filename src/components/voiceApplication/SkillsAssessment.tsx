
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { extractSkills } from './extractors/skillsExtractor';
import { ArrowRight, CheckCircle2, Lightbulb, Mic } from 'lucide-react';

interface SkillsAssessmentProps {
  isActive: boolean;
  isScreenReaderMode: boolean;
  transcript: string[];
}

export const SkillsAssessment: React.FC<SkillsAssessmentProps> = ({
  isActive,
  isScreenReaderMode,
  transcript
}) => {
  const [step, setStep] = useState(0);
  const [currentSkill, setCurrentSkill] = useState('');
  const [detectedSkills, setDetectedSkills] = useState<string[]>([]);
  const [suggestedResponses, setSuggestedResponses] = useState<string[]>([]);
  const [assessmentProgress, setAssessmentProgress] = useState(0);
  
  // Extract skills from transcript when it changes
  useEffect(() => {
    if (transcript.length > 0) {
      const agentText = transcript.filter(line => line.startsWith('Agent:')).join(' ');
      const skills = extractSkills(agentText);
      setDetectedSkills(skills);
    }
  }, [transcript]);
  
  // Update progress based on detected skills
  useEffect(() => {
    if (detectedSkills.length > 0) {
      const progress = Math.min(100, (detectedSkills.length / 5) * 100);
      setAssessmentProgress(progress);
    }
  }, [detectedSkills]);
  
  const accessibilitySkills = [
    'Screen Reader Navigation',
    'Voice Control Software',
    'Assistive Technologies',
    'Accessible Content Creation',
    'WCAG Guidelines Knowledge',
    'Cognitive Accessibility',
    'Braille Literacy',
    'Audio Description',
    'Color Contrast Testing',
    'Keyboard-Only Navigation'
  ];
  
  const getSuggestionsForSkill = (skill: string): string[] => {
    switch(skill) {
      case 'Screen Reader Navigation':
        return [
          "I'm proficient with JAWS, NVDA, and VoiceOver screen readers.",
          "I can navigate complex web applications using screen readers efficiently."
        ];
      case 'Voice Control Software':
        return [
          "I use Dragon NaturallySpeaking for daily computer tasks.",
          "I've developed voice command systems for specialized software."
        ];
      case 'Assistive Technologies':
        return [
          "I'm familiar with a wide range of assistive devices including alternative keyboards and switch devices.",
          "I've trained others on using assistive technology in workplace environments."
        ];
      default:
        return [
          `I have experience with ${skill} through professional projects.`,
          `I've developed expertise in ${skill} through specialized training.`
        ];
    }
  };
  
  const handleSelectSkill = (skill: string) => {
    setCurrentSkill(skill);
    setSuggestedResponses(getSuggestionsForSkill(skill));
    setStep(1);
  };
  
  const resetAssessment = () => {
    setStep(0);
    setCurrentSkill('');
    setSuggestedResponses([]);
  };
  
  return (
    <Card className="p-4 border-primary/30" id="skills-assessment-section" aria-label="Skills Assessment Tool">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-semibold flex items-center gap-2">
          <Lightbulb size={18} className="text-primary" />
          Accessibility Skills Showcase
        </h3>
        <Progress value={assessmentProgress} className="w-24" aria-label={`Skills assessment progress: ${Math.round(assessmentProgress)}%`} />
      </div>
      
      {step === 0 && (
        <div>
          <p className={`text-sm mb-3 ${isScreenReaderMode ? 'text-lg font-medium' : ''}`}>
            Select a skill you'd like to highlight during your interview:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {accessibilitySkills.slice(0, 6).map((skill, index) => (
              <Button 
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSelectSkill(skill)}
                className={`justify-start text-left ${detectedSkills.includes(skill) ? 'border-green-500' : ''}`}
                aria-label={detectedSkills.includes(skill) ? `${skill} (already mentioned)` : skill}
              >
                {detectedSkills.includes(skill) && <CheckCircle2 size={14} className="mr-2 text-green-500" />}
                {skill}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {step === 1 && (
        <div className="space-y-4">
          <p className={`text-sm ${isScreenReaderMode ? 'text-lg font-medium' : ''}`}>
            <strong>Skill:</strong> {currentSkill}
          </p>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Suggested responses:</p>
            {suggestedResponses.map((response, index) => (
              <div 
                key={index} 
                className="p-2 bg-muted/30 rounded-md text-sm"
                role="button"
                tabIndex={0}
                aria-label={`Suggested response: ${response}`}
                onClick={() => navigator.clipboard.writeText(response)}
                onKeyDown={(e) => e.key === 'Enter' && navigator.clipboard.writeText(response)}
              >
                {response}
                <p className="text-xs text-muted-foreground mt-1">(Click to copy)</p>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetAssessment}
              aria-label="Go back to skill selection"
            >
              Back
            </Button>
            {!isActive && (
              <Button 
                size="sm" 
                className="flex items-center gap-1"
                aria-label="Start interview with this skill focus"
              >
                <Mic size={14} />
                Focus on this skill
                <ArrowRight size={14} />
              </Button>
            )}
          </div>
        </div>
      )}
      
      {isScreenReaderMode && (
        <div className="mt-4 p-2 bg-primary/5 rounded-md">
          <p className="text-sm font-medium">Screen Reader Tips:</p>
          <ul className="text-sm list-disc pl-5 space-y-1">
            <li>Use Tab to navigate between interactive elements</li>
            <li>Press Space or Enter to activate buttons</li>
            <li>Use Alt+1 for quick access to start interview</li>
            <li>Current focus will be announced automatically</li>
          </ul>
        </div>
      )}
    </Card>
  );
};
