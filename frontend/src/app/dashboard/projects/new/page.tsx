"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createProject } from "@/services/project.service";

export default function NewProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        visibility: "team"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!formData.name.trim()) {
            setError("Project name is required.");
            return;
        }

        setLoading(true);
        try {
            const res = await createProject({
                name: formData.name,
                description: formData.description,
                settings: {
                    visibility: formData.visibility as 'private' | 'team' | 'public',
                    defaultTaskStatus: "to-do"
                }
            });
            // Redirect to the newly created project board
            router.push(`/dashboard/projects/${res.data.data._id}`);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to create project. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => router.back()} 
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-8"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </button>

            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase mb-4 shadow-sm">
                        <Zap className="w-3.5 h-3.5 text-indigo-600" fill="currentColor" /> 
                        AI Workspace Setup
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-syne mb-2">Create New Project</h1>
                    <p className="text-slate-500 font-medium text-lg">Define your goal and let AI help you structure the tasks.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-[24px] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden">
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-white rounded-full blur-[40px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
                    
                    <div className="relative z-10 space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase tracking-widest">Project Name *</Label>
                            <Input 
                                id="name" 
                                placeholder="e.g., Q3 Marketing Campaign" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="h-14 text-lg rounded-xl bg-slate-50 border-slate-200 focus:border-slate-900 focus:ring-slate-900/10 font-medium placeholder:text-slate-400"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs font-bold text-slate-700 uppercase tracking-widest">Description (Optional)</Label>
                            <textarea 
                                id="description" 
                                placeholder="Briefly describe the goals of this project..." 
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full min-h-[120px] p-4 text-base rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 font-medium placeholder:text-slate-400 resize-y outline-none transition-all"
                            />
                        </div>

                        {/* Visibility (Custom Radio) */}
                        <div className="space-y-3">
                            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Visibility</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.visibility === 'team' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <input type="radio" name="visibility" value="team" className="hidden" checked={formData.visibility === 'team'} onChange={(e) => setFormData({...formData, visibility: e.target.value})} />
                                    <span className="font-bold text-slate-900 mb-1">Team Workspace</span>
                                    <span className="text-sm font-medium text-slate-500">Anyone in your team can view and join.</span>
                                </label>
                                <label className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.visibility === 'private' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <input type="radio" name="visibility" value="private" className="hidden" checked={formData.visibility === 'private'} onChange={(e) => setFormData({...formData, visibility: e.target.value})} />
                                    <span className="font-bold text-slate-900 mb-1">Private</span>
                                    <span className="text-sm font-medium text-slate-500">Only invited members can view this project.</span>
                                </label>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                {error}
                            </div>
                        )}

                        <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end">
                            <Button 
                                type="submit" 
                                disabled={loading} 
                                className="h-12 px-8 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <PlusIcon className="w-5 h-5 mr-2" />}
                                {loading ? "Creating..." : "Create Project"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Just a quick plus icon to avoid adding another lucide import if I forgot
function PlusIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M12 5v14M5 12h14"/>
        </svg>
    )
}
