import React from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import { Badge } from "../components/Badge";
import { User, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
    const { user } = useAuth();

    // Fallback if user is loading or null
    if (!user) return <div className="p-8 text-center">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="col-span-1 text-center">
                    <div className="w-24 h-24 rounded-full bg-primary-100 mx-auto mb-4 p-1 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                        {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-bold text-primary-600">{user.name?.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-500 text-sm mb-4">{user.email}</p>
                    <Badge variant="default" className="mb-6">Free Member</Badge>

                    <div className="text-left space-y-3 pt-6 border-t border-gray-100">
                        <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-3" /> Member since 2024
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <Shield className="h-4 w-4 mr-3" /> Standard Protection
                        </div>
                    </div>
                </Card>

                {/* Edit Details */}
                <Card className="col-span-1 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>
                    <form className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                <Input defaultValue={user.name} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <Input defaultValue={user.email} type="email" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">New Password</label>
                            <Input type="password" placeholder="Leave blank to keep current" />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button>Save Changes</Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    )
}
