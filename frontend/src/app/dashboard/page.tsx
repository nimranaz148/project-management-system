"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/services/auth.service";
import { listProjects } from "@/services/project.service";
import { getProjectTasks } from "@/services/task.service";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, CheckSquare, Users, Plus, Target, Zap, ArrowRight, Clock } from "lucide-react";

// ── Stat Card ──────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, color, loading }: {
    title: string;
    value: string;
    icon: React.ElementType;
    color: string;
    loading?: boolean;
}) {
    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            {loading ? (
                <div className="h-9 w-16 bg-slate-100 animate-pulse rounded-lg mb-1" />
            ) : (
                <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
            )}
            <p className="text-sm font-medium text-slate-500">{title}</p>
        </div>
    );
}

// ── Main Dashboard ─────────────────────────────────────────────────
export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ username: string } | null>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProjects: 0,
        activeTasks: 0,
        completedTasks: 0,
        teamMembers: 1,
        completionRate: "0%"
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch current user
                getCurrentUser().then(res => setUser(res.data)).catch(() => {});

                // 2. Fetch all user projects
                const projRes = await listProjects();
                const userProjects = Array.isArray(projRes.data.data) ? projRes.data.data : [];
                setProjects(userProjects);

                // 3. Fetch tasks for each project to calculate live metrics
                let allTasks: any[] = [];
                let totalMembersCount = 0;

                await Promise.all(
                    userProjects.map(async (item: any) => {
                        const projId = item.project?._id;
                        totalMembersCount += item.project?.metadata?.totalMembers || 1;
                        if (projId) {
                            try {
                                const tasksRes = await getProjectTasks(projId);
                                const projTasks = tasksRes.data.data?.tasks || [];
                                allTasks = [...allTasks, ...projTasks];
                            } catch (err) {
                                console.error(`Error fetching tasks for ${projId}`, err);
                            }
                        }
                    })
                );

                const active = allTasks.filter(t => t.status !== "done").length;
                const completed = allTasks.filter(t => t.status === "done").length;
                const rate = allTasks.length > 0 ? `${Math.round((completed / allTasks.length) * 100)}%` : "0%";

                setStats({
                    totalProjects: userProjects.length,
                    activeTasks: active,
                    completedTasks: completed,
                    teamMembers: Math.max(1, totalMembersCount),
                    completionRate: rate
                });
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-syne">
                        Good evening, {user?.username || 'User'}
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Here's what's happening in your workspace today.
                    </p>
                </div>
                <button 
                    onClick={() => router.push('/dashboard/projects/new')}
                    className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)] hover:-translate-y-0.5"
                >
                    <Plus className="w-4 h-4" />
                    New Project
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                <StatCard 
                    title="Total Projects" 
                    value={stats.totalProjects.toString()} 
                    icon={FolderKanban} 
                    color="bg-indigo-50 text-indigo-600 border border-indigo-100" 
                    loading={loading}
                />
                <StatCard 
                    title="Active Tasks" 
                    value={stats.activeTasks.toString()} 
                    icon={CheckSquare} 
                    color="bg-amber-50 text-amber-600 border border-amber-100" 
                    loading={loading}
                />
                <StatCard 
                    title="Team Members" 
                    value={stats.teamMembers.toString()} 
                    icon={Users} 
                    color="bg-sky-50 text-sky-600 border border-sky-100" 
                    loading={loading}
                />
                <StatCard 
                    title="Completion Rate" 
                    value={stats.completionRate} 
                    icon={Target} 
                    color="bg-emerald-50 text-emerald-600 border border-emerald-100" 
                    loading={loading}
                />
            </div>

            {/* Create Project CTA / Banner */}
            <div className="relative overflow-hidden rounded-[24px] bg-white border border-slate-200/80 p-8 sm:p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] mb-10 group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-50/50 to-purple-50/40 rounded-full blur-[60px] translate-x-1/3 -translate-y-1/4 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                
                <div className="relative z-10 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase mb-4">
                        <Zap className="w-3.5 h-3.5 text-amber-500" fill="currentColor" /> 
                        AI Powered Setup
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3 font-syne">Ready to start a new project?</h2>
                    <p className="text-slate-500 font-medium text-base mb-6 leading-relaxed">
                        Create a project, invite your team, and let our AI instantly suggest tasks, structure sprints, and analyze risks for you.
                    </p>
                    <button onClick={() => router.push('/dashboard/projects/new')} className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-[15px] font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5">
                        <Plus className="w-5 h-5" />
                        Create New Project
                    </button>
                </div>
            </div>

            {/* Recent Projects */}
            <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-sm overflow-hidden mb-8">
                <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h3 className="font-bold tracking-tight text-slate-900 text-lg font-syne">Recent Projects</h3>
                        <p className="text-sm font-medium text-slate-500 mt-0.5">Your active workspaces and projects</p>
                    </div>
                    <button onClick={() => router.push('/dashboard/projects')} className="text-sm text-indigo-600 font-bold hover:underline underline-offset-4 flex items-center gap-1">
                        View all <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
                
                {loading ? (
                    <div className="p-12 text-center text-slate-400 font-medium">Loading workspace data...</div>
                ) : projects.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center mx-auto mb-5 shadow-inner">
                            <FolderKanban className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                        </div>
                        <h4 className="text-slate-900 font-bold text-lg mb-2 font-syne">No projects yet</h4>
                        <p className="text-slate-500 font-medium text-sm mb-6 max-w-sm mx-auto">
                            Your workspace is empty. Create your first project to start tracking tasks and collaborating.
                        </p>
                        <button onClick={() => router.push('/dashboard/projects/new')} className="inline-flex items-center gap-2 bg-white text-slate-900 border-2 border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:border-slate-900 transition-colors shadow-sm">
                            <Plus className="w-4 h-4" />
                            Create Project
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {projects.slice(0, 5).map((item) => {
                            const p = item.project;
                            if (!p) return null;
                            return (
                                <div 
                                    key={p._id} 
                                    onClick={() => router.push(`/dashboard/projects/${p._id}`)}
                                    className="p-6 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-600 font-bold shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                            <FolderKanban className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{p.name}</h4>
                                                <Badge variant="outline" className="text-[11px] font-bold uppercase tracking-wider bg-slate-50 text-slate-600 border-slate-200">
                                                    {p.settings?.visibility || "private"}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1 line-clamp-1 max-w-xl">
                                                {p.description || "No description provided."}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 self-end sm:self-center">
                                        <div className="text-right hidden md:block">
                                            <p className="text-xs text-slate-400 font-medium">Last active</p>
                                            <p className="text-xs font-bold text-slate-700 mt-0.5">
                                                {new Date(p.updatedAt || p.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
