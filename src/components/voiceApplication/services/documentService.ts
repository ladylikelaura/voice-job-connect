
import { ProcessedCV } from '../types';

/**
 * Generates a Word document from a ProcessedCV object
 * @param cv The processed CV data
 * @returns A Blob containing the Word document
 */
export const generateWordDocument = (cv: ProcessedCV): Blob => {
  // This is a mock implementation that would normally generate a .docx file
  console.log('Generating Word document with CV data:', cv);
  
  // Create a mock text representation of the document
  const docText = `
    ${cv.personalInfo.name}
    ${cv.personalInfo.email} | ${cv.personalInfo.phone}
    ${cv.personalInfo.location || ''}
    
    Professional Summary:
    ${cv.professionalSummary}
    
    Skills:
    ${cv.skills.join(', ')}
    
    Experience:
    ${cv.experience.map(exp => `${exp.role} at ${exp.company} (${exp.duration})`).join('\n')}
    
    Education:
    ${cv.education.map(edu => `${edu.degree} from ${edu.institution} (${edu.year})`).join('\n')}
  `;
  
  // Create a text blob (in a real implementation, this would be a .docx file)
  return new Blob([docText], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
};

/**
 * Generates a PDF document from a ProcessedCV object
 * @param cv The processed CV data
 * @returns A Blob containing the PDF document
 */
export const generatePdfDocument = (cv: ProcessedCV): Blob => {
  // This is a mock implementation that would normally generate a PDF file
  console.log('Generating PDF document with CV data:', cv);
  
  // Create a mock text representation of the document
  const docText = `
    ${cv.personalInfo.name}
    ${cv.personalInfo.email} | ${cv.personalInfo.phone}
    ${cv.personalInfo.location || ''}
    
    Professional Summary:
    ${cv.professionalSummary}
    
    Skills:
    ${cv.skills.join(', ')}
    
    Experience:
    ${cv.experience.map(exp => `${exp.role} at ${exp.company} (${exp.duration})`).join('\n')}
    
    Education:
    ${cv.education.map(edu => `${edu.degree} from ${edu.institution} (${edu.year})`).join('\n')}
  `;
  
  // Create a text blob (in a real implementation, this would be a PDF file)
  return new Blob([docText], { type: 'application/pdf' });
};
