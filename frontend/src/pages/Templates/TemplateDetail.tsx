import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Upload,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import templateBuilderService from '../../services/templateBuilder.service';
import templateService, { TemplateVersionDetail } from '../../services/template.service';
import CKEditorWrapper from '../../components/Editor/CKEditorWrapper';
import ESignatureModal from '../../components/ESignatureModal';
import ErrorModal from '../../components/ErrorModal';
import { formatISTDateTime } from '../../utils/dateUtils';

export default function TemplateDetail() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const templateIdNum = parseInt(templateId || '0', 10);

  const [template, setTemplate] = useState<any>(null);
  const [latestVersion, setLatestVersion] = useState<TemplateVersionDetail | null>(null);
  const [templateHtml, setTemplateHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [unresolvedComments, setUnresolvedComments] = useState(0);
  
  // Track if reviewer/approver has viewed the template content
  const [hasViewedContent, setHasViewedContent] = useState(() => {
    const viewed = sessionStorage.getItem(`template_viewed_${templateIdNum}`);
    return viewed === 'true';
  });
  
  // Check if user needs to view content before taking action
  const requiresContentView = () => {
    if (!user) return false;
    return user.roles?.includes('Reviewer') || 
           user.roles?.includes('Approver') || 
           user.roles?.includes('DMS_Admin');
  };
  
  // Mark template as viewed
  const markAsViewed = () => {
    setHasViewedContent(true);
    sessionStorage.setItem(`template_viewed_${templateIdNum}`, 'true');
  };
  
  // Error modal state
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    suggestion?: string;
  }>({ isOpen: false, title: '', message: '' });

  // E-Signature modal state
  const [showESignModal, setShowESignModal] = useState(false);
  const [eSignAction, setESignAction] = useState<{
    type: 'submit' | 'approve' | 'reject' | 'publish';
    title: string;
    message: string;
    actionName: string;
    requireComments?: boolean;
    commentsLabel?: string;
  } | null>(null);

  const canEdit = user?.roles?.includes('DMS_Admin') || user?.roles?.includes('Author');
  const canReview = user?.roles?.includes('Reviewer') || user?.roles?.includes('DMS_Admin');
  const canApprove = user?.roles?.includes('Approver') || user?.roles?.includes('DMS_Admin');

  useEffect(() => {
    if (templateIdNum) {
      loadTemplate();
    }
  }, [templateIdNum]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get template from template builder
      let templateData;
      try {
        templateData = await templateBuilderService.getTemplate(templateIdNum);
      } catch (err: any) {
        const templates = await templateService.list({});
        templateData = templates.items.find((t: any) => t.id === templateIdNum);
        if (!templateData) {
          throw new Error('Template not found');
        }
      }

      // Get the latest version
      const versions = await templateService.listVersions(templateIdNum);
      const latestVersionData = versions.items?.[0];

      if (!latestVersionData) {
        throw new Error('No template version found');
      }

      // Get full version details with reviews
      const versionDetail = await templateService.getVersion(templateIdNum, latestVersionData.id);
      setLatestVersion(versionDetail);

      // Count unresolved comments
      const unresolved = versionDetail.reviews?.filter((r: any) => !r.is_resolved).length || 0;
      setUnresolvedComments(unresolved);

      setTemplate({
        ...templateData,
        status: templateData.status || latestVersionData.status,
      });

      // Generate HTML from blocks
      const templateDataObj = templateData.template_data;
      
      if (templateDataObj && templateDataObj.blocks && Array.isArray(templateDataObj.blocks)) {
        const blocks = templateDataObj.blocks;
        if (blocks.length > 0) {
          const htmlContent = blocks
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
            .map((block: any) => block.html || '')
            .filter((html: string) => html && html.trim().length > 0)
            .join('');
          
          if (htmlContent.length > 0) {
            setTemplateHtml(htmlContent);
          } else {
            setTemplateHtml('<p>Template blocks exist but contain no content</p>');
          }
        } else {
          setTemplateHtml('<p>No template blocks found</p>');
        }
      } else {
        setTemplateHtml('<p>No template content available</p>');
      }
    } catch (err: any) {
      console.error('Error loading template:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load template';
      setError(errorMessage);
      setTemplateHtml('<p>Error loading template content</p>');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = () => {
    if (!latestVersion) return;
    
    if (unresolvedComments > 0) {
      setErrorModal({
        isOpen: true,
        title: 'Cannot Submit for Review',
        message: `This template has ${unresolvedComments} unresolved comment(s). You must resolve all comments before resubmitting for review.`,
        suggestion: 'Please open the template editor, review all comments, make necessary changes, and click "Resolve" on each comment after addressing it.',
      });
      return;
    }
    
    setESignAction({
      type: 'submit',
      title: 'Submit for Review',
      message: 'You are about to submit this template for review. You will no longer be able to edit it until it is returned.',
      actionName: 'Submit for Review',
      requireComments: false,
      commentsLabel: 'Comments (Optional)',
    });
    setShowESignModal(true);
  };

  const handleApproveReview = () => {
    if (!latestVersion) return;
    
    if (unresolvedComments > 0) {
      setErrorModal({
        isOpen: true,
        title: 'Cannot Approve Review',
        message: `This template has ${unresolvedComments} unresolved comment(s). Templates with comments cannot be sent to the next workflow step.`,
        suggestion: 'Please use "Request Changes" to send it back to the author for revisions.',
      });
      return;
    }
    
    setESignAction({
      type: 'approve',
      title: 'Approve Review',
      message: 'You are approving the review of this template. It will move to Pending Approval.',
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
      message: 'You are requesting changes to this template. It will be returned to Draft status.',
      actionName: 'Request Changes',
      requireComments: true,
      commentsLabel: 'Required Changes',
    });
    setShowESignModal(true);
  };

  const handleApprove = () => {
    if (!latestVersion) return;
    
    if (unresolvedComments > 0) {
      setErrorModal({
        isOpen: true,
        title: 'Cannot Approve Template',
        message: `This template has ${unresolvedComments} unresolved comment(s). Templates with comments cannot be sent to the next workflow step.`,
        suggestion: 'Please use "Reject" to send it back to the author for revisions.',
      });
      return;
    }
    
    setESignAction({
      type: 'approve',
      title: 'Approve Template',
      message: 'You are approving this template. It will be ready for publication.',
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
      title: 'Reject Template',
      message: 'You are rejecting this template. It will be returned to Draft status.',
      actionName: 'Reject',
      requireComments: true,
      commentsLabel: 'Rejection Reason',
    });
    setShowESignModal(true);
  };

  const handlePublish = () => {
    if (!latestVersion) return;
    
    if (unresolvedComments > 0) {
      setErrorModal({
        isOpen: true,
        title: 'Cannot Publish Template',
        message: `This template has ${unresolvedComments} unresolved comment(s). All comments must be resolved before publishing.`,
        suggestion: 'Please ensure all comments are resolved before attempting to publish.',
      });
      return;
    }
    
    setESignAction({
      type: 'publish',
      title: 'Publish Template',
      message: 'You are about to publish this template. It will become the official version and visible to all users.',
      actionName: 'Publish',
      requireComments: false,
    });
    setShowESignModal(true);
  };

  const handleESignConfirm = async (password: string, comments?: string) => {
    if (!eSignAction || !latestVersion) return;

    setActionLoading(true);
    
    try {
      switch (eSignAction.type) {
        case 'submit':
          await templateService.submitForReview(templateIdNum, latestVersion.id);
          break;
        case 'approve':
          if (latestVersion.status === 'UnderReview') {
            // Approve review - submit for approval
            await templateService.submitForApproval(templateIdNum, latestVersion.id);
          } else {
            // Approve template - publish
            await templateService.approve(templateIdNum, latestVersion.id, { 
              decision: 'Approved', 
              password,
              comment: comments 
            });
          }
          break;
        case 'reject':
          await templateService.approve(templateIdNum, latestVersion.id, { 
            decision: 'Rejected', 
            password,
            comment: comments || 'No reason provided' 
          });
          break;
        case 'publish':
          await templateService.publish(templateIdNum, latestVersion.id);
          break;
      }

      setShowESignModal(false);
      setESignAction(null);
      
      await loadTemplate();
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const canEditTemplate = () => {
    if (!user || !latestVersion) return false;
    return (
      latestVersion.status === 'Draft' &&
      (user.roles.includes('Author') || user.roles.includes('DMS_Admin'))
    );
  };

  const canSubmitForReview = () => {
    if (!user || !latestVersion) return false;
    return (
      latestVersion.status === 'Draft' &&
      (user.roles.includes('Author') || user.roles.includes('DMS_Admin'))
    );
  };

  const canReviewTemplate = () => {
    if (!user || !latestVersion) return false;
    return (
      latestVersion.status === 'UnderReview' &&
      (user.roles.includes('Reviewer') || user.roles.includes('DMS_Admin'))
    );
  };

  const canApproveTemplate = () => {
    if (!user || !latestVersion) return false;
    return (
      latestVersion.status === 'PendingApproval' &&
      (user.roles.includes('Approver') || user.roles.includes('DMS_Admin'))
    );
  };

  const canPublishTemplate = () => {
    if (!user || !latestVersion) return false;
    return (
      latestVersion.status === 'Published' === false && // Not already published
      user.roles.includes('DMS_Admin')
    );
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any; text: string }> = {
      'Draft': { color: 'bg-gray-100 text-gray-800', icon: FileText, text: 'Draft' },
      'UnderReview': { color: 'bg-blue-100 text-blue-800', icon: Send, text: 'Under Review' },
      'PendingApproval': { color: 'bg-yellow-100 text-yellow-800', icon: Send, text: 'Pending Approval' },
      'Published': { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Published' },
      'Rejected': { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' },
    };
    
    const badge = badges[status] || badges['Draft'];
    const Icon = badge.icon;
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${badge.color} flex items-center gap-2`}>
        <Icon size={16} />
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading template...</p>
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!template || !latestVersion) {
    return null;
  }

  const status = template.status || latestVersion.status;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/templates')}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Templates
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">{template.name || 'Template'}</h1>
            <div className="flex items-center gap-4 mt-2">
              {getStatusBadge(status)}
              {template.template_code && (
                <span className="text-sm text-gray-600">Code: {template.template_code}</span>
              )}
              {template.category && (
                <span className="text-sm text-gray-600">Category: {template.category}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unresolved Comments Warning */}
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
              {latestVersion.status === 'Draft' ? (
                <p className="text-sm text-orange-700 mt-1">
                  <strong>HIGH PRIORITY:</strong> This template was returned with reviewer comments. Please open the editor, review all comments, make necessary changes, and resolve each comment. You cannot resubmit until all comments are resolved.
                </p>
              ) : (
                <p className="text-sm text-orange-700 mt-1">
                  This template has comments that need to be addressed. Templates with unresolved comments cannot be sent to the next workflow step. Use "Request Changes" or "Reject" to send it back to the author.
                </p>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        {canEditTemplate() && (
          <button
            onClick={() => navigate(`/templates/${templateIdNum}/edit`)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit size={18} />
            Edit Template
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

        {canReviewTemplate() && (
          <>
            <button
              onClick={handleApproveReview}
              disabled={actionLoading}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle size={18} />
              Approve Review
            </button>
            <button
              onClick={handleRequestChanges}
              disabled={actionLoading}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <XCircle size={18} />
              Request Changes
            </button>
          </>
        )}

        {canApproveTemplate() && (
          <>
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle size={18} />
              Approve
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <XCircle size={18} />
              Reject
            </button>
          </>
        )}

        {canPublishTemplate() && (
          <button
            onClick={handlePublish}
            disabled={actionLoading}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <Upload size={18} />
            Publish
          </button>
        )}

      </div>

      {/* Template Preview in CKEditor */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Eye size={20} />
            Template Preview
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            This is how the template will appear when creating documents. The content will be loaded into CKEditor for editing.
          </p>
        </div>
        
        <div className="p-6">
          <CKEditorWrapper
            initialContent={templateHtml}
            onChange={() => {}} // Read-only preview
            disabled={true}
            placeholder="Template preview will appear here..."
            minHeight="600px"
          />
        </div>
      </div>

      {/* Reviews Section */}
      {latestVersion.reviews && latestVersion.reviews.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Comments</h3>
          <div className="space-y-4">
            {latestVersion.reviews.map((review: any) => (
              <div key={review.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {review.reviewer_full_name || review.reviewer_username || 'Reviewer'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatISTDateTime(review.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template Metadata */}
      {template.template_data?.config && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <p className="text-sm text-gray-900 mt-1">{template.category || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Required Metadata Fields</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {template.template_data.config.required_metadata_fields
                  ?.filter((f: any) => f.required)
                  .map((field: any) => (
                    <span key={field.key} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {field.label}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
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

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        message={errorModal.message}
        suggestion={errorModal.suggestion}
      />
    </div>
  );
}
