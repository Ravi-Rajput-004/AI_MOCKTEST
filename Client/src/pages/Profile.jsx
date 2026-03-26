import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { useProfile, useUpdateProfile } from '../queries/user.queries.js';
import { useHistory } from '../queries/interview.queries.js';
import SessionHistory from '../components/dashboard/SessionHistory.jsx';
import Loader from '../components/common/Loader.jsx';
import { SDE_LEVELS, DEV_ROLES, PLANS } from '../lib/constants.jsx';
import { getInitials, formatDate } from '../lib/utils.js';
import { pageVariants } from '../animations/variants.js';
import toast from 'react-hot-toast';

export default function Profile() {
  const { data: profile, isLoading } = useProfile();
  const { data: historyData } = useHistory({ limit: 10 });
  const updateProfile = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [role, setRole] = useState('');

  if (isLoading) return <Loader fullScreen text="Loading profile..." />;

  const handleEdit = () => {
    setName(profile?.name || '');
    setLevel(profile?.level || '');
    setRole(profile?.role || '');
    setEditing(true);
  };

  const handleSave = () => {
    updateProfile.mutate({ name, level, role }, {
      onSuccess: () => { setEditing(false); toast.success('Profile updated'); },
      onError: () => toast.error('Update failed'),
    });
  };

  return (
    <Motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-bg-card rounded-2xl border border-border p-8 mb-8">
          <div className="flex items-start gap-6 flex-wrap">
            <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-primary to-[#A78BFA] flex items-center justify-center text-2xl font-bold text-white">
              {getInitials(profile?.name)}
            </div>
            <div className="flex-1 min-w-[200px]">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-text-muted mb-1">Level</label>
                      <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-3 py-2 bg-bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary">
                        <option value="">Select</option>
                        {SDE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">Role</label>
                      <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 bg-bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary">
                        <option value="">Select</option>
                        {DEV_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={updateProfile.isPending} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm transition-colors">{updateProfile.isPending ? 'Saving...' : 'Save'}</button>
                    <button onClick={() => setEditing(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-bg-elevated transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold">{profile?.name}</h1>
                    {profile?.isAdmin && <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning">Admin</span>}
                  </div>
                  <p className="text-sm text-text-muted">{profile?.email}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-text-secondary">
                    {profile?.level && <span>{SDE_LEVELS.find(l => l.value === profile.level)?.label}</span>}
                    {profile?.role && <span>• {DEV_ROLES.find(r => r.value === profile.role)?.label}</span>}
                    <span>• Joined {formatDate(profile?.createdAt)}</span>
                  </div>
                  <button onClick={handleEdit} className="mt-4 px-4 py-2 text-sm border border-border rounded-lg hover:bg-bg-elevated transition-colors">Edit Profile</button>
                </>
              )}
            </div>

            <div className="bg-bg-elevated rounded-xl p-4 min-w-[180px]">
              <p className="text-xs text-text-muted mb-1">Current Plan</p>
              <p className="text-lg font-bold text-primary-light">{profile?.plan || 'FREE'}</p>
              {profile?.planExpiry && <p className="text-xs text-text-muted mt-1">Expires {formatDate(profile.planExpiry)}</p>}
              {profile?.plan !== 'TEAM' && (
                <Link to="/pricing" className="mt-3 w-full bg-primary/10 hover:bg-primary/20 text-primary-light text-xs py-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 border border-primary/20">
                  <CreditCard className="w-3.5 h-3.5" /> Upgrade Plan
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Interview History</h2>
          <SessionHistory sessions={historyData?.sessions || []} />
        </div>
      </div>
    </Motion.div>
  );
}
