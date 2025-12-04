import React, { useState } from 'react';
import { X, Lock, AlertCircle, CheckCircle } from 'lucide-react';

interface ESignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string, comments?: string) => Promise<void>;
  title: string;
  message: string;
  actionName: string;
  requireComments?: boolean;
  commentsLabel?: string;
  commentsPlaceholder?: string;
}

const ESignatureModal: React.FC<ESignatureModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  actionName,
  requireComments = false,
  commentsLabel = 'Comments (Optional)',
  commentsPlaceholder = 'Add your comments here...',
}) => {
  const [password, setPassword] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Password is required for e-signature');
      return;
    }

    if (requireComments && !comments.trim()) {
      setError(`${commentsLabel} is required`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 E-Signature: Submitting action with password');
      await onConfirm(password, comments.trim() || undefined);
      console.log('✅ E-Signature: Action completed successfully');
      
      setSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      console.error('❌ E-signature error:', err);
      console.error('Error response:', err.response);
      if (err.response?.status === 401) {
        setError('Invalid password. Please try again.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Action failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setComments('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Lock className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* Message */}
          <div className="mb-4">
            <p className="text-gray-700">{message}</p>
          </div>

          {/* Compliance Notice */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-blue-800">
                <strong>21 CFR Part 11 Compliance:</strong> This action requires your password as an electronic signature. Your identity and action will be recorded in the audit trail.
              </div>
            </div>
          </div>

          {/* Comments (if required or optional) */}
          {(requireComments || commentsLabel) && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {commentsLabel}
                {requireComments && <span className="text-red-500 ml-1">*</span>}
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={commentsPlaceholder}
                disabled={loading || success}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
              />
            </div>
          )}

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password to confirm"
              disabled={loading || success}
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              This serves as your electronic signature for this action.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-green-800">Action completed successfully! Closing...</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading || success}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success || !password.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : success ? (
                <>
                  <CheckCircle size={18} />
                  Success
                </>
              ) : (
                <>
                  <Lock size={18} />
                  {actionName}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ESignatureModal;

