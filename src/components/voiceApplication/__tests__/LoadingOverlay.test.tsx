
import { render, screen } from '@testing-library/react';
import { LoadingOverlay } from '../LoadingOverlay';

describe('LoadingOverlay', () => {
  it('renders loading spinner when isProcessing is true', () => {
    render(<LoadingOverlay isProcessing={true} />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('does not render when isProcessing is false', () => {
    const { container } = render(<LoadingOverlay isProcessing={false} />);
    expect(container.firstChild).toBeNull();
  });
});
