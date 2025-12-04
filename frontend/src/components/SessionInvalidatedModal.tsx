import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AlertTriangle, LogOut } from 'lucide-react';

const SessionInvalidatedModal: React.FC = () => {
  const { sessionInvalidated, clearSessionInvalidated } = useAuth();
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    clearSessionInvalidated();
    navigate('/login');
  };

  if (!sessionInvalidated) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="bg-amber-50 px-6 py-4 border-b border-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <h3 className="text-lg font-semibold text-amber-800">
              Session Ended
            </h3>
          </div>
        </div>
        
        <div className="px-6 py-4">
          <p className="text-gray-700 mb-4">
            Your session has been ended because you logged in from another device or browser tab.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            For security reasons, only one active session is allowed per user. 
            If this wasn't you, please change your password immediately.
          </p>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">
              <strong>Note:</strong> Any unsaved work may have been lost. 
              Please log in again to continue.
            </p>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={handleGoToLogin}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <LogOut size={18} />
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionInvalidatedModal;


