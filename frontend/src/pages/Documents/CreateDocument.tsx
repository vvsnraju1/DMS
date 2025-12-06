import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import documentService from '../../services/document.service';
import versionService from '../../services/version.service';
import { useAuth } from '../../context/AuthContext';

export default function CreateDocument() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    doc_number: '',
    department: '',
    description: '',
    createVersion: true, // Option to create initial version
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Validate form
  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return 'Title is required';
    }
    if (!formData.doc_number.trim()) {
      return 'Document number is required';
    }
    if (!formData.department) {
      return 'Department is required';
    }
    return null;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create document metadata
      const document = await documentService.create({
        title: formData.title.trim(),
        document_number: formData.doc_number.trim(),
        department: formData.department,
        description: formData.description.trim() || undefined,
      });

      // Create initial version if requested
      if (formData.createVersion) {
        await versionService.create(document.id, {
          content_html: '<p>Start writing your document here...</p>',
        });
        
        // Navigate to editor
        navigate(`/documents/${document.id}/edit`);
      } else {
        // Navigate to document detail
        navigate(`/documents/${document.id}`);
      }
    } catch (err: any) {
      console.error('Error creating document:', err);
      setError(err.response?.data?.detail || 'Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/documents')}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Documents
        </button>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-brand-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <FileText className="text-white" size={28} />
          </div>
          <div>
            <h1 className="page-title">Create New Document</h1>
            <p className="page-subtitle">Enter the document metadata to get started</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card">
        {/* Title */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Document Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Standard Operating Procedure for Equipment Cleaning"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-sm text-gray-500 mt-1">A descriptive title for the document</p>
        </div>

        {/* Document Number */}
        <div className="mb-6">
          <label htmlFor="doc_number" className="block text-sm font-medium text-gray-700 mb-2">
            Document Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="doc_number"
            name="doc_number"
            value={formData.doc_number}
            onChange={handleChange}
            placeholder="e.g., SOP-QA-001"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Unique identifier following your naming convention</p>
        </div>

        {/* Department */}
        <div className="mb-6">
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select a department</option>
            <option value="Quality Assurance">Quality Assurance</option>
            <option value="Production">Production</option>
            <option value="Research & Development">Research & Development</option>
            <option value="Quality Control">Quality Control</option>
            <option value="Regulatory Affairs">Regulatory Affairs</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Engineering">Engineering</option>
            <option value="Safety">Safety</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">The department that owns this document</p>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-gray-400">(Optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Brief description of the document purpose and scope..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-sm text-gray-500 mt-1">A brief summary of what this document covers</p>
        </div>

        {/* Create Initial Version Option */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              name="createVersion"
              checked={formData.createVersion}
              onChange={handleChange}
              className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Create initial draft version</span>
              <p className="text-sm text-gray-600 mt-1">
                Automatically create Version 1.0 (Draft) and open the editor. 
                Uncheck if you only want to create the document metadata.
              </p>
            </div>
          </label>
        </div>

        {/* Created By Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <strong>Created by:</strong> {user?.full_name} ({user?.username})
          </div>
          <div className="text-sm text-gray-600 mt-1">
            <strong>Roles:</strong> {user?.roles.join(', ')}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Save size={20} />
                {formData.createVersion ? 'Create & Start Editing' : 'Create Document'}
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/documents')}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-sm font-semibold text-yellow-900 mb-2">📋 Document Workflow</h3>
        <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
          <li><strong>Draft:</strong> Create and edit content</li>
          <li><strong>Under Review:</strong> Submit for peer review</li>
          <li><strong>Pending Approval:</strong> Awaiting HOD/QA approval</li>
          <li><strong>Published:</strong> Active and in use</li>
          <li><strong>Archived:</strong> Obsolete or superseded</li>
        </ol>
      </div>
    </div>
  );
}

