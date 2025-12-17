import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Plus, GripVertical, X, FileText, CheckSquare, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CKEditorWrapper from '../../components/Editor/CKEditorWrapper';
import TokenInsertButton from '../../components/Editor/TokenInsertButton';
import templateBuilderService from '../../services/templateBuilder.service';
import templateService from '../../services/template.service';

interface SOPSection {
  id: string;
  key: string;
  name: string;
  enabled: boolean;
  order: number;
  html: string;
  defaultContent: string;
}

interface RequiredMetadataField {
  key: string;
  label: string;
  required: boolean;
}

interface TemplateConfig {
  required_metadata_fields: RequiredMetadataField[];
  category: string;
}

// Available SOP sections with default content (including headings)
const AVAILABLE_SECTIONS: Omit<SOPSection, 'id' | 'enabled' | 'order' | 'html'>[] = [
  {
    key: 'purpose',
    name: '1.0 PURPOSE',
    defaultContent: '<h2>1.0 PURPOSE</h2><p>{{PURPOSE}}</p>',
  },
  {
    key: 'scope',
    name: '2.0 SCOPE',
    defaultContent: '<h2>2.0 SCOPE</h2><p>{{SCOPE}}</p>',
  },
  {
    key: 'definitions',
    name: '3.0 DEFINITIONS / ABBREVIATIONS',
    defaultContent: '<h2>3.0 DEFINITIONS / ABBREVIATIONS</h2><p>{{DEFINITIONS}}</p>',
  },
  {
    key: 'responsibility',
    name: '4.0 RESPONSIBILITY',
    defaultContent: '<h2>4.0 RESPONSIBILITY</h2><p>{{RESPONSIBILITY}}</p>',
  },
  {
    key: 'materials',
    name: '5.0 MATERIALS / REAGENTS',
    defaultContent: '<h2>5.0 MATERIALS / REAGENTS</h2><p>{{MATERIALS}}</p>',
  },
  {
    key: 'equipment',
    name: '6.0 EQUIPMENT',
    defaultContent: '<h2>6.0 EQUIPMENT</h2><p>{{EQUIPMENT}}</p>',
  },
  {
    key: 'procedure',
    name: '7.0 PROCEDURE',
    defaultContent: '<h2>7.0 PROCEDURE</h2><p>{{PROCEDURE}}</p>',
  },
  {
    key: 'safety',
    name: '8.0 SAFETY PRECAUTIONS',
    defaultContent: '<h2>8.0 SAFETY PRECAUTIONS</h2><p>{{SAFETY_PRECAUTIONS}}</p>',
  },
  {
    key: 'records',
    name: '9.0 RECORDS / DOCUMENTATION',
    defaultContent: '<h2>9.0 RECORDS / DOCUMENTATION</h2><p>{{RECORDS}}</p>',
  },
  {
    key: 'references',
    name: '10.0 REFERENCES',
    defaultContent: '<h2>10.0 REFERENCES</h2><p>{{REFERENCES}}</p>',
  },
  {
    key: 'annexures',
    name: '11.0 ANNEXURES / ATTACHMENTS',
    defaultContent: '<h2>11.0 ANNEXURES / ATTACHMENTS</h2><table border="1" class="annexure-table" style="border-collapse: collapse; width: 100%; max-width: 100%; table-layout: fixed; border: 1px solid #000;"><thead><tr><th style="padding: 8pt; font-weight: bold; border: 1px solid #000;">Annexure No.</th><th style="padding: 8pt; font-weight: bold; border: 1px solid #000;">Title</th></tr></thead><tbody><tr><td style="padding: 8pt; border: 1px solid #000;"></td><td style="padding: 8pt; border: 1px solid #000;"></td></tr></tbody></table>',
  },
];

