import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { SessionConflictResponse } from '@/services/auth.service';
import { Lock, User, AlertCircle, AlertTriangle } from 'lucide-react';
import { formatISTDateTime } from '@/utils/dateUtils';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Session conflict state
  const [sessionConflict, setSessionConflict] = useState<SessionConflictResponse | null>(null);
  const [forceLoading, setForceLoading] = useState(false);
  
  const { login, forceLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSessionConflict(null);
    setLoading(true);

    try {
      const result = await login({ username, password });
      
      if (result.sessionConflict) {
        // Session conflict detected
        setSessionConflict(result.sessionConflict);
      } else if (result.success) {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogin = async () => {
    setForceLoading(true);
    setError('');

    try {
      await forceLogin({ username, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to override session');
      setSessionConflict(null);
    } finally {
      setForceLoading(false);
    }
  };

  const handleCancelForceLogin = () => {
    setSessionConflict(null);
    setPassword(''); // Clear password for security
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Q-Docs</h1>
          <p className="text-gray-600 mt-2">Document Management System</p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="label">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input pl-10"
                  placeholder="Enter your username"
                  required
                  autoFocus
                  disabled={!!sessionConflict}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="Enter your password"
                  required
                  disabled={!!sessionConflict}
                />
              </div>
            </div>

            {!sessionConflict && (
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full mt-6"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            )}
          </form>

          {/* Session Conflict Warning */}
          {sessionConflict && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800 mb-1">
                    Active Session Detected
                  </h3>
                  <p className="text-sm text-amber-700 mb-3">
                    {sessionConflict.detail}
                  </p>
                  {sessionConflict.existing_session_created_at && (
                    <p className="text-xs text-amber-600 mb-3">
                      Session started: {formatISTDateTime(sessionConflict.existing_session_created_at)} IST
                    </p>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelForceLogin}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 text-sm"
                      disabled={forceLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleForceLogin}
                      disabled={forceLoading}
                      className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm disabled:opacity-50"
                    >
                      {forceLoading ? 'Overriding...' : 'Continue Here'}
                    </button>
                  </div>
                  <p className="text-xs text-amber-600 mt-2 text-center">
                    ⚠️ This will log out the other session
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Default credentials: <strong>admin / Admin@123456</strong>
            </p>
            <p className="text-xs text-gray-500 text-center mt-2">
              ⚠️ Change password after first login
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Q-Docs v1.0.0 - Phase 1: User Management
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
