
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionButtons } from '../ActionButtons';

describe('ActionButtons', () => {
  const mockProps = {
    isCallActive: false,
    isProcessing: false,
    isMuted: false,
    generatedCV: null,
    onStartConversation: jest.fn(),
    onEndConversation: jest.fn(),
    onToggleMute: jest.fn(),
    onResetApplication: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders start button when call is not active', () => {
    render(<ActionButtons {...mockProps} />);
    expect(screen.getByText('Start Interview')).toBeInTheDocument();
    expect(screen.queryByText('End Interview')).not.toBeInTheDocument();
  });

  it('renders end button when call is active', () => {
    render(<ActionButtons {...mockProps} isCallActive={true} />);
    expect(screen.getByText('End Interview')).toBeInTheDocument();
    expect(screen.queryByText('Start Interview')).not.toBeInTheDocument();
  });

  it('renders mute button when call is active', () => {
    render(<ActionButtons {...mockProps} isCallActive={true} />);
    expect(screen.getByText('Mute')).toBeInTheDocument();
  });

  it('renders unmute button when call is active and muted', () => {
    render(<ActionButtons {...mockProps} isCallActive={true} isMuted={true} />);
    expect(screen.getByText('Unmute')).toBeInTheDocument();
  });

  it('renders start over button when CV is generated', () => {
    render(<ActionButtons {...mockProps} generatedCV="Some CV content" />);
    expect(screen.getByText('Start Over')).toBeInTheDocument();
  });

  it('calls onStartConversation when start button is clicked', () => {
    render(<ActionButtons {...mockProps} />);
    fireEvent.click(screen.getByText('Start Interview'));
    expect(mockProps.onStartConversation).toHaveBeenCalledTimes(1);
  });

  it('calls onEndConversation when end button is clicked', () => {
    render(<ActionButtons {...mockProps} isCallActive={true} />);
    fireEvent.click(screen.getByText('End Interview'));
    expect(mockProps.onEndConversation).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleMute when mute/unmute button is clicked', () => {
    render(<ActionButtons {...mockProps} isCallActive={true} />);
    fireEvent.click(screen.getByText('Mute'));
    expect(mockProps.onToggleMute).toHaveBeenCalledTimes(1);
  });

  it('calls onResetApplication when start over button is clicked', () => {
    render(<ActionButtons {...mockProps} generatedCV="Some CV content" />);
    fireEvent.click(screen.getByText('Start Over'));
    expect(mockProps.onResetApplication).toHaveBeenCalledTimes(1);
  });
});