export default function SOPTemplateBuilder() {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId?: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [templateStatus, setTemplateStatus] = useState<string>('Draft');

  // Available metadata fields that can be required
  const availableMetadataFields: RequiredMetadataField[] = [
    { key: 'template_title', label: 'SOP Title', required: true }, // Always required
    { key: 'template_code', label: 'SOP Number', required: false },
    { key: 'revision', label: 'Revision Number', required: false },
    { key: 'effective_date', label: 'Effective Date', required: false },
    { key: 'next_review_date', label: 'Next Review Date', required: false },
    { key: 'department', label: 'Department', required: false },
    { key: 'cc_number', label: 'CC Number', required: false },
    { key: 'confidentiality', label: 'Confidentiality', required: false },
  ];

  // Template configuration state
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig>({
    required_metadata_fields: availableMetadataFields.map(field => ({
      ...field,
      required: field.key === 'template_title', // Only title is required by default
    })),
    category: 'SOP',
  });

  // Sections state
  const [sections, setSections] = useState<SOPSection[]>([]);

  // Token library
  const [tokenLibrary, setTokenLibrary] = useState<any>({});

  // Load template if editing
  useEffect(() => {
    if (templateId) {
      loadTemplate();
    }
    loadTokenLibrary();
    initializeSections();
  }, [templateId]);

  const initializeSections = () => {
    // Title page HTML - matching the image format, full width like signatory
    const titlePageHTML = `
      <div class="title-page-section" style="width: 100%; margin: 0; padding: 0;">
        <table border="1" style="border-collapse: collapse; width: 100%; max-width: 100%; table-layout: fixed; border: 2px solid #000; margin: 0;">
          <tbody>
            <!-- Top row: zerokost logo (left, spans 2 rows) and SOP Title (right) -->
            <tr>
              <td rowspan="2" style="padding: 12pt; vertical-align: middle; width: 20%; border: 2px solid #000; text-align: center; word-wrap: break-word;">
                <img src="/zerokost-logo.png" alt="zerokost Healthcare Pvt. Ltd." style="max-width: 100%; max-height: 80px; height: auto; object-fit: contain; display: block; margin: 0 auto;" />
              </td>
              <td colspan="3" style="text-align: center; padding: 12pt; font-weight: bold; font-size: 16pt; border: 2px solid #000; word-wrap: break-word;">STANDARD OPERATING PROCEDURE</td>
            </tr>
            <!-- Second row: Empty for logo continuation -->
            <tr>
              <td colspan="3" style="padding: 8pt; border: 2px solid #000;"></td>
            </tr>
            <!-- SOP Title row -->
            <tr>
              <td style="padding: 8pt; font-weight: bold; border: 2px solid #000; word-wrap: break-word;">SOP Title</td>
              <td colspan="3" style="padding: 8pt; border: 2px solid #000; word-wrap: break-word; overflow-wrap: break-word;">{{TEMPLATE_TITLE}}</td>
            </tr>
            <!-- SOP Number and CC Number row -->
            <tr>
              <td style="padding: 8pt; font-weight: bold; border: 2px solid #000; word-wrap: break-word;">SOP Number</td>
              <td style="padding: 8pt; background-color: #f0f0f0; border: 2px solid #000; word-wrap: break-word; overflow-wrap: break-word;">{{TEMPLATE_CODE}}</td>
              <td style="padding: 8pt; font-weight: bold; border: 2px solid #000; word-wrap: break-word;">CC Number</td>
              <td style="padding: 8pt; border: 2px solid #000; word-wrap: break-word; overflow-wrap: break-word;">{{CC_NUMBER}}</td>
            </tr>
            <!-- Effective Date and Next Review Date row -->
            <tr>
              <td style="padding: 8pt; font-weight: bold; border: 2px solid #000; word-wrap: break-word;">Effective Date</td>
              <td style="padding: 8pt; border: 2px solid #000; word-wrap: break-word; overflow-wrap: break-word;">{{EFFECTIVE_DATE}}</td>
              <td style="padding: 8pt; font-weight: bold; border: 2px solid #000; word-wrap: break-word;">Next Review Date</td>
              <td style="padding: 8pt; border: 2px solid #000; word-wrap: break-word; overflow-wrap: break-word;">{{NEXT_REVIEW_DATE}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    // Signatory HTML - resized to fit page width with proper cell separation and smaller font
    const signatoryHTML = `
      <h2>Document Signatory Page</h2>
      <table border="1" style="border-collapse: collapse; width: 100%; max-width: 100%; table-layout: fixed; border: 1px solid #000;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="padding: 6pt; font-weight: bold; width: 15%; font-size: 9pt; border: 1px solid #000; text-align: left; word-wrap: break-word;">Signature Type</th>
            <th style="padding: 6pt; font-weight: bold; width: 20%; font-size: 9pt; border: 1px solid #000; text-align: left; word-wrap: break-word;">Name</th>
            <th style="padding: 6pt; font-weight: bold; width: 20%; font-size: 9pt; border: 1px solid #000; text-align: left; word-wrap: break-word;">Designation</th>
            <th style="padding: 6pt; font-weight: bold; width: 20%; font-size: 9pt; border: 1px solid #000; text-align: left; word-wrap: break-word;">Department</th>
            <th style="padding: 6pt; font-weight: bold; width: 25%; font-size: 9pt; border: 1px solid #000; text-align: left; word-wrap: break-word;">Date & Time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 6pt; font-size: 9pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word;">Prepared By</td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_PREPARED_NAME}}</code></td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_PREPARED_DESIGNATION}}</code></td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_PREPARED_DEPARTMENT}}</code></td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_PREPARED_DATE}}</code></td>
          </tr>
          <tr>
            <td style="padding: 6pt; font-size: 9pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word;">Checked By</td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_CHECKED_NAME}}</code></td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_CHECKED_DESIGNATION}}</code></td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_CHECKED_DEPARTMENT}}</code></td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_CHECKED_DATE}}</code></td>
          </tr>
          <tr>
            <td style="padding: 6pt; font-size: 9pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word;">Approved By</td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_APPROVED_NAME}}</code></td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_APPROVED_DESIGNATION}}</code></td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_APPROVED_DEPARTMENT}}</code></td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_APPROVED_DATE}}</code></td>
          </tr>
        </tbody>
      </table>
    `;

    // Initialize with title page and signatory table always enabled
    const initialSections: SOPSection[] = [
      {
        id: 'title_page',
        key: 'title_page',
        name: 'Title Page',
        enabled: true,
        order: 0,
        html: titlePageHTML,
        defaultContent: titlePageHTML,
      },
      {
        id: 'signatory',
        key: 'signatory',
        name: 'Signatory Table',
        enabled: true,
        order: 999, // Always last
        html: signatoryHTML,
        defaultContent: signatoryHTML,
      },
    ];

    // Add other sections as disabled by default
    AVAILABLE_SECTIONS.forEach((section, index) => {
      initialSections.push({
        ...section,
        id: section.key,
        enabled: false,
        order: index + 1,
        html: section.defaultContent,
      });
    });

    setSections(initialSections);
  };

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const template = await templateBuilderService.getTemplate(parseInt(templateId!));
      if (template.template_data) {
        // Load required metadata fields configuration
        if (template.template_data.config) {
          setTemplateConfig(template.template_data.config);
        }
        
        // Update status
        if (template.status) {
          setTemplateStatus(template.status);
        }
        
        // Convert blocks to sections
        const blocks = template.template_data.blocks || [];
        const loadedSections = sections.map(section => {
          const block = blocks.find((b: any) => {
            if (section.key === 'title_page') return b.type === 'title';
            if (section.key === 'signatory') return b.type === 'signatory_table';
            return b.metadata?.section_key === section.key;
          });
          if (block) {
            return { ...section, enabled: true, html: block.html };
          }
          return section;
        });
        setSections(loadedSections);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const loadTokenLibrary = async () => {
    try {
      const library = await templateBuilderService.getTokenLibrary();
      setTokenLibrary(library);
    } catch (err) {
      console.error('Error loading token library:', err);
    }
  };

  const toggleMetadataField = (fieldKey: string) => {
    setTemplateConfig(prev => ({
      ...prev,
      required_metadata_fields: prev.required_metadata_fields.map(field =>
        field.key === fieldKey
          ? { ...field, required: !field.required }
          : field
      ),
    }));
  };
  
  // Update title page when config changes
  useEffect(() => {
    if (sections.length > 0 && templateConfig.required_metadata_fields.length > 0) {
      // Generate new title page HTML with current selected fields
      const selectedFields = templateConfig.required_metadata_fields.filter(f => f.required);
      
      const fieldMap: { [key: string]: { label: string; token: string; specialStyle?: string } } = {
        template_title: { label: 'SOP Title', token: 'TEMPLATE_TITLE' },
        template_code: { label: 'SOP Number', token: 'TEMPLATE_CODE', specialStyle: 'background-color: #f0f0f0;' },
        revision: { label: 'Revision', token: 'REVISION' },
        effective_date: { label: 'Effective Date', token: 'EFFECTIVE_DATE' },
        next_review_date: { label: 'Next Review Date', token: 'NEXT_REVIEW_DATE' },
        department: { label: 'Department', token: 'DEPARTMENT' },
        cc_number: { label: 'CC Number', token: 'CC_NUMBER' },
        confidentiality: { label: 'Confidentiality', token: 'CONFIDENTIALITY' },
      };
      
      let tableRows = '';
      
      // Header rows (always shown)
      tableRows += `
        <tr>
          <td rowspan="2" style="padding: 12pt; vertical-align: middle; width: 20%; border: 2px solid #000; text-align: center;">
            <img src="/zerokost-logo.png" alt="zerokost Healthcare Pvt. Ltd." style="max-width: 100%; max-height: 80px; height: auto; object-fit: contain;" />
          </td>
          <td colspan="3" style="text-align: center; padding: 12pt; font-weight: bold; font-size: 16pt; border: 2px solid #000;">STANDARD OPERATING PROCEDURE</td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 8pt; border: 2px solid #000;"></td>
        </tr>
      `;
      
      // SOP Title is always first (always required)
      const titleField = selectedFields.find(f => f.key === 'template_title');
      if (titleField) {
        tableRows += `
          <tr>
            <td style="padding: 8pt; font-weight: bold; border: 2px solid #000;">SOP Title</td>
            <td colspan="3" style="padding: 8pt; border: 2px solid #000;">{{TEMPLATE_TITLE}}</td>
          </tr>
        `;
      }
      
      // Group remaining fields into rows of 2
      const remainingFields = selectedFields.filter(f => f.key !== 'template_title');
      
      // Process fields in pairs
      for (let i = 0; i < remainingFields.length; i += 2) {
        const field1 = remainingFields[i];
        const field2 = remainingFields[i + 1];
        
        if (field1) {
          const field1Info = fieldMap[field1.key];
          if (field1Info) {
            if (field2 && fieldMap[field2.key]) {
              // Two fields in one row
              const field2Info = fieldMap[field2.key];
              tableRows += `
                <tr>
                  <td style="padding: 8pt; font-weight: bold; border: 2px solid #000;">${field1Info.label}</td>
                  <td style="padding: 8pt; ${field1Info.specialStyle || ''} border: 2px solid #000;">{{${field1Info.token}}}</td>
                  <td style="padding: 8pt; font-weight: bold; border: 2px solid #000;">${field2Info.label}</td>
                  <td style="padding: 8pt; ${field2Info.specialStyle || ''} border: 2px solid #000;">{{${field2Info.token}}}</td>
                </tr>
              `;
            } else {
              // Single field, span 3 columns
              tableRows += `
                <tr>
                  <td style="padding: 8pt; font-weight: bold; border: 2px solid #000;">${field1Info.label}</td>
                  <td colspan="3" style="padding: 8pt; ${field1Info.specialStyle || ''} border: 2px solid #000;">{{${field1Info.token}}}</td>
                </tr>
              `;
            }
          }
        }
      }
      
      const newTitleHTML = `
        <div class="title-page-section" style="width: 100%; margin: 0; padding: 0;">
          <table border="1" style="border-collapse: collapse; width: 100%; max-width: 100%; border: 2px solid #000; table-layout: fixed; margin: 0;">
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      `;
      
      setSections(prevSections => prevSections.map(s =>
        s.key === 'title_page' ? { ...s, html: newTitleHTML } : s
      ));
    }
  }, [templateConfig.required_metadata_fields]);

  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        const newEnabled = !section.enabled;
        // If enabling, ensure HTML is set to default content
        return {
          ...section,
          enabled: newEnabled,
          html: newEnabled && !section.html ? section.defaultContent : section.html,
        };
      }
      return section;
    }));
  };

  const updateSectionContent = (sectionId: string, html: string) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId ? { ...section, html } : section
    ));
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    setSections(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex(s => s.id === sectionId);
      if (index === -1) return prev;

      if (direction === 'up' && index > 0) {
        [sorted[index], sorted[index - 1]] = [sorted[index - 1], sorted[index]];
      } else if (direction === 'down' && index < sorted.length - 1) {
        [sorted[index], sorted[index + 1]] = [sorted[index + 1], sorted[index]];
      }

      // Reassign orders
      return sorted.map((s, i) => ({ ...s, order: i }));
    });
  };

  const insertToken = (sectionId: string, token: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      updateSectionContent(sectionId, section.html + `{{${token}}}`);
    }
  };

  const generateTitlePageHTML = (config?: TemplateConfig) => {
    // Use provided config or current state
    const currentConfig = config || templateConfig;
    
    // Get selected required metadata fields
    const selectedFields = currentConfig.required_metadata_fields.filter(f => f.required);
    
    // Field mapping: key -> {label, token, specialStyle}
    const fieldMap: { [key: string]: { label: string; token: string; specialStyle?: string } } = {
      template_title: { label: 'SOP Title', token: 'TEMPLATE_TITLE' },
      template_code: { label: 'SOP Number', token: 'TEMPLATE_CODE', specialStyle: 'background-color: #f0f0f0;' },
      revision: { label: 'Revision', token: 'REVISION' },
      effective_date: { label: 'Effective Date', token: 'EFFECTIVE_DATE' },
      next_review_date: { label: 'Next Review Date', token: 'NEXT_REVIEW_DATE' },
      department: { label: 'Department', token: 'DEPARTMENT' },
      cc_number: { label: 'CC Number', token: 'CC_NUMBER' },
      confidentiality: { label: 'Confidentiality', token: 'CONFIDENTIALITY' },
    };
    
    // Build table rows dynamically based on selected fields
    let tableRows = '';
    
    // Header rows (always shown) - full width styling
    tableRows += `
      <tr>
        <td rowspan="2" style="padding: 12pt; vertical-align: middle; width: 20%; border: 2px solid #000; text-align: center; word-wrap: break-word;">
          <img src="/zerokost-logo.png" alt="zerokost Healthcare Pvt. Ltd." style="max-width: 100%; max-height: 80px; height: auto; object-fit: contain; display: block; margin: 0 auto;" />
        </td>
        <td colspan="3" style="text-align: center; padding: 12pt; font-weight: bold; font-size: 16pt; border: 2px solid #000; word-wrap: break-word;">STANDARD OPERATING PROCEDURE</td>
      </tr>
      <tr>
        <td colspan="3" style="padding: 8pt; border: 2px solid #000;"></td>
      </tr>
    `;
    
    // SOP Title is always first (always required)
    const titleField = selectedFields.find(f => f.key === 'template_title');
    if (titleField) {
      tableRows += `
        <tr>
          <td style="padding: 8pt; font-weight: bold; border: 2px solid #000; word-wrap: break-word;">SOP Title</td>
          <td colspan="3" style="padding: 8pt; border: 2px solid #000; word-wrap: break-word; overflow-wrap: break-word;">{{TEMPLATE_TITLE}}</td>
        </tr>
      `;
    }
    
    // Group remaining fields into rows of 2
    const remainingFields = selectedFields.filter(f => f.key !== 'template_title');
    
    // Process fields in pairs
    for (let i = 0; i < remainingFields.length; i += 2) {
      const field1 = remainingFields[i];
      const field2 = remainingFields[i + 1];
      
      if (field1) {
        const field1Info = fieldMap[field1.key];
        if (field1Info) {
          if (field2 && fieldMap[field2.key]) {
            // Two fields in one row
            const field2Info = fieldMap[field2.key];
            tableRows += `
              <tr>
                <td style="padding: 8pt; font-weight: bold; border: 2px solid #000; word-wrap: break-word;">${field1Info.label}</td>
                <td style="padding: 8pt; ${field1Info.specialStyle || ''} border: 2px solid #000; word-wrap: break-word; overflow-wrap: break-word;">{{${field1Info.token}}}</td>
                <td style="padding: 8pt; font-weight: bold; border: 2px solid #000; word-wrap: break-word;">${field2Info.label}</td>
                <td style="padding: 8pt; ${field2Info.specialStyle || ''} border: 2px solid #000; word-wrap: break-word; overflow-wrap: break-word;">{{${field2Info.token}}}</td>
              </tr>
            `;
          } else {
            // Single field, span 3 columns
            tableRows += `
              <tr>
                <td style="padding: 8pt; font-weight: bold; border: 2px solid #000; word-wrap: break-word;">${field1Info.label}</td>
                <td colspan="3" style="padding: 8pt; ${field1Info.specialStyle || ''} border: 2px solid #000; word-wrap: break-word; overflow-wrap: break-word;">{{${field1Info.token}}}</td>
              </tr>
            `;
          }
        }
      }
    }
    
    return `
      <div class="title-page-section" style="width: 100%; margin: 0; padding: 0;">
        <table border="1" style="border-collapse: collapse; width: 100%; max-width: 100%; border: 2px solid #000; table-layout: fixed; margin: 0;">
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    `;
  };

  const generateSignatoryHTML = () => {
    // Get signatory HTML from sections if available, otherwise use default
    const signatorySection = sections.find(s => s.key === 'signatory');
    if (signatorySection && signatorySection.html) {
      return signatorySection.html;
    }
    
    // Return the resized format with proper cell separation and smaller font
    return `
      <h2>Document Signatory Page</h2>
      <table border="1" style="border-collapse: collapse; width: 100%; max-width: 100%; table-layout: fixed; border: 1px solid #000;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="padding: 6pt; font-weight: bold; width: 15%; font-size: 9pt; border: 1px solid #000; text-align: left; word-wrap: break-word;">Signature Type</th>
            <th style="padding: 6pt; font-weight: bold; width: 20%; font-size: 9pt; border: 1px solid #000; text-align: left; word-wrap: break-word;">Name</th>
            <th style="padding: 6pt; font-weight: bold; width: 20%; font-size: 9pt; border: 1px solid #000; text-align: left; word-wrap: break-word;">Designation</th>
            <th style="padding: 6pt; font-weight: bold; width: 20%; font-size: 9pt; border: 1px solid #000; text-align: left; word-wrap: break-word;">Department</th>
            <th style="padding: 6pt; font-weight: bold; width: 25%; font-size: 9pt; border: 1px solid #000; text-align: left; word-wrap: break-word;">Date & Time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 6pt; font-size: 9pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word;">Prepared By</td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_PREPARED_NAME}}</code></td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_PREPARED_DESIGNATION}}</code></td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_PREPARED_DEPARTMENT}}</code></td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_PREPARED_DATE}}</code></td>
          </tr>
          <tr>
            <td style="padding: 6pt; font-size: 9pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word;">Checked By</td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_CHECKED_NAME}}</code></td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_CHECKED_DESIGNATION}}</code></td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_CHECKED_DEPARTMENT}}</code></td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_CHECKED_DATE}}</code></td>
          </tr>
          <tr>
            <td style="padding: 6pt; font-size: 9pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word;">Approved By</td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_APPROVED_NAME}}</code></td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_APPROVED_DESIGNATION}}</code></td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_APPROVED_DEPARTMENT}}</code></td>
            <td style="padding: 6pt; font-size: 8pt; border: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;"><code style="font-size: 8pt;">{{SIGNATORY_APPROVED_DATE}}</code></td>
          </tr>
        </tbody>
      </table>
    `;
  };

  const handleSave = async (draft: boolean = true) => {
    try {
      setSaving(true);
      setError(null);

      // Validate that at least template_title is required
      const hasTitle = templateConfig.required_metadata_fields.some(f => f.key === 'template_title' && f.required);
      if (!hasTitle) {
        setError('SOP Title is required and cannot be deselected');
        setSaving(false);
        return;
      }

      // Build blocks from enabled sections
      const enabledSections = sections
        .filter(s => s.enabled)
        .sort((a, b) => a.order - b.order);

      const blocks = enabledSections.map((section, index) => {
        let html = section.html;
        let blockType = 'paragraph';

        if (section.key === 'title_page') {
          // Generate title page with current selected fields
          html = generateTitlePageHTML(templateConfig);
          blockType = 'title';
        } else if (section.key === 'signatory') {
          html = generateSignatoryHTML();
          blockType = 'signatory_table';
        } else if (section.key === 'annexures') {
          blockType = 'annexure_table';
        }

        return {
          id: `block_${section.id}`,
          type: blockType,
          html: html || section.defaultContent,
          order: index,
          metadata: { section_key: section.key },
        };
      });

      // Build metadata structure with required fields info
      const metadata = {
        template_title: `SOP Template - ${templateConfig.category}`, // Placeholder name for template
        category: templateConfig.category,
      };

      const templateData = {
        metadata,
        blocks,
        config: {
          required_metadata_fields: templateConfig.required_metadata_fields,
          category: templateConfig.category,
        },
      };

      console.log('Saving template data:', JSON.stringify(templateData, null, 2));

      let response;
      try {
        if (templateId) {
          response = await templateBuilderService.updateTemplate(parseInt(templateId), {
            template_data: templateData,
          });
          console.log('Update response:', response);
          setSuccess('Template updated successfully!');
        } else {
          response = await templateBuilderService.createTemplate({
            template_data: templateData,
          });
          console.log('Create response:', response);
          setSuccess('Template saved successfully!');
        }
        
        // Update status if available
        if (response.status) {
          setTemplateStatus(response.status);
        }
      } catch (apiError: any) {
        console.error('API Error details:', {
          message: apiError.message,
          response: apiError.response?.data,
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
        });
        throw apiError;
      }

      // Always redirect to templates list after saving draft
      if (draft) {
        setSuccess('Template saved successfully!');
        setTimeout(() => {
          navigate('/templates');
        }, 1500);
      } else {
        setTimeout(() => {
          navigate('/templates');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Save error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to save template';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!templateId) return;
    
    try {
      setSaving(true);
      setError(null);
      
      // First save the current draft
      await handleSave(true);
      
      // Get the latest version ID
      const versions = await templateService.listVersions(parseInt(templateId));
      const latestVersion = versions.items?.[0];
      
      if (latestVersion) {
        await templateService.submitForReview(parseInt(templateId), latestVersion.id);
        setSuccess('Template submitted for review successfully!');
        setTemplateStatus('UnderReview');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit for review');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!templateId) return;
    
    try {
      setSaving(true);
      setError(null);
      
      // Get the latest version ID
      const versions = await templateService.listVersions(parseInt(templateId));
      const latestVersion = versions.items?.[0];
      
      if (latestVersion) {
        await templateService.submitForApproval(parseInt(templateId), latestVersion.id);
        setSuccess('Template submitted for approval successfully!');
        setTemplateStatus('PendingApproval');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit for approval');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    try {
      setLoading(true);
      
      const enabledSections = sections
        .filter(s => s.enabled)
        .sort((a, b) => a.order - b.order);

      // Use sample values for preview
      const tokenValues: { [key: string]: string } = {
        TEMPLATE_TITLE: 'Sample SOP Title',
        TEMPLATE_CODE: 'SP-XXX-001-01',
        REVISION: '01',
        EFFECTIVE_DATE: new Date().toLocaleDateString(),
        NEXT_REVIEW_DATE: new Date().toLocaleDateString(),
        CC_NUMBER: 'CC-001',
        DEPARTMENT: 'Quality Assurance',
        CONFIDENTIALITY: 'Internal',
        PURPOSE: '{{PURPOSE}}',
        SCOPE: '{{SCOPE}}',
        DEFINITIONS: '{{DEFINITIONS}}',
        RESPONSIBILITY: '{{RESPONSIBILITY}}',
        MATERIALS: '{{MATERIALS}}',
        EQUIPMENT: '{{EQUIPMENT}}',
        PROCEDURE: '{{PROCEDURE}}',
        SAFETY_PRECAUTIONS: '{{SAFETY_PRECAUTIONS}}',
        RECORDS: '{{RECORDS}}',
        REFERENCES: '{{REFERENCES}}',
      };

      const previewBlocks = enabledSections.map(section => {
        let html = section.html;
        
        if (section.key === 'title_page') {
          html = generateTitlePageHTML(templateConfig);
        } else if (section.key === 'signatory') {
          html = generateSignatoryHTML();
        }

        // Replace tokens
        Object.entries(tokenValues).forEach(([token, value]) => {
          html = html.replace(new RegExp(`\\{\\{${token}\\}\\}`, 'g'), value || `{{${token}}}`);
        });

        return html;
      });

      setPreviewHtml(previewBlocks.join(''));
      setShowPreview(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !templateId) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  const enabledSections = sections.filter(s => s.enabled).sort((a, b) => a.order - b.order);
  const availableSections = sections.filter(s => s.key !== 'title_page' && s.key !== 'signatory');

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Left Sidebar - Required Metadata Fields Selection */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Template Configuration</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Category
            </label>
            <select
              value={templateConfig.category}
              onChange={(e) => setTemplateConfig(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="SOP">SOP</option>
              <option value="STP">STP</option>
              <option value="Form">Form</option>
              <option value="Report">Report</option>
              <option value="Annexure">Annexure</option>
            </select>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Required Metadata Fields
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Select which metadata fields should be required when creating documents from this template.
            </p>
            
            <div className="space-y-2">
              {templateConfig.required_metadata_fields.map((field) => (
                <label
                  key={field.key}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={() => toggleMetadataField(field.key)}
                    disabled={field.key === 'template_title'} // Title is always required
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700">{field.label}</span>
                    {field.key === 'template_title' && (
                      <span className="ml-2 text-xs text-gray-500">(Always required)</span>
                    )}
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> These fields will be required when users create documents from this template. 
                Users will fill in the actual values at document creation time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/templates')}
                className="text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {templateId ? 'Edit SOP Template' : 'Create SOP Template'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {templateStatus && (
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  templateStatus === 'Published' ? 'bg-green-100 text-green-800' :
                  templateStatus === 'PendingApproval' ? 'bg-yellow-100 text-yellow-800' :
                  templateStatus === 'UnderReview' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {templateStatus}
                </span>
              )}
              <button
                onClick={handlePreview}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Eye size={16} />
                Preview
              </button>
              {templateId && templateStatus === 'Draft' && (
                <button
                  onClick={handleSubmitForReview}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  Submit for Review
                </button>
              )}
              {templateId && templateStatus === 'UnderReview' && (
                <button
                  onClick={handleSubmitForApproval}
                  disabled={saving}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2"
                >
                  Submit for Approval
                </button>
              )}
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="btn btn-primary flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-b border-green-200 px-6 py-3">
            <p className="text-green-700 text-sm flex items-center gap-2">
              <CheckCircle size={16} />
              {success}
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {/* Section Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select SOP Sections</h2>
              <p className="text-sm text-gray-600 mb-4">
                Check the sections you want to include in your SOP template. You can edit each section's content after enabling it.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {availableSections.map((section) => (
                  <label
                    key={section.id}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={() => toggleSection(section.id)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">{section.name}</span>
                  </label>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Title Page and Signatory Table are always included and cannot be disabled.
                </p>
              </div>
            </div>

            {/* Enabled Sections - Editable */}
            {enabledSections.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">SOP Sections (Drag to reorder)</h2>
                
                {enabledSections.map((section, index) => (
                  <div
                    key={section.id}
                    className="bg-white rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <GripVertical className="text-gray-400 cursor-move" size={18} />
                        <h3 className="text-sm font-semibold text-gray-900">{section.name}</h3>
                        {section.key !== 'title_page' && section.key !== 'signatory' && (
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="ml-4 text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {index > 0 && (
                          <button
                            onClick={() => moveSection(section.id, 'up')}
                            className="p-1 text-gray-500 hover:text-gray-700"
                            title="Move up"
                          >
                            ↑
                          </button>
                        )}
                        {index < enabledSections.length - 1 && (
                          <button
                            onClick={() => moveSection(section.id, 'down')}
                            className="p-1 text-gray-500 hover:text-gray-700"
                            title="Move down"
                          >
                            ↓
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      {section.key === 'title_page' || section.key === 'signatory' ? (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-600">
                            {section.key === 'title_page' 
                              ? 'Title page is auto-generated with metadata. No editing needed.'
                              : 'Signatory table is auto-generated. No editing needed.'}
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="mb-3">
                            <TokenInsertButton
                              onTokenSelect={(token) => insertToken(section.id, token)}
                              tokenLibrary={tokenLibrary}
                            />
                          </div>
                          <CKEditorWrapper
                            initialContent={section.html || section.defaultContent}
                            onChange={(html) => updateSectionContent(section.id, html)}
                            placeholder={`Edit ${section.name} content... Use tokens like {{${section.key.toUpperCase()}}}`}
                            minHeight="200px"
                          />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {enabledSections.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">Select sections above to build your SOP template</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">SOP Template Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
              <div className="template-preview-container">
                <div
                  className="template-preview a4-page"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
              <style>{`
                .template-preview-container {
                  display: flex;
                  justify-content: center;
                  padding: 2rem;
                }
                
                .a4-page {
                  width: 210mm;
                  min-height: 297mm;
                  background: white;
                  padding: 20mm 15mm;
                  margin: 0 auto;
                  box-shadow: 0 0 10px rgba(0,0,0,0.1);
                  font-family: 'Times New Roman', serif;
                  font-size: 12pt;
                  line-height: 1.5;
                  box-sizing: border-box;
                }
                
                .a4-page .title-page-section {
                  width: 100%;
                  max-width: 100%;
                  margin: 0;
                  padding: 0;
                  margin-bottom: 20mm;
                  box-sizing: border-box;
                }
                
                .a4-page .title-page-section table {
                  border-collapse: collapse;
                  width: 100% !important;
                  max-width: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  border: 2px solid #000;
                  table-layout: fixed;
                  box-sizing: border-box;
                }
                
                .a4-page .title-page-section table td {
                  box-sizing: border-box;
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                }
                
                .a4-page table {
                  border-collapse: collapse;
                  width: 100%;
                  margin: 12pt 0;
                  border: 1px solid #000;
                }
                
                .a4-page table th,
                .a4-page table td {
                  border: 1px solid #000;
                  padding: 6pt 8pt;
                  text-align: left;
                  font-size: 11pt;
                }
                
                .a4-page table th {
                  background-color: #f0f0f0;
                  font-weight: 600;
                }
                
                .a4-page h1 { font-size: 18pt; margin: 18pt 0 12pt; }
                .a4-page h2 { font-size: 16pt; margin: 16pt 0 10pt; }
                .a4-page h3 { font-size: 14pt; margin: 14pt 0 8pt; }
                .a4-page p { margin: 6pt 0; text-align: justify; }
                .a4-page ul, .a4-page ol { margin: 6pt 0; padding-left: 20pt; }
              `}</style>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

