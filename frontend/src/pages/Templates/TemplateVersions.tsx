import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Send, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import templateService, { TemplateVersion } from '../../services/template.service';
import { formatIST } from '../../utils/dateUtils';

export default function TemplateVersions() {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const { user } = useAuth();
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canReview = user?.roles?.includes('Reviewer') || user?.roles?.includes('DMS_Admin');
  const canApprove = user?.roles?.includes('Approver') || user?.roles?.includes('DMS_Admin');
  const canUpload = user?.roles?.includes('Author') || user?.roles?.includes('DMS_Admin');

  useEffect(() => {
    if (templateId) {
      loadVersions();
    }
  }, [templateId]);

  const loadVersions = async () => {
    if (!templateId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await templateService.listVersions(parseInt(templateId));
      setVersions(response.items || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load template versions');
      console.error('Error loading versions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any; text: string }> = {
      'Draft': { color: 'bg-gray-100 text-gray-800', icon: FileText, text: 'Draft' },
      'UnderReview': { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'Under Review' },
      'PendingApproval': { color: 'bg-yellow-100 text-yellow-800', icon: Send, text: 'Pending Approval' },
      'Published': { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Published' },
      'Rejected': { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' },
    };
    
    const badge = badges[status] || badges['Draft'];
    const Icon = badge.icon;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color} flex items-center gap-1`}>
        <Icon size={12} />
        {badge.text}
      </span>
    );
  };

  const handleSubmitForReview = async (versionId: number) => {
    if (!templateId) return;
    
    try {
      await templateService.submitForReview(parseInt(templateId), versionId);
      loadVersions();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit for review');
    }
  };

  const handleSubmitForApproval = async (versionId: number) => {
    if (!templateId) return;
    
    try {
      await templateService.submitForApproval(parseInt(templateId), versionId);
      loadVersions();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit for approval');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => navigate('/templates')}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Templates
        </button>
        <h1 className="page-title">Template Versions</h1>
        <p className="page-subtitle">
          View and manage template versions
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading versions...</p>
        </div>
      ) : versions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No versions found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {versions.map((version) => (
                  <tr key={version.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Version {version.version_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(version.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {version.created_by_username || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatIST(version.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/templates/${templateId}/versions/${version.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye size={18} />
                        </button>
                        {version.status === 'Draft' && canUpload && (
                          <button
                            onClick={() => handleSubmitForReview(version.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Submit for Review"
                          >
                            <Send size={18} />
                          </button>
                        )}
                        {version.status === 'UnderReview' && canReview && (
                          <button
                            onClick={() => navigate(`/templates/${templateId}/versions/${version.id}/review`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Add Review Comment"
                          >
                            <Send size={18} />
                          </button>
                        )}
                        {version.status === 'UnderReview' && canReview && (
                          <button
                            onClick={() => handleSubmitForApproval(version.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Submit for Approval"
                          >
                            <Send size={18} />
                          </button>
                        )}
                        {version.status === 'PendingApproval' && canApprove && (
                          <button
                            onClick={() => navigate(`/templates/${templateId}/versions/${version.id}/approve`)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve/Reject"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


