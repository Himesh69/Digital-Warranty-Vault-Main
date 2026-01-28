import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import './PublicWarrantyView.css';

const PublicWarrantyView = () => {
    const { shareToken } = useParams();
    const [warranty, setWarranty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchWarranty();
    }, [shareToken]);

    const fetchWarranty = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/share/${shareToken}/`
            );
            setWarranty(response.data);
        } catch (err) {
            console.error('Error fetching warranty:', err);
            setError('Warranty not found or link is invalid');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return '#10b981';
            case 'Expiring Soon':
                return '#f59e0b';
            case 'Expired':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="public-warranty-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading warranty details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="public-warranty-container">
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <h2>Warranty Not Found</h2>
                    <p>{error}</p>
                    <p className="error-hint">Please check the link and try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="public-warranty-container">
            <div className="public-warranty-card">
                <div className="warranty-header">
                    <div className="warranty-icon">📄</div>
                    <h1>Warranty Details</h1>
                    <div
                        className="warranty-status-badge"
                        style={{ backgroundColor: getStatusColor(warranty.status) }}
                    >
                        {warranty.status}
                    </div>
                </div>

                <div className="warranty-content">
                    <div className="warranty-section">
                        <h2>Product Information</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Product Name</label>
                                <p>{warranty.product_name}</p>
                            </div>
                            <div className="info-item">
                                <label>Brand</label>
                                <p>{warranty.brand}</p>
                            </div>
                            <div className="info-item">
                                <label>Category</label>
                                <p>{warranty.category}</p>
                            </div>
                        </div>
                    </div>

                    <div className="warranty-section">
                        <h2>Warranty Information</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Purchase Date</label>
                                <p>{formatDate(warranty.purchase_date)}</p>
                            </div>
                            <div className="info-item">
                                <label>Warranty Period</label>
                                <p>{warranty.warranty_period} months</p>
                            </div>
                            <div className="info-item">
                                <label>Expiry Date</label>
                                <p>{formatDate(warranty.expiry_date)}</p>
                            </div>
                            <div className="info-item">
                                <label>Days Remaining</label>
                                <p className="days-remaining">
                                    {warranty.days_remaining > 0
                                        ? `${warranty.days_remaining} days`
                                        : 'Expired'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {warranty.receipt_file_url && (
                        <div className="warranty-section">
                            <h2>Receipt</h2>
                            <div className="receipt-container">
                                <img
                                    src={warranty.receipt_file_url}
                                    alt="Receipt"
                                    className="receipt-image"
                                />
                                <a
                                    href={warranty.receipt_file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="view-receipt-btn"
                                >
                                    View Full Size
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <div className="warranty-footer">
                    <p className="read-only-notice">
                        🔒 This is a read-only view. You cannot edit this warranty.
                    </p>
                    <p className="powered-by">
                        Powered by <strong>Digital Warranty Vault</strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PublicWarrantyView;
