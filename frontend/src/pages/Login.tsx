import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { SessionConflictResponse } from '@/services/auth.service';
import { Lock, User, AlertCircle, AlertTriangle, FileText, Shield, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen flex">
      {/* Left Side - Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-gradient-to-br from-primary-700 via-brand-600 to-primary-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent-400 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-brand-400 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full h-full p-10 lg:p-14 xl:p-20 text-white">
          {/* Logo */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 xl:w-24 xl:h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/20">
              <span className="text-5xl xl:text-6xl font-display font-bold">Q</span>
            </div>
            <div>
              <h1 className="text-4xl xl:text-5xl font-display font-bold tracking-tight">Q-Docs</h1>
              <p className="text-white/70 text-lg xl:text-xl mt-1">Document Management System</p>
            </div>
          </div>
          
          {/* Features */}
          <div className="space-y-10 flex-1 flex flex-col justify-center py-8">
            <div>
              <h2 className="text-5xl xl:text-6xl font-display font-bold leading-tight">
                Streamline Your<br />
                <span className="text-accent-300">Document Workflow</span>
              </h2>
              <p className="mt-6 text-xl xl:text-2xl text-white/80 max-w-2xl leading-relaxed">
                Enterprise-grade document management with full audit trails, 
                role-based access control, and regulatory compliance.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-5 xl:gap-6">
              {[
                { icon: FileText, label: 'Version Control', desc: 'Track all document changes' },
                { icon: Shield, label: 'Compliance Ready', desc: 'FDA 21 CFR Part 11' },
                { icon: User, label: 'Role-Based Access', desc: 'Granular permissions' },
                { icon: Sparkles, label: 'Smart Workflows', desc: 'Automated routing' },
              ].map((feature) => (
                <div key={feature.label} className="bg-white/10 backdrop-blur-sm rounded-2xl xl:rounded-3xl p-5 xl:p-6 border border-white/10 hover:bg-white/15 transition-colors">
                  <feature.icon className="w-10 h-10 xl:w-12 xl:h-12 text-accent-300 mb-3" />
                  <p className="font-bold text-lg xl:text-xl">{feature.label}</p>
                  <p className="text-base xl:text-lg text-white/60 mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-base xl:text-lg text-white/50">
            <p>© 2024 Q-Docs. Enterprise Document Management.</p>
          </div>
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-8 py-12 lg:px-16 xl:px-24">
        <div className="w-full max-w-lg xl:max-w-xl">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-600 via-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
                <span className="text-white font-display font-bold text-2xl">Q</span>
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary-600 to-brand-600 bg-clip-text text-transparent">
                  Q-Docs
                </h1>
                <p className="text-sm text-gray-500">Document Management</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10 xl:p-12 border border-gray-100">
            <div className="text-center mb-10">
              <h2 className="text-3xl xl:text-4xl font-display font-semibold text-gray-900">Welcome Back</h2>
              <p className="text-gray-500 mt-2 text-lg">Sign in to continue to Q-Docs</p>
            </div>

            {error && (
              <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-xl flex items-start animate-fade-in">
                <AlertCircle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-base text-red-700">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-base font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-5 py-4 pl-14 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder:text-gray-400 text-lg transition-all duration-200"
                    placeholder="Enter your username"
                    required
                    autoFocus
                    disabled={!!sessionConflict}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-base font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 pl-14 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder:text-gray-400 text-lg transition-all duration-200"
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
                  className="btn btn-primary w-full py-4 text-lg mt-4"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              )}
            </form>

            {/* Session Conflict Warning */}
            {sessionConflict && (
              <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-amber-800 mb-2">
                      Active Session Detected
                    </h3>
                    <p className="text-base text-amber-700 mb-4">
                      {sessionConflict.detail}
                    </p>
                    {sessionConflict.existing_session_created_at && (
                      <p className="text-sm text-amber-600 mb-4 px-3 py-1.5 bg-amber-100 rounded-lg inline-block">
                        Session started: {formatISTDateTime(sessionConflict.existing_session_created_at)} IST
                      </p>
                    )}
                    <div className="flex gap-4">
                      <button
                        onClick={handleCancelForceLogin}
                        className="flex-1 btn btn-secondary py-3 text-base"
                        disabled={forceLoading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleForceLogin}
                        disabled={forceLoading}
                        className="flex-1 btn bg-amber-600 text-white hover:bg-amber-700 py-3 text-base"
                      >
                        {forceLoading ? 'Overriding...' : 'Continue Here'}
                      </button>
                    </div>
                    <p className="text-sm text-amber-600 mt-4 text-center">
                      ⚠️ This will log out the other session
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-10 pt-8 border-t border-gray-100">
              <div className="bg-gray-50 rounded-2xl p-6">
                <p className="text-base text-gray-600 text-center mb-3">
                  <span className="font-semibold">Demo Credentials</span>
                </p>
                <div className="flex items-center justify-center gap-3 font-mono text-lg bg-white rounded-xl px-5 py-3 border border-gray-200">
                  <span className="text-gray-700">admin</span>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-700">Admin@123456</span>
                </div>
                <p className="text-sm text-amber-600 text-center mt-3 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Change password after first login
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-base text-gray-500">
              Q-Docs v1.0.0 • Secure Document Management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
