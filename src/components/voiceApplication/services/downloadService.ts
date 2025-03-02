
import { toast } from 'sonner';
import { generateWordDocument, generatePdfDocument } from './documentService';
import { ProcessedCV } from '../types';
import { parseBasicCV } from '../utils/cvFormatUtils';

/**
 * Generate Word document from CV data
 */
export const downloadWordDocument = (processedCVData: ProcessedCV | null, generatedCV: string | null): void => {
  if (!processedCVData && !generatedCV) {
    toast.error("No CV data available to download");
    return;
  }
  
  try {
    const dataToUse = processedCVData || parseBasicCV(generatedCV!);
    console.log('Generating Word document with data:', dataToUse);
    
    const blob = generateWordDocument(dataToUse);
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataToUse.personalInfo.name || 'professional'}_cv.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Word document downloaded successfully");
  } catch (error) {
    console.error('Error generating Word document:', error);
    toast.error("Error generating Word document");
  }
};

/**
 * Generate PDF document from CV data
 */
export const downloadPdfDocument = (processedCVData: ProcessedCV | null, generatedCV: string | null): void => {
  if (!processedCVData && !generatedCV) {
    toast.error("No CV data available to download");
    return;
  }
  
  try {
    const dataToUse = processedCVData || parseBasicCV(generatedCV!);
    console.log('Generating PDF document with data:', dataToUse);
    
    const blob = generatePdfDocument(dataToUse);
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataToUse.personalInfo.name || 'professional'}_cv.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("PDF document downloaded successfully");
  } catch (error) {
    console.error('Error generating PDF document:', error);
    toast.error("Error generating PDF document");
  }
};
