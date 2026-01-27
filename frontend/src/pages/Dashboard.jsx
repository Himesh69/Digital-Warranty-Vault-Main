import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { Badge } from '../components/Badge';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, Clock, Trash2, Pencil, QrCode } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import warrantyService from '../services/warrantyService';
import QRCode from 'qrcode';
import QRCodeModal from '../components/QRCodeModal';

export default function Dashboard() {
    const location = useLocation();
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        expiringSoon: 0,
        expired: 0
    });
    const [warranties, setWarranties] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleDelete = (warrantId) => {
        setWarranties(warranties.filter(w => w.id !== warrantId));
        // Update stats after deletion
        setStats(prev => ({
            ...prev,
            total: prev.total - 1
        }));
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsData, warrantiesData] = await Promise.all([
                    warrantyService.getStats(),
                    warrantyService.getWarranties()
                ]);

                // Map API stats to component expected format if needed
                // API stats: { total_warranties, active_warranties, expiring_soon, expired_warranties }
                setStats({
                    total: statsData.total_warranties || 0,
                    active: statsData.active_warranties || 0,
                    expiringSoon: statsData.expiring_soon || 0,
                    expired: statsData.expired_warranties || 0
                });

                setWarranties(warrantiesData);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [location]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back! Here's the status of your product warranties.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Total Warranties" value={stats.total} icon={ShieldCheck} color="text-primary-600" bg="bg-primary-50" border="border-primary-100" />
                <StatsCard title="Active" value={stats.active} icon={CheckCircle} color="text-green-600" bg="bg-green-50" border="border-green-100" />
                <StatsCard title="Expiring Soon" value={stats.expiringSoon} icon={AlertTriangle} color="text-yellow-600" bg="bg-yellow-50" border="border-yellow-100" />
                <StatsCard title="Expired" value={stats.expired} icon={XCircle} color="text-red-600" bg="bg-red-50" border="border-red-100" />
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Warranties</h2>
                    <a href="/dashboard/warranties" className="text-sm font-medium text-primary-600 hover:text-primary-700">View All</a>
                </div>
                {warranties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {warranties.slice(0, 3).map(w => (
                            <WarrantyCard key={w.id} warranty={w} onDelete={handleDelete} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                        <ShieldCheck className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No warranties yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by adding your first warranty.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function StatsCard({ title, value, icon: Icon, color, bg, border }) {
    return (
        <Card className={`flex items-center p-6 gap-4 border-l-4 ${border}`}>
            <div className={`p-3 rounded-xl ${bg} ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
            </div>
        </Card>
    )
}

export function WarrantyCard({ warranty, onDelete }) {
    if (!warranty) {
        return null;
    }

    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = () => {
        navigate(`/dashboard/edit/${warranty.id}`);
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete "${warranty.product_name}"? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            await warrantyService.deleteWarranty(warranty.id);
            if (onDelete) {
                onDelete(warranty.id);
            }
        } catch (error) {
            console.error('Failed to delete warranty:', error);
            alert('Failed to delete warranty. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    // QR Code functionality
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    const handleGenerateQR = async (e) => {
        e.stopPropagation();

        if (!warranty.share_token) {
            alert('Share token not available for this warranty');
            return;
        }

        try {
            const shareUrl = `${window.location.origin}/share/${warranty.share_token}`;
            const qrDataUrl = await QRCode.toDataURL(shareUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#03045e',
                    light: '#ffffff'
                }
            });

            setQrCodeUrl(qrDataUrl);
            setShowQrModal(true);
        } catch (error) {
            console.error('Failed to generate QR code:', error);
            alert('Failed to generate QR code. Please try again.');
        }
    };

    try {
        // Parse dates with better error handling
        let expiryDate = null;
        let purchaseDate = null;

        try {
            expiryDate = warranty.expiry_date ? parseISO(warranty.expiry_date) : null;
            purchaseDate = warranty.purchase_date ? parseISO(warranty.purchase_date) : null;
        } catch (dateError) {
            console.error('Date parsing error:', dateError, warranty);
            // Fallback: try creating Date objects directly
            expiryDate = warranty.expiry_date ? new Date(warranty.expiry_date) : null;
            purchaseDate = warranty.purchase_date ? new Date(warranty.purchase_date) : null;
        }

        // Calculate warranty progress (time elapsed)
        const calculateProgress = () => {
            if (!purchaseDate || !expiryDate) {
                console.log('Missing dates for progress calculation:', { purchaseDate, expiryDate });
                return 0;
            }

            // Validate dates are valid
            if (isNaN(purchaseDate.getTime()) || isNaN(expiryDate.getTime())) {
                console.error('Invalid dates:', { purchaseDate, expiryDate });
                return 0;
            }

            const today = new Date();
            const totalDuration = expiryDate - purchaseDate;
            const elapsed = today - purchaseDate;
            const percentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
            return Math.round(percentage);
        };

        const progress = calculateProgress();
        const daysRemaining = warranty.days_remaining || 0;

        // Debug logging
        if (progress === 0 || progress === 100) {
            console.log('Progress bar debug:', {
                product: warranty.product_name,
                progress,
                purchaseDate,
                expiryDate,
                daysRemaining,
                status: warranty.status
            });
        }

        // Determine progress bar color based on status
        const getProgressColor = () => {
            if (warranty.status === 'Expired') return 'bg-red-500';
            if (warranty.status === 'Expiring Soon') return 'bg-yellow-500';
            return 'bg-green-500';
        };

        // Determine icon based on category
        const getCategoryIcon = (category) => {
            const cat = category?.toLowerCase() || '';
            if (cat.includes('laptop') || cat.includes('computer')) return '💻';
            if (cat.includes('phone') || cat.includes('mobile')) return '📱';
            if (cat.includes('headphone') || cat.includes('audio')) return '🎧';
            if (cat.includes('monitor') || cat.includes('screen')) return '🖥️';
            if (cat.includes('keyboard') || cat.includes('mouse')) return '⌨️';
            if (cat.includes('home') || cat.includes('appliance')) return '🏠';
            if (cat.includes('camera')) return '📷';
            if (cat.includes('watch')) return '⌚';
            return '📦';
        };

        // Get category image URL
        const getCategoryImage = (category) => {
            const categoryMap = {
                'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&h=100&fit=crop',
                'Home Appliances': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=100&h=100&fit=crop',
                'Furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&h=100&fit=crop',
                'Automotive': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=100&h=100&fit=crop',
                'Accessories': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
                'Other': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=100&h=100&fit=crop'
            };
            return categoryMap[category] || categoryMap['Other'];
        };

        return (
            <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-t-4 border-t-transparent hover:border-t-primary-500">
                <div className="flex justify-between items-start mb-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 group-hover:bg-primary-50 transition-colors flex-shrink-0">
                        <img
                            src={getCategoryImage(warranty.category)}
                            alt={warranty.category}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback to emoji if image fails to load
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        <div className="absolute inset-0 hidden items-center justify-center text-2xl">
                            {getCategoryIcon(warranty.category)}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={warranty.status}>{warranty.status}</Badge>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateQR(e);
                            }}
                            className="p-2 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            title="Generate QR Code"
                        >
                            <QrCode className="h-5 w-5" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit();
                            }}
                            className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit warranty"
                        >
                            <Pencil className="h-5 w-5" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            disabled={isDeleting}
                            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete warranty"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="mb-4 flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-primary-600 transition-colors">{warranty.product_name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{warranty.brand} • {warranty.category}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Purchased</span>
                        <span className="font-medium text-gray-900">
                            {purchaseDate ? format(purchaseDate, 'MMM d, yyyy') : 'N/A'}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Expires</span>
                        <span className={`font-medium ${warranty.status === 'Expired' ? 'text-red-600' : 'text-gray-900'}`}>
                            {expiryDate ? format(expiryDate, 'MMM d, yyyy') : 'Calculated automatically'}
                        </span>
                    </div>

                    {/* Warranty Progress Bar */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-medium">Warranty Progress</span>
                            <span className={`font-semibold ${warranty.status === 'Expired' ? 'text-red-600' :
                                warranty.status === 'Expiring Soon' ? 'text-yellow-600' :
                                    'text-green-600'
                                }`}>
                                {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full ${getProgressColor()} transition-all duration-500 ease-out rounded-full`}
                                style={{
                                    width: `${progress}%`,
                                    minWidth: progress > 0 ? '0' : '2px'
                                }}
                            />
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-400">
                            <span>{purchaseDate ? format(purchaseDate, 'MMM yyyy') : ''}</span>
                            <span className="text-gray-500">{progress}%</span>
                            <span>{expiryDate ? format(expiryDate, 'MMM yyyy') : ''}</span>
                        </div>
                    </div>
                </div>

                {/* QR Code Modal */}
                {showQrModal && (
                    <QRCodeModal
                        qrCodeUrl={qrCodeUrl}
                        shareUrl={`${window.location.origin}/share/${warranty.share_token}`}
                        onClose={() => setShowQrModal(false)}
                    />
                )}
            </Card>
        );
    } catch (error) {
        console.error('Error rendering WarrantyCard:', error, warranty);
        return (
            <Card className="flex flex-col h-full bg-red-50 border-red-200">
                <div className="text-red-700 text-sm p-4">
                    <p className="font-medium">Error loading warranty</p>
                    <p className="text-xs mt-1">{error.message}</p>
                </div>
            </Card>
        );
    }
}
