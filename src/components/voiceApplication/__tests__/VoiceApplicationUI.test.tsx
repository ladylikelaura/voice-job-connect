
import { render, screen } from '@testing-library/react';
import { VoiceApplicationUI } from '../../VoiceApplicationUI';

// Mock the custom hook
jest.mock('../useVoiceConversation', () => ({
  useVoiceConversation: () => ({
    isCallActive: false,
    isProcessing: false,
    generatedCV: null,
    callDuration: 0,
    isMuted: false,
    interviewTranscript: [],
    startConversation: jest.fn(),
    endConversation: jest.fn(),
    toggleMute: jest.fn(),
    resetApplication: jest.fn()
  })
}));

describe('VoiceApplicationUI', () => {
  it('renders the voice application UI with correct title', () => {
    render(<VoiceApplicationUI />);
    expect(screen.getByText('AI Voice CV Generator')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<VoiceApplicationUI />);
    expect(screen.getByText(/Have a conversation with our AI agent/)).toBeInTheDocument();
  });

  it('renders the start interview button when not in a call', () => {
    render(<VoiceApplicationUI />);
    expect(screen.getByText('Start Interview')).toBeInTheDocument();
  });
});
