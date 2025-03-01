
import { Conversation } from '@11labs/client';

export interface VoiceConversationState {
  isCallActive: boolean;
  isProcessing: boolean;
  generatedCV: string | null;
  callDuration: number;
  isMuted: boolean;
  interviewTranscript: string[];
}

export interface VoiceConversationActions {
  startConversation: () => Promise<void>;
  endConversation: () => Promise<void>;
  toggleMute: () => void;
  resetApplication: () => void;
}

export type VoiceConversationHook = VoiceConversationState & VoiceConversationActions;

export interface ConversationRefs {
  conversationRef: React.MutableRefObject<any>;
  timerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  audioContextRef: React.MutableRefObject<AudioContext | null>;
  cvGenerationAttemptedRef: React.MutableRefObject<boolean>;
  disconnectTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  shouldGenerateCVRef: React.MutableRefObject<boolean>;
}
