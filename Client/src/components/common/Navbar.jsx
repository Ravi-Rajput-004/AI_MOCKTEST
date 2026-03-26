import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';
import { useUserStore } from '../../store/userStore.js';
import { useLogout } from '../../queries/auth.queries.js';
import { getInitials } from '../../lib/utils.js';

export default function Navbar() {
  const { user, isAuthenticated } = useUserStore();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout.mutate();
    navigate('/');
  };

  return (
    <Motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src="/icons/icon.png" className="w-8 h-8 rounded-lg object-contain" alt="MockPrep Logo" />
            <span className="text-lg font-bold gradient-text hidden sm:block">MockPrep</span>
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5">Dashboard</Link>
                {user?.isAdmin && (
                  <Link to="/admin" className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors px-3 py-1.5 flex items-center gap-1.5">Admin Panel</Link>
                )}
                <Link to="/pricing" className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 flex items-center gap-1.5"><CreditCard className="w-4 h-4" /> Pricing</Link>
                <Link to="/setup" className="text-sm bg-primary hover:bg-primary-hover text-white px-4 py-1.5 rounded-lg transition-colors">New Interview</Link>
                <div className="relative group">
                  <button className="w-8 h-8 rounded-full bg-bg-card border border-border flex items-center justify-center text-xs font-semibold text-primary-light">
                    {getInitials(user?.name)}
                  </button>
                  <div className="absolute right-0 top-10 w-48 bg-bg-card border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-text-muted">{user?.email}</p>
                    </div>
                    <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-bg-elevated transition-colors">Profile</Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-bg-elevated transition-colors">Logout</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5">Login</Link>
                <Link to="/register" className="text-sm bg-primary hover:bg-primary-hover text-white px-4 py-1.5 rounded-lg transition-colors btn-glow">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </Motion.nav>
  );
}
