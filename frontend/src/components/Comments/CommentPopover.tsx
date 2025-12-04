/**
 * CommentPopover Component
 * Shows when text is selected to allow adding comments
 */
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquarePlus, X } from 'lucide-react';

interface CommentPopoverProps {
  isOpen: boolean;
  position: { x: number; y: number };
  selectedText: string;
  onSubmit: (commentText: string) => void;
  onClose: () => void;
}

export default function CommentPopover({
  isOpen,
  position,
  selectedText,
  onSubmit,
  onClose,
}: CommentPopoverProps) {
  const [commentText, setCommentText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && !isSaving) {
      setIsSaving(true);
      try {
        await onSubmit(commentText);
        setCommentText('');
        // onClose() will be called by parent component after successful save
      } catch (err) {
        console.error('Error saving comment:', err);
        setIsSaving(false);
      }
    }
  };

  const handleCancel = () => {
    setCommentText('');
    onClose();
  };

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-80"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: 'translate(-50%, 10px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-blue-50">
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="w-4 h-4 text-blue-600" />
          <h4 className="text-sm font-semibold text-gray-900">Add Comment</h4>
        </div>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Text Quote */}
      <div className="p-3 bg-yellow-50 border-b border-yellow-200">
        <p className="text-xs text-gray-600 mb-1 font-medium">Selected Text:</p>
        <p className="text-xs text-gray-700 italic line-clamp-3">
          "{selectedText}"
        </p>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="p-3">
        <textarea
          ref={textareaRef}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add your comment or suggestion..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={4}
          required
        />

        <div className="flex gap-2 mt-3">
          <button
            type="submit"
            disabled={!commentText.trim() || isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              'Add Comment'
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

