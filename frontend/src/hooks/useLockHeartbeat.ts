import { useEffect, useRef } from 'react';
import lockService from '../services/lock.service';

interface UseLockHeartbeatOptions {
  documentId: number | null;
  versionId: number | null;
  lockToken: string | null;
  enabled?: boolean;
  intervalMs?: number;
  extendMinutes?: number;
  onError?: (error: any) => void;
  onSuccess?: () => void;
}

/**
 * Hook to automatically refresh/extend an edit lock at regular intervals
 * This keeps the lock alive while the user is actively editing
 */
export function useLockHeartbeat({
  documentId,
  versionId,
  lockToken,
  enabled = true,
  intervalMs = 15000, // Default: 15 seconds
  extendMinutes = 30, // Default: extend by 30 minutes each time
  onError,
  onSuccess,
}: UseLockHeartbeatOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Don't start if disabled or no lock token or no IDs
    if (!enabled || !lockToken || !documentId || !versionId) {
      isRunningRef.current = false;
      return;
    }

    console.log(`[LockHeartbeat] Starting heartbeat (${intervalMs}ms interval)`);
    isRunningRef.current = true;

    // Heartbeat function
    const sendHeartbeat = async () => {
      if (!lockToken || !documentId || !versionId || !isRunningRef.current) {
        return;
      }

      try {
        await lockService.heartbeat(documentId, versionId, lockToken, extendMinutes);
        console.log('[LockHeartbeat] Lock refreshed successfully');
        
        if (onSuccess) {
          onSuccess();
        }
      } catch (error: any) {
        console.error('[LockHeartbeat] Failed to refresh lock:', error);
        
        if (onError) {
          onError(error);
        }

        // If lock is gone (404) or expired (410), stop heartbeat
        if (error.response?.status === 404 || error.response?.status === 410) {
          console.warn('[LockHeartbeat] Lock no longer exists, stopping heartbeat');
          isRunningRef.current = false;
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }
    };

    // Start interval
    intervalRef.current = setInterval(sendHeartbeat, intervalMs);

    // Send first heartbeat immediately
    sendHeartbeat();

    // Cleanup
    return () => {
      console.log('[LockHeartbeat] Stopping heartbeat');
      isRunningRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [documentId, versionId, lockToken, enabled, intervalMs, extendMinutes, onError, onSuccess]);

  // Return whether heartbeat is running
  return { isRunning: isRunningRef.current };
}

