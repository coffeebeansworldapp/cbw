import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadImage } from '../api/media';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

/**
 * ImageUpload - Cloudinary image upload component
 * @param {Object} props
 * @param {function} props.onUploadComplete - Callback with uploaded image data {url, id}
 * @param {string} props.currentImageUrl - Current image URL for preview
 * @param {function} props.onRemove - Callback when image is removed
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.label - Label text
 */
export function ImageUpload({ 
  onUploadComplete, 
  currentImageUrl, 
  onRemove, 
  className = '',
  label = 'Upload Image'
}) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || null);
  const inputRef = useRef(null);

  const uploadMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: (data) => {
      setPreviewUrl(data.url);
      onUploadComplete?.({ url: data.url, id: data.clouderiaId || data.id });
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    },
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB');
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    uploadMutation.mutate(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreviewUrl(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onRemove?.();
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors ${
          dragActive 
            ? 'border-amber-500 bg-amber-50' 
            : previewUrl 
              ? 'border-gray-200' 
              : 'border-gray-300 hover:border-amber-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!previewUrl ? handleClick : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            
            {/* Uploading overlay */}
            {uploadMutation.isPending && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-white flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Uploading...</span>
                </div>
              </div>
            )}

            {/* Remove button */}
            {!uploadMutation.isPending && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Change image button */}
            {!uploadMutation.isPending && (
              <button
                type="button"
                onClick={handleClick}
                className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors shadow-lg text-sm font-medium"
              >
                Change
              </button>
            )}
          </div>
        ) : (
          <div className="p-8 text-center cursor-pointer">
            {uploadMutation.isPending ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-10 w-10 text-amber-600 animate-spin mb-3" />
                <p className="text-sm font-semibold text-gray-700">Connecting to Cloudinary...</p>
                <p className="text-xs text-gray-500 mt-1">Securing your media assets</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-amber-50 rounded-full">
                    <Upload className="h-8 w-8 text-amber-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium text-amber-600">Click to upload</span> or drag and drop
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className="text-[10px] font-bold text-gray-400 border border-gray-300 px-1.5 py-0.5 rounded tracking-widest uppercase">
                    Cloudinary Optimized
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {uploadMutation.isError && (
        <p className="mt-2 text-sm text-red-600">
          Upload failed. Please try again.
        </p>
      )}
    </div>
  );
}

/**
 * MultiImageUpload - Upload multiple images
 */
export function MultiImageUpload({ 
  images = [], 
  onImagesChange,
  maxImages = 5,
  className = '',
  label = 'Product Images'
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const uploadMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: (data) => {
      const newImage = { url: data.url, cloudinaryPublicId: data.clouderiaId || data.id };
      onImagesChange?.([...images, newImage]);
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    },
    onSettled: () => {
      setUploading(false);
    },
  });

  const handleFiles = (files) => {
    const file = files[0];
    if (!file) return;

    if (images.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB');
      return;
    }

    setUploading(true);
    uploadMutation.mutate(file);
  };

  const handleRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange?.(newImages);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} ({images.length}/{maxImages})
      </label>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {/* Existing images */}
        {images.map((img, index) => (
          <div key={img.url || index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
            <img
              src={img.url}
              alt={`Product ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Add button */}
        {images.length < maxImages && (
          <div
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-amber-400 cursor-pointer flex flex-col items-center justify-center transition-colors"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Add Image</span>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
