import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Button from './Button';

export default function Navbar() {
    return (
        <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-primary-600 p-1.5 rounded-lg group-hover:scale-105 transition-transform">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">Warranty<span className="text-primary-600">Vault</span></span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost" className="font-semibold text-gray-600 hover:text-primary-600">Login</Button>
                        </Link>
                        <Link to="/register">
                            <Button className="shadow-lg shadow-primary-500/20">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}
