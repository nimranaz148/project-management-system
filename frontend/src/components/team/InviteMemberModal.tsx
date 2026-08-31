"use client";

import { useState } from "react";
import { X, Loader2, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { addTeamMember } from "@/services/team.service";

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    onMemberAdded: () => void;
}

export function InviteMemberModal({ isOpen, onClose, projectId, onMemberAdded }: InviteMemberModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!email?.trim()) {
            setError("Email is required.");
            return;
        }

        setLoading(true);
        try {
            await addTeamMember(projectId, email, role);
            onMemberAdded();
            setEmail("");
            setRole("member");
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to invite member. Make sure they are registered.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 font-syne">Invite Member</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">User Email</Label>
                            <div className="relative">
                                <Input 
                                    type="email"
                                    placeholder="name@example.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 pl-10 rounded-xl bg-slate-50 font-medium border-slate-200 focus:border-slate-900"
                                    required
                                />
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-4 pointer-events-none" />
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium mt-1">User must already have an account.</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Role</Label>
                            <select 
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full h-12 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-sm outline-none focus:border-slate-900"
                            >
                                <option value="member">Member (Can edit tasks)</option>
                                <option value="admin">Admin (Full Access)</option>
                            </select>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-bold border border-red-100">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end gap-3">
                        <Button 
                            type="button" 
                            variant="outline"
                            onClick={onClose}
                            className="h-11 px-6 rounded-xl font-bold hover:bg-slate-50"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="h-11 px-6 rounded-xl bg-slate-900 text-white font-bold shadow-md hover:bg-slate-800"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Send Invite
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
