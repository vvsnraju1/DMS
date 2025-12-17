import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Archive,
  Eye,
  Upload,
  Download,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import documentService from '../../services/document.service';
import versionService from '../../services/version.service';
import commentService from '../../services/comment.service';
import { authService } from '../../services/auth.service';
import AttachmentManager from '../../components/AttachmentManager';
import ESignatureModal from '../../components/ESignatureModal';
import ErrorModal from '../../components/ErrorModal';
import CreateNewVersionDialog from '../../components/CreateNewVersionDialog';
import { Document as DmsDocument, DocumentVersion } from '../../types/document';
import { formatISTDateTime } from '../../utils/dateUtils';
import { resolveApiBaseUrl } from '@/utils/apiUtils';

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const documentId = parseInt(id || '0', 10);

  const [document, setDocument] = useState<DmsDocument | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [latestVersion, setLatestVersion] = useState<DocumentVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [unresolvedComments, setUnresolvedComments] = useState(0);
  
  // Track if reviewer/approver has viewed the document content
  const [hasViewedContent, setHasViewedContent] = useState(() => {
    // Check sessionStorage for this document
    const viewed = sessionStorage.getItem(`doc_viewed_${documentId}`);
    return viewed === 'true';
  });
  
  // Check if user needs to view content before taking action (Reviewer, Approver, or HOD)
  const requiresContentView = () => {
    if (!user) return false;
    return user.roles?.includes('Reviewer') || 
           user.roles?.includes('Approver') || 
           user.roles?.includes('HOD');
  };
  
  // Mark document as viewed and persist to sessionStorage
  const markAsViewed = () => {
    setHasViewedContent(true);
    sessionStorage.setItem(`doc_viewed_${documentId}`, 'true');
  };
  
  // Error modal state
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    suggestion?: string;
  }>({ isOpen: false, title: '', message: '' });

  // Success modal state
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    versionString?: string;
  }>({ isOpen: false, title: '', message: '' });

  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [exportReason, setExportReason] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const handleExportDocx = () => {
    if (!document || !latestVersion) return;
    // Show password dialog
    setShowExportModal(true);
    setExportPassword('');
    setExportReason('');
  };

  const confirmExport = async () => {
    if (!document || !latestVersion) return;
    
    if (!exportPassword) {
      setErrorModal({
        isOpen: true,
        title: 'Password Required',
        message: 'Please enter your password for e-signature verification.',
      });
      return;
    }

    const token = authService.getToken();
    if (!token) {
      setErrorModal({
        isOpen: true,
        title: 'Session Expired',
        message: 'Please sign in again before exporting the document.',
        suggestion: 'Log out and log back in, then retry the export.',
      });
      return;
    }

    setExportLoading(true);

    try {
      const url = `${resolveApiBaseUrl()}/documents/${document.id}/versions/${latestVersion.id}/export/docx`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
        body: JSON.stringify({
          password: exportPassword,
          reason: exportReason || undefined
        })
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let message = 'Failed to export document. Please try again.';

        if (contentType?.includes('application/json')) {
          const data = await response.json();
          message = data.detail || message;
        } else {
          const text = await response.text();
          if (text) message = text;
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = `${document.document_number}_v${latestVersion.version_number}.docx`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      // Close modal on success
      setShowExportModal(false);
    } catch (err) {
      console.error('Document export failed:', err);
      setErrorModal({
        isOpen: true,
        title: 'Export Failed',
        message: err instanceof Error ? err.message : 'Failed to export document. Please try again.',
        suggestion: 'Check your password and try again.',
      });
    } finally {
      setExportLoading(false);
    }
  };
  
  // E-Signature modal state
  const [showESignModal, setShowESignModal] = useState(false);
  const [eSignAction, setESignAction] = useState<{
    type: 'submit' | 'approve' | 'reject' | 'publish' | 'archive';
    title: string;
    message: string;
    actionName: string;
    requireComments?: boolean;
    commentsLabel?: string;
  } | null>(null);

  // Create New Version dialog state
  const [showCreateVersionDialog, setShowCreateVersionDialog] = useState(false);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);

      const doc = await documentService.getById(documentId);
      setDocument(doc);

      const vers = await versionService.listByDocument(documentId);
      setVersions(vers);
      if (vers.length > 0) {
        setLatestVersion(vers[0]); // Already sorted desc
        
        // Load comments to check for unresolved ones
        try {
          const commentsResponse = await commentService.list(documentId, vers[0].id, false);
          const unresolved = commentsResponse.comments.filter((c: any) => !c.is_resolved).length;
          setUnresolvedComments(unresolved);
        } catch (commentErr) {
          console.error('Error loading comments:', commentErr);
          setUnresolvedComments(0);
        }
      }
    } catch (err: any) {
      console.error('Error loading document:', err);
      setError(err.response?.data?.detail || 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  // Reload when window regains focus (e.g., returning from editor)
  useEffect(() => {
    const handleFocus = () => {
      loadDocument();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [documentId]);

  const handleSubmitForReview = () => {
    if (!latestVersion) return;
    
    // Block if there are unresolved comments - author must resolve all before resubmitting
    if (unresolvedComments > 0) {
      setErrorModal({
        isOpen: true,
        title: 'Cannot Submit for Review',
        message: `This document has ${unresolvedComments} unresolved comment(s). You must resolve all comments before resubmitting for review.`,
        suggestion: 'Please open the document editor, review all comments, make necessary changes, and click "Resolve" on each comment after addressing it.',
      });
      return;
    }
    
    setESignAction({
      type: 'submit',
      title: 'Submit for Review',
      message: 'You are about to submit this document for review. You will no longer be able to edit it until it is returned.',
      actionName: 'Submit for Review',
      requireComments: false,
      commentsLabel: 'Comments (Optional)',
    });
    setShowESignModal(true);
  };

  const handleESignConfirm = async (password: string, comments?: string) => {
    if (!eSignAction || !latestVersion) return;

    setActionLoading(true);
    
    try {
      switch (eSignAction.type) {
        case 'submit':
          await versionService.submitForReview(documentId, latestVersion.id, { password, comments });
          break;
        case 'approve':
          await versionService.approve(documentId, latestVersion.id, { password, comments });
          break;
        case 'reject':
          await versionService.reject(documentId, latestVersion.id, { password, comments: comments || 'No reason provided' });
          break;
        case 'publish':
          await versionService.publish(documentId, latestVersion.id, { password });
          break;
        case 'archive':
          await versionService.archive(documentId, latestVersion.id, { password });
          break;
      }

      // Action succeeded - close modal FIRST before reloading
      setShowESignModal(false);
      setESignAction(null);
      
      // Then reload document (this won't affect modal if it fails)
      try {
        await loadDocument();
      } catch (reloadErr) {
        console.error('Error reloading document after action:', reloadErr);
        // Don't throw - action already succeeded
      }
    } catch (err) {
      // Re-throw so modal can show the error
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveReview = () => {
    if (!latestVersion) return;
    
    // Block if there are unresolved comments
    if (unresolvedComments > 0) {
      setErrorModal({
        isOpen: true,
        title: 'Cannot Approve Document',
        message: `This document has ${unresolvedComments} unresolved comment(s). Documents with comments cannot be sent to the next workflow step.`,
        suggestion: 'Please use "Request Changes" to send it back to the author for revisions.',
      });
      return;
    }
    
    setESignAction({
      type: 'approve',
      title: 'Approve Review',
      message: 'You are approving the review of this document. It will move to Pending Approval.',
      actionName: 'Approve Review',
      requireComments: false,
      commentsLabel: 'Review Comments (Optional)',
    });
    setShowESignModal(true);
  };

  const handleRequestChanges = () => {
    if (!latestVersion) return;
    
    setESignAction({
      type: 'reject',
      title: 'Request Changes',
      message: 'You are requesting changes to this document. It will be returned to Draft status.',
      actionName: 'Request Changes',
      requireComments: true,
      commentsLabel: 'Required Changes',
    });
    setShowESignModal(true);
  };

  const handleApprove = () => {
    if (!latestVersion) return;
    
    // Block if there are unresolved comments
    if (unresolvedComments > 0) {
      setErrorModal({
        isOpen: true,
        title: 'Cannot Approve Document',
        message: `This document has ${unresolvedComments} unresolved comment(s). Documents with comments cannot be sent to the next workflow step.`,
        suggestion: 'Please use "Reject" to send it back to the author for revisions.',
      });
      return;
    }
    
    setESignAction({
      type: 'approve',
      title: 'Approve Document',
      message: 'You are approving this document. It will be ready for publication.',
      actionName: 'Approve',
      requireComments: false,
      commentsLabel: 'Approval Comments (Optional)',
    });
    setShowESignModal(true);
  };

  const handleReject = () => {
    if (!latestVersion) return;
    
    setESignAction({
      type: 'reject',
      title: 'Reject Document',
      message: 'You are rejecting this document. It will be returned to Draft status.',
      actionName: 'Reject',
      requireComments: true,
      commentsLabel: 'Rejection Reason',
    });
    setShowESignModal(true);
  };

  const handlePublish = () => {
    if (!latestVersion) return;
    
    // Block if there are unresolved comments
    if (unresolvedComments > 0) {
      setErrorModal({
        isOpen: true,
        title: 'Cannot Publish Document',
        message: `This document has ${unresolvedComments} unresolved comment(s). All comments must be resolved before publishing.`,
        suggestion: 'Please ensure all comments are resolved before attempting to publish.',
      });
      return;
    }
    
    setESignAction({
      type: 'publish',
      title: 'Publish Document',
      message: 'You are about to publish this document. It will become the official version and visible to all users.',
      actionName: 'Publish',
      requireComments: false,
    });
    setShowESignModal(true);
  };

  const handleArchive = () => {
    if (!latestVersion) return;
    
    setESignAction({
      type: 'archive',
      title: 'Archive Document',
      message: 'You are archiving this document. It will be marked as obsolete.',
      actionName: 'Archive',
      requireComments: false,
    });
    setShowESignModal(true);
  };

  const handleCreateNewVersion = async (data: { change_reason: string; change_type: 'Minor' | 'Major' }) => {
    if (!latestVersion) return;

    setActionLoading(true);
    try {
      const newVersion = await versionService.createNewVersion(
        documentId,
        latestVersion.id,
        {
          change_reason: data.change_reason,
          change_type: data.change_type
        }
      );

      // Close dialog
      setShowCreateVersionDialog(false);

      // Reload document to show new version
      await loadDocument();

      // Show success confirmation
      setSuccessModal({
        isOpen: true,
        title: 'New Version Created Successfully',
        message: `A new draft version ${newVersion.version_string || `v${newVersion.version_number}`} has been created from ${latestVersion.version_string || `v${latestVersion.version_number}`}.`,
        versionString: newVersion.version_string || `v${newVersion.version_number}`
      });
    } catch (err: any) {
      console.error('Error creating new version:', err);
      setErrorModal({
        isOpen: true,
        title: 'Failed to Create New Version',
        message: err.response?.data?.detail || 'An error occurred while creating the new version.',
        suggestion: 'Please try again or contact support if the issue persists.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const canEdit = () => {
    if (!user || !latestVersion) return false;
    // Can edit if DRAFT and (Author or Admin)
    return (
      latestVersion.status === 'DRAFT' &&
      (user.roles.includes('Author') || user.roles.includes('DMS_Admin'))
    );
  };

  const canSubmitForReview = () => {
    if (!user || !latestVersion) return false;
    return (
      latestVersion.status === 'DRAFT' &&
      (user.roles.includes('Author') || user.roles.includes('DMS_Admin'))
    );
  };

  const canReview = () => {
    if (!user || !latestVersion) return false;
    return (
      latestVersion.status === 'UNDER_REVIEW' &&
      (user.roles.includes('Reviewer') || user.roles.includes('DMS_Admin'))
    );
  };

  const canApprove = () => {
    if (!user || !latestVersion) return false;
    return (
      latestVersion.status === 'PENDING_APPROVAL' &&
      (user.roles.includes('Approver') || user.roles.includes('DMS_Admin'))
    );
  };

  const canPublish = () => {
    if (!user || !latestVersion) return false;
    return (
      latestVersion.status === 'APPROVED' &&
      user.roles.includes('DMS_Admin')
    );
  };

  const canCreateNewVersion = () => {
    if (!user || !latestVersion || !document) return false;
    // Can create new version from EFFECTIVE documents
    // Requires Author (owner) or Admin
    return (
      latestVersion.status === 'EFFECTIVE' &&
      (user.roles.includes('Author') || user.roles.includes('DMS_Admin'))
    );
  };

  const canArchive = () => {
    if (!user) return false;
    return user.roles.includes('DMS_Admin');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'DRAFT': 'bg-gray-200 text-gray-800',
      'UNDER_REVIEW': 'bg-blue-200 text-blue-800',
      'PENDING_APPROVAL': 'bg-yellow-200 text-yellow-800',
      'APPROVED': 'bg-purple-200 text-purple-800',
      'EFFECTIVE': 'bg-green-200 text-green-800',
      'REJECTED': 'bg-red-300 text-red-900',
      'OBSOLETE': 'bg-gray-300 text-gray-600',
      'ARCHIVED': 'bg-red-200 text-red-800',
    };
    return colors[status] || 'bg-gray-200 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading document...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="text-red-500" size={32} />
          </div>
          <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Document</h2>
          <p className="text-red-700 mb-6">{error || 'Document not found'}</p>
          <button
            onClick={() => navigate('/documents')}
            className="btn btn-primary"
          >
            <ArrowLeft size={18} />
            Back to Documents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/documents')}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Documents
        </button>

        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-brand-600 flex items-center justify-center shadow-lg shadow-primary-500/25 flex-shrink-0">
              <FileText className="text-white" size={28} />
            </div>
            <div>
              <h1 className="page-title mb-1">{document.title}</h1>
              <p className="text-gray-500 font-medium">{document.document_number}</p>
            </div>
          </div>
          {latestVersion && (
            <span
              className={`px-4 py-2 rounded-xl text-sm font-bold ${getStatusColor(
                latestVersion.status
              )}`}
            >
              {latestVersion.status}
            </span>
          )}
        </div>
      </div>

      {/* Unresolved Comments Warning - different messages for different roles */}
      {unresolvedComments > 0 && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-orange-800">
                ⚠️ {unresolvedComments} Unresolved Comment{unresolvedComments > 1 ? 's' : ''}
              </h3>
              {latestVersion?.status === 'DRAFT' ? (
                <p className="text-sm text-orange-700 mt-1">
                  <strong>HIGH PRIORITY:</strong> This document was returned with reviewer comments. Please open the editor, review all comments, make necessary changes, and resolve each comment. You cannot resubmit until all comments are resolved.
                </p>
              ) : (
                <p className="text-sm text-orange-700 mt-1">
                  This document has comments that need to be addressed. Documents with unresolved comments cannot be sent to the next workflow step. Use "Request Changes" or "Reject" to send it back to the author.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Warning: Must View Content Before Action */}
      {requiresContentView() && !hasViewedContent && (canReview() || canApprove()) && (
        <div className="mb-6 bg-blue-50 border border-blue-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Eye className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-800">
                📖 Document Review Required
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                You must <strong>read the entire document</strong> before you can approve or reject it.
                Click "View Content" below to open and review the document. The approve/reject buttons will be enabled after you view the content.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        {canEdit() && (
          <button
            onClick={() => navigate(`/documents/${documentId}/edit`)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit size={18} />
            Edit Document
          </button>
        )}

        {canSubmitForReview() && (
          <button
            onClick={handleSubmitForReview}
            disabled={actionLoading}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
            Submit for Review
          </button>
        )}

        {canReview() && (
          <>
            <button
              onClick={handleApproveReview}
              disabled={actionLoading || (requiresContentView() && !hasViewedContent)}
              title={requiresContentView() && !hasViewedContent ? 'You must view the document content first' : ''}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle size={18} />
              Approve Review
            </button>
            <button
              onClick={handleRequestChanges}
              disabled={actionLoading || (requiresContentView() && !hasViewedContent)}
              title={requiresContentView() && !hasViewedContent ? 'You must view the document content first' : ''}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <XCircle size={18} />
              Request Changes
            </button>
          </>
        )}

        {canApprove() && (
          <>
            <button
              onClick={handleApprove}
              disabled={actionLoading || (requiresContentView() && !hasViewedContent)}
              title={requiresContentView() && !hasViewedContent ? 'You must view the document content first' : ''}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle size={18} />
              Approve
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading || (requiresContentView() && !hasViewedContent)}
              title={requiresContentView() && !hasViewedContent ? 'You must view the document content first' : ''}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <XCircle size={18} />
              Reject
            </button>
          </>
        )}

        {canPublish() && (
          <button
            onClick={handlePublish}
            disabled={actionLoading}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <Upload size={18} />
            Publish
          </button>
        )}

        {canCreateNewVersion() && (
          <button
            onClick={() => setShowCreateVersionDialog(true)}
            disabled={actionLoading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <FileText size={18} />
            Create New Version
          </button>
        )}

        {canArchive() && latestVersion?.status !== 'Archived' && (
          <button
            onClick={handleArchive}
            disabled={actionLoading}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <Archive size={18} />
            Archive
          </button>
        )}

        <button
          onClick={async () => {
            // Mark as viewed in backend (for validation)
            if (latestVersion) {
              try {
                await versionService.markAsViewed(documentId, latestVersion.id);
              } catch (err) {
                console.warn('Failed to mark document as viewed:', err);
              }
            }
            // Also mark in sessionStorage (for frontend UI)
            markAsViewed();
            navigate(`/documents/${documentId}/edit`);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            requiresContentView() && !hasViewedContent
              ? 'bg-blue-600 text-white hover:bg-blue-700 animate-pulse'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Eye size={18} />
          {requiresContentView() && !hasViewedContent ? '📖 View Content (Required)' : 'View Content'}
        </button>

        {latestVersion && (
          <button
            onClick={handleExportDocx}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            Export DOCX
          </button>
        )}
      </div>

      {/* Document Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Metadata */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Department</dt>
              <dd className="mt-1 text-sm text-gray-900">{document.department || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{document.description || 'No description'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Owner</dt>
              <dd className="mt-1 text-sm text-gray-900">{document.owner_full_name || document.owner_username || 'Unknown'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatISTDateTime(document.created_at)} IST
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatISTDateTime(document.updated_at)} IST
              </dd>
            </div>
          </dl>
        </div>

        {/* Current Version */}
        {latestVersion && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Version</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Version Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{latestVersion.version_number}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(latestVersion.status)}`}>
                    {latestVersion.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Change Summary</dt>
                <dd className="mt-1 text-sm text-gray-900">{latestVersion.change_summary || 'No summary'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created By</dt>
                <dd className="mt-1 text-sm text-gray-900">Version {latestVersion.version_number}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Modified</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatISTDateTime(latestVersion.updated_at)} IST
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {/* Version History */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Version History</h2>
        {versions.length === 0 ? (
          <p className="text-gray-600">No versions yet.</p>
        ) : (
          <div className="space-y-3">
            {versions.map((version: DocumentVersion) => (
              <div
                key={version.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <FileText size={24} className="text-gray-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Version {version.version_number}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatISTDateTime(version.created_at)} IST
                    </div>
                    {version.change_summary && (
                      <div className="text-sm text-gray-500 mt-1">{version.change_summary}</div>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(version.status)}`}>
                  {version.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attachments */}
      {latestVersion && (
        <AttachmentManager 
          versionId={latestVersion.id} 
          canEdit={canEdit()} 
        />
      )}

      {/* E-Signature Modal */}
      {eSignAction && (
        <ESignatureModal
          isOpen={showESignModal}
          onClose={() => {
            setShowESignModal(false);
            setESignAction(null);
          }}
          onConfirm={handleESignConfirm}
          title={eSignAction.title}
          message={eSignAction.message}
          actionName={eSignAction.actionName}
          requireComments={eSignAction.requireComments}
          commentsLabel={eSignAction.commentsLabel}
        />
      )}

      {/* Error Modal for comment blocking */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        message={errorModal.message}
        suggestion={errorModal.suggestion}
      />

      {/* Success Modal for New Version Creation */}
      {successModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 bg-green-50 border-b border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">
                  {successModal.title}
                </h3>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700 mb-2">{successModal.message}</p>
              {successModal.versionString && (
                <p className="text-sm text-gray-600">
                  <strong>New Version:</strong> {successModal.versionString}
                </p>
              )}
              <p className="text-sm text-gray-600 mt-2">
                You will be redirected to the editor to start editing the new draft version.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSuccessModal({ ...successModal, isOpen: false });
                  // Navigate to editor for the new draft version
                  navigate(`/documents/${documentId}/edit`);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                <Edit size={16} />
                Open Editor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export DOCX Modal with E-Signature */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Export Document as DOCX
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Please enter your password to confirm this export. This action will be logged for audit compliance.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={exportPassword}
                    onChange={(e) => setExportPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Export (Optional)
                  </label>
                  <input
                    type="text"
                    value={exportReason}
                    onChange={(e) => setExportReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Offline review, Printing"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-amber-800">
                  <strong>E-Signature Notice:</strong> By entering your password, you are electronically signing this export action. 
                  Your identity, timestamp, and reason will be recorded in the audit trail per FDA 21 CFR Part 11 requirements.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
                disabled={exportLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmExport}
                disabled={exportLoading || !exportPassword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {exportLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Export DOCX
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Version Dialog */}
      {showCreateVersionDialog && latestVersion && (
        <CreateNewVersionDialog
          isOpen={showCreateVersionDialog}
          onClose={() => setShowCreateVersionDialog(false)}
          onSubmit={handleCreateNewVersion}
          currentVersionString={latestVersion.version_string || `v${latestVersion.version_number}`}
        />
      )}
    </div>
  );
}

