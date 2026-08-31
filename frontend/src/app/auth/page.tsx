"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginUser, registerUser } from "@/services/auth.service";
import gsap from "gsap";

export default function AuthPage() {
    const router = useRouter();
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.fromTo(cardRef.current, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );
    }, []);

    // --- Login State ---
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    // --- Register State ---
    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regError, setRegError] = useState("");
    const [regLoading, setRegLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");
        setLoginLoading(true);
        try {
            await loginUser(loginEmail, loginPassword);
            router.push("/dashboard");
        } catch (err: any) {
            setLoginError(err?.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setLoginLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegError("");
        setRegLoading(true);
        try {
            await registerUser(regName, regEmail, regPassword);
            // Auto login so session cookies are created immediately
            await loginUser(regEmail, regPassword);
            router.push("/dashboard");
        } catch (err: any) {
            setRegError(err?.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setRegLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#f8f7f3] selection:bg-indigo-500/30 overflow-hidden">
            
            {/* 1. Deep Glowing Background Orbs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[140px] opacity-40 pointer-events-none mix-blend-multiply"
                 style={{ background: "radial-gradient(circle, #6366f1, transparent 60%)" }} />
            <div className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 pointer-events-none mix-blend-multiply"
                 style={{ background: "radial-gradient(circle, #0ea5e9, transparent 60%)" }} />
            
            {/* Subtle mesh/dot grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.2]"
                 style={{ backgroundImage: "radial-gradient(circle, #4f46e5 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

            {/* 2. Glassmorphic Card */}
            <div ref={cardRef} className="relative z-10 w-full max-w-[420px] p-8 sm:p-10 bg-white/40 backdrop-blur-[40px] border border-white/80 rounded-[32px] shadow-[0_32px_64px_-12px_rgba(79,70,229,0.15)] ring-1 ring-white/50">
                
                {/* Subtle top edge highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

                <div className="mb-8 text-center relative z-20">
                    <div className="mx-auto w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/30 border border-white/20 relative">
                        <div className="absolute inset-0 rounded-2xl bg-white/20 blur-sm"></div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-white relative z-10">
                            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2 font-syne">
                        Welcome to Project Camp
                    </h1>
                    <p className="text-[14px] text-slate-600 font-medium">
                        Access your glowing workspace.
                    </p>
                </div>

                <Tabs defaultValue="login" className="w-full relative z-20">
                    <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-white/50 backdrop-blur-md rounded-xl p-1 border border-white/60 shadow-inner">
                        <TabsTrigger value="login" className="text-sm font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 text-slate-500 transition-all">Log In</TabsTrigger>
                        <TabsTrigger value="register" className="text-sm font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 text-slate-500 transition-all">Sign Up</TabsTrigger>
                    </TabsList>

                    {/* ── Login Tab ─────────────────────────────── */}
                    <TabsContent value="login" className="mt-0 outline-none">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Email</Label>
                                <Input id="email" type="email" placeholder="name@company.com" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} 
                                       className="h-12 rounded-xl bg-white/60 backdrop-blur-md border-white/80 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 px-4 text-[15px] shadow-sm placeholder:text-slate-400 transition-all font-medium text-slate-800" />
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between ml-1">
                                    <Label htmlFor="password" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</Label>
                                    <a href="#" className="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors">Forgot?</a>
                                </div>
                                <Input id="password" type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} 
                                       className="h-12 rounded-xl bg-white/60 backdrop-blur-md border-white/80 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 px-4 text-[15px] shadow-sm transition-all font-medium text-slate-800" />
                            </div>

                            {loginError && (
                                <div className="text-[13px] text-red-600 bg-red-50/80 backdrop-blur-sm border border-red-200 p-3 rounded-xl font-medium">
                                    {loginError}
                                </div>
                            )}

                            <Button type="submit" disabled={loginLoading} className="relative w-full h-12 text-[15px] font-bold mt-4 rounded-xl text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-gradient-x"></div>
                                <span className="relative z-10">{loginLoading ? "Authenticating..." : "Enter Workspace"}</span>
                            </Button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-300/50" /></div>
                                <div className="relative flex justify-center text-[10px] uppercase font-extrabold tracking-widest">
                                    <span className="bg-[#f2f4f8] px-3 text-slate-400 rounded-full">Or</span>
                                </div>
                            </div>

                            <Button variant="outline" type="button" className="w-full h-12 rounded-xl bg-white/70 backdrop-blur-md hover:bg-white border-white/80 text-slate-700 font-bold transition-all shadow-sm">
                                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Continue with Google
                            </Button>
                        </form>
                    </TabsContent>

                    {/* ── Register Tab ────────────────────────────── */}
                    <TabsContent value="register" className="mt-0 outline-none">
                        <form onSubmit={handleRegister} className="space-y-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="reg-name" className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Full Name</Label>
                                <Input id="reg-name" type="text" placeholder="John Doe" required value={regName} onChange={(e) => setRegName(e.target.value)} 
                                       className="h-12 rounded-xl bg-white/60 backdrop-blur-md border-white/80 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 px-4 text-[15px] shadow-sm placeholder:text-slate-400 transition-all font-medium text-slate-800" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="reg-email" className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Email</Label>
                                <Input id="reg-email" type="email" placeholder="name@company.com" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} 
                                       className="h-12 rounded-xl bg-white/60 backdrop-blur-md border-white/80 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 px-4 text-[15px] shadow-sm placeholder:text-slate-400 transition-all font-medium text-slate-800" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="reg-password" className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Password</Label>
                                <Input id="reg-password" type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} 
                                       className="h-12 rounded-xl bg-white/60 backdrop-blur-md border-white/80 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 px-4 text-[15px] shadow-sm transition-all font-medium text-slate-800" />
                            </div>

                            {regError && (
                                <div className="text-[13px] text-red-600 bg-red-50/80 backdrop-blur-sm border border-red-200 p-3 rounded-xl font-medium">
                                    {regError}
                                </div>
                            )}

                            <Button type="submit" disabled={regLoading} className="relative w-full h-12 text-[15px] font-bold mt-4 rounded-xl text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-gradient-x"></div>
                                <span className="relative z-10">{regLoading ? "Creating account..." : "Create Account"}</span>
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
