import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export default function Register() {
  const { signup } = useAuthContext();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const validatePassword = (pwd) => {
    const minLength = /.{8,}/;
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const number = /[0-9]/;
    const special = /[!@#$%^&*(),.?":{}|<>]/;

    if (!minLength.test(pwd)) return "Password must be at least 8 characters long.";
    if (!uppercase.test(pwd)) return "Password must contain at least one uppercase letter.";
    if (!lowercase.test(pwd)) return "Password must contain at least one lowercase letter.";
    if (!number.test(pwd)) return "Password must contain at least one number.";
    if (!special.test(pwd)) return "Password must contain at least one special character.";
    
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    const { error } = await signup(email, password, fullName);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setShowVerificationModal(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main p-4 relative transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-main mb-2">Create an Account</h1>
          <p className="text-text-muted">Join AI Research Assistant today.</p>
        </div>

        <Card className="p-8 shadow-2xl border-border">
          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-md mb-6">{error}</div>}
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-bg-card border border-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                placeholder="John Doe"
                required
              />
            </div>

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
              <label className="block text-sm font-medium text-text-main mb-2">Password</label>
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

            <div>
              <label className="block text-sm font-medium text-text-main mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-bg-card border border-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full text-base font-semibold py-3 mt-2"
              isLoading={loading}
            >
              Sign Up
            </Button>
          </form>

          <div className="mt-6 text-center text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-400 font-semibold transition-colors">
              Log in
            </Link>
          </div>
        </Card>
      </div>

      {showVerificationModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-sm w-full p-6 text-center shadow-2xl border-border bg-bg-card">
            <h2 className="text-xl font-bold text-text-main mb-4 border-b border-border pb-2">Verification Email Sent</h2>
            <div className="text-text-main mb-6 space-y-4">
              <p>We've sent a verification link to:</p>
              <p className="font-semibold text-primary-400 bg-primary-500/10 py-2 rounded-lg">{email}</p>
              <p className="text-sm text-text-muted">Check your inbox and spam folder.</p>
            </div>
            <Button 
              onClick={() => {
                setShowVerificationModal(false);
                navigate('/login');
              }}
              className="w-full"
            >
              Go to Login
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
