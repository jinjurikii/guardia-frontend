import { render, screen, fireEvent } from '@testing-library/react';
import QuickActions from '../QuickActions';
import { ClientContext } from '../LobbyShell';

describe('QuickActions', () => {
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

  const mockOnConnectFacebook = jest.fn();
  const mockOnOpenTablet = jest.fn();

  beforeEach(() => {
    mockOnConnectFacebook.mockClear();
    mockOnOpenTablet.mockClear();
  });

  it('should render null when client is null', () => {
    const { container } = render(
      <QuickActions
        client={null}
        onConnectFacebook={mockOnConnectFacebook}
        onOpenTablet={mockOnOpenTablet}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should show Facebook connect button when setup needed', () => {
    const client = { ...baseClient, needs_platform_setup: true };
    render(
      <QuickActions
        client={client}
        onConnectFacebook={mockOnConnectFacebook}
        onOpenTablet={mockOnOpenTablet}
      />
    );
    expect(screen.getByText(/Connect Facebook/)).toBeInTheDocument();
  });

  it('should call onConnectFacebook when Facebook button clicked', () => {
    const client = { ...baseClient, needs_platform_setup: true };
    render(
      <QuickActions
        client={client}
        onConnectFacebook={mockOnConnectFacebook}
        onOpenTablet={mockOnOpenTablet}
      />
    );
    fireEvent.click(screen.getByText(/Connect Facebook/));
    expect(mockOnConnectFacebook).toHaveBeenCalled();
  });

  it('should show approval button when items are ready', () => {
    const client = { ...baseClient, styled_ready: 3 };
    render(
      <QuickActions
        client={client}
        onConnectFacebook={mockOnConnectFacebook}
        onOpenTablet={mockOnOpenTablet}
      />
    );
    expect(screen.getByText(/3 ready to approve/)).toBeInTheDocument();
  });

  it('should call onOpenTablet when approval button clicked', () => {
    const client = { ...baseClient, styled_ready: 3 };
    render(
      <QuickActions
        client={client}
        onConnectFacebook={mockOnConnectFacebook}
        onOpenTablet={mockOnOpenTablet}
      />
    );
    fireEvent.click(screen.getByText(/3 ready to approve/));
    expect(mockOnOpenTablet).toHaveBeenCalled();
  });

  it('should render nothing when no actions needed', () => {
    const { container } = render(
      <QuickActions
        client={baseClient}
        onConnectFacebook={mockOnConnectFacebook}
        onOpenTablet={mockOnOpenTablet}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
