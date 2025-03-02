export interface VoiceConversationHook {
  isCallActive: boolean;
  isProcessing: boolean;
  generatedCV: string | null;
  callDuration: number;
  isMuted: boolean;
  interviewTranscript: string[];
  startConversation: () => Promise<void>;
  endConversation: () => Promise<void>;
  toggleMute: () => void;
  resetApplication: () => void;
  downloadWordDocument?: () => void;
  downloadPdfDocument?: () => void;
}

export interface ProcessedCV {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location?: string;
    linkedIn?: string;
    website?: string;
  };
  professionalSummary: string;
  jobTitle: string;
  skills: string[];
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    responsibilities: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  certifications: string[];
  languages: string[];
}

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  key: string;
  description: string;
}
