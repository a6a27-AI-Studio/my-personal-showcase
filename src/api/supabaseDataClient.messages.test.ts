import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseDataClient } from './supabaseDataClient';

const mockGetSession = vi.fn();
const mockRefreshSession = vi.fn();
const mockInvoke = vi.fn();

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      refreshSession: (...args: unknown[]) => mockRefreshSession(...args),
    },
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
  },
}));

type MessageRowTest = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  admin_reply: string | null;
  replied_at: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
};

const now = '2026-02-24T03:30:00.000Z';
const baseRow: MessageRowTest = {
  id: 'm1',
  user_id: 'u1',
  title: 't1',
  content: 'c1',
  admin_reply: null,
  replied_at: null,
  deleted_at: null,
  deleted_by: null,
  created_at: now,
  updated_at: now,
};

describe('SupabaseDataClient messages flow', () => {
  beforeEach(() => {
    mockGetSession.mockReset();
    mockRefreshSession.mockReset();
    mockInvoke.mockReset();

    const sessionData = { data: { session: { access_token: 'token-123' } } };
    mockGetSession.mockResolvedValue(sessionData);
    mockRefreshSession.mockResolvedValue(sessionData);
  });

  it('createMyMessage creates and maps message', async () => {
    mockInvoke.mockResolvedValue({
      data: { message: baseRow },
      error: null,
    });

    const result = await SupabaseDataClient.createMyMessage({
      title: 't1',
      content: 'c1',
    });

    expect(mockInvoke).toHaveBeenCalledWith(
      'messages',
      expect.objectContaining({
        body: {
          action: 'create',
          payload: { title: 't1', content: 'c1' },
        },
      })
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: 'm1',
        userId: 'u1',
        title: 't1',
        content: 'c1',
      })
    );
  });

  it('updateMyMessage updates and maps message', async () => {
    const updatedRow = { ...baseRow, title: 't2', content: 'c2' };
    mockInvoke.mockResolvedValue({
      data: { message: updatedRow },
      error: null,
    });

    const result = await SupabaseDataClient.updateMyMessage('m1', {
      title: 't2',
      content: 'c2',
    });

    expect(mockInvoke).toHaveBeenCalledWith(
      'messages',
      expect.objectContaining({
        body: {
          action: 'update',
          id: 'm1',
          payload: { title: 't2', content: 'c2' },
        },
      })
    );

    expect(result.title).toBe('t2');
    expect(result.content).toBe('c2');
  });

  it('deleteMyMessage sends delete action with mode', async () => {
    mockInvoke.mockResolvedValue({ data: { ok: true }, error: null });

    await SupabaseDataClient.deleteMyMessage('m1');
    expect(mockInvoke).toHaveBeenCalledWith(
      'messages',
      expect.objectContaining({ body: { action: 'delete', id: 'm1', mode: 'soft' } })
    );

    await SupabaseDataClient.deleteMyMessage('m1', { mode: 'hard' });
    expect(mockInvoke).toHaveBeenCalledWith(
      'messages',
      expect.objectContaining({ body: { action: 'delete', id: 'm1', mode: 'hard' } })
    );
  });
});
