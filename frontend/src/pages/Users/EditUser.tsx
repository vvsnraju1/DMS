import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userService } from '@/services/user.service';
import { User, UserUpdate } from '@/types';
import { ArrowLeft, Save, Key } from 'lucide-react';
import { formatISTDateTime } from '@/utils/dateUtils';

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  const [formData, setFormData] = useState<UserUpdate>({
    email: '',
    first_name: '',
    last_name: '',
    department: '',
    phone: '',
    role_ids: [],
    is_active: true,
  });

  const [passwordData, setPasswordData] = useState({
    new_password: '',
    force_change: true,
  });

  const roles = [
    { id: 1, name: 'Author' },
    { id: 2, name: 'Reviewer' },
    { id: 3, name: 'Approver' },
    { id: 4, name: 'DMS_Admin' },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userService.getUserById(Number(id));
        setUser(userData);
        setFormData({
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          department: userData.department || '',
          phone: userData.phone || '',
          role_ids: userData.roles.map((r) => r.id),
          is_active: userData.is_active,
        });
      } catch (error) {
        setError('Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    if (!formData.role_ids || formData.role_ids.length === 0) {
      setError('Please select at least one role');
      setSaving(false);
      return;
    }

    try {
      await userService.updateUser(Number(id), formData);
      setSuccess('User updated successfully!');
      setTimeout(() => {
        navigate('/users');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user');
    } finally {
      setSaving(false);
    }
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
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password');
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setFormData((prev) => ({
      ...prev,
      role_ids: prev.role_ids?.includes(roleId)
        ? prev.role_ids.filter((id) => id !== roleId)
        : [...(prev.role_ids || []), roleId],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">User not found</p>
        <button onClick={() => navigate('/users')} className="btn btn-primary mt-4">
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
        {/* Main Edit Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Edit User: {user.username}
            </h1>

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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Username (Read-only)</label>
                  <input
                    type="text"
                    value={user.username}
                    disabled
                    className="input bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">Roles *</label>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={formData.role_ids?.includes(role.id)}
                        onChange={() => handleRoleToggle(role.id)}
                        className="mr-3 h-4 w-4"
                      />
                      <span className="font-medium">{role.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-3 h-4 w-4"
                  />
                  <span className="font-medium">Active Account</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="submit" disabled={saving} className="btn btn-primary">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/users')}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar - User Info & Password Reset */}
        <div className="space-y-6">
          {/* User Info Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">User ID</p>
                <p className="text-gray-900 font-medium">{user.id}</p>
              </div>
              <div>
                <p className="text-gray-500">Created</p>
                <p className="text-gray-900">{formatISTDateTime(user.created_at)} IST</p>
              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p className="text-gray-900">{formatISTDateTime(user.updated_at)} IST</p>
              </div>
              {user.last_login && (
                <div>
                  <p className="text-gray-500">Last Login</p>
                  <p className="text-gray-900">{formatISTDateTime(user.last_login)} IST</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Status</p>
                {user.is_active ? (
                  <span className="badge badge-green">Active</span>
                ) : (
                  <span className="badge badge-red">Inactive</span>
                )}
              </div>
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
                <Key className="w-4 h-4 mr-2" />
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
                  <label className="flex items-center cursor-pointer">
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
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordReset(false);
                      setPasswordData({ new_password: '', force_change: true });
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
                User must change password on next login
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUser;

