import React from 'react';
import { AlertTriangle, RefreshCw, Save, X } from 'lucide-react';

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onForceOverwrite: () => void;
  conflictInfo?: {
    lastModifiedBy?: string;
    lastModifiedAt?: string;
    currentHash?: string;
    serverHash?: string;
  };
}

const ConflictModal: React.FC<ConflictModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
  onForceOverwrite,
  conflictInfo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6 transform transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>

          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
            <AlertTriangle size={24} className="text-yellow-600" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Document Conflict Detected
          </h3>

          {/* Description */}
          <div className="text-sm text-gray-600 mb-6 space-y-2">
            <p className="text-center">
              The document has been modified since you last loaded it. 
              This might be because:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>Another user saved changes while you were editing</li>
              <li>You opened the same document in another tab/window</li>
              <li>Your session expired and the document was auto-saved</li>
            </ul>
            
            {conflictInfo?.lastModifiedBy && (
              <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                <p className="font-medium text-gray-900">Last Modified By:</p>
                <p className="text-gray-700">{conflictInfo.lastModifiedBy}</p>
                {conflictInfo.lastModifiedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    at {new Date(conflictInfo.lastModifiedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">
              <strong>⚠️ Choose carefully:</strong> If you force overwrite, 
              you will lose the other changes permanently.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Refresh (recommended) */}
            <button
              onClick={onRefresh}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <RefreshCw size={18} />
              Refresh Content (Recommended)
            </button>
            <p className="text-xs text-gray-600 text-center -mt-2">
              This will reload the latest version. Your unsaved changes will be lost.
            </p>

            {/* Force Overwrite (dangerous) */}
            <button
              onClick={onForceOverwrite}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Save size={18} />
              Force Overwrite
            </button>
            <p className="text-xs text-gray-600 text-center -mt-2">
              Overwrites the server version with your local content.
            </p>

            {/* Cancel */}
            <button
              onClick={onClose}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel (Keep Editing)
            </button>
            <p className="text-xs text-gray-600 text-center -mt-2">
              Continue editing. You can try saving again later.
            </p>
          </div>

          {/* Help text */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>💡 Tip:</strong> To avoid conflicts, make sure you have an active 
              edit lock before making changes. The lock prevents others from editing 
              the same document simultaneously.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;

