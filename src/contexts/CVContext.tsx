
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProcessedCV } from '@/components/voiceApplication/types';

interface CVContextType {
  generatedCV: ProcessedCV | null;
  setGeneratedCV: React.Dispatch<React.SetStateAction<ProcessedCV | null>>;
}

const CVContext = createContext<CVContextType | undefined>(undefined);

export const CVProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [generatedCV, setGeneratedCV] = useState<ProcessedCV | null>(null);

  return (
    <CVContext.Provider value={{ generatedCV, setGeneratedCV }}>
      {children}
    </CVContext.Provider>
  );
};

export const useCV = () => {
  const context = useContext(CVContext);
  if (context === undefined) {
    throw new Error('useCV must be used within a CVProvider');
  }
  return context;
};
