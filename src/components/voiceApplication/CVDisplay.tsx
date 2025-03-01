
import React from 'react';
import { FileText, Download, FileType, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CVDisplayProps {
  /**
   * The generated CV content in markdown or text format
   */
  generatedCV: string | null;
  /**
   * Function to download Word document
   */
  downloadWordDocument?: () => void;
  /**
   * Function to download PDF document
   */
  downloadPdfDocument?: () => void;
}

export const CVDisplay: React.FC<CVDisplayProps> = ({ 
  generatedCV, 
  downloadWordDocument, 
  downloadPdfDocument 
}) => {
  if (!generatedCV) return null;
  
  // Convert markdown headers to HTML
  const formatMarkdown = (text: string) => {
    // Format headers
    let formatted = text
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold my-3 text-primary">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-medium my-2">$1</h3>')
      // Format lists
      .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc">$1</li>')
      // Format italic text
      .replace(/\*([^*]+)\*/g, '<em class="text-muted-foreground">$1</em>')
      // Add paragraph spacing
      .replace(/\n\n/g, '<div class="my-3"></div>');
    
    return formatted;
  };

  const downloadMarkdown = () => {
    const blob = new Blob([generatedCV], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_generated_cv.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="mt-6 p-6 bg-muted/20 backdrop-blur-sm rounded-md border border-muted-foreground/10 shadow-md" id="cv-container">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Generated CV
        </h4>
        <div className="flex gap-2">
          {downloadWordDocument && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex gap-1 items-center"
              onClick={downloadWordDocument}
            >
              <FileType className="w-4 h-4" />
              Word
            </Button>
          )}
          
          {downloadPdfDocument && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex gap-1 items-center"
              onClick={downloadPdfDocument}
            >
              <File className="w-4 h-4" />
              PDF
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex gap-1 items-center"
            onClick={downloadMarkdown}
          >
            <Download className="w-4 h-4" />
            Markdown
          </Button>
        </div>
      </div>
      <div 
        className="whitespace-pre-wrap text-sm leading-relaxed cv-content"
        dangerouslySetInnerHTML={{ __html: formatMarkdown(generatedCV) }}
      />
    </div>
  );
};
