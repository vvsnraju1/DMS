"""
DocumentVersion model for DMS
Represents a specific version of a document with content and workflow state
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum


class VersionStatus(str, enum.Enum):
    """Document version workflow states"""
    DRAFT = "Draft"
    UNDER_REVIEW = "Under Review"
    PENDING_APPROVAL = "Pending Approval"
    APPROVED = "Approved"
    PUBLISHED = "Published"
    REJECTED = "Rejected"
    ARCHIVED = "Archived"
    OBSOLETE = "Obsolete"


class DocumentVersion(Base):
    """
    Individual version of a document with content and workflow state
    """
    __tablename__ = "document_versions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey('documents.id', ondelete='CASCADE'), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)  # 1, 2, 3...
    
    # Content
    content_html = Column(Text)  # HTML or SFDT format from Syncfusion
    content_hash = Column(String(64), nullable=True)  # SHA-256 hash for optimistic concurrency
    
    # Metadata
    change_summary = Column(Text)  # Description of changes in this version
    status = Column(SQLEnum(VersionStatus), default=VersionStatus.DRAFT, nullable=False, index=True)
    
    # Attachments metadata (JSON list of attachment IDs or metadata)
    attachments_metadata = Column(JSON, default=list)
    
    # DOCX reference (if uploaded)
    docx_attachment_id = Column(Integer, ForeignKey('attachments.id'), nullable=True)
    
    # Workflow
    created_by_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    submitted_at = Column(DateTime, nullable=True)  # When submitted for review
    submitted_by_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    review_comments = Column(Text)
    
    approved_at = Column(DateTime, nullable=True)
    approved_by_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    approval_comments = Column(Text)
    e_signature_data = Column(JSON)  # Part 11 e-signature metadata
    
    published_at = Column(DateTime, nullable=True)
    published_by_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    rejected_at = Column(DateTime, nullable=True)
    rejected_by_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    rejection_reason = Column(Text)
    
    archived_at = Column(DateTime, nullable=True)
    archived_by_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Optimistic locking version
    lock_version = Column(Integer, default=0, nullable=False)
    
    # Relationships
    document = relationship("Document", foreign_keys=[document_id], back_populates="versions")
    created_by = relationship("User", foreign_keys=[created_by_id])
    submitted_by = relationship("User", foreign_keys=[submitted_by_id])
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_id])
    approved_by = relationship("User", foreign_keys=[approved_by_id])
    published_by = relationship("User", foreign_keys=[published_by_id])
    rejected_by = relationship("User", foreign_keys=[rejected_by_id])
    archived_by = relationship("User", foreign_keys=[archived_by_id])
    docx_attachment = relationship("Attachment", foreign_keys=[docx_attachment_id])
    edit_locks = relationship("EditLock", back_populates="document_version", cascade="all, delete-orphan")
    comments = relationship("DocumentComment", back_populates="version", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<DocumentVersion(id={self.id}, doc_id={self.document_id}, v={self.version_number}, status={self.status})>"


