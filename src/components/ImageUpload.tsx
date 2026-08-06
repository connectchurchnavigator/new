'use client';

import { useState } from 'react';

interface ImageUploadProps {
  kind: 'avatar' | 'cover' | 'gallery';
  label: string;
  onUploaded: (url: string) => void;
  currentUrl?: string;
}

export function ImageUpload({ kind, label, onUploaded, currentUrl }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file: File) {
    setError('');
    setUploading(true);

    // Show an instant local preview while the real upload happens.
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
  }

  return (
    <div>
      <label className="block text-xs font-bold text-ink mb-2">{label}</label>
      <div
        onClick={() => document.getElementById(`upload-${kind}`)?.click()}
        className="relative border-[1.5px] border-dashed border-border rounded-2xl h-[130px] flex items-center justify-center cursor-pointer bg-surface overflow-hidden"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-gray-light">
            <i className="ti ti-cloud-upload text-2xl block mx-auto mb-1.5" />
            <div className="text-xs">{uploading ? 'Uploading…' : `Click to upload ${kind}`}</div>
          </div>
        )}
        <input
          id={`upload-${kind}`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}
