import React, { useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface CKEditorWrapperProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  onReady?: (editor: any) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
}

const CKEditorWrapper: React.FC<CKEditorWrapperProps> = ({
  initialContent = '',
  onChange,
  onReady,
  onBlur,
  onFocus,
  placeholder = 'Start writing your document here...',
  disabled = false,
  minHeight = '500px',
}) => {
  const editorRef = useRef<any>(null);

  const editorConfig = {
    placeholder,
    // Classic build comes with pre-configured plugins
    // We can customize the toolbar here
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      '|',
      'link',
      'bulletedList',
      'numberedList',
      '|',
      'outdent',
      'indent',
      '|',
      'insertTable',
      'blockQuote',
      '|',
      'undo',
      'redo',
    ],
  };

  const handleEditorReady = (editor: any) => {
    editorRef.current = editor;

    // Set min height for editing area
    const editingView = editor.editing.view;
    const domElement = editingView.getDomRoot();
    if (domElement) {
      domElement.style.minHeight = minHeight;
    }

    if (onReady) {
      onReady(editor);
    }
  };

  const handleEditorChange = (_event: any, editor: any) => {
    const data = editor.getData();
    if (onChange) {
      onChange(data);
    }
  };

  const handleEditorBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };

  const handleEditorFocus = () => {
    if (onFocus) {
      onFocus();
    }
  };

  return (
    <div className="ckeditor-wrapper">
      <CKEditor
        editor={ClassicEditor}
        config={editorConfig}
        data={initialContent}
        onReady={handleEditorReady}
        onChange={handleEditorChange}
        onBlur={handleEditorBlur}
        onFocus={handleEditorFocus}
        disabled={disabled}
      />

      <style>{`
        .ckeditor-wrapper .ck-editor {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .ckeditor-wrapper .ck-editor__top {
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .ckeditor-wrapper .ck-toolbar {
          background: #f9fafb !important;
          border: none !important;
          padding: 0.75rem !important;
        }

        .ckeditor-wrapper .ck-editor__main {
          background: white;
        }

        .ckeditor-wrapper .ck-content {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14px;
          line-height: 1.6;
          padding: 1.5rem !important;
        }

        .ckeditor-wrapper .ck-content h1 {
          font-size: 2em;
          font-weight: 700;
          margin: 1.5rem 0 1rem;
        }

        .ckeditor-wrapper .ck-content h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem;
        }

        .ckeditor-wrapper .ck-content h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin: 1rem 0 0.5rem;
        }

        .ckeditor-wrapper .ck-content p {
          margin: 0.5rem 0;
        }

        .ckeditor-wrapper .ck-content ul,
        .ckeditor-wrapper .ck-content ol {
          margin: 0.75rem 0;
          padding-left: 2rem;
        }

        .ckeditor-wrapper .ck-content table {
          border-collapse: collapse;
          margin: 1rem 0;
          width: 100%;
        }

        .ckeditor-wrapper .ck-content table td,
        .ckeditor-wrapper .ck-content table th {
          border: 1px solid #d1d5db;
          padding: 0.5rem;
        }

        .ckeditor-wrapper .ck-content blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }

        .ckeditor-wrapper .ck-content code {
          background: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875em;
        }

        .ckeditor-wrapper .ck-content a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .ckeditor-wrapper .ck-content a:hover {
          color: #2563eb;
        }

        /* Disabled state */
        .ckeditor-wrapper .ck-editor.ck-read-only {
          opacity: 0.6;
          pointer-events: none;
        }

        /* Focus state */
        .ckeditor-wrapper .ck-editor__editable:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Ensure min height */
        .ckeditor-wrapper .ck-content {
          min-height: ${minHeight};
        }
      `}</style>
    </div>
  );
};

export default CKEditorWrapper;
