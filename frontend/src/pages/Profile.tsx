import React, { useEffect, useState } from 'react';
import { Mail, Shield, Hash, User as UserIcon, RefreshCcw, AlertCircle, CheckCircle2, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import type { UserInfo } from '@/types';

const infoRowClass = 'flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700';
const chipClass = 'inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserInfo | null>(user);
  const [loading, setLoading] = useState(!user);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfile(user);
      setLoading(false);
    }
  }, [user]);

  const refreshProfile = async () => {
    setRefreshing(true);
    setError(null);
    setSuccess(null);

    try {
      const latest = await authService.getCurrentUser();
      setProfile(latest);
      setSuccess('Account details refreshed.');
    } catch (err: any) {
      console.error('Unable to refresh profile', err);
      setError(err?.response?.data?.detail || 'Unable to refresh profile at the moment.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
        <p className="text-sm text-gray-500">Loading your account profile…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="rounded-3xl bg-white p-8 shadow">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Account</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Your profile</h1>
            <p className="mt-1 text-sm text-gray-500">
              Keep your contact information up to date to ensure workflow notifications reach you.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={refreshProfile}
              className="inline-flex items-center rounded-2xl border border-primary-600 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 disabled:opacity-50"
              disabled={refreshing}
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing' : 'Refresh details'}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
        {(error || success) && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ${
              error ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {error ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            <span>{error || success}</span>
          </div>
        )}
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow">
          <p className="text-xs font-semibold uppercase text-gray-500">Personal</p>
          <h2 className="mt-2 text-xl font-semibold text-gray-900">Identity</h2>
          <div className="mt-4 space-y-3">
            <div className={infoRowClass}>
              <UserIcon className="h-4 w-4 text-primary-600" />
              <div>
                <p className="text-xs uppercase text-gray-400">Full name</p>
                <p className="font-semibold text-gray-900">{profile?.full_name || 'Not provided'}</p>
              </div>
            </div>
            <div className={infoRowClass}>
              <Hash className="h-4 w-4 text-primary-600" />
              <div>
                <p className="text-xs uppercase text-gray-400">Username</p>
                <p className="font-semibold text-gray-900">{profile?.username}</p>
              </div>
            </div>
            <div className={infoRowClass}>
              <Mail className="h-4 w-4 text-primary-600" />
              <div>
                <p className="text-xs uppercase text-gray-400">Email</p>
                <p className="font-semibold text-gray-900">{profile?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow">
          <p className="text-xs font-semibold uppercase text-gray-500">Access</p>
          <h2 className="mt-2 text-xl font-semibold text-gray-900">Roles & status</h2>
          <div className="mt-4 space-y-4">
            <div className={infoRowClass}>
              <Shield className="h-4 w-4 text-primary-600" />
              <div>
                <p className="text-xs uppercase text-gray-400">Account status</p>
                <p className={`font-semibold ${profile?.is_active ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {profile?.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Assigned roles</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile?.roles.length ? (
                  profile.roles.map((role) => (
                    <span key={role} className={chipClass}>
                      {role}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No roles assigned.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500">
        Need to update your information or change your access? Contact your site administrator or QA coordinator.
      </div>
    </div>
  );
};

export default Profile;

