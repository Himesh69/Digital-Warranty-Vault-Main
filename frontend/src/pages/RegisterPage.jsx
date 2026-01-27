import { useState } from 'react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const name = `${formData.firstName} ${formData.lastName}`.trim();
            await register(formData.email, name, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.email?.[0] || err.response?.data?.error || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary-100/50 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500 relative z-10">
                <div className="text-center">
                    <Link to="/" className="inline-block mx-auto h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-primary-500/30 hover:scale-105 transition-transform">
                        <ShieldCheck className="h-8 w-8" />
                    </Link>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create an account</h2>
                    <p className="mt-2 text-gray-600">Start organizing your warranties today</p>
                </div>

                <Card className="p-8 shadow-2xl border-0 ring-1 ring-gray-900/5 bg-white/80 backdrop-blur-sm">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <Input
                                    name="firstName"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <Input
                                    name="lastName"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <Input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <Input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <Input
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 text-base shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30"
                            disabled={loading}
                        >
                            {loading ? 'Creating account...' : 'Get Started'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-500">Already have an account? </span>
                        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">Sign in</Link>
                    </div>
                </Card>
            </div>
        </div>
    )
}
