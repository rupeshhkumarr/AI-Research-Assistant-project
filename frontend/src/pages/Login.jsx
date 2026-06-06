import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export default function Login() {
  const { login, session } = useAuthContext();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if already logged in
  React.useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await login(email, password);

    if (error) {
      // Supabase throws this error if "Confirm Email" is enabled and the user hasn't verified
      if (error.message.toLowerCase().includes('email not confirmed')) {
        setError('Your email address has not been verified. Please check your inbox and verify your account.');
      } else {
        setError(error.message);
      }
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-main mb-2">AI Research Assistant</h1>
          <p className="text-text-muted">Welcome back. Please log in to your account.</p>
        </div>

        <Card className="p-8 shadow-2xl border-border">
          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-md mb-6">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-card border border-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-text-main">Password</label>
                <Link to="/forgot-password" className="text-sm text-primary-500 hover:text-primary-400 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-card border border-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full text-base font-semibold py-3"
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-400 font-semibold transition-colors">
              Sign up
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
