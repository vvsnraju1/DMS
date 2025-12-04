import React from 'react';
import { Check, Clock, AlertCircle, Loader } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutosaveIndicatorProps {
  status: AutosaveStatus;
  lastSavedAt?: Date;
  error?: string;
}

const AutosaveIndicator: React.FC<AutosaveIndicatorProps> = ({
  status,
  lastSavedAt,
  error,
}) => {
  // Idle state (no changes or not initialized)
  if (status === 'idle') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500">
        <Clock size={14} />
        <span>No changes</span>
      </div>
    );
  }

  // Saving state
  if (status === 'saving') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 animate-pulse">
        <Loader size={14} className="animate-spin" />
        <span className="font-medium">Saving...</span>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
        <AlertCircle size={14} />
        <span className="font-medium">{error || 'Save failed'}</span>
      </div>
    );
  }

  // Saved state
  if (status === 'saved' && lastSavedAt) {
    const timeAgo = formatDistanceToNow(lastSavedAt, { addSuffix: true });
    
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
        <Check size={14} />
        <span className="font-medium">Saved {timeAgo}</span>
      </div>
    );
  }

  return null;
};

export default AutosaveIndicator;

