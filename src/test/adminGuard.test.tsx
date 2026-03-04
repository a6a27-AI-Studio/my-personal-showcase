import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminGuard } from '@/components/guards/AdminGuard';

const mockUseAuth = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate">navigate:{to}</div>,
  };
});

describe('AdminGuard', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it('shows loading state while auth is loading', () => {
    mockUseAuth.mockReturnValue({ isAdmin: false, loading: true });

    render(
      <MemoryRouter>
        <AdminGuard>
          <div>protected</div>
        </AdminGuard>
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects non-admin users to /403', () => {
    mockUseAuth.mockReturnValue({ isAdmin: false, loading: false });

    render(
      <MemoryRouter>
        <AdminGuard>
          <div>protected</div>
        </AdminGuard>
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate')).toHaveTextContent('navigate:/403');
  });

  it('renders protected content for admin users', () => {
    mockUseAuth.mockReturnValue({ isAdmin: true, loading: false });

    render(
      <MemoryRouter>
        <AdminGuard>
          <div>protected</div>
        </AdminGuard>
      </MemoryRouter>
    );

    expect(screen.getByText('protected')).toBeInTheDocument();
  });
});
