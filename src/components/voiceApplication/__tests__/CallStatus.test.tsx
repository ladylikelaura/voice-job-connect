
import { render, screen } from '@testing-library/react';
import { CallStatus } from '../CallStatus';

describe('CallStatus', () => {
  it('renders call duration when call is active', () => {
    render(<CallStatus isCallActive={true} callDuration={65} />);
    expect(screen.getByText('Call in progress (01:05)')).toBeInTheDocument();
    expect(screen.getByLabelText('Call duration')).toBeInTheDocument();
  });

  it('does not render when call is not active', () => {
    const { container } = render(<CallStatus isCallActive={false} callDuration={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('formats duration correctly', () => {
    render(<CallStatus isCallActive={true} callDuration={125} />);
    expect(screen.getByText('Call in progress (02:05)')).toBeInTheDocument();
  });
});
