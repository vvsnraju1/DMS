import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { ChangeType } from '../types/document';

interface CreateNewVersionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { change_reason: string; change_type: ChangeType }) => Promise<void>;
  currentVersionString?: string;
  loading?: boolean;
}

export default function CreateNewVersionDialog({
  isOpen,
  onClose,
  onSubmit,
  currentVersionString,
  loading = false
}: CreateNewVersionDialogProps) {
  const [changeReason, setChangeReason] = useState('');
  const [changeType, setChangeType] = useState<ChangeType>('Minor');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (changeReason.trim().length < 10) {
      setError('Change reason must be at least 10 characters');
      return;
    }

    if (changeReason.trim().length > 1000) {
      setError('Change reason must be less than 1000 characters');
      return;
    }

    try {
      await onSubmit({
        change_reason: changeReason.trim(),
        change_type: changeType
      });
      
      // Reset form on success
      setChangeReason('');
      setChangeType('Minor');
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to create new version');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setChangeReason('');
      setChangeType('Minor');
      setError(null);
      onClose();
    }
  };

  const computeNextVersion = () => {
    if (!currentVersionString) return '?';
    
    const match = currentVersionString.match(/v(\d+)\.(\d+)/);
    if (!match) return '?';
    
    const major = parseInt(match[1]);
    const minor = parseInt(match[2]);
    
    if (changeType === 'Major') {
      return `v${major + 1}.0`;
    } else {
      return `v${major}.${minor + 1}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Plus className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create New Version</h2>
                <p className="text-sm text-gray-600">
                  Current: {currentVersionString} → New: {computeNextVersion()}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Change Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Change Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    changeType === 'Minor'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="changeType"
                    value="Minor"
                    checked={changeType === 'Minor'}
                    onChange={(e) => setChangeType(e.target.value as ChangeType)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Minor Change</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Small updates, corrections, or clarifications
                    </div>
                    <div className="text-xs text-blue-600 mt-1 font-mono">
                      {currentVersionString} → {currentVersionString?.replace(/v(\d+)\.(\d+)/, (m, maj, min) => `v${maj}.${parseInt(min) + 1}`)}
                    </div>
                  </div>
                </label>

                <label
                  className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    changeType === 'Major'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="changeType"
                    value="Major"
                    checked={changeType === 'Major'}
                    onChange={(e) => setChangeType(e.target.value as ChangeType)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Major Change</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Significant revisions or structural changes
                    </div>
                    <div className="text-xs text-orange-600 mt-1 font-mono">
                      {currentVersionString} → {currentVersionString?.replace(/v(\d+)\.(\d+)/, (m, maj) => `v${parseInt(maj) + 1}.0`)}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Change Reason */}
            <div>
              <label htmlFor="changeReason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Change <span className="text-red-500">*</span>
              </label>
              <textarea
                id="changeReason"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                rows={4}
                required
                minLength={10}
                maxLength={1000}
                placeholder="Describe the reason for creating this new version. Be specific about what changes are being made and why they are necessary. (Minimum 10 characters)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="mt-1 flex justify-between text-xs">
                <span className="text-gray-500">
                  Minimum 10 characters required for audit trail
                </span>
                <span className={`${
                  changeReason.length < 10
                    ? 'text-red-500'
                    : changeReason.length > 1000
                    ? 'text-red-500'
                    : 'text-gray-500'
                }`}>
                  {changeReason.length} / 1000
                </span>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>A new <strong>Draft</strong> version will be created</li>
                <li>Content will be cloned from the current Effective version</li>
                <li>The current version remains <strong>Effective</strong> (not obsoleted yet)</li>
                <li>You can edit the new draft version</li>
                <li>Previous version will be obsoleted only when the new version is approved and published</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || changeReason.trim().length < 10}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Create New Version
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

