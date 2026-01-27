import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
    const { user, logout } = useAuth();

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-end px-8 shadow-sm z-30">

                    <div className="flex items-center gap-6">
                        <NotificationBell />

                        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</div>
                                <div className="text-xs text-gray-500">Free Plan</div>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border-2 border-white shadow-sm overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                                )}
                            </div>
                            <button
                                onClick={logout}
                                className="ml-2 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8 scroll-smooth">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
