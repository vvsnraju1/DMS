import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, FileText, Calendar, User, Eye, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import documentService from '../../services/document.service';
import { Document } from '../../types/document';
import { formatIST } from '../../utils/dateUtils';

export default function DocumentList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user can create documents (Admin or Author)
  const canCreateDocuments = user?.roles?.includes('DMS_Admin') || user?.roles?.includes('Author');
  
  // Filters - Only Published documents shown here
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const pageSize = 10;

  // Load documents - ONLY Published documents
  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await documentService.list({
        skip: (currentPage - 1) * pageSize,
        limit: pageSize,
        search: searchQuery || undefined,
        department: departmentFilter || undefined,
        status: 'Published', // Always filter by Published only
      });
      
      setDocuments(response.items || []);
      setTotalPages(response.pages || 1);
      setTotalDocs(response.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load documents');
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load on mount and filter changes
  useEffect(() => {
    loadDocuments();
  }, [currentPage, searchQuery, departmentFilter]);

  // Handle search with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Draft': 'bg-gray-200 text-gray-800',
      'Under Review': 'bg-blue-200 text-blue-800',
      'Pending Approval': 'bg-yellow-200 text-yellow-800',
      'Published': 'bg-green-200 text-green-800',
      'Archived': 'bg-red-200 text-red-800',
    };
    return colors[status] || 'bg-gray-200 text-gray-800';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Published Documents</h1>
          <p className="text-gray-600 mt-1">
            Official SOP documents approved for use
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ClipboardList size={20} />
            Pending Tasks
          </button>
          {canCreateDocuments && (
            <button
              onClick={() => navigate('/documents/create')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Create Document
            </button>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-green-900">Official Published Documents</h3>
            <p className="text-sm text-green-800 mt-1">
              This page shows <strong>only published</strong> SOP documents that are official and approved for use.
              Documents in draft, review, or approval stages appear in the <strong>Pending Tasks</strong> page based on your role.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title or doc number..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">All Departments</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Production">Production</option>
              <option value="Research & Development">Research & Development</option>
              <option value="Quality Control">Quality Control</option>
              <option value="Regulatory Affairs">Regulatory Affairs</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || departmentFilter) && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchQuery && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="ml-2 hover:text-blue-900">×</button>
              </span>
            )}
            {departmentFilter && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Dept: {departmentFilter}
                <button onClick={() => setDepartmentFilter('')} className="ml-2 hover:text-blue-900">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setDepartmentFilter('');
              }}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      {!loading && documents && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {documents.length} of {totalDocs} documents
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading documents...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadDocuments}
            className="text-red-600 hover:text-red-800 text-sm mt-2 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && documents && documents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No published documents found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || departmentFilter
              ? 'Try adjusting your filters'
              : 'No documents have been published yet'}
          </p>
          {canCreateDocuments && !searchQuery && !departmentFilter && (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => navigate('/documents/create')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create New Document
              </button>
              <button
                onClick={() => navigate('/tasks')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View Pending Tasks →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Documents Table */}
      {!loading && !error && documents && documents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/documents/${doc.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <FileText className="text-gray-400 mr-3 mt-1" size={20} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                        <div className="text-sm text-gray-500">{doc.document_number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{doc.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{doc.version_count || 0} version(s)</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar size={14} className="mr-1" />
                      {formatIST(doc.created_at)} IST
                    </div>
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                      <User size={12} className="mr-1" />
                      {doc.owner_full_name || doc.owner_username || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/documents/${doc.id}`);
                      }}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-900 font-medium"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

