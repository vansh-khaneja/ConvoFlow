'use client';

import { useState, useEffect } from 'react';
import { ComponentProps } from '../types';
import { API_BASE } from '@/api/config';

export function FileUpload({ component, value, onChange, theme, disabled }: ComponentProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justUploaded, setJustUploaded] = useState(false);

  // Initialize fileName from saved value when component mounts or value changes
  useEffect(() => {
    if (value && typeof value === 'object') {
      // Extract filename from saved file metadata
      if (value.file?.filename || value.file?.original_name) {
        setFileName(value.file.filename || value.file.original_name);
      } else if (value.filename || value.original_name) {
        setFileName(value.filename || value.original_name);
      }
      // Reset justUploaded flag when loading existing value
      setJustUploaded(false);
    }
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setFileName(file.name);
    setError(null);
    setUploading(true);
    setJustUploaded(false);

    // Delete old file if exists
    if (value && typeof value === 'object' && value.file?.stored_name) {
      try {
        await fetch(`${API_BASE}/api/v1/files/${value.file.stored_name}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.warn('Failed to delete old file:', err);
        // Continue with upload even if delete fails
      }
    }

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload file to backend
      const response = await fetch(`${API_BASE}/api/v1/files/upload`, {
        method: 'POST',
        body: formData,
        // Note: Don't set Content-Type header - browser will set it with boundary for multipart/form-data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'File upload failed');
      }

      const result = await response.json();

      // Pass the file metadata to onChange
      onChange(result);
      setJustUploaded(true);
    } catch (err) {
      console.error('File upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      setFileName(null);
      onChange(null);
      setJustUploaded(false);
    } finally {
      setUploading(false);
    }
  };

  const primaryColor = theme?.primaryColor || '#3b82f6';
  const backgroundColor = theme?.backgroundColor || '#13111C';
  const textColor = theme?.textColor || '#ffffff';
  const mutedTextColor = textColor + '60';

  return (
    <div className="space-y-1">
      {/* Show existing file if present */}
      {fileName && !uploading && !error && (
        <div
          className="flex items-center justify-between px-4 py-3 border rounded-lg transition-all duration-200"
          style={{
            backgroundColor: backgroundColor,
            borderColor: primaryColor + '60',
            color: textColor,
            borderWidth: '1.5px',
            borderStyle: 'solid'
          }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <svg className="w-4 h-4 flex-shrink-0" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm truncate">{fileName}</span>
            {justUploaded && (
              <span className="text-xs" style={{ color: '#10b981' }}>(uploaded)</span>
            )}
          </div>
          <button
            type="button"
            onClick={async () => {
              // Delete file from server
              if (value && typeof value === 'object' && value.file?.stored_name) {
                try {
                  await fetch(`${API_BASE}/api/v1/files/${value.file.stored_name}`, {
                    method: 'DELETE',
                  });
                } catch (err) {
                  console.warn('Failed to delete file from server:', err);
                }
              }
              setFileName(null);
              setError(null);
              onChange(null);
            }}
            className="ml-2 text-xs flex-shrink-0 px-2 py-1 rounded transition-colors hover:bg-opacity-10"
            style={{ 
              color: '#ef4444',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444' + '20';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            disabled={disabled}
          >
            Remove
          </button>
        </div>
      )}

      {/* Show file input when no file or during upload */}
      {(!fileName || error) && (
        <label className="block">
          <input
            type="file"
            onChange={handleFileChange}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:cursor-pointer"
            style={{
              backgroundColor: backgroundColor,
              borderColor: primaryColor + '60',
              color: textColor,
              borderWidth: '1.5px',
              borderStyle: 'solid',
              opacity: disabled || uploading ? 0.5 : 1,
              cursor: disabled || uploading ? 'not-allowed' : 'pointer',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = primaryColor;
              e.target.style.boxShadow = `0 0 0 2px ${primaryColor}40`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = primaryColor + '60';
              e.target.style.boxShadow = 'none';
            }}
            disabled={disabled || uploading}
            accept={component.accept}
            multiple={component.multiple}
            aria-label={component.label}
            aria-required={component.required}
            aria-describedby={component.description ? `${component.name}-description` : undefined}
          />
        </label>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-sm" style={{ color: primaryColor }}>
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Uploading file...</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-sm" style={{ color: '#ef4444' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      {component.description && (
        <p 
          id={`${component.name}-description`}
          className="text-xs"
          style={{ color: mutedTextColor }}
        >
          {component.description}
        </p>
      )}
      {component.max_file_size && (
        <p 
          className="text-xs"
          style={{ color: mutedTextColor }}
        >
          Max file size: {(component.max_file_size / 1024 / 1024).toFixed(1)} MB
        </p>
      )}
    </div>
  );
}

