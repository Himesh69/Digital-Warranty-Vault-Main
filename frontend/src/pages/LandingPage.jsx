import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { ShieldCheck, Bell, Smartphone, Lock, ArrowRight } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white font-sans selection:bg-primary-100 selection:text-primary-900">
            <Navbar />

            {/* Hero */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-50 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        Never Lose a <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-400">Warranty</span> Again.
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        The secure, intelligent vault for all your product warranties.
                        Track expirations, get smart reminders, and declutter your life in seconds.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <Link to="/register">
                            <Button size="lg" className="rounded-full px-8 text-lg h-14 shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 transform hover:-translate-y-1 transition-all w-full sm:w-auto">
                                Start Vaulting
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" size="lg" className="rounded-full px-8 text-lg h-14 border-2 hover:bg-gray-50 w-full sm:w-auto">
                                Log In
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-24 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">Why Digital Warranty Vault?</h2>
                        <p className="mt-4 text-gray-500 text-lg">Everything you need to manage your purchases effectively.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <FeatureCard
                            icon={Lock}
                            title="Secure Storage"
                            desc="Keep your receipts and documents safe in encrypted cloud storage. Never worry about fading ink again."
                        />
                        <FeatureCard
                            icon={Bell}
                            title="Smart Alerts"
                            desc="Get automated email and push notifications 30 days before your warranty expires."
                        />
                        <FeatureCard
                            icon={Smartphone}
                            title="Access Anywhere"
                            desc="Your information is available 24/7 on any device. Mobile-first design for on-the-go access."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <ShieldCheck className="h-6 w-6 text-gray-400" />
                        <span className="text-lg font-bold text-gray-500">WarrantyVault</span>
                    </div>
                    <p className="text-gray-400 text-sm">© 2024 Digital Warranty Vault. Built for Final Year Project.</p>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({ icon: Icon, title, desc }) {
    return (
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 group">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary-600 group-hover:scale-110 transition-transform duration-300">
                <Icon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-500 leading-relaxed">{desc}</p>
        </div>
    )
}
