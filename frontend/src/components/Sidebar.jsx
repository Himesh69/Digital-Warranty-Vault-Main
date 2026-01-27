import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, List, User, LogOut, ShieldCheck } from 'lucide-react';
import { cn } from '../utils/utils';

export default function Sidebar() {
    const location = useLocation();

    const links = [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { href: '/dashboard/warranties', label: 'My Warranties', icon: List },
        { href: '/dashboard/add', label: 'Add Warranty', icon: PlusCircle },
        { href: '/dashboard/profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full fixed left-0 top-0 bottom-0 z-40 lg:relative">
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <div className="bg-primary-600 p-1.5 rounded-lg mr-3 shadow-md shadow-primary-500/20">
                    <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900 tracking-tight">Warranty<span className="text-primary-600">Vault</span></span>
            </div>

            <div className="p-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4">Menu</div>
                <nav className="space-y-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.href || (link.href !== '/dashboard' && location.pathname.startsWith(link.href));
                        return (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-primary-50 text-primary-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-r-full" />}
                                <Icon className={cn("h-5 w-5 mr-3 transition-colors", isActive ? "text-primary-600" : "text-gray-400 group-hover:text-primary-600")} />
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="mt-auto p-4 border-t border-gray-100">
                <Link to="/login">
                    <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors">
                        <LogOut className="h-5 w-5 mr-3" />
                        Sign Out
                    </button>
                </Link>
            </div>
        </div>
    )
}
