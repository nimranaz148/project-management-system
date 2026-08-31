"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import api from "@/lib/api";

interface ActivityLog {
    _id: string;
    user?: { _id: string; username: string; profilePicture?: string; fullName?: string };
    userId?: { _id: string; username: string; profilePicture?: string; fullName?: string };
    action: string;
    entityType: string;
    entityId: string;
    createdAt: string;
}

export default function ActivityLogsPage() {
    const params = useParams();
    const router = useRouter();
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const projectId = params.id as string;

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get(`/activity/${projectId}`);
                setLogs(Array.isArray(res.data.message) ? res.data.message : res.data.data || []);
            } catch (error) {
                console.error("Failed to fetch activity logs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [projectId]);

    return (
        <div className="max-w-4xl mx-auto py-8">
            <button 
                onClick={() => router.push(`/dashboard/projects/${projectId}`)}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Project
            </button>

            <div className="bg-white border border-slate-200/80 rounded-[24px] p-8 shadow-sm">
                <h1 className="text-2xl font-extrabold text-slate-900 font-syne mb-8 flex items-center gap-3">
                    <Clock className="w-6 h-6 text-indigo-500" />
                    Activity Logs
                </h1>

                {loading ? (
                    <div className="text-center py-10 text-slate-500 font-medium">Loading logs...</div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 font-medium">No activity yet.</div>
                ) : (
                    <div className="space-y-6">
                        {logs.map((log) => {
                            const name = log.user?.fullName || log.user?.username || log.userId?.username || 'Team Member';
                            return (
                                <div key={log._id} className="flex gap-4 items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                                        {name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-800">
                                            <span className="font-bold text-slate-900">{name}</span>
                                            <span className="text-slate-500 mx-1.5">
                                                {log.action === "created" ? "created a new" :
                                                 log.action === "updated" ? "updated" :
                                                 log.action === "deleted" ? "deleted" : log.action}
                                            </span>
                                            <span className="font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs uppercase tracking-wider">
                                                {log.entityType}
                                            </span>
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1 font-medium">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
