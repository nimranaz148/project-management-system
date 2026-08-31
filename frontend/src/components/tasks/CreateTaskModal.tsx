"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createTask, TaskData } from "@/services/task.service";
import { listTeamMembers, TeamMember } from "@/services/team.service";

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    onTaskCreated: () => void;
    defaultStatus?: "todo" | "in-progress" | "done";
}

export function CreateTaskModal({ isOpen, onClose, projectId, onTaskCreated, defaultStatus = "todo" }: CreateTaskModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [members, setMembers] = useState<TeamMember[]>([]);
    
    const [formData, setFormData] = useState<Partial<TaskData>>({
        title: "",
        description: "",
        status: defaultStatus,
        priority: "medium",
        dueDate: "",
        assignedTo: "",
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({ ...prev, status: defaultStatus }));
            // Fetch project members
            listTeamMembers(projectId)
                .then(res => setMembers(res.data.data))
                .catch(err => console.error("Failed to load members", err));
        }
    }, [isOpen, defaultStatus, projectId]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!formData.title?.trim()) {
            setError("Task title is required.");
            return;
        }

        setLoading(true);
        try {
            await createTask(projectId, formData as TaskData);
            onTaskCreated();
            setFormData({ title: "", description: "", status: "todo", priority: "medium" });
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to create task.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[24px] w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 font-syne">Create Task</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Title</Label>
                            <Input 
                                placeholder="What needs to be done?" 
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="h-12 rounded-xl bg-slate-50 font-medium border-slate-200 focus:border-slate-900"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Description</Label>
                            <textarea 
                                placeholder="Add more details..." 
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full min-h-[100px] p-3 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 font-medium resize-none outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Priority</Label>
                                <select 
                                    value={formData.priority}
                                    onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                                    className="w-full h-12 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-sm outline-none focus:border-slate-900"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Due Date</Label>
                                <div className="relative">
                                    <Input 
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                        className="h-12 pl-10 rounded-xl bg-slate-50 font-medium border-slate-200 focus:border-slate-900"
                                    />
                                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-4 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Assign To</Label>
                            <select 
                                value={formData.assignedTo || ""}
                                onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                                className="w-full h-12 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-sm outline-none focus:border-slate-900"
                            >
                                <option value="">Unassigned</option>
                                {members.map((member) => {
                                    const uid = typeof member.user === 'object' && member.user ? member.user._id : (member.user || member._id);
                                    const uName = typeof member.user === 'object' && member.user ? (member.user.fullName || member.user.username || member.user.email) : "Member";
                                    const uEmail = typeof member.user === 'object' && member.user?.email ? ` (${member.user.email})` : "";
                                    const roleTag = member.role ? ` • ${member.role}` : "";
                                    return (
                                        <option key={member._id} value={uid}>
                                            {uName}{uEmail}{roleTag}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-bold">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end gap-3">
                        <Button 
                            type="button" 
                            variant="outline"
                            onClick={onClose}
                            className="h-11 px-6 rounded-xl font-bold"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="h-11 px-6 rounded-xl bg-slate-900 text-white font-bold shadow-md hover:bg-slate-800"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Create Task
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
