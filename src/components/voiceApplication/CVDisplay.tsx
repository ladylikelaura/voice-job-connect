
import React from 'react';
import { FileText } from 'lucide-react';

interface CVDisplayProps {
  generatedCV: string | null;
}

export const CVDisplay: React.FC<CVDisplayProps> = ({ generatedCV }) => {
  if (!generatedCV) return null;
  
  return (
    <div className="mt-6 p-4 bg-muted rounded-md">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Generated CV
        </h4>
      </div>
      <pre className="whitespace-pre-wrap text-sm">{generatedCV}</pre>
    </div>
  );
};
