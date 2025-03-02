
import React, { useEffect, useRef } from 'react';
import { FileText, Download, FileType, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  /**
   * Whether screen reader mode is enabled
   */
  isScreenReaderMode?: boolean;
}

export const CVDisplay: React.FC<CVDisplayProps> = ({ 
  generatedCV, 
  downloadWordDocument, 
  downloadPdfDocument,
  isScreenReaderMode = false
}) => {
  const pdfRef = useRef<HTMLIFrameElement>(null);
  const cvContentRef = useRef<HTMLDivElement>(null);
  
  // Check for PDF rendering support
  useEffect(() => {
    if (downloadPdfDocument && !window.navigator.mimeTypes['application/pdf']) {
      console.warn('PDF rendering not supported in this browser');
    }
  }, [downloadPdfDocument]);

  // Add focus management for accessibility
  useEffect(() => {
    if (generatedCV && isScreenReaderMode && cvContentRef.current) {
      // Announce CV generation completion
      const announceElement = document.createElement('div');
      announceElement.setAttribute('aria-live', 'assertive');
      announceElement.className = 'sr-only';
      announceElement.textContent = 'CV has been successfully generated. You can now review and download it.';
      document.body.appendChild(announceElement);
      
      // Remove announcement after it's been read
      setTimeout(() => {
        document.body.removeChild(announceElement);
      }, 3000);
    }
  }, [generatedCV, isScreenReaderMode]);

  if (!generatedCV) return null;
  
  // Convert markdown headers to HTML with better formatting
  const formatMarkdown = (text: string) => {
    // Format headers
    let formatted = text
      // Format the name as the main title (centered)
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mb-2 text-center">$1</h1>')
      // Format contact info (centered)
      .replace(/^(Phone No:.+)$/gm, '<p class="text-center text-sm mb-1">$1</p>')
      // Format location (centered)
      .replace(/^([A-Za-z].+(?:, )?[A-Za-z]+)$/gm, (match, p1) => {
        // Only replace if it's not part of any other formatting and likely a location
        if (!p1.startsWith('#') && !p1.includes(':') && !p1.startsWith('-')) {
          return `<p class="text-center text-sm mb-4">$1</p>`;
        }
        return match; // Return unchanged if not matching our criteria
      })
      // Format section headers
      .replace(/^## ([A-Z\s&]+)$/gm, '<h2 class="text-xl font-bold my-3 text-primary border-b border-gray-300 pb-1">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold my-2">$1</h3>')
      // Format work experience titles
      .replace(/^([^-#\n].+) - (.+) \| (.+)$/gm, '<div class="flex justify-between my-2"><span class="font-semibold">$1 - $2</span><span class="text-sm">$3</span></div>')
      // Format lists for responsibilities and skills
      .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc my-1">$1</li>')
      // Format italic text
      .replace(/\*([^*]+)\*/g, '<em class="text-gray-600">$1</em>')
      // Format education listings
      .replace(/^\s\s([^-#\n].+) \| (.+)$/gm, '<div class="ml-5 text-sm mb-3">$1 | $2</div>')
      // Add paragraph spacing
      .replace(/\n\n/g, '<div class="my-2"></div>');
    
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
    
    if (isScreenReaderMode) {
      toast.success("Markdown file downloaded successfully");
    }
  };
  
  const handlePdfDownload = () => {
    if (downloadPdfDocument) {
      try {
        downloadPdfDocument();
        if (isScreenReaderMode) {
          toast.success("PDF file download started");
        }
      } catch (error) {
        console.error('Error downloading PDF:', error);
        toast.error('Could not generate PDF. Try using the Word or Markdown format instead.');
      }
    }
  };

  const handleWordDownload = () => {
    if (downloadWordDocument) {
      try {
        downloadWordDocument();
        if (isScreenReaderMode) {
          toast.success("Word document download started");
        }
      } catch (error) {
        console.error('Error downloading Word:', error);
        toast.error('Could not generate Word document. Try using the Markdown format instead.');
      }
    }
  };
  
  const plainTextContent = generatedCV.replace(/[#*-]/g, '');
  
  return (
    <div 
      className="mt-6 p-6 bg-muted/20 backdrop-blur-sm rounded-md border border-muted-foreground/10 shadow-md" 
      id="cv-container"
      role="region"
      aria-label="Generated CV"
    >
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
              onClick={handleWordDownload}
              aria-label="Download Word document"
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
              onClick={handlePdfDownload}
              aria-label="Download PDF document"
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
            aria-label="Download Markdown file"
          >
            <Download className="w-4 h-4" />
            Markdown
          </Button>
        </div>
      </div>
      <div 
        ref={cvContentRef}
        className="whitespace-pre-wrap text-sm leading-relaxed cv-content max-w-3xl mx-auto bg-white p-6 rounded shadow"
        dangerouslySetInnerHTML={{ __html: formatMarkdown(generatedCV) }}
        tabIndex={0}
        aria-label="CV Content"
      />
      
      {isScreenReaderMode && (
        <div className="sr-only" aria-live="polite">
          <p>CV Content:</p>
          <div>{plainTextContent}</div>
        </div>
      )}
    </div>
  );
};
