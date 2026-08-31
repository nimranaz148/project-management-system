"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { listProjects } from "@/services/project.service";
import { Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function GlobalTeamPage() {
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
        <div className="max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-syne">
                    Team Directory
                </h1>
                <p className="text-slate-500 font-medium mt-1">
                    Select a workspace to manage its team members and roles.
                </p>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 font-bold mb-8">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((item) => (
                    <div 
                        key={item.project._id}
                        onClick={() => router.push(`/dashboard/projects/${item.project._id}/team`)}
                        className="bg-white border border-slate-200/80 rounded-[20px] p-6 hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 transition-all cursor-pointer group flex flex-col"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl uppercase font-syne">
                                {item.project.name.charAt(0)}
                            </div>
                            <Badge variant="outline" className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                {item.role}
                            </Badge>
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-900 mb-2 truncate">{item.project.name}</h3>
                        
                        <div className="border-t border-slate-100 pt-4 mt-auto flex items-center justify-between text-slate-400">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                <Users className="w-4 h-4 text-slate-400" /> 
                                {item.project.metadata?.totalMembers || 1} Members
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" strokeWidth={3} />
                        </div>
                    </div>
                ))}
            </div>

            {projects.length === 0 && !error && (
                <div className="bg-white rounded-[24px] border border-slate-200/80 p-16 text-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center mx-auto mb-5 shadow-inner">
                        <Users className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                    </div>
                    <h4 className="text-slate-900 font-bold text-lg mb-2">No active teams</h4>
                    <p className="text-slate-500 font-medium text-sm mb-6 max-w-sm mx-auto">
                        Create a project to start building your team.
                    </p>
                </div>
            )}
        </div>
    );
}
