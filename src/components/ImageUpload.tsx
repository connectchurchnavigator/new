'use client';

import { useState } from 'react';

interface ImageUploadProps {
  kind: 'avatar' | 'cover' | 'gallery';
  label: string;
  onUploaded: (url: string) => void;
  onMultipleUploaded?: (urls: string[]) => void;
  currentUrl?: string;
  multiple?: boolean;
}

export function ImageUpload({ kind, label, onUploaded, onMultipleUploaded, currentUrl, multiple }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFiles(files: FileList | File[]) {
    setError('');
    setUploading(true);

    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    if (!multiple || fileArray.length === 1) {
      const file = fileArray[0];
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('kind', kind);

        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Upload failed');

        setPreview(data.url);
        onUploaded(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
        setPreview(currentUrl);
      } finally {
        setUploading(false);
      }
    } else {
      try {
        const uploadedUrls: string[] = [];
        for (const file of fileArray) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('kind', kind);

          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          const data = await res.json();

          if (res.ok && data.url) {
            uploadedUrls.push(data.url);
          }
        }

        if (uploadedUrls.length > 0) {
          if (onMultipleUploaded) {
            onMultipleUploaded(uploadedUrls);
          } else {
            uploadedUrls.forEach(url => onUploaded(url));
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    }
  }

  return (
    <div>
      <label className="block text-xs font-bold text-ink mb-2">{label}</label>
      <div
        onClick={() => document.getElementById(`upload-${kind}`)?.click()}
        className="relative border-[1.5px] border-dashed border-border rounded-2xl h-[130px] flex items-center justify-center cursor-pointer bg-surface overflow-hidden hover:border-purple-500 transition-colors"
      >
        {preview && !multiple ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-gray-light">
            <i className="ti ti-cloud-upload text-2xl block mx-auto mb-1.5" />
            <div className="text-xs">
              {uploading ? 'Uploading image…' : multiple ? `Click to upload multiple photos` : `Click to upload ${kind}`}
            </div>
          </div>
        )}

        {/* Persistent Uploading Overlay */}
        {uploading && (
          <div 
            style={{ 
              position: "absolute", 
              inset: 0, 
              background: "rgba(15, 23, 42, 0.75)", 
              backdropFilter: "blur(2px)",
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "#ffffff", 
              zIndex: 20 
            }}
          >
            <i className="ti ti-loader-2 animate-spin" style={{ fontSize: "28px", color: "#a855f7", marginBottom: "8px" }} />
            <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.02em" }}>Uploading image...</span>
            <span style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "2px" }}>Please wait a moment</span>
          </div>
        )}
        <input
          id={`upload-${kind}`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
            }
          }}
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}
