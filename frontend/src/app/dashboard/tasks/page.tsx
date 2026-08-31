"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { listProjects } from "@/services/project.service";
import { getProjectTasks } from "@/services/task.service";
import { getCurrentUser } from "@/services/auth.service";
import { CheckSquare, Clock, ArrowRight, LayoutList, UserCheck, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MyTasksPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"assigned" | "all">("assigned");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAllTasks = async () => {
            try {
                // 1. Get user & projects
                const [userRes, projRes] = await Promise.all([
                    getCurrentUser(),
                    listProjects()
                ]);

                const user = userRes.data?.data?.user || userRes.data?.user || userRes.data?.data;
                setCurrentUser(user);

                const projects = projRes.data.data;

                // 2. Fetch tasks for each project
                let allTasks: any[] = [];
                
                await Promise.all(
                    projects.map(async (item: any) => {
                        const projectId = item.project._id;
                        try {
                            const tasksRes = await getProjectTasks(projectId);
                            const projTasks = tasksRes.data.data?.tasks || [];
                            // attach project name to each task so we know where it came from
                            projTasks.forEach((t: any) => {
                                t.projectName = item.project.name;
                            });
                            allTasks = [...allTasks, ...projTasks];
                        } catch (e) {
                            console.error(`Failed to fetch tasks for project ${projectId}`);
                        }
                    })
                );

                // Sort by due date (newest first) or fallback to createdAt
                allTasks.sort((a, b) => {
                    const dateA = new Date(a.dueDate || a.createdAt).getTime();
                    const dateB = new Date(b.dueDate || b.createdAt).getTime();
                    return dateB - dateA;
                });

                setTasks(allTasks);
            } catch (err) {
                setError("Failed to load your tasks.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllTasks();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "done": return "bg-green-100 text-green-700 border-green-200";
            case "in-progress": return "bg-blue-100 text-blue-700 border-blue-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "critical": return "text-red-600 bg-red-50";
            case "high": return "text-orange-600 bg-orange-50";
            case "low": return "text-slate-600 bg-slate-50";
            default: return "text-indigo-600 bg-indigo-50";
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-10 min-h-[50vh]">
                <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const filteredTasks = activeTab === "assigned"
        ? tasks.filter(t => (t.assignedTo?._id === currentUser?._id || t.assignedTo === currentUser?._id))
        : tasks;

    return (
        <div className="max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-syne">
                        My Tasks
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        A global overview of tasks across your workspaces.
                    </p>
                </div>

                {/* Jira/ClickUp Filter Tabs */}
                <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
                    <button
                        onClick={() => setActiveTab("assigned")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeTab === "assigned"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                        <UserCheck className="w-3.5 h-3.5" />
                        Assigned to Me ({tasks.filter(t => t.assignedTo?._id === currentUser?._id || t.assignedTo === currentUser?._id).length})
                    </button>
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeTab === "all"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        All Workspace Tasks ({tasks.length})
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 font-bold mb-8">
                    {error}
                </div>
            )}

            {filteredTasks.length === 0 && !error ? (
                <div className="bg-white rounded-[24px] border border-slate-200/80 p-16 text-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center mx-auto mb-5 shadow-inner">
                        <CheckSquare className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                    </div>
                    <h4 className="text-slate-900 font-bold text-lg mb-2">
                        {activeTab === "assigned" ? "No tasks assigned to you" : "No workspace tasks found"}
                    </h4>
                    <p className="text-slate-500 font-medium text-sm mb-6 max-w-sm mx-auto">
                        {activeTab === "assigned" 
                            ? "You're all caught up! When a project admin assigns tasks to you, they'll appear right here." 
                            : "Create tasks inside a project board to start tracking work."}
                    </p>
                    <button 
                        onClick={() => router.push('/dashboard/projects')}
                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-md hover:-translate-y-0.5"
                    >
                        <LayoutList className="w-4 h-4" />
                        Go to Projects
                    </button>
                </div>
            ) : (
                <div className="bg-white border border-slate-200/80 rounded-[24px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Task</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Project</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTasks.map((task) => (
                                    <tr key={task._id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => router.push(`/dashboard/projects/${task.project}/board`)}>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 mb-1">{task.title}</div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${getPriorityColor(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                                                {task.projectName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={`font-bold capitalize ${getStatusColor(task.status)}`}>
                                                {task.status.replace("-", " ")}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            {task.dueDate ? (
                                                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-sm font-medium">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors ml-auto" strokeWidth={3} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
