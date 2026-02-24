import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

declare global {
  interface Window {
    __signInResult?: string;
    __signOutResult?: string;
  }
}

const mockIsInAppWebView = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockSignOut = vi.fn();
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock('@/lib/webview', () => ({
  isInAppWebView: () => mockIsInAppWebView(),
}));

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      getSession: (...args: unknown[]) => mockGetSession(...args),
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    }),
  },
}));

function TestConsumer() {
  const { signInWithGoogle, signOut } = useAuth();

  return (
    <div>
      <button
        onClick={async () => {
          try {
            await signInWithGoogle();
            window.__signInResult = 'ok';
          } catch (error) {
            window.__signInResult = error instanceof Error ? error.message : 'error';
          }
        }}
      >
        sign-in
      </button>
      <button
        onClick={async () => {
          await signOut();
          window.__signOutResult = 'ok';
        }}
      >
        sign-out
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    mockIsInAppWebView.mockReset();
    mockSignInWithOAuth.mockReset();
    mockSignOut.mockReset();
    mockGetSession.mockReset();
    mockOnAuthStateChange.mockReset();

    window.__signInResult = undefined;
    window.__signOutResult = undefined;

    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockSignOut.mockResolvedValue({ error: null });
    mockSignInWithOAuth.mockResolvedValue({ error: null });
  });

  it('blocks Google OAuth in in-app webview', async () => {
    mockIsInAppWebView.mockReturnValue(true);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    screen.getByText('sign-in').click();

    await waitFor(() => {
      expect(window.__signInResult).toBe('WEBVIEW_UNSUPPORTED_FOR_GOOGLE_OAUTH');
    });
    expect(mockSignInWithOAuth).not.toHaveBeenCalled();
  });

  it('starts Google OAuth in normal browser', async () => {
    mockIsInAppWebView.mockReturnValue(false);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    screen.getByText('sign-in').click();

    await waitFor(() => {
      expect(window.__signInResult).toBe('ok');
    });

    expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'google',
        options: expect.objectContaining({
          redirectTo: expect.stringContaining('/auth/callback'),
        }),
      })
    );
  });

  it('signOut calls supabase auth signOut', async () => {
    mockIsInAppWebView.mockReturnValue(false);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    screen.getByText('sign-out').click();

    await waitFor(() => {
      expect(window.__signOutResult).toBe('ok');
    });
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
