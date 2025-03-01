
import { render, screen } from '@testing-library/react';
import { TranscriptDisplay } from '../TranscriptDisplay';

describe('TranscriptDisplay', () => {
  const mockTranscript = [
    'Agent: Tell me about your experience',
    'You: I have 5 years of experience'
  ];

  it('renders transcript when visible and has content', () => {
    render(<TranscriptDisplay interviewTranscript={mockTranscript} isVisible={true} />);
    expect(screen.getByText(/Interview Transcript/)).toBeInTheDocument();
    expect(screen.getByText(/Tell me about your experience/)).toBeInTheDocument();
    expect(screen.getByText(/I have 5 years of experience/)).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    const { container } = render(<TranscriptDisplay interviewTranscript={mockTranscript} isVisible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('does not render when transcript is empty', () => {
    const { container } = render(<TranscriptDisplay interviewTranscript={[]} isVisible={true} />);
    expect(container.firstChild).toBeNull();
  });
});
