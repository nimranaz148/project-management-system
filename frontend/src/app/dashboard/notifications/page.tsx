"use client";

import { useState, useEffect } from "react";
import { Bell, Check, CheckCircle2, Inbox } from "lucide-react";
import { getMyNotifications, markAllAsRead, markAsRead, NotificationData } from "@/services/notification.service";
import { useRouter } from "next/navigation";

function timeAgo(dateInput: string | Date): string {
    const date = new Date(dateInput);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} days ago`;
    return date.toLocaleDateString();
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchNotifications = async () => {
        try {
            const res = await getMyNotifications();
            setNotifications(res.data.data.notifications);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error(error);
        }
    };

    const handleNotificationClick = async (notification: NotificationData) => {
        if (!notification.isRead) {
            try {
                await markAsRead(notification._id);
                setNotifications(notifications.map(n => n._id === notification._id ? { ...n, isRead: true } : n));
            } catch (error) {
                console.error(error);
            }
        }

        // Navigate based on type
        if (notification.type === "project_invite" && notification.relatedEntity) {
            router.push(`/dashboard/projects/${notification.relatedEntity}`);
        } else if (notification.type === "task_assigned" && notification.relatedEntity) {
            // we don't have direct task URL, so we just go to my tasks
            router.push(`/dashboard/tasks`);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading inbox...</div>;
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="max-w-4xl mx-auto py-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-syne flex items-center gap-3">
                        <Inbox className="w-8 h-8 text-indigo-600" />
                        Inbox
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">You have {unreadCount} unread notifications.</p>
                </div>
                {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center mx-auto mb-6">
                        <Bell className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2 font-syne">Inbox Zero</h2>
                    <p className="text-slate-500 font-medium text-center max-w-sm">
                        You're all caught up! Real-time notifications for task assignments and mentions will appear here.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                    {notifications.map((notification) => (
                        <div 
                            key={notification._id} 
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-5 flex items-start gap-4 border-b border-slate-100 cursor-pointer transition-colors ${!notification.isRead ? 'bg-indigo-50/30 hover:bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                        >
                            <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${!notification.isRead ? 'bg-indigo-600' : 'bg-transparent'}`} />
                            
                            <div className="flex-1">
                                <h4 className={`text-sm mb-1 ${!notification.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                    {notification.title}
                                </h4>
                                <p className="text-slate-600 text-sm mb-2 leading-relaxed">
                                    {notification.message}
                                </p>
                                <span className="text-xs font-medium text-slate-400">
                                    {timeAgo(notification.createdAt)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
