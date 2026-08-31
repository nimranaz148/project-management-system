"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { getProjectTasks, updateTask, TaskData } from "@/services/task.service";
import { ArrowLeft, Plus, MoreHorizontal, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getProjectDetails } from "@/services/project.service";
import { getCurrentUser } from "@/services/auth.service";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { ViewTaskModal } from "@/components/tasks/ViewTaskModal";
import { getSocket } from "@/services/socket.service";

// Kanban Columns Setup
const COLUMNS = [
    { id: "todo", title: "To Do", color: "bg-slate-100" },
    { id: "in-progress", title: "In Progress", color: "bg-indigo-50" },
    { id: "done", title: "Done", color: "bg-emerald-50" },
];

export default function KanbanBoardPage() {
    const router = useRouter();
    const { id: projectId } = useParams();
    const [project, setProject] = useState<any>(null);
    const [tasks, setTasks] = useState<TaskData[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [userRole, setUserRole] = useState<string>("member");
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            const [projRes, tasksRes, userRes] = await Promise.all([
                getProjectDetails(projectId as string),
                getProjectTasks(projectId as string),
                getCurrentUser()
            ]);
            setProject(projRes.data.data.project);
            setUserRole(projRes.data.data.role);
            setTasks(tasksRes.data.data?.tasks || []);
            const user = userRes.data?.data?.user || userRes.data?.user || userRes.data?.data;
            setCurrentUser(user);
        } catch (err) {
            console.error("Failed to fetch board data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!projectId) return;
        fetchData();

        const socket = getSocket();
        socket.emit("joinProject", projectId);

        socket.on("task_created", (data: any) => {
            if (data?.task) {
                setTasks(prev => {
                    if (prev.some(t => t._id === data.task._id)) return prev;
                    return [...prev, data.task];
                });
            }
        });

        socket.on("task_updated", (data: any) => {
            if (data?.task) {
                setTasks(prev => prev.map(t => t._id === data.task._id ? { ...t, ...data.task } : t));
            }
        });

        socket.on("task_deleted", (data: any) => {
            if (data?.taskId) {
                setTasks(prev => prev.filter(t => t._id !== data.taskId));
            }
        });

        return () => {
            socket.emit("leaveProject", projectId);
            socket.off("task_created");
            socket.off("task_updated");
            socket.off("task_deleted");
        };
    }, [projectId]);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Optimistically update UI
        const newStatus = destination.droppableId as TaskData['status'];
        const taskToUpdate = tasks.find(t => t._id === draggableId);
        
        if (taskToUpdate) {
            const updatedTasks = tasks.map(t => 
                t._id === draggableId ? { ...t, status: newStatus } : t
            );
            setTasks(updatedTasks);

            // API Call
            try {
                await updateTask(projectId as string, draggableId, { status: newStatus });
            } catch (error) {
                console.error("Failed to update task status", error);
                // Revert if failed
                fetchData();
            }
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-10 min-h-[50vh]">
                <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full h-[calc(100vh-100px)]">
            {userRole === 'admin' && (
                <CreateTaskModal 
                    isOpen={isCreateModalOpen} 
                    onClose={() => setIsCreateModalOpen(false)} 
                    projectId={projectId as string}
                    onTaskCreated={fetchData}
                />
            )}

            <ViewTaskModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedTask(null);
                }}
                projectId={projectId as string}
                task={selectedTask}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                    <button 
                        onClick={() => router.push(`/dashboard/projects/${projectId}`)} 
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Overview
                    </button>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-syne">
                        {project?.name || "Project Board"}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2 mr-4">
                        {/* Member Role Badge */}
                        <Badge variant="outline" className={`font-bold uppercase tracking-wider text-[11px] px-3 py-1 rounded-xl ${
                            userRole === 'admin' 
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                                : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                            {userRole === 'admin' ? "👑 Project Admin" : "👤 Member View"}
                        </Badge>
                    </div>
                    {userRole === 'admin' && (
                        <button onClick={() => setIsCreateModalOpen(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-md hover:-translate-y-0.5">
                            <Plus className="w-4 h-4" />
                            Add Task
                        </button>
                    )}
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-6 h-full min-w-max pb-4">
                        {COLUMNS.map(column => {
                            const columnTasks = tasks.filter(t => t.status === column.id);
                            
                            return (
                                <div key={column.id} className="w-80 flex flex-col h-full max-h-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-900">{column.title}</h3>
                                            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                                {columnTasks.length}
                                            </span>
                                        </div>
                                        <button className="text-slate-400 hover:text-slate-900 transition-colors">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <Droppable droppableId={column.id}>
                                        {(provided, snapshot) => (
                                            <div 
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={`flex-1 rounded-[20px] p-3 transition-colors overflow-y-auto ${column.color} ${snapshot.isDraggingOver ? 'ring-2 ring-slate-900/10' : ''}`}
                                            >
                                                {columnTasks.map((task, index) => {
                                                    const assignedId = typeof task.assignedTo === 'object' && task.assignedTo ? task.assignedTo._id : task.assignedTo;
                                                    const canEdit = userRole === 'admin' || assignedId === currentUser?._id;
                                                    
                                                    return (
                                                    <Draggable key={task._id || index} draggableId={task._id || `task-${index}`} index={index} isDragDisabled={!canEdit}>
                                                        {(provided, snapshot) => (
                                                            <div 
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                onClick={() => {
                                                                    setSelectedTask(task);
                                                                    setIsViewModalOpen(true);
                                                                }}
                                                                className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-3 group hover:border-slate-300 hover:shadow-md transition-all cursor-pointer ${
                                                                    snapshot.isDragging ? 'shadow-lg rotate-2 scale-105 border-indigo-500' : ''
                                                                } ${!canEdit ? 'opacity-75 cursor-not-allowed' : ''}`}
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <Badge variant={task.priority === 'high' || task.priority === 'critical' ? 'destructive' : 'secondary'} className="text-[10px] uppercase tracking-wider px-1.5 py-0">
                                                                        {task.priority}
                                                                    </Badge>
                                                                </div>
                                                                <h4 className="font-bold text-slate-900 text-sm mb-1 leading-snug">{task.title}</h4>
                                                                {task.description && (
                                                                    <p className="text-slate-500 text-xs font-medium line-clamp-2 mb-3">
                                                                        {task.description}
                                                                    </p>
                                                                )}
                                                                
                                                                <div className="flex items-center justify-between text-slate-400 mt-4 pt-3 border-t border-slate-100">
                                                                    {task.dueDate ? (
                                                                        <div className="flex items-center gap-1.5 text-[11px] font-bold">
                                                                            <Clock className="w-3.5 h-3.5" />
                                                                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                                                                        </div>
                                                                    ) : <div/>}
                                                                    
                                                                    {task.assignedTo ? (
                                                                        <div className="w-6 h-6 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-700 uppercase" title={typeof task.assignedTo === 'object' && task.assignedTo ? (task.assignedTo.fullName || task.assignedTo.username || 'Member') : "Assigned"}>
                                                                            {(typeof task.assignedTo === 'object' && task.assignedTo ? (task.assignedTo.fullName || task.assignedTo.username || 'U') : 'U').charAt(0)}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600" title="Unassigned">
                                                                            U
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                    );
                                                })}
                                                {provided.placeholder}
                                                
                                                {userRole === 'admin' && (
                                                    <button onClick={() => setIsCreateModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 font-bold text-sm hover:border-slate-900 hover:text-slate-900 hover:bg-white transition-all mt-2">
                                                        <Plus className="w-4 h-4" />
                                                        Add Task
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            );
                        })}
                    </div>
                </DragDropContext>
            </div>
        </div>
    );
}
