/**
 * CommentPanel Component
 * Displays all comments in a right sidebar
 */
import { useState } from 'react';
import { DocumentComment } from '../../types/document';
import { MessageSquare, Check, Trash2, Edit2, User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentPanelProps {
  comments: DocumentComment[];
  currentUserId?: number;
  isAdmin?: boolean;
  canResolve?: boolean; // Only Admin/Author can resolve comments
  onCommentClick: (comment: DocumentComment) => void;
  onResolve: (commentId: number) => void;
  onDelete: (commentId: number) => void;
  onEdit: (commentId: number, newText: string) => void;
  loading?: boolean;
}

export default function CommentPanel({
  comments,
  currentUserId,
  isAdmin = false,
  canResolve = false,
  onCommentClick,
  onResolve,
  onDelete,
  onEdit,
  loading = false,
}: CommentPanelProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const handleEditStart = (comment: DocumentComment) => {
    setEditingId(comment.id);
    setEditText(comment.comment_text);
  };

  const handleEditSave = (commentId: number) => {
    onEdit(commentId, editText);
    setEditingId(null);
    setEditText('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const canModify = (comment: DocumentComment) => {
    return comment.user_id === currentUserId || isAdmin;
  };

  if (loading) {
    return (
      <div className="h-full bg-gray-50 border-l border-gray-200 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
          </div>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {comments.filter(c => !c.is_resolved).length} Open
          </span>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No comments yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Select text and add a comment to start
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              onClick={() => onCommentClick(comment)}
              className={`bg-white rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md ${
                comment.is_resolved ? 'opacity-60 border-gray-200' : 'border-blue-200'
              }`}
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {comment.user_full_name || comment.user_name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {comment.is_resolved && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                    <Check className="w-3 h-3" />
                    Resolved
                  </span>
                )}
              </div>

              {/* Selected Text (Quote) */}
              {comment.selected_text && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-2 text-xs text-gray-700 italic">
                  "{comment.selected_text.substring(0, 100)}
                  {comment.selected_text.length > 100 ? '...' : ''}"
                </div>
              )}

              {/* Comment Text */}
              {editingId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSave(comment.id);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCancel();
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">
                  {comment.comment_text}
                </p>
              )}

              {/* Actions */}
              {!comment.is_resolved && editingId !== comment.id && (
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  {/* Only Admin/Author can resolve comments */}
                  {canResolve && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onResolve(comment.id);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded hover:bg-green-100 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      Resolve
                    </button>
                  )}

                  {canModify(comment) && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStart(comment);
                        }}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this comment?')) {
                            onDelete(comment.id);
                          }
                        }}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Resolved Info */}
              {comment.is_resolved && comment.resolved_by_name && (
                <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                  Resolved by {comment.resolved_by_name}
                  {comment.resolved_at && ` ${formatDistanceToNow(new Date(comment.resolved_at), { addSuffix: true })}`}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

