import React, { useState } from 'react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import FileUploadZone from '../components/FileUploadZone';
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import warrantyService from '../services/warrantyService';

export default function AddWarranty() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);

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

            // Always use FormData if we have a file, otherwise use JSON
            let payload;
            if (uploadedFile) {
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
                // Regular JSON payload for manual entry without file
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

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Warranty</h1>
                <p className="text-gray-500">Store a new product warranty in your digital vault.</p>
            </div>

            {/* Warranty Form */}
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Warranty Details</h2>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Product Name
                            </label>
                            <Input
                                name="productName"
                                placeholder="e.g. iPhone 15 Pro"
                                value={formData.productName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Brand / Manufacturer
                            </label>
                            <Input
                                name="brand"
                                placeholder="e.g. Apple"
                                value={formData.brand}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Purchase Date
                            </label>
                            <Input
                                type="date"
                                name="purchaseDate"
                                value={formData.purchaseDate}
                                onChange={handleChange}
                                max={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Warranty Period
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
                        <label className="text-sm font-medium text-gray-700">
                            Category
                        </label>
                        <select
                            name="category"
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                        <label className="text-sm font-medium text-gray-700">Receipt / Warranty Document (Optional)</label>
                        <FileUploadZone onFileSelect={handleFileSelect} />
                        {uploadedFile && (
                            <p className="text-sm text-green-600 flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                File selected: {uploadedFile.name}
                            </p>
                        )}
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
