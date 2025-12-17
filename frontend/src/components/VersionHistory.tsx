import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Archive,
  FileText,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  GitBranch,
  Plus
} from 'lucide-react';
import { DocumentVersion, ChangeType } from '../types/document';
import versionService from '../services/version.service';
import { useAuth } from '../context/AuthContext';

interface VersionHistoryProps {
  documentId: number;
  currentVersionId?: number;
  onVersionSelect?: (version: DocumentVersion) => void;
  onCreateNewVersion?: () => void;
  showCreateButton?: boolean;
}

export default function VersionHistory({ 
  documentId, 
  currentVersionId, 
  onVersionSelect,
  onCreateNewVersion,
  showCreateButton = true
}: VersionHistoryProps) {
  const { user } = useAuth();
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set());
  const [includeObsolete, setIncludeObsolete] = useState(false);

  useEffect(() => {
    loadVersions();
  }, [documentId, includeObsolete]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (includeObsolete) {
        // Get full version history including obsolete
        const history = await versionService.getVersionHistory(documentId);
        setVersions(history);
      } else {
        // Get only non-obsolete versions
        const response = await versionService.listWithFilters(documentId, {
          include_obsolete: false
        });
        setVersions(response.versions || []);
      }
    } catch (err: any) {
      console.error('Error loading versions:', err);
      setError(err.response?.data?.detail || 'Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (versionId: number) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedVersions(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft':
        return <FileText className="text-gray-400" size={18} />;
      case 'Under Review':
        return <Clock className="text-blue-500" size={18} />;
      case 'Pending Approval':
        return <AlertTriangle className="text-yellow-500" size={18} />;
      case 'Approved':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'Effective':
        return <CheckCircle className="text-green-600" size={18} />;
      case 'Obsolete':
        return <Archive className="text-gray-400" size={18} />;
      case 'Rejected':
        return <XCircle className="text-red-500" size={18} />;
      case 'Archived':
        return <Archive className="text-gray-500" size={18} />;
      default:
        return <FileText className="text-gray-400" size={18} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'Under Review':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'Pending Approval':
        return 'bg-yellow-50 text-yellow-700 border-yellow-300';
      case 'Approved':
        return 'bg-green-50 text-green-700 border-green-300';
      case 'Effective':
        return 'bg-green-100 text-green-800 border-green-400 font-semibold';
      case 'Obsolete':
        return 'bg-gray-100 text-gray-600 border-gray-300 line-through';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-300';
      case 'Archived':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getChangeTypeColor = (changeType: ChangeType | null) => {
    if (!changeType) return 'bg-gray-100 text-gray-600';
    switch (changeType) {
      case 'Major':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Minor':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canCreateNewVersion = (version: DocumentVersion) => {
    // Only allow creating new version from Effective versions
    return version.status === 'Effective' && version.is_latest && (user?.roles.includes('Author') || user?.roles.includes('DMS_Admin'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading version history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
        <div className="flex items-center gap-3">
          <label className="flex items-center text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={includeObsolete}
              onChange={(e) => setIncludeObsolete(e.target.checked)}
              className="mr-2 rounded border-gray-300"
            />
            Show obsolete versions
          </label>
        </div>
      </div>

      {/* Version List */}
      <div className="space-y-3">
        {versions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No versions found
          </div>
        ) : (
          versions.map((version) => (
            <div
              key={version.id}
              className={`border rounded-lg transition-all ${
                version.id === currentVersionId
                  ? 'border-blue-500 bg-blue-50'
                  : version.status === 'Obsolete'
                  ? 'border-gray-200 bg-gray-50 opacity-75'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Version Header */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => toggleExpand(version.id)}
                      className="mt-1 text-gray-400 hover:text-gray-600"
                    >
                      {expandedVersions.has(version.id) ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(version.status)}
                        <span className="text-lg font-semibold text-gray-900">
                          {version.version_string || `v${version.version_number}`}
                        </span>
                        
                        <span
                          className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(
                            version.status
                          )}`}
                        >
                          {version.status}
                        </span>

                        {version.is_latest && version.status !== 'Obsolete' && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-300 font-medium">
                            Latest
                          </span>
                        )}

                        {version.change_type && (
                          <span
                            className={`px-2 py-1 text-xs rounded-full border ${getChangeTypeColor(
                              version.change_type
                            )}`}
                          >
                            {version.change_type} Change
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span>
                            Created by {version.created_by_username || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{formatDate(version.created_at)}</span>
                        </div>
                        {version.parent_version_id && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <GitBranch size={14} />
                            <span>Branched from parent version</span>
                          </div>
                        )}
                      </div>

                      {version.change_reason && (
                        <div className="mt-2 text-sm text-gray-700 bg-gray-50 rounded p-2">
                          <strong>Change Reason:</strong> {version.change_reason}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {onVersionSelect && version.status !== 'Obsolete' && (
                      <button
                        onClick={() => onVersionSelect(version)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      >
                        View
                      </button>
                    )}
                    
                    {canCreateNewVersion(version) && showCreateButton && onCreateNewVersion && (
                      <button
                        onClick={onCreateNewVersion}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <Plus size={16} />
                        New Version
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedVersions.has(version.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                    {version.effective_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Effective Date:</span>
                        <span className="font-medium">{formatDate(version.effective_date)}</span>
                      </div>
                    )}
                    
                    {version.obsolete_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Obsoleted Date:</span>
                        <span className="font-medium text-red-600">
                          {formatDate(version.obsolete_date)}
                        </span>
                      </div>
                    )}
                    
                    {version.approved_by_username && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Approved By:</span>
                        <span className="font-medium">{version.approved_by_username}</span>
                      </div>
                    )}
                    
                    {version.approved_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Approved At:</span>
                        <span className="font-medium">{formatDate(version.approved_at)}</span>
                      </div>
                    )}
                    
                    {version.change_summary && (
                      <div className="pt-2">
                        <span className="text-gray-600">Summary:</span>
                        <p className="mt-1 text-gray-700">{version.change_summary}</p>
                      </div>
                    )}

                    {version.status === 'Obsolete' && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">
                          ⚠️ <strong>OBSOLETE</strong> – This version has been superseded and is for reference only.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

