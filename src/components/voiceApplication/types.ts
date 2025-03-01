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
