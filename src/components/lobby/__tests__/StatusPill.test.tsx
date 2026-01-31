import { render, screen } from '@testing-library/react';
import StatusPill from '../StatusPill';
import { ClientContext } from '../LobbyShell';

describe('StatusPill', () => {
  const baseClient: ClientContext = {
    id: '1',
    business_name: 'Test Business',
    contact_name: 'Test User',
    tier: 'pro',
    pending_uploads: 0,
    styled_ready: 0,
    scheduled_posts: 0,
    posted_this_month: 0,
  };

  it('should render null when client is null', () => {
    const { container } = render(<StatusPill client={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should show "Setup needed" when needs_platform_setup is true', () => {
    const client = { ...baseClient, needs_platform_setup: true };
    render(<StatusPill client={client} />);
    expect(screen.getByText('Setup needed')).toBeInTheDocument();
  });

  it('should show scheduled posts count', () => {
    const client = { ...baseClient, scheduled_posts: 5 };
    render(<StatusPill client={client} />);
    expect(screen.getByText('5 scheduled')).toBeInTheDocument();
  });

  it('should show queue count when items are pending', () => {
    const client = { ...baseClient, pending_uploads: 3, styled_ready: 2 };
    render(<StatusPill client={client} />);
    expect(screen.getByText('5 in queue')).toBeInTheDocument();
  });

  it('should show "Ready" when no pending work', () => {
    render(<StatusPill client={baseClient} />);
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });
});
