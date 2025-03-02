
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { generateWordDocument, generatePdfDocument } from "./services/documentService";
import { ProcessedCV } from "./types";

interface CVDownloadButtonProps {
  cvData: ProcessedCV | null;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary" | "primary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  label?: string;
}

const CVDownloadButton: React.FC<CVDownloadButtonProps> = ({
  cvData,
  variant = "outline",
  size = "default",
  className = "",
  label = "Download CV"
}) => {
  const handleDownload = (format: "pdf" | "word") => {
    if (!cvData) {
      toast.error("No CV data available to download");
      return;
    }
    
    try {
      const blob = format === "pdf" 
        ? generatePdfDocument(cvData) 
        : generateWordDocument(cvData);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cvData.personalInfo?.name || 'professional'}_cv.${format === "pdf" ? "pdf" : "docx"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`${format.toUpperCase()} document downloaded successfully`);
    } catch (error) {
      console.error(`Error generating ${format} document:`, error);
      toast.error(`Error generating ${format} document`);
    }
  };

  return (
    <div className="flex items-center gap-2" role="group" aria-label="CV download options">
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => handleDownload("pdf")}
        disabled={!cvData}
        aria-label="Download CV as PDF"
      >
        <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
        {label} (PDF)
      </Button>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => handleDownload("word")}
        disabled={!cvData}
        aria-label="Download CV as Word document"
      >
        <Download className="w-4 h-4 mr-2" aria-hidden="true" />
        {label} (Word)
      </Button>
    </div>
  );
};

export default CVDownloadButton;
