"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, FolderKanban, ArrowRight, Clock, Users, Target } from "lucide-react";
import { listProjects } from "@/services/project.service";
import { Badge } from "@/components/ui/badge";

export default function ProjectsListPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await listProjects();
                setProjects(res.data.data);
            } catch (err: any) {
                setError("Failed to load projects.");
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-10 min-h-[50vh]">
                <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-syne">
                        All Projects
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Manage your active projects and workspaces.
                    </p>
                </div>
                <button 
                    onClick={() => router.push('/dashboard/projects/new')}
                    className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md hover:-translate-y-0.5"
                >
                    <Plus className="w-4 h-4" />
                    New Project
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 font-bold mb-8">
                    {error}
                </div>
            )}

            {projects.length === 0 && !error ? (
                <div className="bg-white rounded-[24px] border border-slate-200/80 p-16 text-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center mx-auto mb-5 shadow-inner">
                        <FolderKanban className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                    </div>
                    <h4 className="text-slate-900 font-bold text-lg mb-2">No projects found</h4>
                    <p className="text-slate-500 font-medium text-sm mb-6 max-w-sm mx-auto">
                        You haven't created or joined any projects yet.
                    </p>
                    <button 
                        onClick={() => router.push('/dashboard/projects/new')}
                        className="inline-flex items-center gap-2 bg-white text-slate-900 border-2 border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:border-slate-900 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Create Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((item) => (
                        <div 
                            key={item.project._id}
                            onClick={() => router.push(`/dashboard/projects/${item.project._id}`)}
                            className="bg-white border border-slate-200/80 rounded-[20px] p-6 hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 transition-all cursor-pointer group flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl uppercase font-syne">
                                    {item.project.name.charAt(0)}
                                </div>
                                <div className="bg-slate-50 border border-slate-200 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    {item.project.settings?.visibility || 'Team'}
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-slate-900 mb-2 truncate">{item.project.name}</h3>
                            <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-6 flex-1">
                                {item.project.description || "No description provided for this project."}
                            </p>

                            <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-slate-400">
                                <div className="flex items-center gap-4 text-xs font-bold">
                                    <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> {item.project.metadata?.totalTasks || 0}</span>
                                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {item.project.metadata?.totalMembers || 1}</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" strokeWidth={3} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
