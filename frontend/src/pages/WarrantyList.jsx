import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { WarrantyCard } from './Dashboard';
import { Search, Filter, ShieldCheck } from 'lucide-react';
import warrantyService from '../services/warrantyService';

export default function WarrantyList() {
    const location = useLocation();
    const [warranties, setWarranties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = (warrantId) => {
        setWarranties(warranties.filter(w => w.id !== warrantId));
    };

    useEffect(() => {
        const fetchWarranties = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await warrantyService.getWarranties();
                console.log('Fetched warranties:', data);
                // Ensure data is an array
                const warrantiesArray = Array.isArray(data) ? data : (data?.results || []);
                setWarranties(warrantiesArray);
            } catch (error) {
                console.error("Failed to fetch warranties", error);
                setError("Failed to load warranties. Please try again.");
                setWarranties([]);
            } finally {
                setLoading(false);
            }
        };

        fetchWarranties();
    }, [location]);

    const filteredWarranties = warranties.filter(w =>
        w.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Warranties</h1>
                    <p className="text-gray-500">Manage all your stored documents.</p>
                </div>
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Warranties</h1>
                    <p className="text-gray-500">Manage all your stored documents.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </button>
                </div>
            </div>

            {filteredWarranties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWarranties.map(w => (
                        <WarrantyCard key={w.id} warranty={w} onDelete={handleDelete} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                    <ShieldCheck className="mx-auto h-16 w-16 text-gray-200" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No warranties found</h3>
                    <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                        {searchTerm ? "Try adjusting your search terms." : "You haven't added any warranties yet."}
                    </p>
                </div>
            )}
        </div>
    )
}
