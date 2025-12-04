import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import documentService from '../services/document.service';
import versionService from '../services/version.service';
import lockService from '../services/lock.service';
import { Document, DocumentVersion } from '../types/document';

interface UseEditorOptions {
  documentId: number;
  currentUserId?: number;
  autoLoad?: boolean;
}

interface UseEditorReturn {
  // Data
  document: Document | null;
  version: DocumentVersion | null;
  content: string;
  
  // Lock state
  lockToken: string | null;
  isLocked: boolean;
  isLockedByMe: boolean;
  lockInfo: any;
  
  // Loading states
  loading: boolean;
  saving: boolean;
  
  // Error states
  error: string | null;
  saveError: string | null;
  
  // Actions
  loadDocument: () => Promise<void>;
  updateContent: (newContent: string) => void;
  saveContent: (isAutosave?: boolean) => Promise<void>;
  acquireLock: () => Promise<boolean>;
  releaseLock: () => Promise<void>;
  
  // Helpers
  hasUnsavedChanges: boolean;
}

export function useEditor({ documentId, currentUserId, autoLoad = true }: UseEditorOptions): UseEditorReturn {
  const navigate = useNavigate();
  
  // Data state
  const [document, setDocument] = useState<Document | null>(null);
  const [version, setVersion] = useState<DocumentVersion | null>(null);
  const [content, setContent] = useState<string>('');
  const [savedContent, setSavedContent] = useState<string>('');
  
  // Lock state
  const [lockToken, setLockToken] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isLockedByMe, setIsLockedByMe] = useState(false);
  const [lockInfo, setLockInfo] = useState<any>(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Has unsaved changes
  const hasUnsavedChanges = content !== savedContent;
  
  // Load document and latest version
  const loadDocument = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load document
      const doc = await documentService.getById(documentId);
      setDocument(doc);
      
      // Load latest version
      try {
        const latestVersion = await versionService.getLatest(documentId);
        setVersion(latestVersion);
        
        // Set content
        const versionContent = latestVersion.content_html || '';
        setContent(versionContent);
        setSavedContent(versionContent);
        
        // Check lock status
        if (latestVersion.id && doc.id) {
          const lockStatus = await lockService.checkLock(doc.id, latestVersion.id);
          setIsLocked(lockStatus.is_locked);
          if (lockStatus.is_locked) {
            // Check if the current user owns the lock
            const lockedByCurrentUser = currentUserId && lockStatus.locked_by_user_id === currentUserId;
            setIsLockedByMe(lockedByCurrentUser || false);
            setLockInfo({
              locked_by: lockStatus.locked_by_username,
              locked_by_id: lockStatus.locked_by_user_id,
              expires_at: lockStatus.lock_expires_at,
            });
            
            // If locked by current user, set the lock token from response
            if (lockedByCurrentUser && lockStatus.lock_token) {
              setLockToken(lockStatus.lock_token);
            }
          }
        }
      } catch (versionError: any) {
        // No version exists yet - that's okay for new documents
        if (versionError.response?.status === 404) {
          console.log('No version exists yet for this document');
          setVersion(null);
          setContent('<p>Start writing your document here...</p>');
          setSavedContent('<p>Start writing your document here...</p>');
        } else {
          throw versionError;
        }
      }
    } catch (err: any) {
      console.error('Error loading document:', err);
      setError(err.response?.data?.detail || 'Failed to load document');
      
      // If document not found, redirect to list
      if (err.response?.status === 404) {
        navigate('/documents');
      }
    } finally {
      setLoading(false);
    }
  }, [documentId, navigate]);
  
  // Acquire edit lock
  const acquireLock = useCallback(async (): Promise<boolean> => {
    if (!version?.id || !document?.id) {
      console.warn('No version or document to lock');
      return false;
    }
    
    try {
      const lockResult = await lockService.acquire({
        document_id: document.id,
        document_version_id: version.id,
        lock_duration_minutes: 30,
      });
      
      if (lockResult && lockResult.lock_token) {
        setLockToken(lockResult.lock_token);
        setIsLocked(true);
        setIsLockedByMe(true);
        setLockInfo({
          locked_at: lockResult.lock?.locked_at,
          expires_at: lockResult.expires_at,
        });
        return true;
      } else {
        console.warn('Invalid lock response from server');
        return false;
      }
    } catch (err: any) {
      console.error('Error acquiring lock:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to acquire lock';
      
      // Don't set page-level error for permission/status issues - just log it
      // This allows read-only viewing when lock can't be acquired
      if (err.response?.status === 403 || err.response?.status === 400) {
        console.warn('Cannot acquire lock (permission or status):', errorMsg);
        // Document is read-only - don't block the page
      } else if (err.response?.status === 423) {
        // Already locked by someone else
        console.warn('Document locked by another user');
        try {
          const lockStatus = await lockService.checkLock(document.id, version.id);
          setIsLocked(true);
          setIsLockedByMe(false);
          setLockInfo({
            locked_by: lockStatus.locked_by_username,
            locked_by_id: lockStatus.locked_by_user_id,
            expires_at: lockStatus.lock_expires_at,
          });
        } catch (checkErr) {
          console.error('Error checking lock status:', checkErr);
        }
      } else {
        // Only set page-level error for unexpected errors
        setError(errorMsg);
      }
      
      return false;
    }
  }, [document, version]);
  
  // Release edit lock
  const releaseLock = useCallback(async () => {
    if (!lockToken || !document?.id || !version?.id) return;
    
    try {
      await lockService.release({
        document_id: document.id,
        document_version_id: version.id,
        lock_token: lockToken,
      });
      setLockToken(null);
      setIsLocked(false);
      setIsLockedByMe(false);
      setLockInfo(null);
    } catch (err: any) {
      console.error('Error releasing lock:', err);
      // Don't show error for lock release - it's not critical
    }
  }, [document, version, lockToken]);
  
  // Update content (local state only)
  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);
  
  // Save content to backend
  const saveContent = useCallback(async (isAutosave: boolean = false) => {
    if (!version?.id || !document?.id) {
      setSaveError('No version or document to save to');
      return;
    }
    
    if (!hasUnsavedChanges && isAutosave) {
      // Skip autosave if no changes
      return;
    }
    
    try {
      setSaving(true);
      setSaveError(null);
      
      await versionService.saveContent(document.id, version.id, {
        content_html: content,
        lock_token: lockToken || undefined,
        is_autosave: isAutosave,
      });
      
      // Update saved content to match current
      setSavedContent(content);
    } catch (err: any) {
      console.error('Error saving content:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to save content';
      setSaveError(errorMsg);
      throw err; // Re-throw for autosave handler to catch
    } finally {
      setSaving(false);
    }
  }, [document, version, content, lockToken, hasUnsavedChanges]);
  
  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadDocument();
    }
  }, [autoLoad, loadDocument]);
  
  // Cleanup: release lock on unmount
  useEffect(() => {
    return () => {
      if (lockToken && document?.id && version?.id) {
        lockService.release({
          document_id: document.id,
          document_version_id: version.id,
          lock_token: lockToken,
        }).catch(err => {
          console.error('Error releasing lock on unmount:', err);
        });
      }
    };
  }, [lockToken, document, version]);
  
  return {
    // Data
    document,
    version,
    content,
    
    // Lock state
    lockToken,
    isLocked,
    isLockedByMe,
    lockInfo,
    
    // Loading states
    loading,
    saving,
    
    // Error states
    error,
    saveError,
    
    // Actions
    loadDocument,
    updateContent,
    saveContent,
    acquireLock,
    releaseLock,
    
    // Helpers
    hasUnsavedChanges,
  };
}

