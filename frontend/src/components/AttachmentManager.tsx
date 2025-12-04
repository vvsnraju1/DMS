import React, { useState, useEffect } from 'react';
import {  Upload, Download, Trash2, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import attachmentService from '../services/attachment.service';
import { Attachment } from '../types/document';
import { formatISTDate } from '../utils/dateUtils';

interface AttachmentManagerProps {
  versionId: number;
  canEdit?: boolean;
}

const AttachmentManager: React.FC<AttachmentManagerProps> = ({
  versionId,
  canEdit = true,
}) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  
  // App alert modal state
  const [appAlert, setAppAlert] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
  }>({ isOpen: false, type: 'success', title: '', message: '' });
  
  const showAppAlert = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
    setAppAlert({ isOpen: true, type, title, message });
  };

  const loadAttachments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await attachmentService.listByVersion(versionId);
      setAttachments(data);
    } catch (err: any) {
      console.error('Error loading attachments:', err);
      setError(err.response?.data?.detail || 'Failed to load attachments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttachments();
  }, [versionId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      const validation = attachmentService.validateFile(file, 50);
      if (!validation.valid) {
        showAppAlert('error', 'Invalid File', validation.error || 'File validation failed');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showAppAlert('warning', 'No File Selected', 'Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      await attachmentService.upload(
        versionId,
        selectedFile,
        description || undefined,
        (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      );

      // Reset form
      setSelectedFile(null);
      setDescription('');
      setShowUploadForm(false);
      setUploadProgress(0);

      // Reload attachments
      await loadAttachments();
      
      showAppAlert('success', 'Upload Complete', 'File uploaded successfully!');
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.response?.data?.detail || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      await attachmentService.downloadFile(attachment.id, attachment.filename);
    } catch (err: any) {
      showAppAlert('error', 'Download Failed', err.response?.data?.detail || 'Failed to download file');
    }
  };

  const handleDelete = async (attachmentId: number) => {
    const confirmed = window.confirm('Delete this attachment? This cannot be undone.');
    if (!confirmed) return;

    try {
      await attachmentService.delete(attachmentId);
      await loadAttachments();
      showAppAlert('success', 'Deleted', 'Attachment deleted successfully!');
    } catch (err: any) {
      showAppAlert('error', 'Delete Failed', err.response?.data?.detail || 'Failed to delete attachment');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Attachments</h2>
        {canEdit && !showUploadForm && (
          <button
            onClick={() => setShowUploadForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Upload size={16} />
            Upload File
          </button>
        )}
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Upload New File</h3>
            <button
              onClick={() => {
                setShowUploadForm(false);
                setSelectedFile(null);
                setDescription('');
                setError(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <input
                type="file"
                onChange={handleFileSelect}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Max 50MB. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, images, ZIP, RAR
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                <File size={16} className="text-blue-600" />
                <span className="flex-1 text-blue-900">{selectedFile.name}</span>
                <span className="text-blue-600">
                  {attachmentService.formatFileSize(selectedFile.size)}
                </span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Supporting documentation"
                disabled={uploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
            </div>

            {uploading && (
              <div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedFile(null);
                  setDescription('');
                }}
                disabled={uploading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachments List */}
      {loading && attachments.length === 0 && (
        <p className="text-gray-600 text-sm">Loading attachments...</p>
      )}

      {!loading && attachments.length === 0 && (
        <p className="text-gray-600 text-sm">No attachments yet.</p>
      )}

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <File size={20} className="text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{attachment.filename}</div>
                  <div className="text-sm text-gray-500">
                    {attachmentService.formatFileSize(attachment.file_size)}
                    {attachment.description && ` • ${attachment.description}`}
                  </div>
                  <div className="text-xs text-gray-400">
                    Uploaded {formatISTDate(attachment.created_at)} IST
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(attachment)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Download"
                >
                  <Download size={18} />
                </button>
                {canEdit && (
                  <button
                    onClick={() => handleDelete(attachment.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* App Alert Modal */}
      {appAlert.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className={`px-6 py-4 ${
              appAlert.type === 'success' ? 'bg-green-50 border-b border-green-200' :
              appAlert.type === 'error' ? 'bg-red-50 border-b border-red-200' :
              'bg-orange-50 border-b border-orange-200'
            }`}>
              <div className="flex items-center gap-3">
                {appAlert.type === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className={`w-6 h-6 ${appAlert.type === 'error' ? 'text-red-600' : 'text-orange-600'}`} />
                )}
                <h3 className={`text-lg font-semibold ${
                  appAlert.type === 'success' ? 'text-green-800' :
                  appAlert.type === 'error' ? 'text-red-800' :
                  'text-orange-800'
                }`}>
                  {appAlert.title}
                </h3>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700">{appAlert.message}</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => setAppAlert({ ...appAlert, isOpen: false })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  appAlert.type === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
                  appAlert.type === 'error' ? 'bg-red-600 text-white hover:bg-red-700' :
                  'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentManager;

