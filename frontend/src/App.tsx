import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import SessionInvalidatedModal from './components/SessionInvalidatedModal';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import UserList from './pages/Users/UserList';
import CreateUser from './pages/Users/CreateUser';
import EditUser from './pages/Users/EditUser';
import UserDetail from './pages/Users/UserDetail';
import AuditLogs from './pages/AuditLogs';

// Document pages
import DocumentList from './pages/Documents/DocumentList';
import CreateDocument from './pages/Documents/CreateDocument';
import DocumentEditor from './pages/Documents/DocumentEditor';
import DocumentDetail from './pages/Documents/DocumentDetail';
import PendingTasks from './pages/PendingTasks';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Global session invalidation modal */}
        <SessionInvalidatedModal />
        
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* User management routes (Admin only) */}
          <Route
            path="/users"
            element={
              <ProtectedRoute requireAdmin>
                <Layout>
                  <UserList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/create"
            element={
              <ProtectedRoute requireAdmin>
                <Layout>
                  <CreateUser />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/users/:id"
            element={
              <ProtectedRoute requireAdmin>
                <Layout>
                  <UserDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/users/:id/edit"
            element={
              <ProtectedRoute requireAdmin>
                <Layout>
                  <EditUser />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute requireAdmin>
                <Layout>
                  <AuditLogs />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Pending Tasks */}
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Layout>
                  <PendingTasks />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Account profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Document management routes */}
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <Layout>
                  <DocumentList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateDocument />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/:id/edit"
            element={
              <ProtectedRoute>
                <DocumentEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <DocumentDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;


