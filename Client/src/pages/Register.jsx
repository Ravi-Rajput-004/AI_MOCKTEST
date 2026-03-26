import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { useRegister } from '../queries/auth.queries.js';
import { pageVariants } from '../animations/variants.js';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const register = useRegister();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    register.mutate({ name, email, password }, {
      onSuccess: () => navigate('/dashboard'),
      onError: (err) => {
        const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Registration failed';
        setError(msg);
      },
    });
  };

  return (
    <Motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-[#A78BFA] flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">AI</Link>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-text-muted mt-1">Start practicing interviews for free</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-bg-card rounded-2xl border border-border p-8 space-y-5">
          {error && <div className="text-sm text-danger bg-danger/10 px-4 py-2 rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-medium mb-1.5">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2.5 bg-bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors" placeholder="Your name" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2.5 bg-bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors" placeholder="you@email.com" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="w-full px-4 py-2.5 bg-bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors pr-12" 
                placeholder="Min 8 characters" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-text-muted mt-1">Must include uppercase, lowercase, and a number</p>
          </div>

          <button type="submit" disabled={register.isPending} className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 btn-glow">
            {register.isPending ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-text-muted">
            Already have an account? <Link to="/login" className="text-primary-light hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </Motion.div>
  );
}
