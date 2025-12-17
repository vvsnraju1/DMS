import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import templateService, { TemplateVersionDetail, TemplateApproval as TemplateApprovalType } from '../../services/template.service';

export default function TemplateApproval() {
  const navigate = useNavigate();
  const { templateId, versionId } = useParams<{ templateId: string; versionId: string }>();
  const { user } = useAuth();
  const [version, setVersion] = useState<TemplateVersionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<'Approved' | 'Rejected'>('Approved');
  const [comment, setComment] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (templateId && versionId) {
      loadVersion();
    }
  }, [templateId, versionId]);

  const loadVersion = async () => {
    if (!templateId || !versionId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await templateService.getVersion(parseInt(templateId), parseInt(versionId));
      setVersion(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load template version');
      console.error('Error loading version:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim() || !templateId || !versionId) return;

    try {
      setSubmitting(true);
      await templateService.approve(
        parseInt(templateId),
        parseInt(versionId),
        {
          decision,
          comment: comment.trim() || undefined,
          password: password.trim(),
        }
      );
      navigate(`/templates/${templateId}/versions`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit approval');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!version) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Template version not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate(`/templates/${templateId}/versions`)}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Versions
        </button>
        <h1 className="page-title">Approve Template</h1>
        <p className="page-subtitle">
          Version {version.version_number} - Approve or reject this template
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Existing Approvals */}
      {version.approvals && version.approvals.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Previous Approvals</h2>
          <div className="space-y-4">
            {version.approvals.map((approval: TemplateApprovalType) => (
              <div
                key={approval.id}
                className={`border-l-4 pl-4 py-2 ${
                  approval.decision === 'Approved'
                    ? 'border-green-500'
                    : 'border-red-500'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {approval.approver_full_name || approval.approver_username}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(approval.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      approval.decision === 'Approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {approval.decision}
                  </span>
                </div>
                {approval.comment && (
                  <p className="text-gray-700 whitespace-pre-wrap">{approval.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Lock size={20} className="mr-2" />
          E-Signature Required
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Decision */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Decision <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Approved"
                  checked={decision === 'Approved'}
                  onChange={(e) => setDecision(e.target.value as 'Approved')}
                  className="mr-2"
                />
                <CheckCircle size={18} className="text-green-600 mr-1" />
                <span className="text-green-700 font-medium">Approve</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Rejected"
                  checked={decision === 'Rejected'}
                  onChange={(e) => setDecision(e.target.value as 'Rejected')}
                  className="mr-2"
                />
                <XCircle size={18} className="text-red-600 mr-1" />
                <span className="text-red-700 font-medium">Reject</span>
              </label>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Comment {decision === 'Rejected' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required={decision === 'Rejected'}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={decision === 'Rejected' ? 'Please provide a reason for rejection...' : 'Optional comment...'}
            />
          </div>

          {/* Password for E-Signature */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password (E-Signature) <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password to sign"
            />
            <p className="mt-1 text-sm text-gray-500">
              Your password is required for e-signature compliance
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/templates/${templateId}/versions`)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${decision === 'Approved' ? 'btn-primary' : 'btn-danger'}`}
              disabled={submitting || !password.trim() || (decision === 'Rejected' && !comment.trim())}
            >
              {submitting ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : decision === 'Approved' ? (
                <>
                  <CheckCircle size={18} />
                  Approve Template
                </>
              ) : (
                <>
                  <XCircle size={18} />
                  Reject Template
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

