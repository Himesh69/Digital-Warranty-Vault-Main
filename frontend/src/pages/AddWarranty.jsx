import React, { useState } from 'react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import FileUploadZone from '../components/FileUploadZone';
import OCRProcessingIndicator from '../components/OCRProcessingIndicator';
import { Upload, Sparkles, Edit3, FileSearch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import warrantyService from '../services/warrantyService';

export default function AddWarranty() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // OCR-related state
    const [uploadedFile, setUploadedFile] = useState(null);
    const [ocrStatus, setOcrStatus] = useState('idle'); // idle, uploading, scanning, extracting, success, error
    const [ocrResult, setOcrResult] = useState(null);
    const [ocrError, setOcrError] = useState('');
    const [useManualEntry, setUseManualEntry] = useState(false);

    const [formData, setFormData] = useState({
        productName: '',
        brand: '',
        purchaseDate: new Date().toISOString().split('T')[0], // Default to today
        warrantyPeriod: '12', // Default to 12 months
        warrantyPeriodUnit: 'months', // Default to months
        category: '',
        notes: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Special handling for warranty period to ensure it's always a valid number
        if (name === 'warrantyPeriod') {
            // Only allow positive integers
            const numValue = value.replace(/[^0-9]/g, '');
            if (numValue === '' || parseInt(numValue, 10) > 0) {
                setFormData({ ...formData, [name]: numValue });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleUnitChange = (unit) => {
        // Prevent any state updates if the unit is already selected
        if (formData.warrantyPeriodUnit === unit) {
            return;
        }
        setFormData(prevData => ({ ...prevData, warrantyPeriodUnit: unit }));
    };

    const handleFileSelect = (file) => {
        setUploadedFile(file);
        setOcrStatus('idle');
        setOcrResult(null);
        setOcrError('');
    };

    const handleScanReceipt = async () => {
        if (!uploadedFile) {
            setError('Please select a file first');
            return;
        }

        setError('');
        setOcrError('');
        setOcrStatus('uploading');

        try {
            // Simulate upload phase
            await new Promise(resolve => setTimeout(resolve, 500));
            setOcrStatus('scanning');

            // Simulate scanning phase
            await new Promise(resolve => setTimeout(resolve, 800));
            setOcrStatus('extracting');

            // Call OCR API
            const result = await warrantyService.scanReceipt(uploadedFile);

            if (result.success) {
                setOcrStatus('success');
                setOcrResult(result);

                // Pre-fill form with OCR data
                setFormData({
                    productName: result.data.product_name || '',
                    brand: result.data.brand || '',
                    purchaseDate: result.data.purchase_date || new Date().toISOString().split('T')[0],
                    warrantyPeriod: result.data.warranty_period?.toString() || '12',
                    warrantyPeriodUnit: result.data.warranty_period_unit || 'months',
                    category: result.data.category || '',
                    notes: formData.notes // Keep existing notes
                });
            } else {
                setOcrStatus('error');
                setOcrError(result.error || 'Failed to scan receipt');
            }
        } catch (err) {
            console.error('OCR scan failed:', err);
            setOcrStatus('error');
            setOcrError(err.response?.data?.error || err.message || 'Failed to scan receipt. Please try again.');
        }
    };

    const handleClearOCRData = () => {
        setFormData({
            productName: '',
            brand: '',
            purchaseDate: new Date().toISOString().split('T')[0],
            warrantyPeriod: '12',
            warrantyPeriodUnit: 'months',
            category: '',
            notes: formData.notes
        });
        setOcrResult(null);
        setOcrStatus('idle');
    };

    const handleRetryOCR = () => {
        handleScanReceipt();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate form data
            if (!formData.productName.trim() || !formData.brand.trim() || !formData.category.trim()) {
                setError('Please fill in all required fields.');
                setLoading(false);
                return;
            }

            // Check if we have a receipt file from OCR
            let payload;
            if (uploadedFile && ocrResult) {
                // Use FormData to send file with warranty data
                const formDataPayload = new FormData();
                formDataPayload.append('product_name', formData.productName);
                formDataPayload.append('brand', formData.brand);
                formDataPayload.append('purchase_date', formData.purchaseDate);
                formDataPayload.append('warranty_period', parseInt(formData.warrantyPeriod, 10));
                formDataPayload.append('warranty_period_unit', formData.warrantyPeriodUnit);
                formDataPayload.append('category', formData.category);
                formDataPayload.append('notes', formData.notes);
                formDataPayload.append('receipt_file', uploadedFile);

                payload = formDataPayload;
            } else {
                // Regular JSON payload for manual entry
                payload = {
                    product_name: formData.productName,
                    brand: formData.brand,
                    purchase_date: formData.purchaseDate,
                    warranty_period: parseInt(formData.warrantyPeriod, 10),
                    warranty_period_unit: formData.warrantyPeriodUnit,
                    category: formData.category,
                    notes: formData.notes
                };
            }

            console.log('Submitting warranty with file:', uploadedFile ? uploadedFile.name : 'No file');
            const response = await warrantyService.createWarranty(payload);
            console.log('Warranty created successfully:', response);

            // Only navigate after successful response
            if (response) {
                setLoading(false);
                // Use a small delay to ensure state updates are processed
                setTimeout(() => {
                    navigate('/dashboard/warranties');
                }, 100);
            }
        } catch (err) {
            console.error("Failed to add warranty", err);
            const errorMessage = err.response?.data?.detail ||
                err.response?.data?.message ||
                err.response?.data?.[Object.keys(err.response?.data || {})[0]]?.[0] ||
                err.message ||
                "Failed to add warranty. Please try again.";
            setError(errorMessage);
            setLoading(false);
        }
    };

    const isFieldPreFilled = (fieldName) => {
        return ocrResult && ocrResult.success && ocrResult.data[fieldName];
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Warranty</h1>
                <p className="text-gray-500">Store a new product warranty in your digital vault.</p>
            </div>

            {/* OCR Upload Section */}
            {!useManualEntry && (
                <Card>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary-600" />
                                    Scan Receipt (OCR)
                                </h2>
                                <p className="text-sm text-gray-500 mt-0.5">Upload a receipt to automatically extract warranty information</p>
                            </div>
                            <button
                                onClick={() => setUseManualEntry(true)}
                                className="text-sm text-gray-600 hover:text-gray-900 underline underline-offset-2"
                            >
                                Manual Entry
                            </button>
                        </div>

                        <FileUploadZone onFileSelect={handleFileSelect} />

                        {uploadedFile && ocrStatus === 'idle' && (
                            <Button
                                onClick={handleScanReceipt}
                                className="w-full"
                                variant="outline"
                            >
                                <FileSearch className="h-4 w-4 mr-2" />
                                Scan Receipt
                            </Button>
                        )}

                        {ocrStatus !== 'idle' && (
                            <OCRProcessingIndicator
                                status={ocrStatus}
                                confidence={ocrResult?.confidence || 0}
                                extractedTextPreview={ocrResult?.extracted_text_preview || ''}
                                error={ocrError}
                                onRetry={handleRetryOCR}
                            />
                        )}
                    </div>
                </Card>
            )}

            {/* Warranty Form */}
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Warranty Details</h2>
                        {ocrResult && ocrResult.success && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-green-600 font-medium">✓ Pre-filled from OCR</span>
                                <button
                                    type="button"
                                    onClick={handleClearOCRData}
                                    className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
                                >
                                    Clear
                                </button>
                            </div>
                        )}
                        {useManualEntry && (
                            <button
                                type="button"
                                onClick={() => setUseManualEntry(false)}
                                className="text-sm text-primary-600 hover:text-primary-700 underline underline-offset-2"
                            >
                                Use OCR Scan
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                Product Name
                                {isFieldPreFilled('product_name') && (
                                    <span className="text-xs text-green-600 font-normal">✓ OCR</span>
                                )}
                            </label>
                            <Input
                                name="productName"
                                placeholder="e.g. iPhone 15 Pro"
                                value={formData.productName}
                                onChange={handleChange}
                                required
                                className={isFieldPreFilled('product_name') ? 'border-green-300 bg-green-50/30' : ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                Brand / Manufacturer
                                {isFieldPreFilled('brand') && (
                                    <span className="text-xs text-green-600 font-normal">✓ OCR</span>
                                )}
                            </label>
                            <Input
                                name="brand"
                                placeholder="e.g. Apple"
                                value={formData.brand}
                                onChange={handleChange}
                                required
                                className={isFieldPreFilled('brand') ? 'border-green-300 bg-green-50/30' : ''}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                Purchase Date
                                {isFieldPreFilled('purchase_date') && (
                                    <span className="text-xs text-green-600 font-normal">✓ OCR</span>
                                )}
                            </label>
                            <Input
                                type="date"
                                name="purchaseDate"
                                value={formData.purchaseDate}
                                onChange={handleChange}
                                max={new Date().toISOString().split('T')[0]}
                                required
                                className={isFieldPreFilled('purchase_date') ? 'border-green-300 bg-green-50/30' : ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                Warranty Period
                                {isFieldPreFilled('warranty_period') && (
                                    <span className="text-xs text-green-600 font-normal">✓ OCR</span>
                                )}
                            </label>
                            <div className="flex gap-2 items-stretch">
                                <Input
                                    type="number"
                                    name="warrantyPeriod"
                                    placeholder="e.g. 12"
                                    value={formData.warrantyPeriod}
                                    onChange={handleChange}
                                    min="1"
                                    autoComplete="off"
                                    required
                                    className={isFieldPreFilled('warranty_period') ? 'border-green-300 bg-green-50/30' : ''}
                                />
                                <div className="flex rounded-lg border border-gray-300 bg-white shadow-sm flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => handleUnitChange('months')}
                                        className={`px-6 py-2 text-sm font-medium transition-all duration-200 min-w-[90px] rounded-l-lg ${formData.warrantyPeriodUnit === 'months'
                                            ? 'bg-primary-600 text-white shadow-inner'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Months
                                    </button>
                                    <div className="w-px bg-gray-300"></div>
                                    <button
                                        type="button"
                                        onClick={() => handleUnitChange('days')}
                                        className={`px-6 py-2 text-sm font-medium transition-all duration-200 min-w-[90px] rounded-r-lg ${formData.warrantyPeriodUnit === 'days'
                                            ? 'bg-primary-600 text-white shadow-inner'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Days
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            Category
                            {isFieldPreFilled('category') && (
                                <span className="text-xs text-green-600 font-normal">✓ OCR</span>
                            )}
                        </label>
                        <select
                            name="category"
                            className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isFieldPreFilled('category') ? 'border-green-300 bg-green-50/30' : 'border-gray-300'
                                }`}
                            onChange={handleChange}
                            value={formData.category}
                            required
                        >
                            <option value="">Select a category</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Home Appliances">Home Appliances</option>
                            <option value="Furniture">Furniture</option>
                            <option value="Automotive">Automotive</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
                        <textarea
                            name="notes"
                            placeholder="Additional details..."
                            className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            value={formData.notes}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button variant="outline" type="button" onClick={() => navigate('/dashboard/warranties')}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Calculate & Save'}</Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
