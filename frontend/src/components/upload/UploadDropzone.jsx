import React, { useCallback, useState } from 'react';
import { Upload as UploadIcon, File } from 'lucide-react';
import { cn } from '../../utils/cn';

export const UploadDropzone = ({ onUpload, isUploading, progress }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onUpload(Array.from(e.dataTransfer.files));
      }
    },
    [onUpload]
  );

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files));
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl transition-colors",
        isDragActive ? "border-primary-500 bg-primary-500/10" : "border-border bg-bg-hover/30 hover:bg-bg-hover",
        isUploading && "pointer-events-none opacity-60"
      )}
    >
      <input 
        type="file" 
        multiple 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
        onChange={handleFileChange}
        disabled={isUploading}
        accept=".pdf,.txt,.docx"
      />
      
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <div className="w-16 h-16 mb-4 rounded-full bg-bg-hover flex items-center justify-center text-primary-500">
          <UploadIcon size={32} />
        </div>
        <p className="mb-2 text-sm text-text-muted">
          <span className="font-semibold text-text-main">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-text-muted">PDF, DOCX, TXT (MAX. 20MB)</p>
      </div>

      {isUploading && (
        <div className="absolute inset-0 bg-bg-main/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6">
          <p className="text-text-main font-medium mb-4">Uploading... {progress}%</p>
          <div className="w-full max-w-xs h-2 bg-bg-hover rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};
