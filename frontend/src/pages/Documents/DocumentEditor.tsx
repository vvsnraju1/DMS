import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Clock, AlertCircle, Download, MessageSquare, CheckCircle } from 'lucide-react';
import { useEditor } from '../../hooks/useEditor';
import { useLockHeartbeat } from '../../hooks/useLockHeartbeat';
import { useAuth } from '../../context/AuthContext';
import CKEditorWrapper from '../../components/Editor/CKEditorWrapper';
import LockIndicator from '../../components/Editor/LockIndicator';
import AutosaveIndicator, { AutosaveStatus } from '../../components/AutosaveIndicator';
import ConflictModal from '../../components/ConflictModal';
import CommentPanel from '../../components/Comments/CommentPanel';
import CommentPopover from '../../components/Comments/CommentPopover';
import commentService from '../../services/comment.service';
import { authService } from '../../services/auth.service';
import { DocumentComment } from '../../types/document';
import { resolveApiBaseUrl } from '@/utils/apiUtils';

export default function DocumentEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const documentId = parseInt(id || '0', 10);
  
  // Use editor hook
  const {
    document,
    version,
    content,
    lockToken,
    isLocked,
    isLockedByMe,
    lockInfo,
    loading,
    saving,
    error,
    saveError,
    loadDocument,
    updateContent,
    saveContent,
    acquireLock,
    releaseLock,
    hasUnsavedChanges,
  } = useEditor({ 
    documentId,
    currentUserId: user?.id 
  });
  
  // Autosave state
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  
  // Conflict modal state
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictInfo, setConflictInfo] = useState<any>(null);
  
  // Comment system state
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showCommentPanel, setShowCommentPanel] = useState(false);
  const [showCommentPopover, setShowCommentPopover] = useState(false);
  const [selectionInfo, setSelectionInfo] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  
  // App alert modal state (replaces browser alerts)
  const [appAlert, setAppAlert] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({ isOpen: false, type: 'info', title: '', message: '' });
  
  const showAppAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAppAlert({ isOpen: true, type, title, message });
  };
  
  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [exportReason, setExportReason] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  
  // Determine if user can comment (Reviewer, Approver, or Admin) but never on Published versions
  const canComment = () => {
    if (!user || !version) return false;

    // Published SOPs are immutable, so comments are locked
    if (version.status === 'Published') return false;

    // Reviewers, Approvers, and Admins can comment
    return user.roles?.includes('Reviewer') || user.roles?.includes('Approver') || user.is_admin;
  };
  
  // Determine if user can see comment panel
  // - Reviewers/Approvers when reviewing (not Draft)
  // - Admins can always see
  // - Authors can see when editing Draft (to address reviewer comments)
  const canSeeComments = () => {
    if (!user) return false;
    
    // Admin can always see comments
    if (user.is_admin || user.roles?.includes('DMS_Admin')) return true;
    
    // Author can see comments when editing their draft (to resolve reviewer comments)
    if (user.roles?.includes('Author') && version?.status === 'Draft') return true;
    
    // Reviewers/Approvers when document is under review or pending approval
    if (canComment() && version?.status !== 'Draft') return true;
    
    return false;
  };
  
  // Lock heartbeat - keeps lock alive every 15 seconds
  useLockHeartbeat({
    documentId: document?.id || null,
    versionId: version?.id || null,
    lockToken,
    enabled: isLockedByMe,
    intervalMs: 15000, // 15 seconds
    extendMinutes: 30, // Extend by 30 minutes
    onError: (error) => {
      console.error('Heartbeat failed:', error);
      // Lock might have expired - try to reacquire
      if (version?.id) {
        acquireLock();
      }
    },
    onSuccess: () => {
      // Lock successfully refreshed
    },
  });
  
  // Check if current user can edit (only Draft status can be edited)
  const canUserEdit = () => {
    if (!user || !version) return false;
    
    // Only Draft versions can be edited
    if (version.status !== 'Draft') {
      return false; // Under Review, Pending Approval, etc. are read-only
    }
    
    // User must be Author or Admin to edit
    return user.roles?.includes('Author') || user.roles?.includes('DMS_Admin');
  };
  
  // Load comments for this version
  const loadComments = async () => {
    if (!document || !version) return;
    
    try {
      setCommentsLoading(true);
      const response = await commentService.list(document.id, version.id, false);
      setComments(response.comments);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };
  
  // Handle text selection for commenting
  const handleTextSelection = () => {
    // Allow comments for:
    // - Reviewers/Approvers in read-only mode (!isLockedByMe)
    // - Admins anytime (even when editing)
    const canAddComment = canComment() && (!isLockedByMe || user?.is_admin);
    
    if (!canAddComment) return;
    
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    
    console.log('Text selected:', selectedText); // Debug log
    
    if (selectedText && selectedText.length > 0) {
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      
      console.log('Selection rect:', rect); // Debug log
      
      if (rect) {
        setSelectionInfo({
          text: selectedText,
          x: rect.left + rect.width / 2,
          y: rect.bottom + window.scrollY,
        });
        setShowCommentPopover(true);
        console.log('Comment popover should show'); // Debug log
      }
    }
  };
  
  // Add a comment
  const handleAddComment = async (commentText: string) => {
    if (!document || !version || !selectionInfo) return;
    
    try {
      await commentService.create(document.id, version.id, {
        comment_text: commentText,
        selected_text: selectionInfo.text,
      });
      
      // Close popover
      setShowCommentPopover(false);
      setSelectionInfo(null);
      
      // Reload comments
      await loadComments();
      
      // Show comment panel if not already shown
      setShowCommentPanel(true);
      
      // Show success message (optional - can be removed if too intrusive)
      console.log('✅ Comment saved successfully');
    } catch (err: any) {
      console.error('Error adding comment:', err);
      showAppAlert('error', 'Comment Error', err.response?.data?.detail || 'Failed to add comment');
      throw err; // Re-throw so CommentPopover can handle it
    }
  };
  
  // Handle comment actions
  const handleCommentClick = (comment: DocumentComment) => {
    console.log('Comment clicked:', comment);
    
    if (!comment.selected_text) {
      console.log('No selected text in comment');
      return;
    }
    
    // Try to find and highlight the text in the document
    try {
      // Clear any existing highlights first
      const existingHighlights = document.querySelectorAll('.comment-highlight');
      existingHighlights.forEach(el => {
        const parent = el.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(el.textContent || ''), el);
          parent.normalize();
        }
      });
      
      // Use window.find to locate the text (works in most browsers)
      if (window.find) {
        // Clear previous selection
        window.getSelection()?.removeAllRanges();
        
        // Find the text
        const found = window.find(comment.selected_text, false, false, true, false, true, false);
        
        if (found) {
          // Get the selection
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            
            // Create a highlight span
            const highlight = document.createElement('span');
            highlight.className = 'comment-highlight';
            highlight.style.backgroundColor = '#FEF3C7'; // yellow-100
            highlight.style.padding = '2px 4px';
            highlight.style.borderRadius = '3px';
            highlight.style.transition = 'all 0.3s ease';
            
            try {
              range.surroundContents(highlight);
              
              // Scroll to the highlight
              highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
              
              // Remove highlight after 3 seconds
              setTimeout(() => {
                const parent = highlight.parentNode;
                if (parent) {
                  parent.replaceChild(document.createTextNode(highlight.textContent || ''), highlight);
                  parent.normalize();
                }
              }, 3000);
            } catch (err) {
              console.log('Could not highlight text:', err);
              // Just scroll to selection
              const rect = range.getBoundingClientRect();
              window.scrollTo({
                top: window.scrollY + rect.top - 100,
                behavior: 'smooth'
              });
            }
          }
        } else {
          console.log('Text not found in document');
          showAppAlert('warning', 'Text Not Found', 'Could not locate the commented text in the document. It may have been edited.');
        }
      } else {
        console.log('window.find not supported');
        showAppAlert('info', 'Not Supported', 'Text highlighting is not supported in this browser.');
      }
    } catch (err) {
      console.error('Error highlighting comment text:', err);
    }
  };
  
  const handleResolveComment = async (commentId: number) => {
    if (!document || !version) return;
    
    try {
      await commentService.resolve(document.id, version.id, commentId);
      await loadComments();
    } catch (err: any) {
      console.error('Error resolving comment:', err);
      showAppAlert('error', 'Resolve Error', err.response?.data?.detail || 'Failed to resolve comment');
    }
  };
  
  const handleDeleteComment = async (commentId: number) => {
    if (!document || !version) return;
    
    try {
      await commentService.delete(document.id, version.id, commentId);
      await loadComments();
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      showAppAlert('error', 'Delete Error', err.response?.data?.detail || 'Failed to delete comment');
    }
  };
  
  const handleEditComment = async (commentId: number, newText: string) => {
    if (!document || !version) return;
    
    try {
      await commentService.update(document.id, version.id, commentId, {
        comment_text: newText,
      });
      await loadComments();
    } catch (err: any) {
      console.error('Error editing comment:', err);
      showAppAlert('error', 'Edit Error', err.response?.data?.detail || 'Failed to edit comment');
    }
  };

  // Try to acquire lock on mount (only if user can edit and version is Draft)
  useEffect(() => {
    if (!version) return;
    
    // Check if user can edit this version
    const canEdit = canUserEdit();
    
    if (canEdit && !isLocked) {
      // User can edit and document not locked - try to acquire
      console.log('Attempting to acquire lock for editing...');
      acquireLock();
    } else if (canEdit && isLocked && !isLockedByMe) {
      // Locked by someone else
      console.log('Document is locked by another user - read-only mode');
    } else if (!canEdit) {
      // User cannot edit (wrong status or insufficient permissions)
      console.log('Document is read-only (status or permissions)');
    }
    // If isLockedByMe is true, we already have the lock
  }, [version?.id, version?.status, isLocked, isLockedByMe, user?.roles]);
  
  // Load comments when version changes
  useEffect(() => {
    if (version) {
      loadComments();
    }
  }, [version?.id]);
  
  // Auto-show comment panel when there are unresolved comments
  useEffect(() => {
    if (comments.length > 0 && canSeeComments()) {
      const hasUnresolved = comments.some(c => !c.is_resolved);
      if (hasUnresolved) {
        setShowCommentPanel(true);
      }
    }
  }, [comments, user?.roles, user?.is_admin]);
  
  // Add text selection listener for commenting
  useEffect(() => {
    // Allow text selection for:
    // - Reviewers/Approvers when NOT editing
    // - Admins anytime (even when editing)
    const shouldEnableSelection = canComment() && (!isLockedByMe || user?.is_admin);
    
    if (!shouldEnableSelection) {
      console.log('Text selection listener NOT added. canComment:', canComment(), 'isLockedByMe:', isLockedByMe, 'isAdmin:', user?.is_admin);
      return;
    }
    
    console.log('Text selection listener ADDED for commenting (Admin:', user?.is_admin, ')');
    
    const handleSelection = () => {
      // Delay to allow selection to complete
      setTimeout(handleTextSelection, 100);
    };
    
    window.document.addEventListener('mouseup', handleSelection);
    
    return () => {
      console.log('Text selection listener REMOVED');
      window.document.removeEventListener('mouseup', handleSelection);
    };
  }, [user?.roles, user?.is_admin, isLockedByMe, version?.id]);
  
  // Autosave effect - every 10 seconds
  useEffect(() => {
    if (!isLockedByMe || !hasUnsavedChanges) {
      return;
    }
    
    const interval = setInterval(async () => {
      try {
        setAutosaveStatus('saving');
        await saveContent(true); // isAutosave = true
        setAutosaveStatus('saved');
        setLastSavedAt(new Date());
      } catch (err: any) {
        // Handle 409 Conflict
        if (err.response?.status === 409) {
          setConflictInfo(err.response?.data);
          setShowConflictModal(true);
        }
        setAutosaveStatus('error');
      }
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval);
  }, [isLockedByMe, hasUnsavedChanges, saveContent]);
  
  // Manual save
  const handleManualSave = async () => {
    if (!isLockedByMe) {
      showAppAlert('warning', 'Cannot Save', 'You must have edit lock to save');
      return;
    }
    
    try {
      setAutosaveStatus('saving');
      await saveContent(false); // isAutosave = false (manual save)
      setAutosaveStatus('saved');
      setLastSavedAt(new Date());
    } catch (err: any) {
      // Handle 409 Conflict
      if (err.response?.status === 409) {
        setConflictInfo(err.response?.data);
        setShowConflictModal(true);
      }
      setAutosaveStatus('error');
    }
  };
  
  // Conflict modal handlers
  const handleRefreshContent = () => {
    setShowConflictModal(false);
    loadDocument(); // Reload the document content
    setAutosaveStatus('idle');
  };
  
  const handleForceOverwrite = async () => {
    setShowConflictModal(false);
    
    // TODO: Implement force overwrite logic
    // This would require a new backend endpoint that accepts a force flag
    showAppAlert('warning', 'Not Implemented', 'Force overwrite not yet implemented. Please refresh and merge changes manually.');
    setAutosaveStatus('idle');
  };
  
  const handleCloseConflictModal = () => {
    setShowConflictModal(false);
    setAutosaveStatus('idle');
  };
  
  // Export as DOCX - show password dialog
  const handleExportDocx = () => {
    if (!document || !version) return;
    setShowExportModal(true);
    setExportPassword('');
    setExportReason('');
  };
  
  // Confirm export with password
  const confirmExport = async () => {
    if (!document || !version) return;

    if (!exportPassword) {
      showAppAlert('error', 'Password Required', 'Please enter your password for e-signature verification.');
      return;
    }

    const token = authService.getToken();
    if (!token) {
      showAppAlert('error', 'Export Failed', 'Session expired. Please log in again.');
      return;
    }

    setExportLoading(true);

    try {
      const url = `${resolveApiBaseUrl()}/documents/${document.id}/versions/${version.id}/export/docx`;
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
        let message = 'Failed to export document.';

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
      link.download = `${document.document_number}_v${version.version_number}.docx`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      showAppAlert('success', 'Export Complete', 'Document exported successfully!');
      setShowExportModal(false);
    } catch (err) {
      console.error('Error exporting DOCX:', err);
      showAppAlert('error', 'Export Failed', err instanceof Error ? err.message : 'Failed to export document');
    } finally {
      setExportLoading(false);
    }
  };
  
  // Handle content change from editor
  const handleContentChange = (newContent: string) => {
    updateContent(newContent);
    if (autosaveStatus === 'saved') {
      setAutosaveStatus('idle'); // Reset to idle when content changes
    }
  };
  
  // Handle back navigation with unsaved changes warning
  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmed) return;
    }
    
    releaseLock();
    navigate('/documents');
  };
  
  // Warn before closing tab/window
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Document</h2>
              <p className="text-red-800 mb-4">{error}</p>
              <button
                onClick={() => navigate('/documents')}
                className="text-red-600 hover:text-red-800 underline"
              >
                Back to Documents
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // No document/version state
  if (!document || !version) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">No Version Available</h2>
          <p className="text-yellow-800 mb-4">
            This document doesn't have any versions yet. Create a draft version first.
          </p>
          <button
            onClick={() => navigate('/documents')}
            className="text-yellow-600 hover:text-yellow-800 underline"
          >
            Back to Documents
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          {/* Left: Back button and title */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{document.title}</h1>
              <p className="text-sm text-gray-500">
                {document.document_number} • Version {version.version_number}
              </p>
            </div>
          </div>
          
          {/* Right: Save button and indicators */}
          <div className="flex items-center gap-3">
            <AutosaveIndicator
              status={autosaveStatus}
              lastSavedAt={lastSavedAt || undefined}
              error={saveError || undefined}
            />
            
            {hasUnsavedChanges && (
              <span className="text-xs text-orange-600 flex items-center gap-1">
                <Clock size={14} />
                Unsaved changes
              </span>
            )}
            
            {canSeeComments() && (
              <button
                onClick={() => setShowCommentPanel(!showCommentPanel)}
                className={`flex items-center gap-2 border px-4 py-2 rounded-lg transition-colors ${
                  showCommentPanel 
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <MessageSquare size={18} />
                Comments ({comments.filter(c => !c.is_resolved).length})
              </button>
            )}
            
            {/* Save button for editing (Admin/Author) */}
            {isLockedByMe && (
              <button
                onClick={handleManualSave}
                disabled={saving || !hasUnsavedChanges}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving Document...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Document
                  </>
                )}
              </button>
            )}
            
            {/* Done button for reviewers (read-only mode) */}
            {!isLockedByMe && canComment() && (
              <button
                onClick={() => navigate(`/documents/${documentId}`)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <CheckCircle size={18} />
                Done Reviewing
              </button>
            )}
            
            <button
              onClick={handleExportDocx}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={18} />
              Export DOCX
            </button>
          </div>
        </div>
        
        {/* Lock indicator */}
        <LockIndicator
          isLocked={isLocked}
          lockedBy={lockInfo?.locked_by}
          lockedById={lockInfo?.locked_by_id}
          lockedAt={lockInfo?.locked_at}
          expiresAt={lockInfo?.expires_at}
          currentUserId={user?.id}
        />
      </div>
      
      {/* Main Content Area with Editor and Comment Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div 
          ref={editorContainerRef}
          className={`flex-1 overflow-auto p-6 transition-all ${
            showCommentPanel ? 'mr-0' : ''
          }`}
        >
          <div className="max-w-5xl mx-auto">
            {isLockedByMe ? (
              <>
                {/* Admin tip for commenting while editing */}
                {user?.is_admin && canComment() && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm">
                      <strong>💡 Tip:</strong> As an admin, you can select text while editing to add comments for reviewers.
                    </p>
                  </div>
                )}
                
                {/* Alert for authors when there are unresolved comments to address */}
                {user?.roles?.includes('Author') && comments.filter(c => !c.is_resolved).length > 0 && (
                  <div className="mb-4 bg-orange-50 border border-orange-300 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-orange-800">
                          ⚠️ {comments.filter(c => !c.is_resolved).length} Comment{comments.filter(c => !c.is_resolved).length > 1 ? 's' : ''} to Address
                        </h3>
                        <p className="text-sm text-orange-700 mt-1">
                          This document was returned with reviewer comments. Please review each comment, make the necessary changes, and click "Resolve" on each comment after addressing it. You cannot resubmit until all comments are resolved.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <CKEditorWrapper
                  initialContent={content}
                  onChange={handleContentChange}
                  placeholder="Start writing your document content here..."
                  disabled={false}
                  minHeight="600px"
                />
              </>
            ) : (
              <>
                {/* Read-only mode */}
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    <strong>Read-Only Mode:</strong>{' '}
                    {version.status !== 'Draft' 
                      ? `This document is "${version.status}" and cannot be edited. ${canComment() ? 'Select text to add comments.' : ''}`
                      : isLocked 
                        ? `This document is locked by ${lockInfo?.locked_by || 'another user'}. You cannot edit it.`
                        : 'You do not have permission to edit this document.'}
                  </p>
                </div>
                <CKEditorWrapper
                  initialContent={content}
                  onChange={() => {}} // No-op for read-only
                  disabled={true}
                  minHeight="600px"
                />
              </>
            )}
          </div>
        </div>
        
        {/* Comment Panel - shown for reviewers, approvers, admins, and authors with comments */}
        {showCommentPanel && canSeeComments() && (
          <div className="w-96 flex-shrink-0">
            <CommentPanel
              comments={comments}
              currentUserId={user?.id}
              isAdmin={user?.is_admin}
              canResolve={user?.is_admin || user?.roles?.includes('Author') || user?.roles?.includes('DMS_Admin')}
              onCommentClick={handleCommentClick}
              onResolve={handleResolveComment}
              onDelete={handleDeleteComment}
              onEdit={handleEditComment}
              loading={commentsLoading}
            />
          </div>
        )}
      </div>
      
      {/* Footer info */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-gray-600">
          <div>
            <strong>Department:</strong> {document.department} • 
            <strong className="ml-2">Status:</strong> {version.status}
          </div>
          <div>
            <strong>Created by:</strong> {version.created_by_username} • 
            <strong className="ml-2">Modified:</strong> {new Date(version.updated_at).toLocaleString()}
          </div>
        </div>
      </div>
      
      {/* Comment Popover */}
      {selectionInfo && (
        <CommentPopover
          isOpen={showCommentPopover}
          position={{ x: selectionInfo.x, y: selectionInfo.y }}
          selectedText={selectionInfo.text}
          onSubmit={handleAddComment}
          onClose={() => {
            setShowCommentPopover(false);
            setSelectionInfo(null);
          }}
        />
      )}
      
      {/* Conflict Resolution Modal */}
      <ConflictModal
        isOpen={showConflictModal}
        onClose={handleCloseConflictModal}
        onRefresh={handleRefreshContent}
        onForceOverwrite={handleForceOverwrite}
        conflictInfo={conflictInfo}
      />
      
      {/* App Alert Modal */}
      {appAlert.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className={`px-6 py-4 ${
              appAlert.type === 'success' ? 'bg-green-50 border-b border-green-200' :
              appAlert.type === 'error' ? 'bg-red-50 border-b border-red-200' :
              appAlert.type === 'warning' ? 'bg-orange-50 border-b border-orange-200' :
              'bg-blue-50 border-b border-blue-200'
            }`}>
              <div className="flex items-center gap-3">
                {appAlert.type === 'success' && (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
                {appAlert.type === 'error' && (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
                {appAlert.type === 'warning' && (
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                )}
                {appAlert.type === 'info' && (
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                )}
                <h3 className={`text-lg font-semibold ${
                  appAlert.type === 'success' ? 'text-green-800' :
                  appAlert.type === 'error' ? 'text-red-800' :
                  appAlert.type === 'warning' ? 'text-orange-800' :
                  'text-blue-800'
                }`}>
                  {appAlert.title}
                </h3>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700">{appAlert.message}</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => setAppAlert({ ...appAlert, isOpen: false })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  appAlert.type === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
                  appAlert.type === 'error' ? 'bg-red-600 text-white hover:bg-red-700' :
                  appAlert.type === 'warning' ? 'bg-orange-600 text-white hover:bg-orange-700' :
                  'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                OK
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
    </div>
  );
}

