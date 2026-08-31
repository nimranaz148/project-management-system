"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { TaskData } from "@/services/task.service";

interface Subtask {
    _id: string;
    title: string;
    isCompleted: boolean;
}

interface ViewTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    task: TaskData | null;
}

export function ViewTaskModal({ isOpen, onClose, projectId, task }: ViewTaskModalProps) {
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && task?._id) {
            fetchSubtasks();
        }
    }, [isOpen, task]);

    const fetchSubtasks = async () => {
        if (!task?._id) return;
        setLoading(true);
        try {
            const res = await api.get(`/tasks/${projectId}/t/${task._id}/subtasks`);
            setSubtasks(Array.isArray(res.data.message) ? res.data.message : res.data.data || []);
        } catch (error) {
            console.error("Failed to load subtasks", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubtask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubtaskTitle.trim() || !task?._id) return;
        try {
            await api.post(`/tasks/${projectId}/t/${task._id}/subtasks`, { title: newSubtaskTitle });
            setNewSubtaskTitle("");
            fetchSubtasks();
        } catch (error) {
            console.error("Failed to create subtask", error);
        }
    };

    const toggleSubtask = async (subtask: Subtask) => {
        if (!task?._id) return;
        try {
            await api.patch(`/tasks/${projectId}/t/${task._id}/subtasks/${subtask._id}`, { isCompleted: !subtask.isCompleted });
            fetchSubtasks();
        } catch (error) {
            console.error("Failed to update subtask", error);
        }
    };

    const deleteSubtask = async (subtaskId: string) => {
        if (!task?._id) return;
        try {
            await api.delete(`/tasks/${projectId}/t/${task._id}/subtasks/${subtaskId}`);
            fetchSubtasks();
        } catch (error) {
            console.error("Failed to delete subtask", error);
        }
    };

    if (!isOpen || !task) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-900 font-syne">{task.title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Description</h3>
                        <p className="text-slate-600 leading-relaxed">{task.description || "No description provided."}</p>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4">Subtasks</h3>
                        
                        {/* Subtasks List */}
                        <div className="space-y-2 mb-4">
                            {loading ? (
                                <p className="text-sm text-slate-400">Loading subtasks...</p>
                            ) : subtasks.length === 0 ? (
                                <p className="text-sm text-slate-400">No subtasks yet.</p>
                            ) : (
                                subtasks.map(st => (
                                    <div key={st._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl group border border-slate-100 hover:border-slate-200 transition-colors">
                                        <button onClick={() => toggleSubtask(st)} className="text-slate-400 hover:text-indigo-500 transition-colors">
                                            {st.isCompleted ? <CheckCircle2 className="w-5 h-5 text-indigo-500" /> : <Circle className="w-5 h-5" />}
                                        </button>
                                        <span className={`flex-1 text-sm font-medium ${st.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                            {st.title}
                                        </span>
                                        <button onClick={() => deleteSubtask(st._id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add Subtask Form */}
                        <form onSubmit={handleCreateSubtask} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add a subtask..."
                                value={newSubtaskTitle}
                                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-medium transition-all"
                            />
                            <button type="submit" className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
