import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import documentService from '../services/document.service';
import versionService from '../services/version.service';
import commentService from '../services/comment.service';
import { Document, DocumentVersion } from '../types/document';
import { formatIST } from '../utils/dateUtils';

interface TaskItem {
  document: Document;
  version: DocumentVersion;
  taskType: string;
  priority: string;
  unresolvedComments: number;
}

export default function PendingTasks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Determine what tasks this user should see
  const getTasksForRole = () => {
    if (!user) return [];

    const roles = user.roles;
    const taskTypes: string[] = [];

    // Admin and Author see Drafts
    if (roles.includes('DMS_Admin') || roles.includes('Author')) {
      taskTypes.push('Draft');
    }

    // Reviewer sees Under Review
    if (roles.includes('Reviewer')) {
      taskTypes.push('Under Review');
    }

    // Approver sees Pending Approval
    if (roles.includes('Approver')) {
      taskTypes.push('Pending Approval');
    }

    // DMS Admin sees everything + Ready to Publish
    if (roles.includes('DMS_Admin')) {
      taskTypes.push('Under Review', 'Pending Approval', 'Ready to Publish');
    }

    return taskTypes;
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const taskTypes = getTasksForRole();
      if (taskTypes.length === 0) {
        setTasks([]);
        setLoading(false);
        return;
      }

      // Load all documents
      const docsResponse = await documentService.list({ limit: 100 });
      const allDocs = docsResponse.items || [];

      // For each document, get latest version and check status
      const taskPromises = allDocs.map(async (doc) => {
        try {
          const versions = await versionService.listByDocument(doc.id);
          if (versions.length === 0) return null;

          // Get the latest draft/active version
          const latestVersion = versions[0]; // Already sorted by version_number desc

          // Check if this version's status matches user's role
          const status = latestVersion.status;
          
          // Check for unresolved comments
          let unresolvedComments = 0;
          try {
            const commentsResponse = await commentService.list(doc.id, latestVersion.id, false);
            unresolvedComments = commentsResponse.comments.filter((c: any) => !c.is_resolved).length;
          } catch (commentErr) {
            // Ignore comment errors, default to 0
          }
          
          // Map status to task type
          let taskType = '';
          let priority = 'medium';

          if (status === 'Draft' && taskTypes.includes('Draft')) {
            taskType = 'Draft - Continue Editing';
            // Set HIGH priority if document has unresolved comments (returned from reviewer)
            priority = unresolvedComments > 0 ? 'high' : 'low';
            if (unresolvedComments > 0) {
              taskType = 'Draft - Address Comments';
            }
          } else if (status === 'Under Review' && taskTypes.includes('Under Review')) {
            taskType = 'Review Required';
            priority = 'high';
          } else if (status === 'Pending Approval' && taskTypes.includes('Pending Approval')) {
            taskType = 'Approval Required';
            priority = 'high';
          } else if (status === 'Approved' && taskTypes.includes('Ready to Publish')) {
            taskType = 'Ready to Publish';
            priority = 'medium';
          }

          if (taskType) {
            return {
              document: doc,
              version: latestVersion,
              taskType,
              priority,
              unresolvedComments,
            };
          }

          return null;
        } catch (err) {
          console.error(`Error loading versions for document ${doc.id}:`, err);
          return null;
        }
      });

      const allTasks = await Promise.all(taskPromises);
      const validTasks = allTasks.filter((t): t is TaskItem => t !== null);

      setTasks(validTasks);
    } catch (err: any) {
      console.error('Error loading tasks:', err);
      setError(err.response?.data?.detail || 'Failed to load pending tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTaskIcon = (taskType: string) => {
    if (taskType.includes('Draft')) return <FileText className="text-gray-600" size={20} />;
    if (taskType.includes('Review')) return <AlertCircle className="text-blue-600" size={20} />;
    if (taskType.includes('Approval')) return <CheckCircle className="text-orange-600" size={20} />;
    if (taskType.includes('Publish')) return <CheckCircle className="text-green-600" size={20} />;
    return <FileText className="text-gray-600" size={20} />;
  };

  const filteredTasks = activeTab === 'all' 
    ? tasks 
    : tasks.filter(t => t.priority === activeTab);

  const taskCounts = {
    all: tasks.length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your pending tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error</h2>
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pending Tasks</h1>
        <p className="text-gray-600 mt-1">Documents awaiting your action</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Tasks ({taskCounts.all})
          </button>
          <button
            onClick={() => setActiveTab('high')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'high'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            High Priority ({taskCounts.high})
          </button>
          <button
            onClick={() => setActiveTab('medium')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'medium'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Medium Priority ({taskCounts.medium})
          </button>
          <button
            onClick={() => setActiveTab('low')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'low'
                ? 'border-gray-500 text-gray-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Low Priority ({taskCounts.low})
          </button>
        </nav>
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-600">You have no pending tasks at the moment.</p>
        </div>
      )}

      {/* Task List */}
      {filteredTasks.length > 0 && (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={`${task.document.id}-${task.version.id}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/documents/${task.document.id}`)}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getTaskIcon(task.taskType)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {task.document.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {task.document.document_number} • {task.document.department}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>Version {task.version.version_number}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>
                        Updated {formatIST(task.version.updated_at)} IST
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded text-sm font-medium ${
                        task.unresolvedComments > 0 && task.taskType.includes('Draft')
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {task.taskType}
                      </div>
                      {task.unresolvedComments > 0 && (
                        <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {task.unresolvedComments} comment{task.unresolvedComments > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (task.taskType.includes('Draft')) {
                          navigate(`/documents/${task.document.id}/edit`);
                        } else {
                          navigate(`/documents/${task.document.id}`);
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {task.taskType.includes('Draft') ? 'Continue Editing →' : 'Take Action →'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

