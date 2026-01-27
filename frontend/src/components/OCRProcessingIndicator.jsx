import React from 'react';
import { Loader2, CheckCircle, AlertCircle, FileSearch, Sparkles } from 'lucide-react';

export default function OCRProcessingIndicator({
    status = 'idle', // idle, uploading, scanning, extracting, success, error
    confidence = 0,
    extractedTextPreview = '',
    error = '',
    onRetry
}) {
    const getStatusConfig = () => {
        switch (status) {
            case 'uploading':
                return {
                    icon: Loader2,
                    iconClass: 'text-blue-600 animate-spin',
                    bgClass: 'bg-blue-50 border-blue-200',
                    title: 'Uploading...',
                    message: 'Sending your file to the server'
                };
            case 'scanning':
                return {
                    icon: FileSearch,
                    iconClass: 'text-purple-600 animate-pulse',
                    bgClass: 'bg-purple-50 border-purple-200',
                    title: 'Scanning Document...',
                    message: 'Reading text from your receipt'
                };
            case 'extracting':
                return {
                    icon: Sparkles,
                    iconClass: 'text-indigo-600 animate-pulse',
                    bgClass: 'bg-indigo-50 border-indigo-200',
                    title: 'Extracting Data...',
                    message: 'Identifying warranty information'
                };
            case 'success':
                return {
                    icon: CheckCircle,
                    iconClass: 'text-green-600',
                    bgClass: 'bg-green-50 border-green-200',
                    title: 'Scan Complete!',
                    message: `Extracted with ${confidence}% confidence`
                };
            case 'error':
                return {
                    icon: AlertCircle,
                    iconClass: 'text-red-600',
                    bgClass: 'bg-red-50 border-red-200',
                    title: 'Scan Failed',
                    message: error || 'Failed to process the document'
                };
            default:
                return null;
        }
    };

    if (status === 'idle') {
        return null;
    }

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div className={`border-2 rounded-lg p-6 animate-in fade-in slide-in-from-top-4 duration-300 ${config.bgClass}`}>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
                        <Icon className={`h-6 w-6 ${config.iconClass}`} />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">{config.title}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">{config.message}</p>

                    {/* Progress bar for processing states */}
                    {['uploading', 'scanning', 'extracting'].includes(status) && (
                        <div className="mt-3 h-1.5 bg-white/50 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full animate-pulse"
                                style={{
                                    width: status === 'uploading' ? '33%' : status === 'scanning' ? '66%' : '90%',
                                    transition: 'width 0.5s ease-in-out'
                                }}
                            />
                        </div>
                    )}

                    {/* Success state with confidence and preview */}
                    {status === 'success' && (
                        <div className="mt-4 space-y-3">
                            {/* Confidence Score */}
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-white/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-700"
                                        style={{ width: `${confidence}%` }}
                                    />
                                </div>
                                <span className="text-xs font-semibold text-green-700">{confidence}%</span>
                            </div>

                            {/* Extracted Text Preview */}
                            {extractedTextPreview && (
                                <div className="bg-white/70 rounded-md p-3 border border-green-200/50">
                                    <p className="text-xs font-medium text-gray-700 mb-1">Extracted Text Preview:</p>
                                    <p className="text-xs text-gray-600 line-clamp-3 italic">
                                        "{extractedTextPreview}..."
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error state with retry button */}
                    {status === 'error' && onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-3 text-xs font-medium text-red-700 hover:text-red-800 underline underline-offset-2"
                        >
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
