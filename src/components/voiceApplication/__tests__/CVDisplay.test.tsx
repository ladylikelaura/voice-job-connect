
import { render, screen } from '@testing-library/react';
import { CVDisplay } from '../CVDisplay';

describe('CVDisplay', () => {
  const mockCV = "# Test CV\n\nThis is a test CV";

  it('renders CV content when provided', () => {
    render(<CVDisplay generatedCV={mockCV} />);
    expect(screen.getByText('Generated CV')).toBeInTheDocument();
    expect(screen.getByText(/This is a test CV/)).toBeInTheDocument();
  });

  it('does not render when no CV is provided', () => {
    const { container } = render(<CVDisplay generatedCV={null} />);
    expect(container.firstChild).toBeNull();
  });
});
