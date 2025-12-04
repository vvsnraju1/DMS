import React from 'react';
import { Lock, Unlock, User, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface LockIndicatorProps {
  isLocked: boolean;
  lockedBy?: string;
  lockedById?: number;
  lockedAt?: string;
  expiresAt?: string;
  currentUserId?: number;
}

const LockIndicator: React.FC<LockIndicatorProps> = ({
  isLocked,
  lockedBy,
  lockedById,
  lockedAt,
  expiresAt,
  currentUserId,
}) => {
  const isLockedByCurrentUser = lockedById === currentUserId;

  // Not locked
  if (!isLocked) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm">
        <Unlock size={16} className="text-green-600" />
        <span className="text-green-800 font-medium">Available for editing</span>
      </div>
    );
  }

  // Locked by current user
  if (isLockedByCurrentUser) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <Lock size={16} className="text-blue-600" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <User size={14} className="text-blue-600" />
            <span className="text-blue-800 font-medium">Locked by You</span>
          </div>
          {expiresAt && (
            <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
              <Clock size={12} />
              <span>
                Expires {formatDistanceToNow(new Date(expiresAt), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>
        <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
      </div>
    );
  }

  // Locked by another user
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm">
      <Lock size={16} className="text-red-600" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <User size={14} className="text-red-600" />
          <span className="text-red-800 font-medium">
            Locked by {lockedBy || 'Another user'}
          </span>
        </div>
        {expiresAt && (
          <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
            <Clock size={12} />
            <span>
              Expires {formatDistanceToNow(new Date(expiresAt), { addSuffix: true })}
            </span>
          </div>
        )}
      </div>
      <div className="text-xs text-red-600 font-medium px-2 py-1 bg-red-100 rounded">
        READ ONLY
      </div>
    </div>
  );
};

export default LockIndicator;

