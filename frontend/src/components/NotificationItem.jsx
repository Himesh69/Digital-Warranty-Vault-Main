import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertCircle, XCircle } from 'lucide-react';

export default function NotificationItem({ notification, onMarkAsRead }) {
    const navigate = useNavigate();

    const getIcon = () => {
        const type = notification.notification_type;
        if (type === 'expired') {
            return <XCircle className="h-5 w-5 text-red-500" />;
        } else if (type === '3_days' || type === '2_days' || type === '1_day') {
            return <AlertCircle className="h-5 w-5 text-orange-500" />;
        } else {
            return <Package className="h-5 w-5 text-blue-500" />;
        }
    };

    const handleClick = () => {
        // Mark as read
        if (!notification.is_read) {
            onMarkAsRead(notification.id);
        }
        // Navigate to warranty details
        navigate(`/dashboard/warranties/${notification.warranty_id}`);
    };

    return (
        <div
            onClick={handleClick}
            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 ${!notification.is_read ? 'bg-blue-50/50' : ''
                }`}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium text-gray-900 ${!notification.is_read ? 'font-semibold' : ''}`}>
                            {notification.title}
                        </p>
                        {!notification.is_read && (
                            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary-600 mt-1.5"></span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">
                            {notification.time_ago}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                            {notification.warranty_product_name}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
