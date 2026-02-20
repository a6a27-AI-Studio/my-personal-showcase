import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Json = Record<string, unknown>;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authHeader = req.headers.get('Authorization') || '';

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();

    if (userErr || !user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const { data: adminRow } = await adminClient
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    const isAdmin = !!adminRow;

    const body = (await req.json().catch(() => ({}))) as Json;
    const action = String(body.action || 'list');

    if (action === 'list') {
      let query = adminClient.from('messages').select('*').order('created_at', { ascending: false });
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      if (error) return json({ error: error.message }, 400);

      return json({ messages: data || [] });
    }

    if (action === 'create') {
      const payload = (body.payload || {}) as Json;
      const content = String(payload.content || '').trim();
      const title = payload.title ? String(payload.title) : null;

      if (!content) {
        return json({ error: 'content is required' }, 400);
      }

      const { data, error } = await adminClient
        .from('messages')
        .insert({
          user_id: user.id,
          title,
          content,
        })
        .select('*')
        .single();

      if (error) return json({ error: error.message }, 400);
      return json({ message: data });
    }

    if (action === 'update') {
      const id = String(body.id || '');
      const payload = (body.payload || {}) as Json;
      if (!id) return json({ error: 'id is required' }, 400);

      let ownershipQuery = adminClient.from('messages').select('id,user_id').eq('id', id).maybeSingle();
      const { data: target, error: targetErr } = await ownershipQuery;
      if (targetErr || !target) return json({ error: 'message not found' }, 404);

      if (!isAdmin && target.user_id !== user.id) {
        return json({ error: 'Forbidden' }, 403);
      }

      const updates: Record<string, unknown> = {};
      if (payload.title !== undefined) updates.title = payload.title ? String(payload.title) : null;
      if (payload.content !== undefined) updates.content = String(payload.content || '').trim();

      const { data, error } = await adminClient
        .from('messages')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) return json({ error: error.message }, 400);
      return json({ message: data });
    }

    if (action === 'delete') {
      const id = String(body.id || '');
      if (!id) return json({ error: 'id is required' }, 400);

      const { data: target, error: targetErr } = await adminClient
        .from('messages')
        .select('id,user_id')
        .eq('id', id)
        .maybeSingle();

      if (targetErr || !target) return json({ error: 'message not found' }, 404);

      if (!isAdmin && target.user_id !== user.id) {
        return json({ error: 'Forbidden' }, 403);
      }

      const { error } = await adminClient.from('messages').delete().eq('id', id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: 'Unsupported action' }, 400);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}
