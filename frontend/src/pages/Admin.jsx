import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import Inventory from './Inventory';
import supabase from '../services/supabase';

export default function Admin({ session, authLoaded }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignOut = async () => {
    setError('');
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
    } catch (signOutError) {
      setError(signOutError.message || 'Unable to sign out.');
    }
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    setError('');
    setIsSigningIn(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
    } catch (signInError) {
      setError(signInError.message || 'Unable to sign in.');
    } finally {
      setIsSigningIn(false);
    }
  };

  if (!supabase) {
    return (
      <div className="card" style={{ maxWidth: '560px', margin: '40px auto', padding: '32px' }}>
        <h1>Admin setup required</h1>
        <p className="text-muted">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.local to enable Supabase sign-in.</p>
      </div>
    );
  }

  if (!authLoaded) {
    return <div className="card" style={{ padding: '32px' }}>Checking admin session...</div>;
  }

  if (!session) {
    return (
      <div className="card" style={{ maxWidth: '440px', margin: '40px auto', padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <ShieldCheck size={28} color="var(--primary)" />
          <h1 style={{ margin: 0 }}>Admin sign in</h1>
        </div>
        <p className="text-muted">Sign in with an administrator account to manage medicine stock.</p>
        <form onSubmit={handleSignIn}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="admin-email" style={{ display: 'block', marginBottom: '8px' }}>Email</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="admin-password" style={{ display: 'block', marginBottom: '8px' }}>Password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
            />
          </div>
          {error && <p role="alert" style={{ color: '#dc2626' }}>{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={isSigningIn} style={{ width: '100%' }}>
            {isSigningIn ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    );
  }

  if (session.user?.app_metadata?.role !== 'admin') {
    return (
      <div className="card" style={{ maxWidth: '560px', margin: '40px auto', padding: '32px' }}>
        <h1>Admin access required</h1>
        <p className="text-muted">The signed-in account does not have the admin role.</p>
        {error && <p role="alert" style={{ color: '#dc2626' }}>{error}</p>}
        <button type="button" className="btn btn-outline" onClick={handleSignOut}>Sign out</button>
      </div>
    );
  }

  return (
    <>
      {error && <p role="alert" style={{ color: '#dc2626' }}>{error}</p>}
      <Inventory isAdmin session={session} onSignOut={handleSignOut} />
    </>
  );
}
