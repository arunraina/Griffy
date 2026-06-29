import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Index() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session);
    });
  }, []);

  if (authenticated === null) return null;
  return <Redirect href={authenticated ? '/(tabs)/home' : '/(auth)/login'} />;
}
