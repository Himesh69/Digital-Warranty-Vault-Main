import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { Upload } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import warrantyService from '../services/warrantyService';

export default function EditWarranty() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        productName: '',
        brand: '',
        purchaseDate: '',
        warrantyPeriod: '12',
        warrantyPeriodUnit: 'months',
        expiryDate: '',
        category: '',
        notes: ''
    });

    useEffect(() => {
        const fetchWarranty = async () => {
            try {
                const warranty = await warrantyService.getWarranty(id);
                setFormData({
                    productName: warranty.product_name || '',
                    brand: warranty.brand || '',
                    purchaseDate: warranty.purchase_date || '',
                    warrantyPeriod: warranty.warranty_period?.toString() || '12',
                    warrantyPeriodUnit: warranty.warranty_period_unit || 'months',
                    expiryDate: warranty.expiry_date || '',
                    category: warranty.category || '',
                    notes: warranty.notes || ''
                });
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch warranty:', err);
                setError('Failed to load warranty details.');
                setLoading(false);
            }
        };

        fetchWarranty();
    }, [id]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            // Validate form data
            if (!formData.productName.trim() || !formData.brand.trim() || !formData.category.trim()) {
                setError('Please fill in all required fields.');
                setSaving(false);
                return;
            }

            // Map form data to API payload
            const payload = {
                product_name: formData.productName,
                brand: formData.brand,
                purchase_date: formData.purchaseDate,
                warranty_period: parseInt(formData.warrantyPeriod, 10),
                warranty_period_unit: formData.warrantyPeriodUnit,
                expiry_date: formData.expiryDate || null,
                category: formData.category,
                notes: formData.notes
            };

            console.log('Updating warranty:', payload);
            const response = await warrantyService.updateWarranty(id, payload);
            console.log('Warranty updated successfully:', response);

            // Navigate back to warranties list
            setSaving(false);
            setTimeout(() => {
                navigate('/dashboard/warranties');
            }, 100);
        } catch (err) {
            console.error("Failed to update warranty", err);
            const errorMessage = err.response?.data?.detail ||
                err.response?.data?.message ||
                err.response?.data?.[Object.keys(err.response?.data || {})[0]]?.[0] ||
                err.message ||
                "Failed to update warranty. Please try again.";
            setError(errorMessage);
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Warranty</h1>
                <p className="text-gray-500">Update your product warranty information.</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Product Name</label>
                            <Input
                                name="productName"
                                placeholder="e.g. iPhone 15 Pro"
                                value={formData.productName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Brand / Manufacturer</label>
                            <Input
                                name="brand"
                                placeholder="e.g. Apple"
                                value={formData.brand}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Purchase Date</label>
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
                            <label className="text-sm font-medium text-gray-700">Warranty Period</label>
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
                        <label className="text-sm font-medium text-gray-700">Expiry Date (Optional)</label>
                        <Input
                            type="date"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                        />
                        <p className="text-xs text-gray-500">Leave blank to auto-calculate based on purchase date and warranty period</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Category</label>
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
                        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
