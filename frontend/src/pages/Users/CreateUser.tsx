import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '@/services/user.service';
import { UserCreate } from '@/types';
import { ArrowLeft, Save } from 'lucide-react';

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<UserCreate>({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    department: '',
    phone: '',
    role_ids: [],
    is_active: true,
  });

  const roles = [
    { id: 1, name: 'Author' },
    { id: 2, name: 'Reviewer' },
    { id: 3, name: 'Approver' },
    { id: 4, name: 'DMS_Admin' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.role_ids.length === 0) {
      setError('Please select at least one role');
      setLoading(false);
      return;
    }

    try {
      await userService.createUser(formData);
      navigate('/users');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setFormData((prev) => ({
      ...prev,
      role_ids: prev.role_ids.includes(roleId)
        ? prev.role_ids.filter((id) => id !== roleId)
        : [...prev.role_ids, roleId],
    }));
  };

  return (
    <div>
      <button onClick={() => navigate('/users')} className="btn btn-secondary mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Users
      </button>

      <div className="card max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New User</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Username *</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input"
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
            <label className="label">Password *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input"
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">
              Min 8 characters, 1 uppercase, 1 lowercase, 1 digit
            </p>
          </div>

          <div>
            <label className="label">Roles *</label>
            <div className="space-y-2">
              {roles.map((role) => (
                <label key={role.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.role_ids.includes(role.id)}
                    onChange={() => handleRoleToggle(role.id)}
                    className="mr-2"
                  />
                  {role.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="mr-2"
              />
              Active
            </label>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn btn-primary">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Creating...' : 'Create User'}
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
  );
};

export default CreateUser;


