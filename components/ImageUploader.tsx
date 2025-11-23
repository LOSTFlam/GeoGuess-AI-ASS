import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { UploadedImage, Language, TRANSLATIONS } from '../types';

interface ImageUploaderProps {
  onImageSelected: (image: UploadedImage) => void;
  onClear: () => void;
  currentImage: UploadedImage | null;
  disabled: boolean;
  language: Language;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, onClear, currentImage, disabled, language }) => {
  
  const t = TRANSLATIONS[language];

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [disabled]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('File must be an image');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract base64 data without prefix for API
      const base64Data = result.split(',')[1];
      
      onImageSelected({
        base64: base64Data,
        mimeType: file.type,
        previewUrl: result
      });
    };
    reader.readAsDataURL(file);
  };

  if (currentImage) {
    return (
      <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-800 shadow-lg group">
        <img 
          src={currentImage.previewUrl} 
          alt="To Analyze" 
          className="w-full h-full object-contain"
        />
        {!disabled && (
          <button 
            onClick={onClear}
            className="absolute top-4 right-4 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors backdrop-blur-sm"
            title={t.delete}
          >
            <X size={20} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div 
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`
        w-full h-64 md:h-96 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed border-slate-700 bg-slate-800/50' : 'border-slate-600 bg-slate-800/50 hover:border-emerald-500 hover:bg-slate-800'}
      `}
    >
      <label className={`flex flex-col items-center justify-center w-full h-full ${!disabled && 'cursor-pointer'}`}>
        <div className="p-4 bg-slate-900 rounded-full mb-4 shadow-xl border border-slate-700">
          <Upload className="w-8 h-8 text-emerald-400" />
        </div>
        <p className="mb-2 text-sm text-slate-300 font-medium text-center px-4">
          {t.dragDrop}
        </p>
        <p className="text-xs text-slate-500">
          {t.formats}
        </p>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
          disabled={disabled}
        />
      </label>
    </div>
  );
};

export default ImageUploader;