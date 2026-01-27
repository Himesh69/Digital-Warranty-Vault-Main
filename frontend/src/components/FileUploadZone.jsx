import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';

export default function FileUploadZone({ onFileSelect, acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff', 'application/pdf'], maxSizeMB = 10 }) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const validateFile = (file) => {
        // Check file type
        const fileType = file.type;
        const fileExtension = file.name.split('.').pop().toLowerCase();

        const validExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'bmp', 'tiff'];
        if (!acceptedTypes.includes(fileType) && !validExtensions.includes(fileExtension)) {
            return 'Invalid file type. Please upload JPG, PNG, PDF, BMP, or TIFF files.';
        }

        // Check file size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return `File size exceeds ${maxSizeMB}MB limit.`;
        }

        return null;
    };

    const handleFile = (file) => {
        setError('');

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setSelectedFile(file);

        // Generate preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }

        // Notify parent component
        if (onFileSelect) {
            onFileSelect(file);
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreview(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onFileSelect) {
            onFileSelect(null);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-2">
            <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.bmp,.tiff"
                onChange={handleFileInputChange}
                className="hidden"
            />

            {!selectedFile ? (
                <div
                    onClick={handleClick}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        border-2 border-dashed rounded-lg p-8 text-center 
                        transition-all duration-200 cursor-pointer
                        ${isDragging
                            ? 'border-primary-500 bg-primary-50 scale-[1.02]'
                            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                        }
                    `}
                >
                    <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3
                        transition-all duration-200
                        ${isDragging
                            ? 'bg-primary-100 scale-110'
                            : 'bg-primary-50 group-hover:scale-110'
                        }
                    `}>
                        <Upload className={`h-6 w-6 ${isDragging ? 'text-primary-700' : 'text-primary-600'}`} />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                        {isDragging ? 'Drop your file here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF, BMP or TIFF (max. {maxSizeMB}MB)</p>
                </div>
            ) : (
                <div className="border-2 border-primary-200 bg-primary-50/30 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-start gap-4">
                        {preview ? (
                            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-sm">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-red-100 flex items-center justify-center border-2 border-white shadow-sm">
                                <FileText className="h-8 w-8 text-red-600" />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(selectedFile.size)}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-500 rounded-full animate-in slide-in-from-left duration-500" style={{ width: '100%' }}></div>
                                </div>
                                <span className="text-xs text-primary-600 font-medium">Ready</span>
                            </div>
                        </div>

                        <button
                            onClick={handleRemoveFile}
                            className="flex-shrink-0 p-1.5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove file"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                    {error}
                </div>
            )}
        </div>
    );
}
