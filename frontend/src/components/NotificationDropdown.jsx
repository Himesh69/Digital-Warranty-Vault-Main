import React from 'react';
import NotificationItem from './NotificationItem';
import { CheckCheck, Trash2 } from 'lucide-react';

export default function NotificationDropdown({ notifications, onMarkAsRead, onMarkAllAsRead, onClose }) {
    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="ml-2 text-sm font-normal text-gray-600">
                                ({unreadCount} new)
                            </span>
                        )}
                    </h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onMarkAllAsRead();
                            }}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                        >
                            <CheckCheck className="h-4 w-4" />
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <p className="text-gray-600 font-medium">No notifications</p>
                        <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
                    </div>
                ) : (
                    <>
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={onMarkAsRead}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // Could add clear all functionality here
                        }}
                        className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium py-2"
                    >
                        View all notifications
                    </button>
                </div>
            )}
        </div>
    );
}
