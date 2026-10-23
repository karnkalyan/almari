import React, { useRef, useState } from 'react';
import { 
  Upload, 
  Link as LinkIcon, 
  Trash2, 
  Image as ImageIcon, 
  ExternalLink, 
  Loader2, 
  Check, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { compressAndOptimizeImage, validateImageFile } from '../../utils/imageUtils';

export interface ImageUploadOrUrlProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  placeholder?: string;
  aspectRatio?: string; // e.g., 'aspect-[16/9]', 'aspect-[4/5]', 'aspect-[4/3]'
  compact?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
}

export const ImageUploadOrUrl: React.FC<ImageUploadOrUrlProps> = ({
  value,
  onChange,
  label,
  helperText,
  placeholder = 'https://images.unsplash.com/... or paste image URL',
  aspectRatio = 'aspect-[16/9]',
  compact = false,
  maxWidth = 1920,
  maxHeight = 1080,
  className = '',
}) => {
  const isBase64 = value?.startsWith('data:image/');
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>(isBase64 ? 'upload' : 'url');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    try {
      setLoading(true);
      const optimized = await compressAndOptimizeImage(file, { maxWidth, maxHeight });
      setImageError(false);
      onChange(optimized);
      toast.success('Image uploaded & optimized successfully');
    } catch (err) {
      toast.error('Failed to process image file');
    } finally {
      setLoading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset so same file can be chosen again if needed
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    onChange('');
    setImageError(false);
  };

  // -------------------------------------------------------------
  // COMPACT MODE (for tight grids, side cards, CMS section items)
  // -------------------------------------------------------------
  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
            {label}
          </label>
        )}
        <div className="flex items-center gap-2">
          {/* Thumbnail / Upload Trigger */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative w-11 h-11 rounded-xl border border-gray-200 bg-white overflow-hidden flex-shrink-0 cursor-pointer group hover:border-blue-400 transition-all shadow-sm flex items-center justify-center"
            title="Click to upload file"
          >
            {value && !imageError ? (
              <img 
                src={value} 
                alt="" 
                className="w-full h-full object-cover"
                onError={() => setImageError(true)} 
              />
            ) : (
              <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                <Upload size={16} />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Upload size={14} />
            </div>
          </div>

          {/* URL text input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => {
                setImageError(false);
                onChange(e.target.value);
              }}
              placeholder={placeholder}
              className="w-full h-11 pl-8 pr-8 bg-white border border-gray-100 rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
            />
            <LinkIcon size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 transition"
                title="Remove image"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          {/* File Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="h-11 px-3 bg-gray-50 hover:bg-slate-900 hover:text-white border border-gray-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer"
            title="Upload image from computer"
          >
            {loading ? <Loader2 size={14} className="animate-spin text-blue-600" /> : <Upload size={14} />}
            <span className="hidden sm:inline">Upload</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileInputChange}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STANDARD / FULL MODE (for Main Hero Slider, promo cards, etc.)
  // -------------------------------------------------------------
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header with Label and Tab Switcher */}
      <div className="flex items-center justify-between gap-2">
        {label ? (
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
            {label}
          </label>
        ) : <span />}

        <div className="flex items-center bg-gray-100/80 p-0.5 rounded-lg border border-gray-200/60 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'upload' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-gray-500 hover:text-slate-700'
            }`}
          >
            <Upload size={12} />
            <span>Upload</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'url' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-gray-500 hover:text-slate-700'
            }`}
          >
            <LinkIcon size={12} />
            <span>URL</span>
          </button>
        </div>
      </div>

      {/* Main Preview / Upload Card */}
      <div className="space-y-3">
        {/* Preview Container */}
        <div 
          className={`relative ${aspectRatio} w-full rounded-2xl border-2 overflow-hidden flex items-center justify-center bg-slate-50 transition-all ${
            isDragging 
              ? 'border-blue-500 bg-blue-50/50 scale-[0.99]' 
              : value && !imageError
              ? 'border-gray-200 shadow-sm' 
              : 'border-dashed border-gray-200 hover:border-gray-300'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
              <p className="text-xs font-bold text-slate-700">Optimizing image...</p>
              <p className="text-[10px] text-gray-400">Scaling for optimal web speed</p>
            </div>
          ) : value && !imageError ? (
            <>
              <img
                src={value}
                alt="Hero banner preview"
                className="w-full h-full object-cover transition-transform duration-500"
                onError={() => setImageError(true)}
              />
              
              {/* Badge for Image Source */}
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                {isBase64 ? <Upload size={10} className="text-emerald-400" /> : <LinkIcon size={10} className="text-blue-400" />}
                <span>{isBase64 ? 'Uploaded file' : 'External URL'}</span>
              </div>

              {/* Floating Action Bar */}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-white text-slate-800 rounded-xl text-xs font-bold hover:bg-gray-100 shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Upload size={13} />
                  <span>Change File</span>
                </button>
                {!isBase64 && (
                  <a
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-md transition"
                    title="View original"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition active:scale-95"
                  title="Remove image"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </>
          ) : (
            <div 
              onClick={() => activeTab === 'upload' && fileInputRef.current?.click()}
              className={`p-6 text-center flex flex-col items-center justify-center cursor-pointer w-full h-full`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 mb-3 shadow-sm group-hover:scale-105 transition-transform">
                {imageError ? (
                  <AlertCircle size={22} className="text-amber-500" />
                ) : activeTab === 'upload' ? (
                  <Upload size={22} className="text-blue-600" />
                ) : (
                  <ImageIcon size={22} className="text-gray-400" />
                )}
              </div>

              {imageError ? (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-amber-700">Image could not be loaded</p>
                  <p className="text-[10px] text-gray-400">Please check the URL or upload a new file</p>
                </div>
              ) : activeTab === 'upload' ? (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700">
                    <span className="text-blue-600 underline">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-[10px] text-gray-400">
                    PNG, JPG, WebP, SVG (up to 10MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700">Enter image URL below</p>
                  <p className="text-[10px] text-gray-400">Direct links from Unsplash, CDN, or Cloudinary</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Details according to Active Tab */}
        {activeTab === 'upload' ? (
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Upload size={14} className="text-blue-600" />
              <span>{value ? 'Upload Replacement Image' : 'Choose File to Upload'}</span>
            </button>
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Clear image"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <div className="relative">
              <input
                type="text"
                placeholder={placeholder}
                value={value || ''}
                onChange={(e) => {
                  setImageError(false);
                  onChange(e.target.value);
                }}
                className="w-full h-11 pl-9 pr-9 bg-white border border-gray-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
              />
              <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 transition"
                  title="Clear input"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        )}

        {helperText && (
          <p className="text-[10px] text-gray-400 italic ml-1">
            {helperText}
          </p>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileInputChange}
        className="hidden"
      />
    </div>
  );
};
