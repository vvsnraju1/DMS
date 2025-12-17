import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import templateService, { TemplateVersionDetail, TemplateReview as TemplateReviewType } from '../../services/template.service';

export default function TemplateReview() {
  const navigate = useNavigate();
  const { templateId, versionId } = useParams<{ templateId: string; versionId: string }>();
  const { user } = useAuth();
  const [version, setVersion] = useState<TemplateVersionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
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

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim() || !templateId || !versionId) return;

    try {
      setSubmitting(true);
      await templateService.addReviewComment(
        parseInt(templateId),
        parseInt(versionId),
        { comment: comment.trim() }
      );
      setComment('');
      loadVersion(); // Reload to show new comment
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add review comment');
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
        <h1 className="page-title">Review Template</h1>
        <p className="page-subtitle">
          Version {version.version_number} - Add review comments
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Existing Reviews */}
      {version.reviews && version.reviews.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MessageSquare size={20} className="mr-2" />
            Review Comments ({version.reviews.length})
          </h2>
          <div className="space-y-4">
            {version.reviews.map((review: TemplateReviewType) => (
              <div key={review.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {review.reviewer_full_name || review.reviewer_username}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Review Comment */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Review Comment</h2>
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Comment <span className="text-red-500">*</span>
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your review comment..."
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(`/templates/${templateId}/versions`)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !comment.trim()}
            >
              {submitting ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Comment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

