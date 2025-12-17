import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  Users,
  FileText,
  LogOut,
  User,
  Menu,
  X,
  CheckSquare,
  ChevronRight,
  ScrollText,
  Shield,
  Sparkles,
  Layers,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

// Q-Docs Logo Component
const QDocsLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-xl' },
    md: { icon: 'w-10 h-10', text: 'text-2xl' },
    lg: { icon: 'w-14 h-14', text: 'text-4xl' },
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizes[size].icon} rounded-xl bg-gradient-to-br from-primary-600 via-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25`}>
        <span className="text-white font-display font-bold text-lg">Q</span>
      </div>
      <div>
        <h1 className={`${sizes[size].text} font-display font-bold tracking-tight`}>
          <span className="bg-gradient-to-r from-primary-600 via-brand-500 to-primary-700 bg-clip-text text-transparent">
            Q-Docs
          </span>
        </h1>
        {size !== 'sm' && (
          <p className="text-xs text-gray-500 font-medium -mt-0.5">Document Management</p>
        )}
      </div>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Check if user can access templates (Author or Admin)
  const canAccessTemplates = user?.roles?.includes('Author') || user?.roles?.includes('DMS_Admin') || isAdmin;

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, show: true },
    { name: 'Pending Tasks', href: '/tasks', icon: CheckSquare, show: true },
    { name: 'Documents', href: '/documents', icon: FileText, show: true },
    { name: 'Templates', href: '/templates', icon: Layers, show: canAccessTemplates },
    { name: 'Users', href: '/users', icon: Users, show: isAdmin },
    { name: 'Audit Logs', href: '/audit-logs', icon: ScrollText, show: isAdmin },
  ].filter(item => item.show);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Get primary role for display
  const getPrimaryRole = () => {
    if (user?.roles.includes('DMS_Admin')) return 'Administrator';
    if (user?.roles.includes('HOD')) return 'Head of Department';
    if (user?.roles.includes('Approver')) return 'Approver';
    if (user?.roles.includes('Reviewer')) return 'Reviewer';
    if (user?.roles.includes('Author')) return 'Author';
    return 'User';
  };

  return (
    <div className="min-h-screen bg-gray-50/50 gradient-mesh">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-20 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
            <QDocsLogo size="md" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <p className="px-4 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
              Main Menu
            </p>
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`nav-link group ${
                    active ? 'nav-link-active' : 'nav-link-inactive'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span className="flex-1">{item.name}</span>
                  {active && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User profile section */}
          <div className="border-t border-gray-100 p-4">
            <button
              type="button"
              onClick={() => {
                navigate('/profile');
                setSidebarOpen(false);
              }}
              className="w-full rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/80 p-4 text-left transition-all hover:shadow-md hover:from-primary-50 hover:to-primary-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 group"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-brand-600 shadow-lg shadow-primary-500/25">
                    <User className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-base font-bold text-gray-900 truncate">
                    {user?.full_name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{getPrimaryRole()}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {user?.roles.slice(0, 3).map((role) => (
                  <span key={role} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-xs font-semibold text-gray-600 shadow-sm">
                    <Shield className="w-3 h-3 text-primary-500" />
                    {role}
                  </span>
                ))}
                {(user?.roles?.length || 0) > 3 && (
                  <span className="px-2 py-0.5 rounded-md bg-white text-xs font-semibold text-gray-500 shadow-sm">
                    +{(user?.roles?.length || 0) - 3}
                  </span>
                )}
              </div>
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full mt-3 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 h-16 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Mobile logo */}
            <div className="lg:hidden">
              <QDocsLogo size="sm" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-semibold text-gray-900">{user?.full_name?.split(' ')[0]}</span>
              </span>
            </div>
            
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-brand-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 animate-fade-in">{children}</main>
        
        {/* Footer */}
        <footer className="px-6 py-4 border-t border-gray-100 bg-white/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-primary-600 to-brand-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">Q</span>
              </div>
              <span className="font-semibold text-gray-700">Q-Docs</span>
              <span className="text-gray-400">v1.0.0</span>
            </div>
            <p className="text-xs text-gray-400">FDA 21 CFR Part 11 Compliance Ready</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
