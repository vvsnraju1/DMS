import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { userService } from '@/services/user.service';
import { User } from '@/types';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { formatIST } from '@/utils/dateUtils';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get filters from URL
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || '';
  const isActive = searchParams.get('active');

  const [searchInput, setSearchInput] = useState(search);
  const [roleFilter, setRoleFilter] = useState(role);
  const [activeFilter, setActiveFilter] = useState(isActive);
  
  // Alert/Confirm modal state
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'confirm' | 'error' | 'success';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: 'confirm', title: '', message: '' });

  const pageSize = 20;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const filters: any = { page, page_size: pageSize };
      if (search) filters.search = search;
      if (role) filters.role = role;
      if (isActive !== null) filters.is_active = isActive === 'true';

      const response = await userService.getUsers(filters);
      setUsers(response.users);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, role, isActive]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: any = {};
    if (searchInput) params.search = searchInput;
    if (roleFilter) params.role = roleFilter;
    if (activeFilter) params.active = activeFilter;
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setRoleFilter('');
    setActiveFilter('');
    setSearchParams({});
  };

  const handleActivate = (userId: number) => {
    setAlertModal({
      isOpen: true,
      type: 'confirm',
      title: 'Activate User',
      message: 'Are you sure you want to activate this user?',
      onConfirm: async () => {
        try {
          await userService.activateUser(userId);
          fetchUsers();
          setAlertModal({ isOpen: true, type: 'success', title: 'Success', message: 'User activated successfully' });
        } catch (error) {
          setAlertModal({ isOpen: true, type: 'error', title: 'Error', message: 'Failed to activate user' });
        }
      }
    });
  };

  const handleDeactivate = (userId: number) => {
    setAlertModal({
      isOpen: true,
      type: 'confirm',
      title: 'Deactivate User',
      message: 'Are you sure you want to deactivate this user?',
      onConfirm: async () => {
        try {
          await userService.deactivateUser(userId);
          fetchUsers();
          setAlertModal({ isOpen: true, type: 'success', title: 'Success', message: 'User deactivated successfully' });
        } catch (error) {
          setAlertModal({ isOpen: true, type: 'error', title: 'Error', message: 'Failed to deactivate user' });
        }
      }
    });
  };

  const handleDelete = (userId: number) => {
    setAlertModal({
      isOpen: true,
      type: 'confirm',
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone. Consider deactivating instead.',
      onConfirm: async () => {
        try {
          await userService.deleteUser(userId);
          fetchUsers();
          setAlertModal({ isOpen: true, type: 'success', title: 'Success', message: 'User deleted successfully' });
        } catch (error) {
          setAlertModal({ isOpen: true, type: 'error', title: 'Error', message: 'Failed to delete user' });
        }
      }
    });
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage system users and permissions</p>
        </div>
        <Link to="/users/create" className="btn btn-primary">
          <Plus className="w-5 h-5" />
          Create User
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Username, email, name..."
                  className="input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="label">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input"
              >
                <option value="">All Roles</option>
                <option value="Author">Author</option>
                <option value="Reviewer">Reviewer</option>
                <option value="Approver">Approver</option>
                <option value="DMS_Admin">DMS Admin</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select
                value={activeFilter || ''}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="input"
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="btn btn-primary flex-1">
                <Filter className="w-4 h-4 mr-2" />
                Apply
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn btn-secondary"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* User List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-sm text-gray-500">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <span key={role.id} className="badge badge-blue text-xs">
                              {role.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.is_active ? (
                          <span className="badge badge-green">Active</span>
                        ) : (
                          <span className="badge badge-red">Inactive</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.last_login
                          ? `${formatIST(user.last_login, 'MMM dd, yyyy HH:mm')} IST`
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/users/${user.id}`)}
                            className="text-primary-600 hover:text-primary-900"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/users/${user.id}/edit`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {user.is_active ? (
                            <button
                              onClick={() => handleDeactivate(user.id)}
                              className="text-orange-600 hover:text-orange-900"
                              title="Deactivate"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(user.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Activate"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {(page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, total)} of {total} users
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const params = Object.fromEntries(searchParams.entries());
                    setSearchParams({ ...params, page: String(page - 1) });
                  }}
                  disabled={page === 1}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          const params = Object.fromEntries(searchParams.entries());
                          setSearchParams({ ...params, page: String(pageNum) });
                        }}
                        className={`px-3 py-2 rounded ${
                          page === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    const params = Object.fromEntries(searchParams.entries());
                    setSearchParams({ ...params, page: String(page + 1) });
                  }}
                  disabled={page === totalPages}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Alert/Confirm Modal */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className={`px-6 py-4 border-b ${
              alertModal.type === 'success' ? 'bg-green-50 border-green-200' :
              alertModal.type === 'error' ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-3">
                {alertModal.type === 'success' && (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
                {alertModal.type === 'error' && (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                {alertModal.type === 'confirm' && (
                  <Filter className="w-6 h-6 text-blue-600" />
                )}
                <h3 className={`text-lg font-semibold ${
                  alertModal.type === 'success' ? 'text-green-800' :
                  alertModal.type === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {alertModal.title}
                </h3>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700">{alertModal.message}</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              {alertModal.type === 'confirm' ? (
                <>
                  <button
                    onClick={() => setAlertModal({ ...alertModal, isOpen: false })}
                    className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (alertModal.onConfirm) alertModal.onConfirm();
                    }}
                    className="px-4 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setAlertModal({ ...alertModal, isOpen: false })}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    alertModal.type === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
                    'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;


