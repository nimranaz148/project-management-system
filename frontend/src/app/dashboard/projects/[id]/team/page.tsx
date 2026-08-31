"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    Users, Shield, ShieldAlert, UserMinus, Plus, Mail, 
    AlertTriangle, X, CheckCircle2, AlertCircle, Loader2, ChevronDown
} from "lucide-react";
import { listTeamMembers, removeTeamMember, updateTeamMember, TeamMember } from "@/services/team.service";
import { getProjectDetails } from "@/services/project.service";
import { InviteMemberModal } from "@/components/team/InviteMemberModal";
import { Badge } from "@/components/ui/badge";

export default function ProjectTeamPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [members, setMembers] = useState<TeamMember[]>([]);
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState("member");

    // Custom Remove Modal State
    const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
    const [isRemoveLoading, setIsRemoveLoading] = useState(false);

    // Toast State
    const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const showToast = (type: "success" | "error", text: string) => {
        setToastMessage({ type, text });
        setTimeout(() => {
            setToastMessage(null);
        }, 4000);
    };

    const fetchData = async () => {
        try {
            const [projRes, membersRes] = await Promise.all([
                getProjectDetails(projectId),
                listTeamMembers(projectId)
            ]);
            
            setProject(projRes.data.data.project);
            setCurrentUserRole(projRes.data.data.role);
            setMembers(membersRes.data.data);
        } catch (err: any) {
            setError("Failed to load team data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchData();
        }
    }, [projectId]);

    const handleConfirmRemove = async () => {
        if (!memberToRemove) return;

        const targetId = memberToRemove.user?._id || memberToRemove._id;
        setIsRemoveLoading(true);

        try {
            await removeTeamMember(projectId, targetId);
            setMembers(prev => prev.filter(m => m._id !== memberToRemove._id));
            showToast("success", `${memberToRemove.user?.fullName || memberToRemove.user?.username || "Member"} removed from project.`);
            setMemberToRemove(null);
        } catch (err: any) {
            showToast("error", err?.response?.data?.message || "Failed to remove member.");
        } finally {
            setIsRemoveLoading(false);
        }
    };

    const handleRoleChange = async (member: TeamMember, newRole: "admin" | "member") => {
        if (member.role === newRole) return;
        const targetId = member.user?._id || member._id;

        try {
            await updateTeamMember(projectId, targetId, newRole);
            setMembers(prev => prev.map(m => m._id === member._id ? { ...m, role: newRole } : m));
            showToast("success", `Role updated to ${newRole === "admin" ? "Admin" : "Member"}`);
        } catch (err: any) {
            showToast("error", err?.response?.data?.message || "Failed to update role");
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-10 min-h-[50vh]">
                <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 font-bold p-6">{error}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-16 relative">
            {/* Custom Toast Alert */}
            {toastMessage && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border animate-in slide-in-from-top-4 duration-300 ${
                    toastMessage.type === "success" 
                        ? "bg-slate-900 text-white border-slate-800" 
                        : "bg-red-50 text-red-700 border-red-200"
                }`}>
                    {toastMessage.type === "success" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    )}
                    <span className="text-sm font-semibold">{toastMessage.text}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-syne">
                        Team Management
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Manage access and roles for <span className="font-bold text-slate-700">{project?.name}</span>.
                    </p>
                </div>

                {currentUserRole === 'admin' && (
                    <button 
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md hover:-translate-y-0.5"
                    >
                        <Plus className="w-4 h-4" />
                        Invite Member
                    </button>
                )}
            </div>

            {/* Team Table */}
            <div className="bg-white border border-slate-200/80 rounded-[24px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role & Permissions</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {members.map((member) => (
                                <tr key={member._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold font-syne uppercase shadow-sm border border-indigo-100/60">
                                                {(member.user?.fullName || member.user?.username || "U").charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{member.user?.fullName || member.user?.username || "Member"}</div>
                                                <div className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <Mail className="w-3 h-3 text-slate-400" />
                                                    {member.user?.email || "No email"}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {currentUserRole === 'admin' ? (
                                            <div className="relative inline-block">
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => handleRoleChange(member, e.target.value as "admin" | "member")}
                                                    className={`text-xs font-bold rounded-xl px-3 py-1.5 border appearance-none pr-8 cursor-pointer outline-none transition-all ${
                                                        member.role === 'admin'
                                                            ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                                                            : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                                                    }`}
                                                >
                                                    <option value="member">Member</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                                            </div>
                                        ) : (
                                            member.role === 'admin' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                                                    <ShieldAlert className="w-3.5 h-3.5" />
                                                    Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                                                    <Shield className="w-3.5 h-3.5" />
                                                    Member
                                                </span>
                                            )
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-500">
                                        {new Date(member.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {currentUserRole === 'admin' && (
                                            <button 
                                                onClick={() => setMemberToRemove(member)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Remove Member"
                                            >
                                                <UserMinus className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {members.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                                        No members found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom Confirmation Modal */}
            {memberToRemove && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200 p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900 font-syne">Remove Member</h3>
                                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                                    Are you sure you want to remove <span className="font-bold text-slate-800">{memberToRemove.user?.fullName || memberToRemove.user?.username || "this user"}</span> ({memberToRemove.user?.email}) from <span className="font-bold text-slate-800">{project?.name}</span>?
                                </p>
                                <p className="text-xs text-red-600 font-semibold mt-2">
                                    They will immediately lose access to this project and its tasks.
                                </p>
                            </div>
                            <button 
                                onClick={() => setMemberToRemove(null)}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setMemberToRemove(null)}
                                disabled={isRemoveLoading}
                                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmRemove}
                                disabled={isRemoveLoading}
                                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition-all flex items-center gap-2"
                            >
                                {isRemoveLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Removing...
                                    </>
                                ) : (
                                    "Remove Member"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Member Modal */}
            <InviteMemberModal 
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                projectId={projectId}
                onMemberAdded={fetchData}
            />
        </div>
    );
}
