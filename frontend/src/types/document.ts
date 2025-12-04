/**
 * Document Management Type Definitions
 */

export interface Document {
  id: number;
  document_number: string;
  title: string;
  description: string | null;
  department: string | null;
  tags: string[];
  owner_id: number;
  created_by_id: number;
  current_version_id: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  owner_username?: string;
  owner_full_name?: string;
  version_count?: number;
}

export interface DocumentVersion {
  id: number;
  document_id: number;
  version_number: number;
  content_html: string | null;
  content_hash: string | null;
  change_summary: string | null;
  status: VersionStatus;
  attachments_metadata: any[];
  docx_attachment_id: number | null;
  created_by_id: number;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  submitted_by_id: number | null;
  reviewed_at: string | null;
  reviewed_by_id: number | null;
  review_comments: string | null;
  approved_at: string | null;
  approved_by_id: number | null;
  approval_comments: string | null;
  published_at: string | null;
  published_by_id: number | null;
  rejected_at: string | null;
  rejected_by_id: number | null;
  rejection_reason: string | null;
  archived_at: string | null;
  archived_by_id: number | null;
  lock_version: number;
  created_by_username?: string;
  created_by_full_name?: string;
  is_locked: boolean;
  locked_by_user_id: number | null;
  locked_by_username: string | null;
  lock_expires_at: string | null;
}

export type VersionStatus = 
  | 'Draft'
  | 'Under Review'
  | 'Pending Approval'
  | 'Approved'
  | 'Published'
  | 'Rejected'
  | 'Archived'
  | 'Obsolete';

export interface EditLock {
  id: number;
  document_version_id: number;
  user_id: number;
  lock_token: string;
  acquired_at: string;
  expires_at: string;
  last_heartbeat: string;
  session_id: string | null;
  username: string | null;
  user_full_name: string | null;
  is_expired: boolean;
  time_remaining_seconds: number | null;
}

export interface Attachment {
  id: number;
  filename: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  storage_type: string;
  checksum_sha256: string;
  document_version_id: number | null;
  document_id: number | null;
  uploaded_by_id: number;
  uploaded_at: string;
  description: string | null;
  attachment_type: string;
  scan_status: string;
  scan_result: string | null;
  scanned_at: string | null;
  is_deleted: boolean;
  uploaded_by_username: string | null;
  uploaded_by_full_name: string | null;
  download_url: string | null;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
  page: number;
  page_size: number;
}

export interface DocumentVersionListResponse {
  versions: DocumentVersion[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateDocumentRequest {
  title: string;
  description?: string;
  department?: string;
  tags?: string[];
  document_number?: string;
  owner_id?: number;
}

export interface UpdateDocumentRequest {
  title?: string;
  description?: string;
  department?: string;
  tags?: string[];
  owner_id?: number;
}

export interface CreateVersionRequest {
  content_html?: string;
  change_summary?: string;
  attachments_metadata?: any[];
}

export interface SaveVersionRequest {
  content_html: string;
  content_hash?: string;
  lock_token?: string;
  is_autosave: boolean;
}

export interface AcquireLockRequest {
  timeout_minutes?: number;
  session_id?: string;
}

export interface HeartbeatRequest {
  lock_token: string;
  extend_minutes?: number;
}

export interface ReleaseLockRequest {
  lock_token: string;
}

// Comment types
export interface DocumentComment {
  id: number;
  document_version_id: number;
  user_id: number;
  user_name?: string;
  user_full_name?: string;
  comment_text: string;
  selected_text?: string;
  selection_start?: number;
  selection_end?: number;
  text_context?: string;
  is_resolved: boolean;
  resolved_at?: string;
  resolved_by_id?: number;
  resolved_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CommentCreate {
  comment_text: string;
  selected_text?: string;
  selection_start?: number;
  selection_end?: number;
  text_context?: string;
}

export interface CommentListResponse {
  comments: DocumentComment[];
  total: number;
}


