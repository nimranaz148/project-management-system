"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Plus, Trash2, Paperclip, FileText, Check } from "lucide-react";
import api from "@/lib/api";

interface Note {
    _id: string;
    title: string;
    content: string;
    attachments?: Array<{ url: string; filename: string; key?: string }>;
    createdBy: { _id: string; username: string };
    createdAt: string;
}

export default function NotesPage() {
    const params = useParams();
    const router = useRouter();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState("");
    const [newNoteContent, setNewNoteContent] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const projectId = params.id as string;

    const fetchNotes = async () => {
        try {
            const res = await api.get(`/notes/${projectId}`);
            setNotes(Array.isArray(res.data.message) ? res.data.message : res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch notes", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [projectId]);

    const handleCreateNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
        
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("title", newNoteTitle.trim());
            formData.append("content", newNoteContent.trim());

            if (selectedFiles && selectedFiles.length > 0) {
                for (let i = 0; i < selectedFiles.length; i++) {
                    formData.append("attachments", selectedFiles[i]);
                }
            }

            await api.post(`/notes/${projectId}`, formData);
            setNewNoteTitle("");
            setNewNoteContent("");
            setSelectedFiles(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchNotes();
        } catch (error) {
            console.error("Failed to create note", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!confirm("Are you sure you want to delete this note?")) return;
        try {
            await api.delete(`/notes/${projectId}/${noteId}`);
            fetchNotes();
        } catch (error) {
            console.error("Failed to delete note", error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-6">
            <button 
                onClick={() => router.push(`/dashboard/projects/${projectId}`)}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Project
            </button>

            <div className="flex items-center gap-3 mb-8">
                <BookOpen className="w-8 h-8 text-indigo-500" />
                <h1 className="text-3xl font-extrabold text-slate-900 font-syne">Project Notes</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Note Form */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleCreateNote} className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm sticky top-24">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-indigo-500" />
                            New Note
                        </h2>
                        <input
                            type="text"
                            placeholder="Note Title"
                            value={newNoteTitle}
                            onChange={(e) => setNewNoteTitle(e.target.value)}
                            className="w-full mb-4 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium"
                            required
                        />
                        <textarea
                            placeholder="Write your note here..."
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                            className="w-full mb-4 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium min-h-[140px] resize-y"
                            required
                        />

                        <div className="mb-4 space-y-2">
                            <label className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 cursor-pointer text-xs font-semibold text-slate-600 transition-colors">
                                <div className="flex items-center gap-2">
                                    <Paperclip className="w-4 h-4 text-indigo-500" />
                                    <span>{selectedFiles && selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : "Attach Files (Images, PDF, Docs)"}</span>
                                </div>
                                <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-500 font-bold uppercase">Browse</span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={(e) => setSelectedFiles(e.target.files)}
                                    className="hidden"
                                />
                            </label>

                            {selectedFiles && selectedFiles.length > 0 && (
                                <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1">
                                    <p className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5 text-indigo-600" /> Ready to upload:
                                    </p>
                                    <ul className="text-xs text-indigo-700 space-y-0.5 pl-4 list-disc">
                                        {Array.from(selectedFiles).map((file, idx) => (
                                            <li key={idx} className="truncate">{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Uploading & Saving...
                                </>
                            ) : "Save Note"}
                        </button>
                    </form>
                </div>

                {/* Notes List */}
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="text-center py-10 text-slate-500 font-medium">Loading notes...</div>
                    ) : notes.length === 0 ? (
                        <div className="bg-white border border-slate-200 border-dashed rounded-[24px] p-12 text-center">
                            <p className="text-slate-500 font-medium">No notes yet. Create one to get started.</p>
                        </div>
                    ) : (
                        notes.map((note) => (
                            <div key={note._id} className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm group relative">
                                <button
                                    onClick={() => handleDeleteNote(note._id)}
                                    className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <h3 className="text-xl font-bold text-slate-900 mb-2 pr-8">{note.title}</h3>
                                <p className="text-xs text-slate-400 font-medium mb-4">
                                    By {note.createdBy?.username || "You"} on {new Date(note.createdAt).toLocaleDateString()}
                                </p>
                                <div className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                                    {note.content}
                                </div>

                                {note.attachments && note.attachments.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                                        {note.attachments.map((att, idx) => (
                                            <a 
                                                key={idx} 
                                                href={att.url} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                                            >
                                                <Paperclip className="w-3.5 h-3.5" />
                                                {att.filename || `Attachment ${idx + 1}`}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
