"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getProjectDetails } from "@/services/project.service";
import { ArrowLeft, Edit, Trash2, CheckSquare, Clock, Zap, Target, MoreHorizontal, Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProjectOverviewPage() {
    const router = useRouter();
    const { id } = useParams();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        const fetchDetails = async () => {
            try {
                const res = await getProjectDetails(id as string);
                setProject(res.data.data.project);
            } catch (err) {
                setError("Failed to load project details.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-10 min-h-[50vh]">
                <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 font-bold mb-8">
                {error || "Project not found"}
            </div>
        );
    }

    return (
        <div className="relative max-w-5xl">
            <button 
                onClick={() => router.push('/dashboard/projects')} 
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
            </button>

            {/* Header */}
            <div className="bg-white border border-slate-200/80 rounded-[24px] p-8 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xl uppercase font-syne shadow-md">
                            {project.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-syne">{project.name}</h1>
                            <div className="flex items-center gap-2 mt-1 text-sm font-medium text-slate-500">
                                <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold bg-white text-slate-600 border-slate-200">{project.settings?.visibility || 'Team'}</Badge>
                                <span>•</span>
                                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-slate-600 font-medium text-base mt-4 max-w-2xl leading-relaxed">
                        {project.description || "No description provided for this project."}
                    </p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                    <button 
                        onClick={() => router.push(`/dashboard/projects/${id}/team`)}
                        className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Users className="w-4 h-4" />
                        Manage Team
                    </button>
                    <button 
                        onClick={() => router.push(`/dashboard/projects/${id}/activity`)}
                        className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        Activity Logs
                    </button>
                    <button 
                        onClick={() => router.push(`/dashboard/projects/${id}/notes`)}
                        className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        Notes
                    </button>
                    <button 
                        onClick={() => router.push(`/dashboard/projects/${id}/board`)}
                        className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md"
                    >
                        Open Board
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats / Overview */}
                <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
                                <CheckSquare className="w-5 h-5 text-slate-700" />
                            </div>
                            <p className="text-3xl font-bold text-slate-900 mb-1">{project.metadata?.totalTasks || 0}</p>
                            <p className="text-sm font-medium text-slate-500">Total Tasks</p>
                        </div>
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
                                <Target className="w-5 h-5 text-slate-700" />
                            </div>
                            <p className="text-3xl font-bold text-slate-900 mb-1">{project.metadata?.completedTasks || 0}</p>
                            <p className="text-sm font-medium text-slate-500">Completed</p>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-[24px] p-8 shadow-sm">
                        <h3 className="font-bold tracking-tight text-slate-900 text-lg mb-4">Recent Activity</h3>
                        <div className="text-center py-10">
                            <p className="text-slate-500 font-medium text-sm">No recent activity found in this project.</p>
                        </div>
                    </div>
                </div>

                {/* AI Insights Panel */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[24px] p-8 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[30px]" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6">
                                <Zap className="w-5 h-5 text-yellow-400" fill="currentColor" />
                                <h3 className="font-bold text-white text-lg">AI Insights</h3>
                            </div>
                            
                            {project.aiInsights?.riskLevel ? (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Risk Level</p>
                                        <Badge variant="outline" className="border-slate-700 text-slate-300">
                                            {project.aiInsights.riskLevel}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Recommendations</p>
                                        <ul className="space-y-2">
                                            {project.aiInsights.recommendations?.map((rec: string, i: number) => (
                                                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                                        AI hasn't analyzed this project yet. Add some tasks and team members to generate insights.
                                    </p>
                                    <button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                                        Analyze Project
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SettingsIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    )
}
