import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userService } from '@/services/user.service';
import { User } from '@/types';
import { ArrowLeft, Edit, Key, UserX, UserCheck, Lock } from 'lucide-react';
import { formatISTDateTime } from '@/utils/dateUtils';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    force_change: true,
  });
  
  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userService.getUserById(Number(id));
        setUser(userData);
      } catch (error) {
        setError('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleActivate = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Activate User',
      message: 'Are you sure you want to activate this user?',
      onConfirm: async () => {
        try {
          await userService.activateUser(Number(id));
          setUser((prev) => prev ? { ...prev, is_active: true } : null);
          setSuccess('User activated successfully');
        } catch (err) {
          setError('Failed to activate user');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const handleDeactivate = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Deactivate User',
      message: 'Are you sure you want to deactivate this user?',
      onConfirm: async () => {
        try {
          await userService.deactivateUser(Number(id));
          setUser((prev) => prev ? { ...prev, is_active: false } : null);
          setSuccess('User deactivated successfully');
        } catch (err) {
          setError('Failed to deactivate user');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await userService.resetPassword(Number(id), passwordData);
      setSuccess('Password reset successfully!');
      setPasswordData({ new_password: '', force_change: true });
      setShowPasswordReset(false);
      // Refresh user data
      const userData = await userService.getUserById(Number(id));
      setUser(userData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 mb-4">{error || 'User not found'}</p>
        <button onClick={() => navigate('/users')} className="btn btn-primary">
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate('/users')} className="btn btn-secondary mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Users
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <div className="card">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                {success}
              </div>
            )}

            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-gray-600">@{user.username}</p>
              </div>
              {user.is_active ? (
                <span className="badge badge-green text-lg px-3 py-1">Active</span>
              ) : (
                <span className="badge badge-red text-lg px-3 py-1">Inactive</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  </div>
                  {user.phone && (
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-gray-900">{user.phone}</p>
                    </div>
                  )}
                  {user.department && (
                    <div>
                      <p className="text-xs text-gray-500">Department</p>
                      <p className="text-gray-900">{user.department}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Account Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="text-gray-900">{user.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-gray-900">{formatISTDateTime(user.created_at)} IST</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-gray-900">{formatISTDateTime(user.updated_at)} IST</p>
                  </div>
                  {user.last_login && (
                    <div>
                      <p className="text-xs text-gray-500">Last Login</p>
                      <p className="text-gray-900">{formatISTDateTime(user.last_login)} IST</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Assigned Roles</h3>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <div key={role.id} className="badge badge-blue text-sm px-3 py-1">
                    {role.name}
                  </div>
                ))}
              </div>
            </div>

            {user.is_temp_password && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ This user must change their password on next login.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/users/${user.id}/edit`)}
                className="btn btn-primary w-full flex items-center justify-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit User
              </button>

              {user.is_active ? (
                <button
                  onClick={handleDeactivate}
                  className="btn btn-secondary w-full flex items-center justify-center"
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Deactivate User
                </button>
              ) : (
                <button
                  onClick={handleActivate}
                  className="btn btn-primary w-full flex items-center justify-center"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Activate User
                </button>
              )}
            </div>
          </div>

          {/* Password Reset Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Management</h3>
            
            {!showPasswordReset ? (
              <button
                onClick={() => setShowPasswordReset(true)}
                className="btn btn-secondary w-full flex items-center justify-center"
              >
                <Lock className="w-4 h-4 mr-2" />
                Reset Password
              </button>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="label">New Password *</label>
                  <input
                    type="password"
                    required
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="input"
                    minLength={8}
                    placeholder="Enter new password"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Min 8 chars, 1 uppercase, 1 lowercase, 1 digit
                  </p>
                </div>

                <div>
                  <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={passwordData.force_change}
                      onChange={(e) => setPasswordData({ ...passwordData, force_change: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm">Force change on next login</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary flex-1">
                    <Key className="w-3 h-3 mr-1" />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordReset(false);
                      setPasswordData({ new_password: '', force_change: true });
                      setError('');
                    }}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {user.is_temp_password && (
              <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                ⚠️ User must change password on next login
              </div>
            )}
          </div>

          <div className="card bg-blue-50 border-blue-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Info</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• User ID: {user.id}</li>
              <li>• Roles: {user.roles.length}</li>
              <li>• Status: {user.is_active ? 'Active' : 'Inactive'}</li>
              <li>• Temp Password: {user.is_temp_password ? 'Yes' : 'No'}</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800">{confirmModal.title}</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700">{confirmModal.message}</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;

