"use client";

import { useEffect, useState, useRef } from "react";
import { getCurrentUser, changePassword, updateAvatar } from "@/services/auth.service";
import { Badge } from "@/components/ui/badge";
import { 
    User, Lock, Shield, Bell, Cloud, CheckCircle2, AlertCircle, 
    Upload, Camera, RefreshCw, Sparkles, Key, Check
} from "lucide-react";

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "cloud">("profile");

    // Password State
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // Avatar upload
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [avatarSuccess, setAvatarSuccess] = useState("");
    const [avatarError, setAvatarError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Notification toggles
    const [notifState, setNotifState] = useState({
        emailAlerts: true,
        taskAssigned: true,
        projectUpdates: true,
        aiDigest: false
    });

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const res = await getCurrentUser();
            const userData = res.data?.user || res.data || res.user;
            setUser(userData);
            if (userData?.avatar) {
                setAvatarPreview(userData.avatar);
            }
        } catch (err) {
            console.error("Failed to load user info", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (!oldPassword || !newPassword || !confirmPassword) {
            setPasswordError("All fields are required");
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        try {
            setPasswordLoading(true);
            await changePassword(oldPassword, newPassword);
            setPasswordSuccess("Password updated successfully!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setPasswordError(err.response?.data?.message || "Failed to update password");
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;
        setAvatarLoading(true);
        setAvatarError("");
        setAvatarSuccess("");

        try {
            const formData = new FormData();
            formData.append("avatar", avatarFile);
            await updateAvatar(formData);
            setAvatarSuccess("Avatar updated successfully!");
            fetchUser();
        } catch (err: any) {
            setAvatarError(err.response?.data?.message || "Failed to upload avatar");
        } finally {
            setAvatarLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-10 min-h-[50vh]">
                <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const initials = (user?.fullName || user?.username || "U").slice(0, 2).toUpperCase();

    return (
        <div className="max-w-5xl mx-auto pb-16">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-syne">Settings</h1>
                <p className="text-slate-500 font-medium mt-1">Manage your account profile, security credentials, and preferences.</p>
            </div>

            {/* Layout Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Navigation Sidebar */}
                <div className="space-y-1 md:col-span-1">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors text-left ${
                            activeTab === "profile" 
                                ? "bg-slate-900 text-white shadow-sm" 
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        <User className="w-4 h-4" />
                        My Profile
                    </button>
                    <button
                        onClick={() => setActiveTab("security")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors text-left ${
                            activeTab === "security" 
                                ? "bg-slate-900 text-white shadow-sm" 
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        <Lock className="w-4 h-4" />
                        Security & Password
                    </button>
                    <button
                        onClick={() => setActiveTab("notifications")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors text-left ${
                            activeTab === "notifications" 
                                ? "bg-slate-900 text-white shadow-sm" 
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        <Bell className="w-4 h-4" />
                        Notifications
                    </button>
                    <button
                        onClick={() => setActiveTab("cloud")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors text-left ${
                            activeTab === "cloud" 
                                ? "bg-slate-900 text-white shadow-sm" 
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        <Cloud className="w-4 h-4" />
                        AWS & Cloud Infrastructure
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-3">
                    {/* ── PROFILE TAB ─────────────────────────────────── */}
                    {activeTab === "profile" && (
                        <div className="space-y-6">
                            {/* Profile Card */}
                            <div className="bg-white rounded-[24px] border border-slate-200/80 p-8 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 font-syne mb-6">Profile Information</h3>

                                {/* Avatar Upload Section */}
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-slate-100">
                                    <div className="relative group">
                                        {avatarPreview ? (
                                            <img 
                                                src={avatarPreview} 
                                                alt="Avatar" 
                                                className="w-24 h-24 rounded-3xl object-cover border-2 border-slate-200 shadow-md" 
                                            />
                                        ) : (
                                            <div className="w-24 h-24 rounded-3xl bg-[#113248] text-white flex items-center justify-center text-2xl font-bold shadow-md">
                                                {initials}
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute -bottom-2 -right-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl shadow-lg transition-transform hover:scale-110"
                                            title="Change picture"
                                        >
                                            <Camera className="w-4 h-4" />
                                        </button>
                                        <input 
                                            ref={fileInputRef} 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={handleFileSelect} 
                                        />
                                    </div>

                                    <div className="flex-1 text-center sm:text-left">
                                        <h4 className="font-bold text-slate-900 text-lg">{user?.fullName || user?.username}</h4>
                                        <p className="text-slate-500 text-sm">{user?.email}</p>
                                        
                                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                                                {user?.isEmailVerified ? "Email Verified" : "Active Member"}
                                            </Badge>
                                            {user?.googleId && (
                                                <Badge className="bg-sky-50 text-sky-700 border-sky-200 text-xs">
                                                    Google Account
                                                </Badge>
                                            )}
                                        </div>

                                        {avatarFile && (
                                            <div className="mt-4 flex items-center gap-3">
                                                <button
                                                    onClick={handleAvatarUpload}
                                                    disabled={avatarLoading}
                                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
                                                >
                                                    {avatarLoading ? (
                                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <Upload className="w-3.5 h-3.5" />
                                                    )}
                                                    Save Photo
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setAvatarFile(null);
                                                        setAvatarPreview(user?.avatar || null);
                                                    }}
                                                    className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}

                                        {avatarSuccess && (
                                            <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> {avatarSuccess}
                                            </p>
                                        )}
                                        {avatarError && (
                                            <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5" /> {avatarError}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Form Details (Readonly / Display) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
                                        <input 
                                            type="text" 
                                            value={user?.username || ""} 
                                            readOnly 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium text-sm focus:outline-none cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                        <input 
                                            type="email" 
                                            value={user?.email || ""} 
                                            readOnly 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium text-sm focus:outline-none cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={user?.fullName || user?.username || ""} 
                                            readOnly 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium text-sm focus:outline-none cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Joined Date</label>
                                        <input 
                                            type="text" 
                                            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Active"} 
                                            readOnly 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium text-sm focus:outline-none cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── SECURITY TAB ─────────────────────────────────── */}
                    {activeTab === "security" && (
                        <div className="bg-white rounded-[24px] border border-slate-200/80 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                                    <Key className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 font-syne">Change Password</h3>
                                    <p className="text-slate-500 text-sm">Ensure your workspace account is secured with a strong password.</p>
                                </div>
                            </div>

                            {passwordSuccess && (
                                <div className="p-4 mb-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-sm flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                    {passwordSuccess}
                                </div>
                            )}

                            {passwordError && (
                                <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium text-sm flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {passwordError}
                                </div>
                            )}

                            <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
                                    <input 
                                        type="password" 
                                        value={oldPassword} 
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                                    <input 
                                        type="password" 
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat new password"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="w-full bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 mt-4"
                                >
                                    {passwordLoading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Updating Password...
                                        </>
                                    ) : (
                                        "Update Password"
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ── NOTIFICATIONS TAB ────────────────────────────── */}
                    {activeTab === "notifications" && (
                        <div className="bg-white rounded-[24px] border border-slate-200/80 p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 font-syne mb-2">Notification Preferences</h3>
                            <p className="text-slate-500 text-sm mb-6">Choose how and when you receive workspace updates.</p>

                            <div className="space-y-4 divide-y divide-slate-100">
                                <div className="flex items-center justify-between pt-4">
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">Task Assignments</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Receive immediate in-app and socket alerts when assigned to a task.</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={notifState.taskAssigned} 
                                        onChange={(e) => setNotifState({ ...notifState, taskAssigned: e.target.checked })}
                                        className="w-5 h-5 text-indigo-600 rounded cursor-pointer accent-slate-900" 
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-4">
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">Project Activity Logs</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Track real-time board movements and note creations in your projects.</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={notifState.projectUpdates} 
                                        onChange={(e) => setNotifState({ ...notifState, projectUpdates: e.target.checked })}
                                        className="w-5 h-5 text-indigo-600 rounded cursor-pointer accent-slate-900" 
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-4">
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">AI Daily Digest</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Receive AI-generated sprint health predictions and task suggestions.</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={notifState.aiDigest} 
                                        onChange={(e) => setNotifState({ ...notifState, aiDigest: e.target.checked })}
                                        className="w-5 h-5 text-indigo-600 rounded cursor-pointer accent-slate-900" 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── CLOUD INFRASTRUCTURE TAB ──────────────────────── */}
                    {activeTab === "cloud" && (
                        <div className="bg-white rounded-[24px] border border-slate-200/80 p-8 shadow-sm space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 font-syne mb-1">Cloud & Storage Architecture</h3>
                                <p className="text-slate-500 text-sm">Active AWS and cloud configuration powering Project Camp.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
                                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                        <Cloud className="w-5 h-5" />
                                        <h4 className="font-bold text-slate-900 text-sm">AWS S3 Private Storage</h4>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Zero-trust private bucket with direct streaming via Multer-S3. All files delivered securely via 24-hour pre-signed URLs.
                                    </p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        <span className="text-xs font-bold text-emerald-700">Bucket: Active & Connected</span>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
                                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                                        <Shield className="w-5 h-5" />
                                        <h4 className="font-bold text-slate-900 text-sm">Region & Security</h4>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Deployed in <strong>ap-south-1 (Mumbai)</strong> with JWT token rotation, cryptographic hashing, and Socket.IO real-time websockets.
                                    </p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        <span className="text-xs font-bold text-emerald-700">Region: ap-south-1</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
