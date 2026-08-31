"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, logoutUser } from "@/services/auth.service";
import { initSocket, disconnectSocket } from "@/services/socket.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Users,
    Bell,
    Settings,
    LogOut,
    User,
    Zap,
    ChevronDown,
} from "lucide-react";
import { getMyNotifications } from "@/services/notification.service";
import { AIAssistantPanel } from "@/components/ai/AIAssistantPanel";
import { X } from "lucide-react";

interface UserType {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
}

function NavItem({ icon: Icon, label, href, active, badge }: { icon: React.ElementType; label: string; href: string; active?: boolean; badge?: number }) {
    return (
        <Link href={href} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
            active ? "bg-[#113248] text-white font-semibold shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
        }`}>
            <div className="flex items-center gap-3">
                <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.5 : 2} />
                {label}
            </div>
            {badge && badge > 0 ? (
                <div className={`min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-extrabold shadow-sm ${active ? 'bg-white text-[#113248]' : 'bg-red-500 text-white'}`}>
                    {badge > 99 ? '99+' : badge}
                </div>
            ) : null}
        </Link>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [liveToast, setLiveToast] = useState<{title: string, message: string} | null>(null);

    useEffect(() => {
        const fetchUserAndNotifications = async () => {
            try {
                const res = await getCurrentUser();
                const userData = res.data?.data?.user || res.data?.user || res.data?.data;
                setUser(userData);

                // Fetch initial notifications count
                try {
                    const notifRes = await getMyNotifications();
                    const count = notifRes.data?.data?.unreadCount ?? notifRes.data?.unreadCount ?? 0;
                    setUnreadNotifications(count);
                } catch (e) {
                    console.error("Failed to fetch notifications count", e);
                }
            } catch (error) {
                router.push("/auth");
            } finally {
                setLoading(false);
            }
        };
        fetchUserAndNotifications();
    }, [router]);

    useEffect(() => {
        if (!user?._id) return;
        const socket = initSocket();
        
        const handleNewNotification = (notif: any) => {
            setUnreadNotifications(prev => prev + 1);
            setLiveToast({ title: notif.title, message: notif.message });
            
            // Auto hide toast after 5 seconds
            setTimeout(() => {
                setLiveToast(null);
            }, 5000);
        };

        socket.on("new_notification", handleNewNotification);

        return () => {
            socket.off("new_notification", handleNewNotification);
        };
    }, [user?._id]);

    const handleLogout = async () => {
        await logoutUser();
        router.push("/auth");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">Loading workspace</p>
                </div>
            </div>
        );
    }

    const initials = user?.username?.slice(0, 2).toUpperCase() || "U";

    return (
        <div className="min-h-screen bg-[#fafafa] flex selection:bg-slate-200 font-sans">
            {/* ── Sidebar ──────────────────────────────────────── */}
            <aside className="w-64 bg-white border-r border-slate-200 fixed h-full flex flex-col z-20">
                {/* Header / Logo */}
                <div className="bg-[#113248] py-6 px-5 flex flex-col justify-center shadow-md z-10 relative">
                    <Link href="/" className="flex flex-col gap-1.5 hover:opacity-90 transition-opacity">
                        <div className="flex items-center gap-2 text-white">
                            <Zap className="w-5 h-5 fill-current" />
                            <span className="text-xl font-bold tracking-tight font-syne">Project Camp</span>
                        </div>
                        <span className="text-[10px] text-slate-300 font-bold tracking-[0.2em] uppercase">Admin Console</span>
                    </Link>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-4 py-6 space-y-7 overflow-y-auto custom-scrollbar">
                    {/* OVERVIEW */}
                    <div className="space-y-2">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Overview</h4>
                        <div className="space-y-1">
                            <NavItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" active={pathname === "/dashboard"} />
                            <NavItem icon={FolderKanban} label="Projects" href="/dashboard/projects" active={pathname.startsWith("/dashboard/projects")} />
                            <NavItem icon={CheckSquare} label="My Tasks" href="/dashboard/tasks" active={pathname.startsWith("/dashboard/tasks")} />
                        </div>
                    </div>

                    {/* PEOPLE */}
                    <div className="space-y-2">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">People</h4>
                        <div className="space-y-1">
                            <NavItem icon={Users} label="Team" href="/dashboard/team" active={pathname.startsWith("/dashboard/team")} />
                            <NavItem icon={Bell} label="Notifications" href="/dashboard/notifications" active={pathname.startsWith("/dashboard/notifications")} badge={unreadNotifications} />
                        </div>
                    </div>

                    {/* SYSTEM */}
                    <div className="space-y-2">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">System</h4>
                        <div className="space-y-1">
                            <NavItem icon={Settings} label="Settings" href="/dashboard/settings" active={pathname.startsWith("/dashboard/settings")} />
                        </div>
                    </div>
                </nav>

                {/* Footer User / Sign Out */}
                <div className="p-4 border-t border-slate-100 mt-auto">
                    <button onClick={handleLogout} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors text-sm font-semibold group">
                        <div className="flex items-center gap-3">
                            <LogOut className="w-[18px] h-[18px] text-slate-400 group-hover:text-slate-700" strokeWidth={2.5} />
                            Sign out
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-6 h-6 bg-[#113248] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                {initials}
                             </div>
                        </div>
                    </button>
                </div>
            </aside>

            {/* ── Main Content ──────────────────────────────────── */}
            <main className="ml-64 flex-1 p-10 relative">
                {/* Subtle background glow for premium feel */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-100/40 to-purple-100/40 rounded-full blur-[100px] -z-10 pointer-events-none" />
                {children}
            </main>

            {liveToast && (
                <div className="fixed bottom-6 right-6 w-80 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xl z-50 flex items-start gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <Bell className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{liveToast.title}</h4>
                        <p className="text-slate-600 text-xs mt-1 line-clamp-2">{liveToast.message}</p>
                    </div>
                    <button onClick={() => setLiveToast(null)} className="text-slate-400 hover:text-slate-600 shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <AIAssistantPanel />
        </div>
    );
}
