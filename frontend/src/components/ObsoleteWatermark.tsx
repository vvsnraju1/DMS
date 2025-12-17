import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ObsoleteWatermarkProps {
  obsoleteDate?: string;
  replacedByVersion?: string;
  effectiveDate?: string;
}

export default function ObsoleteWatermark({ 
  obsoleteDate, 
  replacedByVersion,
  effectiveDate 
}: ObsoleteWatermarkProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      {/* Diagonal Watermark Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
        <div 
          className="text-red-600 opacity-10 font-bold select-none"
          style={{
            fontSize: '8rem',
            transform: 'rotate(-45deg)',
            whiteSpace: 'nowrap',
            letterSpacing: '0.2em'
          }}
        >
          OBSOLETE
        </div>
      </div>

      {/* Top Banner Alert */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">OBSOLETE DOCUMENT</span>
                <span className="text-red-200">—</span>
                <span className="text-red-100">FOR REFERENCE ONLY</span>
              </div>
              <div className="text-sm text-red-100 mt-1">
                {effectiveDate && (
                  <span>Was effective: {formatDate(effectiveDate)} | </span>
                )}
                {obsoleteDate && (
                  <span>Obsoleted on: {formatDate(obsoleteDate)}</span>
                )}
                {replacedByVersion && (
                  <span> | Replaced by: {replacedByVersion}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to push content below banner */}
      <div className="h-20"></div>

      {/* Bottom Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-2 text-center">
          <p className="text-sm font-medium">
            ⚠️ This is an obsolete version. Do not use for current operations. Refer to the latest effective version.
          </p>
        </div>
      </div>

      {/* Spacer for bottom banner */}
      <div className="h-12"></div>
    </>
  );
}

