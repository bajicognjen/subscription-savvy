import React, { useEffect, useState } from 'react';
import { supabase } from '@/supabase';

export default function SessionInspector() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      setSession(data?.session ?? null);
      console.debug('[SessionInspector] session', data?.session);
    } catch (err) {
      console.error('Failed to fetch session', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 30000);
    return () => clearInterval(id);
  }, []);

  if (!session) return null;

  return (
    <div className="text-xs text-muted-foreground">
      <div>uid: {session.user?.id}</div>
      <div>expires: {session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'n/a'}</div>
      <button
        onClick={fetch}
        className="ml-2 px-2 py-1 rounded border text-xs"
        disabled={loading}
      >
        Refresh
      </button>
    </div>
  );
}
