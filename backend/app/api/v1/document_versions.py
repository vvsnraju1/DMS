"""
Document Version Management API Endpoints
Handles version creation, editing, workflow, and content management
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from datetime import datetime

from app.api.deps import get_db, get_current_user
from app.models import Document, DocumentVersion, User, VersionStatus, EditLock
from app.schemas.document_version import (
    DocumentVersionCreate,
    DocumentVersionUpdate,
    DocumentVersionSave,
    DocumentVersionResponse,
    DocumentVersionListResponse,
    DocumentVersionListItem,
    SubmitForReviewRequest,
    ReviewRequest,
    ApprovalRequest,
    PublishRequest,
)
from app.core.document_utils import get_next_version_number, compute_content_hash
from app.core.audit import AuditLogger
from app.core.security import verify_password

router = APIRouter()


def verify_esignature(user: User, password: str) -> bool:
    """
    Verify user password for e-signature compliance (21 CFR Part 11)
    
    Returns True if password is valid, raises HTTPException if not
    """
    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password. E-signature authentication failed."
        )
    return True


def can_create_version(user: User, document: Document) -> bool:
    """Check if user can create a version"""
    if user.is_admin():
        return True
    if user.has_role("Author") and document.owner_id == user.id:
        return True
    return False


def can_edit_version(user: User, document: Document, version: DocumentVersion) -> bool:
    """Check if user can edit a version"""
    # Only draft versions can be edited
    if version.status != VersionStatus.DRAFT:
        return False
    if user.is_admin():
        return True
    if user.has_role("Author") and (document.owner_id == user.id or version.created_by_id == user.id):
        return True
    return False


def can_view_version(user: User, document: Document, version: DocumentVersion) -> bool:
    """Check if user can view a version"""
    # For now, all authenticated users can view
    # In production, add more granular checks
    return True


@router.post("/{document_id}/versions", response_model=DocumentVersionResponse, status_code=status.HTTP_201_CREATED)
async def create_version(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    document_id: int,
    version_in: DocumentVersionCreate
):
    """
    Create a new document version (URS-DVM-002)
    
    Auto-increments version number
    Requires: Author (owner) or Admin
    """
    # Get document
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.is_deleted == False
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check permissions
    if not can_create_version(current_user, document):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create versions for this document"
        )
    
    # Get next version number
    version_number = get_next_version_number(db, document_id)
    
    # Compute content hash
    content_hash = compute_content_hash(version_in.content_html or "")
    
    # Create version
    version = DocumentVersion(
        document_id=document_id,
        version_number=version_number,
        content_html=version_in.content_html,
        content_hash=content_hash,
        change_summary=version_in.change_summary,
        status=VersionStatus.DRAFT,
        attachments_metadata=version_in.attachments_metadata or [],
        created_by_id=current_user.id
    )
    
    db.add(version)
    db.flush()  # Get version ID
    
    # Update document's current version to this new draft
    document.current_version_id = version.id
    document.status = VersionStatus.DRAFT.value
    document.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(version)
    
    # Audit log
    AuditLogger.log(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action="VERSION_CREATED",
        entity_type="DocumentVersion",
        entity_id=version.id,
        description=f"Created version {version_number} for document {document.document_number}",
        details={
            "document_id": document_id,
            "document_number": document.document_number,
            "version_number": version_number,
            "change_summary": version_in.change_summary,
        }
    )
    
    # Prepare response
    return _prepare_version_response(db, version, current_user)


@router.get("/{document_id}/versions", response_model=DocumentVersionListResponse)
async def list_versions(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    document_id: int,
    page: int = 1,
    page_size: int = 20
):
    """
    List all versions for a document
    """
    # Check document exists
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.is_deleted == False
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Query versions
    query = db.query(DocumentVersion).filter(
        DocumentVersion.document_id == document_id
    ).options(joinedload(DocumentVersion.created_by))
    
    total = query.count()
    versions = query.order_by(DocumentVersion.version_number.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    # Prepare response
    version_items = [
        DocumentVersionListItem(
            id=v.id,
            document_id=v.document_id,
            version_number=v.version_number,
            status=v.status,
            change_summary=v.change_summary,
            created_by_id=v.created_by_id,
            created_by_username=v.created_by.username if v.created_by else None,
            created_at=v.created_at,
            updated_at=v.updated_at
        )
        for v in versions
    ]
    
    return DocumentVersionListResponse(
        versions=version_items,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{document_id}/versions/{version_id}", response_model=DocumentVersionResponse)
async def get_version(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    document_id: int,
    version_id: int
):
    """
    Get a specific version with full content
    """
    # Get document and version
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.is_deleted == False
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    version = db.query(DocumentVersion).filter(
        DocumentVersion.id == version_id,
        DocumentVersion.document_id == document_id
    ).first()
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found"
        )
    
    # Check permissions
    if not can_view_version(current_user, document, version):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this version"
        )
    
    return _prepare_version_response(db, version, current_user)


@router.patch("/{document_id}/versions/{version_id}", response_model=DocumentVersionResponse)
async def update_version(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    document_id: int,
    version_id: int,
    version_in: DocumentVersionUpdate
):
    """
    Update version metadata (URS-DVM-003)
    
    Only drafts can be updated
    Does not update content - use save endpoint for that
    """
    # Get document and version
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.is_deleted == False
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    version = db.query(DocumentVersion).filter(
        DocumentVersion.id == version_id,
        DocumentVersion.document_id == document_id
    ).first()
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found"
        )
    
    # Check permissions
    if not can_edit_version(current_user, document, version):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this version or version is not a draft"
        )
    
    # Track changes
    changes = {}
    
    # Update fields
    if version_in.change_summary is not None:
        changes["change_summary"] = {"old": version.change_summary, "new": version_in.change_summary}
        version.change_summary = version_in.change_summary
    if version_in.attachments_metadata is not None:
        changes["attachments_metadata"] = {"old": version.attachments_metadata, "new": version_in.attachments_metadata}
        version.attachments_metadata = version_in.attachments_metadata
    
    version.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(version)
    
    # Audit log
    AuditLogger.log(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action="VERSION_UPDATED",
        entity_type="DocumentVersion",
        entity_id=version.id,
        description=f"Updated version {version.version_number} metadata",
        details={"changes": changes}
    )
    
    return _prepare_version_response(db, version, current_user)


@router.post("/{document_id}/versions/{version_id}/save", response_model=DocumentVersionResponse)
async def save_version_content(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request,
    document_id: int,
    version_id: int,
    save_data: DocumentVersionSave
):
    """
    Save version content (URS-DVM-005)
    
    Supports both manual save and autosave
    Enforces optimistic locking and edit lock
    """
    # Get document and version
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.is_deleted == False
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    version = db.query(DocumentVersion).filter(
        DocumentVersion.id == version_id,
        DocumentVersion.document_id == document_id
    ).first()
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found"
        )
    
    # Check permissions
    if not can_edit_version(current_user, document, version):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this version or version is not a draft"
        )
    
    # Check edit lock
    lock = db.query(EditLock).filter(
        EditLock.document_version_id == version_id
    ).first()
    
    if lock:
        # Verify lock ownership
        if lock.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Version is locked by another user: {lock.user.username}"
            )
        
        # Verify lock token
        if save_data.lock_token and lock.lock_token != save_data.lock_token:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid lock token"
            )
        
        # Check expiry
        if lock.is_expired():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Lock has expired, please reacquire"
            )
    
    # Optimistic concurrency check
    if save_data.content_hash:
        if version.content_hash != save_data.content_hash:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Content has been modified by another user",
                headers={
                    "X-Current-Content-Hash": version.content_hash,
                    "X-Conflict": "true"
                }
            )
    
    # Save before snapshot for audit
    before_snapshot = {
        "content_hash": version.content_hash,
        "updated_at": version.updated_at.isoformat() if version.updated_at else None
    }
    
    # Update content
    version.content_html = save_data.content_html
    version.content_hash = compute_content_hash(save_data.content_html)
    version.updated_at = datetime.utcnow()
    version.lock_version += 1
    
    db.commit()
    db.refresh(version)
    
    # Audit log (conditional based on autosave policy)
    if not save_data.is_autosave or (save_data.is_autosave and version.lock_version % 10 == 0):
        # Log manual saves always, autosaves every 10th time
        AuditLogger.log(
            db=db,
            user_id=current_user.id,
            username=current_user.username,
            action="VERSION_SAVED" if not save_data.is_autosave else "VERSION_AUTOSAVED",
            entity_type="DocumentVersion",
            entity_id=version.id,
            description=f"{'Saved' if not save_data.is_autosave else 'Auto-saved'} version {version.version_number} content",
            details={
                "before": before_snapshot,
                "after": {
                    "content_hash": version.content_hash,
                    "updated_at": version.updated_at.isoformat()
                },
                "is_autosave": save_data.is_autosave,
                "lock_version": version.lock_version
            }
        )
    
    return _prepare_version_response(db, version, current_user)


def _prepare_version_response(db: Session, version: DocumentVersion, current_user: User) -> DocumentVersionResponse:
    """Helper to prepare version response with additional metadata"""
    response = DocumentVersionResponse.from_orm(version)
    
    # Add creator info
    if version.created_by:
        response.created_by_username = version.created_by.username
        response.created_by_full_name = version.created_by.full_name
    
    # Add lock info
    lock = db.query(EditLock).filter(
        EditLock.document_version_id == version.id
    ).first()
    
    if lock and not lock.is_expired():
        response.is_locked = True
        response.locked_by_user_id = lock.user_id
        response.locked_by_username = lock.user.username if lock.user else None
        response.lock_expires_at = lock.expires_at
    
    return response


# ==================== WORKFLOW ENDPOINTS ====================

@router.post("/{document_id}/versions/{version_id}/submit", response_model=DocumentVersionResponse)
async def submit_for_review(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    document_id: int,
    version_id: int,
    request_data: SubmitForReviewRequest
):
    """
    Submit document version for review (Draft → Under Review)
    
    Requires: Author or Admin + Password for E-Signature
    """
    # Verify e-signature (password)
    verify_esignature(current_user, request_data.password)
    # Get document and version
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.is_deleted == False
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    version = db.query(DocumentVersion).filter(
        DocumentVersion.id == version_id,
        DocumentVersion.document_id == document_id
    ).first()
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found"
        )
    
    # Check permissions - Author or Admin
    if not (current_user.has_role("Author") or current_user.is_admin()):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Authors and Admins can submit for review"
        )
    
    # Check status
    if version.status != VersionStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can only submit Draft versions. Current status: {version.status.value}"
        )
    
    # Update status
    version.status = VersionStatus.UNDER_REVIEW
    version.submitted_at = datetime.utcnow()
    version.submitted_by_id = current_user.id
    
    db.commit()
    db.refresh(version)
    
    # Audit log with e-signature
    AuditLogger.log(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action="VERSION_SUBMITTED",
        entity_type="DocumentVersion",
        entity_id=version.id,
        description=f"E-Signature: {current_user.username} submitted version {version.version_number} of document {document.document_number} for review. Action authenticated with password (21 CFR Part 11 compliant)."
    )
    
    return _prepare_version_response(db, version, current_user)


@router.post("/{document_id}/versions/{version_id}/approve", response_model=DocumentVersionResponse)
async def approve_version(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    document_id: int,
    version_id: int,
    request_data: ApprovalRequest
):
    """
    Approve document version
    
    If Under Review → Pending Approval (Reviewer approval)
    If Pending Approval → Approved (Approver approval)
    
    Requires: Reviewer (for Under Review) or Approver (for Pending Approval) or Admin + Password for E-Signature
    """
    # Verify e-signature (password)
    verify_esignature(current_user, request_data.password)
    
    comments = request_data.comments
    # Get document and version
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.is_deleted == False
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    version = db.query(DocumentVersion).filter(
        DocumentVersion.id == version_id,
        DocumentVersion.document_id == document_id
    ).first()
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found"
        )
    
    # Check permissions based on current status
    if version.status == VersionStatus.UNDER_REVIEW:
        # Reviewer or Admin can approve review
        if not (current_user.has_role("Reviewer") or current_user.is_admin()):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Reviewers and Admins can approve review"
            )
        # Move to Pending Approval
        version.status = VersionStatus.PENDING_APPROVAL
        version.reviewed_at = datetime.utcnow()
        version.reviewed_by_id = current_user.id
        action_desc = "approved review"
        
    elif version.status == VersionStatus.PENDING_APPROVAL:
        # Approver or Admin can approve
        if not (current_user.has_role("Approver") or current_user.is_admin()):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Approvers and Admins can approve document"
            )
        # Move to Approved
        version.status = VersionStatus.APPROVED
        version.approved_at = datetime.utcnow()
        version.approved_by_id = current_user.id
        action_desc = "approved document"
        
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve version with status: {version.status.value}"
        )
    
    db.commit()
    db.refresh(version)
    
    # Audit log with e-signature
    AuditLogger.log(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action="VERSION_APPROVED",
        entity_type="DocumentVersion",
        entity_id=version.id,
        description=f"E-Signature: {current_user.username} {action_desc} for version {version.version_number} of document {document.document_number}. Comments: {comments or 'None'}. Action authenticated with password (21 CFR Part 11 compliant)."
    )
    
    return _prepare_version_response(db, version, current_user)


@router.post("/{document_id}/versions/{version_id}/reject", response_model=DocumentVersionResponse)
async def reject_version(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    document_id: int,
    version_id: int,
    request_data: ReviewRequest
):
    """
    Reject document version (return to Draft)
    
    Requires: Reviewer, Approver, or Admin + Password for E-Signature
    """
    # Verify e-signature (password)
    verify_esignature(current_user, request_data.password)
    
    reason = request_data.comments or "No reason provided"
    # Get document and version
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.is_deleted == False
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    version = db.query(DocumentVersion).filter(
        DocumentVersion.id == version_id,
        DocumentVersion.document_id == document_id
    ).first()
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found"
        )
    
    # Check permissions - Reviewer, Approver, or Admin
    if not (current_user.has_role("Reviewer") or current_user.has_role("Approver") or current_user.is_admin()):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Reviewers, Approvers, and Admins can reject documents"
        )
    
    # Check status - can only reject if Under Review or Pending Approval
    if version.status not in [VersionStatus.UNDER_REVIEW, VersionStatus.PENDING_APPROVAL]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject version with status: {version.status.value}"
        )
    
    # Return to Draft
    old_status = version.status.value
    version.status = VersionStatus.DRAFT
    version.rejected_at = datetime.utcnow()
    version.rejected_by_id = current_user.id
    
    db.commit()
    db.refresh(version)
    
    # Audit log with e-signature
    AuditLogger.log(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action="VERSION_REJECTED",
        entity_type="DocumentVersion",
        entity_id=version.id,
        description=f"E-Signature: {current_user.username} rejected version {version.version_number} of document {document.document_number}. Previous status: {old_status}. Reason: {reason}. Action authenticated with password (21 CFR Part 11 compliant)."
    )
    
    return _prepare_version_response(db, version, current_user)


@router.post("/{document_id}/versions/{version_id}/publish", response_model=DocumentVersionResponse)
async def publish_version(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    document_id: int,
    version_id: int,
    request_data: PublishRequest
):
    """
    Publish document version (Approved → Published)
    
    Requires: DMS_Admin only + Password for E-Signature
    """
    # Verify e-signature (password)
    verify_esignature(current_user, request_data.password)
    
    # Check permissions - Admin only
    if not current_user.is_admin():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only DMS Admins can publish documents"
        )
    
    # Get document and version
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.is_deleted == False
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    version = db.query(DocumentVersion).filter(
        DocumentVersion.id == version_id,
        DocumentVersion.document_id == document_id
    ).first()
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found"
        )
    
    # Check status - must be Approved
    if version.status != VersionStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can only publish Approved versions. Current status: {version.status.value}"
        )
    
    # Publish
    version.status = VersionStatus.PUBLISHED
    version.published_at = datetime.utcnow()
    version.published_by_id = current_user.id
    
    # Update document current version
    document.current_version_id = version.id
    document.status = "Published"
    
    db.commit()
    db.refresh(version)
    db.refresh(document)
    
    # Audit log with e-signature
    AuditLogger.log(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action="VERSION_PUBLISHED",
        entity_type="DocumentVersion",
        entity_id=version.id,
        description=f"E-Signature: {current_user.username} published version {version.version_number} of document {document.document_number}. Action authenticated with password (21 CFR Part 11 compliant)."
    )
    
    return _prepare_version_response(db, version, current_user)


@router.post("/{document_id}/versions/{version_id}/archive", response_model=DocumentVersionResponse)
async def archive_version(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    document_id: int,
    version_id: int,
    request_data: PublishRequest
):
    """
    Archive document version
    
    Requires: DMS_Admin only + Password for E-Signature
    """
    # Verify e-signature (password)
    verify_esignature(current_user, request_data.password)
    
    # Check permissions - Admin only
    if not current_user.is_admin():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only DMS Admins can archive documents"
        )
    
    # Get document and version
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.is_deleted == False
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    version = db.query(DocumentVersion).filter(
        DocumentVersion.id == version_id,
        DocumentVersion.document_id == document_id
    ).first()
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found"
        )
    
    # Archive
    old_status = version.status.value
    version.status = VersionStatus.ARCHIVED
    version.archived_at = datetime.utcnow()
    version.archived_by_id = current_user.id
    
    # Update document status if this is current version
    if document.current_version_id == version.id:
        document.status = "Archived"
    
    db.commit()
    db.refresh(version)
    db.refresh(document)
    
    # Audit log with e-signature
    AuditLogger.log(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action="VERSION_ARCHIVED",
        entity_type="DocumentVersion",
        entity_id=version.id,
        description=f"E-Signature: {current_user.username} archived version {version.version_number} of document {document.document_number}. Previous status: {old_status}. Action authenticated with password (21 CFR Part 11 compliant)."
    )
    
    return _prepare_version_response(db, version, current_user)


