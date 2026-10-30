"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FileText, MessageSquare, Compass, ClipboardList, 
  TrendingUp, Award, Clock, ArrowUpRight, 
  Plus, AlertCircle, CheckCircle2, ChevronRight, LogOut, User, Cpu, Loader2,
  Upload, Sparkles
} from "lucide-react";
import { getDashboardData } from "@/app/actions/dashboard";
import { updateUserInfo, deleteUserAccount, logoutUser } from "@/app/actions/auth";
import { uploadAndScanResume } from "@/app/actions/resume";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [skillGaps, setSkillGaps] = useState<any[]>([]);

  // Account Settings Modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [updateName, setUpdateName] = useState("");
  const [updateEmail, setUpdateEmail] = useState("");
  const [updateRole, setUpdateRole] = useState("");
  const [updateSkills, setUpdateSkills] = useState("");
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Onboarding Wizard states
  const [onboardTab, setOnboardTab] = useState<"manual" | "upload">("manual");
  const [onboardRole, setOnboardRole] = useState("");
  const [onboardExperience, setOnboardExperience] = useState("Entry Level");
  const [onboardSkills, setOnboardSkills] = useState("");
  const [onboardFile, setOnboardFile] = useState<File | null>(null);
  const [onboardingSubmit, setOnboardingSubmit] = useState(false);
  const [onboardError, setOnboardError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const result = await getDashboardData();
        if (result.success && result.user) {
          setUser(result.user);
          setUpdateName(result.user.name);
          setUpdateEmail(result.user.email);
          setUpdateRole(result.user.targetRole || "");
          setUpdateSkills(result.user.skills ? result.user.skills.join(", ") : "");
          setStats(result.stats);
          setResumes(result.resumes || []);
          setInterviews(result.interviews || []);
          setSkillGaps(result.skillGaps || []);
          setLoading(false);
        } else {
          // Non-authenticated user, redirect to login
          router.push("/login");
        }
      } catch (err) {
        console.error("Dashboard hydration error:", err);
        router.push("/login");
      }
    };

    loadDashboard();
  }, [router]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingSettings(true);
    setSettingsError(null);
    setSettingsSuccess(null);
    try {
      const formattedSkills = updateSkills.split(",").map(s => s.trim()).filter(Boolean).join(",");
      const result = await updateUserInfo({ 
        name: updateName, 
        email: updateEmail,
        targetJobRole: updateRole,
        skills: formattedSkills
      });
      if (result.success) {
        setSettingsSuccess("Profile settings updated successfully!");
        setUser((prev: any) => ({ 
          ...prev, 
          name: updateName, 
          email: updateEmail,
          targetRole: updateRole,
          skills: updateSkills.split(",").map(s => s.trim()).filter(Boolean)
        }));
        setTimeout(() => setSettingsSuccess(null), 3000);
      } else {
        setSettingsError(result.error || "Failed to update profile settings.");
      }
    } catch (err: any) {
      setSettingsError(err.message || "An unexpected error occurred.");
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const result = await deleteUserAccount();
      if (result.success) {
        setIsSettingsOpen(false);
        router.push("/login");
        router.refresh();
      } else {
        alert(result.error || "Failed to delete account. Please try again.");
      }
    } catch (err: any) {
      alert("Failed to delete account. " + (err.message || ""));
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/";
    }
  };

  const handleManualOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardRole.trim()) return;
    setOnboardingSubmit(true);
    setOnboardError(null);

    try {
      const formattedSkills = onboardSkills.split(",").map(s => s.trim()).filter(Boolean).join(",");
      const result = await updateUserInfo({
        name: user?.name || "",
        email: user?.email || "",
        targetJobRole: onboardRole,
        skills: formattedSkills
      });

      if (result.success) {
        // Update user state to trigger re-render of standard dashboard
        setUser((prev: any) => ({
          ...prev,
          targetRole: onboardRole,
          skills: onboardSkills.split(",").map(s => s.trim()).filter(Boolean)
        }));
        router.refresh();
      } else {
        setOnboardError(result.error || "Failed to save profile settings.");
      }
    } catch (err: any) {
      setOnboardError(err.message || "An unexpected error occurred.");
    } finally {
      setOnboardingSubmit(false);
    }
  };

  const handleOnboardFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setOnboardFile(e.target.files[0]);
      setOnboardError(null);
    }
  };

  const handleOnboardUpload = async () => {
    if (!onboardFile || !onboardRole.trim()) return;

    if (onboardFile.size > 5 * 1024 * 1024) {
      setOnboardError("File size exceeds the 5MB limit. Please upload a smaller PDF or Word document.");
      return;
    }

    setOnboardingSubmit(true);
    setOnboardError(null);

    try {
      // First update the user profile's target role and experience level
      const profileResult = await updateUserInfo({
        name: user?.name || "",
        email: user?.email || "",
        targetJobRole: onboardRole,
        skills: "" // Will be populated by the resume scan
      });

      if (!profileResult.success) {
        setOnboardError(profileResult.error || "Failed to update target role.");
        setOnboardingSubmit(false);
        return;
      }

      // Prepare form data
      const formData = new FormData();
      formData.append("file", onboardFile);

      // Trigger scan action
      const result = await uploadAndScanResume(formData);
      if (result.success) {
        router.refresh();
        window.location.reload(); // Hard reload to fully hydrate new stats and profile sync
      } else {
        setOnboardError(result.error || "Failed to scan resume. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setOnboardError(err.message || "An unexpected error occurred during scanning.");
    } finally {
      setOnboardingSubmit(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080914] flex flex-col items-center justify-center text-center px-4">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-xl animate-pulse-glow" />
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin relative z-10" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Hydrating Dashboard...</h2>
        <p className="text-slate-400 text-xs max-w-xs">
          Loading candidate profile and scanning histories.
        </p>
      </div>
    );
  }

  if (!user?.targetRole) {
    return (
      <div className="min-h-screen bg-[#080914] flex items-center justify-center p-4">
        {/* Onboarding Wizard Card */}
        <div className="glass-panel w-full max-w-2xl p-8 rounded-3xl border border-white/10 shadow-2xl relative animate-fade-in space-y-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-cyan/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* Header */}
          <div className="text-center space-y-2 relative z-10">
            <div className="inline-flex bg-brand-500/10 border border-brand-500/20 p-3 rounded-2xl text-brand-500 mb-2">
              <Cpu className="w-8 h-8" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Welcome to HireReady!</h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Your AI-powered virtual career co-pilot is ready. Let's personalize your dashboard and learning roadmap.
            </p>
          </div>

          {/* Setup Tabs */}
          <div className="flex border-b border-white/5 pb-2 justify-center gap-6 text-xs font-semibold text-slate-500 relative z-10">
            <button
              onClick={() => setOnboardTab("manual")}
              className={`pb-2 border-b-2 transition-all ${
                onboardTab === "manual" ? "border-brand-500 text-white font-bold" : "border-transparent hover:text-slate-300"
              }`}
            >
              Manual Quick Setup
            </button>
            <button
              onClick={() => setOnboardTab("upload")}
              className={`pb-2 border-b-2 transition-all ${
                onboardTab === "upload" ? "border-brand-500 text-white font-bold" : "border-transparent hover:text-slate-300"
              }`}
            >
              Auto Setup via Resume Scan
            </button>
          </div>

          {/* Onboarding Error */}
          {onboardError && (
            <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-xl text-red-200 text-xs font-semibold relative z-10">
              {onboardError}
            </div>
          )}

          {/* Tab 1: Manual Profiling */}
          {onboardTab === "manual" && (
            <form onSubmit={handleManualOnboard} className="space-y-6 relative z-10 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Job Role</label>
                  <input 
                    type="text" 
                    value={onboardRole}
                    onChange={(e) => setOnboardRole(e.target.value)}
                    required
                    placeholder="e.g. React Developer, Product Manager"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Experience Level</label>
                  <select 
                    value={onboardExperience}
                    onChange={(e) => setOnboardExperience(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
                  >
                    <option>Entry Level</option>
                    <option>Mid Level</option>
                    <option>Senior Level</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Current Skills (Optional)</label>
                <input 
                  type="text" 
                  value={onboardSkills}
                  onChange={(e) => setOnboardSkills(e.target.value)}
                  placeholder="e.g. JavaScript, React, Python, Product Strategy"
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
                />
                <p className="text-[10px] text-slate-500 mt-1">Comma-separated list of competencies you already possess</p>
              </div>

              <button
                type="submit"
                disabled={onboardingSubmit}
                className="glow-btn w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl border border-brand-500/20 shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {onboardingSubmit ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Initializing Co-Pilot...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-brand-300 animate-pulse" />
                    Initialize Career Co-Pilot
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tab 2: Resume Scan Setup */}
          {onboardTab === "upload" && (
            <div className="space-y-6 relative z-10 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Job Role</label>
                  <input 
                    type="text" 
                    value={onboardRole}
                    onChange={(e) => setOnboardRole(e.target.value)}
                    required
                    placeholder="e.g. Data Scientist"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500 text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Experience Level</label>
                  <select 
                    value={onboardExperience}
                    onChange={(e) => setOnboardExperience(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500 text-sm transition-all"
                  >
                    <option>Entry Level</option>
                    <option>Mid Level</option>
                    <option>Senior Level</option>
                  </select>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Upload Resume File</label>
                <div className="border-2 border-dashed border-white/10 hover:border-brand-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-950/20 hover:bg-slate-950/40 transition-all group relative">
                  <input 
                    type="file" 
                    accept=".pdf,.docx"
                    onChange={handleOnboardFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-slate-500 group-hover:text-brand-500 mb-3 transition-colors" />
                  {onboardFile ? (
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5 justify-center">
                        <FileText className="w-3.5 h-3.5 text-brand-500" />
                        {onboardFile.name}
                      </p>
                      <p className="text-[10px] text-slate-500">{(onboardFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-300">Drag & drop your resume, or <span className="text-brand-500 group-hover:underline">browse</span></p>
                      <p className="text-[10px] text-slate-500">Supports PDF or DOCX files (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleOnboardUpload}
                disabled={!onboardFile || onboardingSubmit}
                className={`glow-btn w-full font-bold py-3.5 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  onboardFile && !onboardingSubmit
                    ? "bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white border-brand-500/20 shadow-lg cursor-pointer"
                    : "bg-white/5 text-slate-500 border-white/5 cursor-not-allowed"
                }`}
              >
                {onboardingSubmit ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scanning Resume & Profiling...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Scan & Initialize
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080914] md:max-h-screen md:overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 md:h-screen md:sticky md:top-0 border-b md:border-b-0 md:border-r border-white/5 glass-panel flex flex-col p-6 shrink-0 z-20 md:overflow-y-auto">
        <Link href="/dashboard" className="flex items-center gap-2 mb-8 justify-center md:justify-start">
          <div className="bg-brand-500/20 border border-brand-500/30 p-2 rounded-lg text-brand-500">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-wider text-white">HireReady</span>
        </Link>

        {/* User Card */}
        <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-8 text-center md:text-left relative group">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Profile</p>
              <h4 className="text-sm font-bold text-white mt-1 truncate" title={user?.name}>{user?.name}</h4>
              <p className="text-xs text-brand-200 mt-0.5 truncate">{user?.targetRole}</p>
            </div>
            <button 
              onClick={() => {
                setUpdateName(user?.name || "");
                setUpdateEmail(user?.email || "");
                setUpdateRole(user?.targetRole || "");
                setUpdateSkills(user?.skills ? user.skills.join(", ") : "");
                setSettingsError(null);
                setSettingsSuccess(null);
                setShowDeleteConfirm(false);
                setIsSettingsOpen(true);
              }}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-white/5 shrink-0 ml-1 cursor-pointer"
              title="Manage Account Settings"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-2 md:gap-1.5 flex-1 text-sm font-medium text-slate-400 custom-scrollbar pb-4 md:pb-0">
          <Link href="/dashboard" className="flex items-center gap-3 bg-brand-500/10 border border-brand-500/20 text-white px-4 py-3 rounded-xl whitespace-nowrap md:whitespace-normal">
            <TrendingUp className="w-4 h-4 text-brand-500" />
            Dashboard
          </Link>
          <Link href="/resume" className="flex items-center gap-3 hover:bg-white/5 hover:text-white px-4 py-3 rounded-xl transition-all whitespace-nowrap md:whitespace-normal">
            <FileText className="w-4 h-4" />
            Resume Scan (ATS)
          </Link>
          <Link href="/interview" className="flex items-center gap-3 hover:bg-white/5 hover:text-white px-4 py-3 rounded-xl transition-all whitespace-nowrap md:whitespace-normal">
            <MessageSquare className="w-4 h-4" />
            Mock Interviews
          </Link>
          <Link href="/roadmap" className="flex items-center gap-3 hover:bg-white/5 hover:text-white px-4 py-3 rounded-xl transition-all whitespace-nowrap md:whitespace-normal">
            <Compass className="w-4 h-4" />
            Career Roadmap
          </Link>
          <Link href="/resume-builder" className="flex items-center gap-3 hover:bg-white/5 hover:text-white px-4 py-3 rounded-xl transition-all whitespace-nowrap md:whitespace-normal">
            <ClipboardList className="w-4 h-4" />
            Resume Builder
          </Link>
        </nav>

        {/* Logout */}
        <button onClick={handleLogout} className="w-full flex items-center gap-3 text-slate-500 hover:text-white text-sm font-semibold px-4 py-3 rounded-xl border border-transparent hover:border-white/5 mt-auto hover:bg-red-950/10 hover:text-red-400 transition-all justify-center md:justify-start cursor-pointer text-left">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto md:h-screen max-w-7xl custom-scrollbar">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Welcome back, {user?.name.split(" ")[0]}!</h1>
            <p className="text-slate-400 text-sm mt-1">Here is an overview of your job readiness progress.</p>
          </div>
          <Link href="/interview" className="glow-btn bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold py-3 px-5 rounded-xl text-sm border border-brand-500/20 shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2 transition-all">
            <Plus className="w-4 h-4" />
            Start Mock Interview
          </Link>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stat 1 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-brand-500/5 rounded-full blur-xl pointer-events-none" />
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Latest ATS Score</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stats.resumeScore}%</h3>
              <p className="text-xs text-brand-200 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> scan match rate
              </p>
            </div>
            <div className="bg-brand-500/15 border border-brand-500/30 p-3 rounded-xl text-brand-500">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          {/* Stat 2 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-accent-cyan/5 rounded-full blur-xl pointer-events-none" />
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Interview Score</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stats.interviewScore}%</h3>
              <p className="text-xs text-accent-cyan mt-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> graded performance
              </p>
            </div>
            <div className="bg-accent-cyan/15 border border-accent-cyan/30 p-3 rounded-xl text-accent-cyan">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>

          {/* Stat 3 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-accent-emerald/5 rounded-full blur-xl pointer-events-none" />
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mock Interviews</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stats.completedInterviews}</h3>
              <p className="text-xs text-accent-emerald mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> completed sessions
              </p>
            </div>
            <div className="bg-accent-emerald/15 border border-accent-emerald/30 p-3 rounded-xl text-accent-emerald">
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* Stat 4 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-accent-rose/5 rounded-full blur-xl pointer-events-none" />
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Skill Gaps</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stats.missingSkillsCount}</h3>
              <p className="text-xs text-accent-rose mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> topics to master
              </p>
            </div>
            <div className="bg-accent-rose/15 border border-accent-rose/30 p-3 rounded-xl text-accent-rose">
              <Compass className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Dashboard Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Actions and History (Left Column, spans 2) */}
          <div className="lg:col-span-2 space-y-8">
            {/* ATS Resume Scanner Card */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-500" />
                    ATS Resume Scanner
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                    Check if your resume matches corporate ATS parameters. Identify missing keywords, formatting errors, and get instant recommendations to beat the screeners.
                  </p>
                </div>
                <Link href="/resume" className="glow-btn bg-slate-900 border border-brand-500/20 hover:border-brand-500/40 text-brand-200 font-semibold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all">
                  Scan Resume
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Recent Resumes & ATS History */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Recent Resume Analysis</h3>
                <Link href="/resume" className="text-xs text-slate-500 hover:text-white flex items-center gap-0.5">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {resumes.length > 0 ? (
                  resumes.map((resume) => (
                    <Link 
                      href={`/resume?reportId=${resume.reportId}`}
                      key={resume.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer block"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className="bg-brand-500/10 p-2.5 rounded-lg text-brand-500">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-white truncate max-w-[180px] sm:max-w-xs">{resume.filename}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">Uploaded on {resume.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          resume.score >= 75 ? "bg-accent-emerald/10 text-accent-emerald" : "bg-accent-amber/10 text-accent-amber"
                        }`}>
                          {resume.score}% Match
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic p-2">No resumes scanned yet.</p>
                )}
              </div>
            </div>

            {/* Past Interviews History */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Mock Interview Sessions</h3>
                <Link href="/interview" className="text-xs text-slate-500 hover:text-white flex items-center gap-0.5">
                  Practice more <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {interviews.length > 0 ? (
                  interviews.map((interview) => (
                    <Link href={interview.status === "COMPLETED" ? `/interview/feedback/${interview.id}` : `/interview/${interview.id}`} key={interview.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="bg-accent-cyan/10 p-2.5 rounded-lg text-accent-cyan">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-white">{interview.role} Session</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">Taken on {interview.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-xs font-bold text-white">
                            {interview.status === "COMPLETED" ? `${interview.overallScore}%` : "In Progress"}
                          </span>
                          <p className="text-[9px] text-slate-500">{interview.status === "COMPLETED" ? "Overall Grade" : "Status"}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic p-2">No interviews attempted yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Skill Gaps & Roadmap Summary (Right Column) */}
          <div className="space-y-8">
            {/* Skill Gaps Breakdown */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Compass className="w-4 h-4 text-accent-cyan" />
                Target Skill Gaps
              </h3>
              <p className="text-xs text-slate-400 mb-4">Identified gaps compared to standard job roles.</p>
              
              <div className="space-y-3">
                {skillGaps.length > 0 ? (
                  skillGaps.map((gap, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white">{gap.skill}</span>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                          gap.level === "Missing" ? "bg-accent-rose/10 text-accent-rose" : "bg-accent-amber/10 text-accent-amber"
                        }`}>
                          {gap.level}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span>Category: {gap.category}</span>
                        <Link href="/roadmap" className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-0.5">
                          Learn <ChevronRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic p-2">No skill gaps identified. Well matching profile!</p>
                )}
              </div>

              <Link href="/roadmap" className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 mt-4 transition-all">
                View Career Roadmap
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Compliance Note */}
            <div className="p-5 rounded-2xl bg-brand-500/5 border border-brand-500/10 text-xs text-slate-400 leading-relaxed space-y-2">
              <div className="flex items-center gap-1 text-slate-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-brand-500" />
                <span>GDPR & UK Data Protection Compliance</span>
              </div>
              <p>
                HireReady anonymizes uploaded PDF/Word data when sending requests to external AI streams and supports strict cascade account-deletion to permanently wipe data.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Account Settings / Edit Profile Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl relative animate-fade-in space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-brand-500" />
                Account Settings
              </h3>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {settingsError && (
              <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-red-200 text-xs font-semibold">
                {settingsError}
              </div>
            )}

            {settingsSuccess && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-emerald-200 text-xs font-semibold">
                {settingsSuccess}
              </div>
            )}

            {!showDeleteConfirm ? (
              <form onSubmit={handleSaveSettings} className="space-y-4">
                {/* Username / Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Username / Name</label>
                  <input 
                    type="text" 
                    value={updateName}
                    onChange={(e) => setUpdateName(e.target.value)}
                    required
                    placeholder="Enter new username/name"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>

                {/* Email / Identifier */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email or Username</label>
                  <input 
                    type="text" 
                    value={updateEmail}
                    onChange={(e) => setUpdateEmail(e.target.value)}
                    required
                    placeholder="Enter email or username identifier"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>

                {/* Target Job Role */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Job Role</label>
                  <input 
                    type="text" 
                    value={updateRole}
                    onChange={(e) => setUpdateRole(e.target.value)}
                    placeholder="e.g. Full Stack Developer"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>

                {/* Candidate Skills */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Skills (Comma-separated)</label>
                  <input 
                    type="text" 
                    value={updateSkills}
                    onChange={(e) => setUpdateSkills(e.target.value)}
                    placeholder="e.g. React, Next.js, TypeScript, PostgreSQL"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button 
                    type="submit"
                    disabled={updatingSettings}
                    className="glow-btn flex-1 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl border border-brand-500/20 text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {updatingSettings && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Changes
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex-1 bg-red-950/20 hover:bg-red-950/40 text-red-400 font-bold py-2.5 px-4 rounded-xl border border-red-500/20 text-xs transition-all cursor-pointer"
                  >
                    Delete Account
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-red-950/10 border border-red-500/20 rounded-xl text-xs text-red-200 leading-relaxed">
                  <p className="font-bold mb-1">⚠️ Warning: Account Deletion is Permanent!</p>
                  Deleting your account will instantly remove all user credentials, candidate profiles, uploaded resumes, ATS scanner analysis reports, mock interview sessions, and feedback records from the database in compliance with GDPR.
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {deletingAccount && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Yes, Delete Permanent
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { 
//   FileText, MessageSquare, Compass, ClipboardList, 
//   TrendingUp, Award, Clock, ArrowUpRight, 
//   Plus, AlertCircle, CheckCircle2, ChevronRight, LogOut, Cpu
// } from "lucide-react";


// const STATIC_USER = {
//   name: "Thazin Phyoe Kyaw",
//   targetRole: "Full Stack Developer",
// };

// const STATIC_STATS = {
//   resumeScore: 82,
//   interviewScore: 75,
//   completedInterviews: 3,
//   missingSkillsCount: 2,
// };

// const STATIC_RESUMES = [
//   {
//     id: "res-001",
//     filename: "TZPK_Resume_2026.pdf",
//     date: "2026-07-10",
//     score: 82,
//   },
//   {
//     id: "res-002",
//     filename: "TZPK_CV_V1.pdf",
//     date: "2026-06-15",
//     score: 68,
//   },
// ];

// const STATIC_INTERVIEWS = [
//   {
//     id: "int-101",
//     role: "Frontend Developer Mock Interview",
//     date: "2026-07-16",
//     overallScore: 80,
//     status: "COMPLETED",
//   },
//   {
//     id: "int-102",
//     role: "Full Stack Technical Round",
//     date: "2026-07-12",
//     overallScore: 70,
//     status: "COMPLETED",
//   },
//   {
//     id: "int-103",
//     role: "System Design Practice",
//     date: "2026-07-18",
//     overallScore: 0,
//     status: "IN_PROGRESS",
//   },
// ];

// const STATIC_SKILL_GAPS = [
//   {
//     skill: "Docker",
//     category: "DevOps",
//     level: "Missing",
//   },
//   {
//     skill: "GraphQL",
//     category: "API Design",
//     level: "Intermediate",
//   },
// ];

// export default function Dashboard() {

//   const [user] = useState(STATIC_USER);
//   const [stats] = useState(STATIC_STATS);
//   const [resumes] = useState(STATIC_RESUMES);
//   const [interviews] = useState(STATIC_INTERVIEWS);
//   const [skillGaps] = useState(STATIC_SKILL_GAPS);

//   return (
//     <div className="min-h-screen flex flex-col md:flex-row bg-[#080914]">
//       {/* Sidebar Navigation */}
//       <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 glass-panel flex flex-col p-6 shrink-0 z-20">
//         <Link href="/dashboard" className="flex items-center gap-2 mb-8 justify-center md:justify-start">
//           <div className="bg-brand-500/20 border border-brand-500/30 p-2 rounded-lg text-brand-500">
//             <Cpu className="w-5 h-5" />
//           </div>
//           <span className="text-lg font-bold tracking-wider text-white">HireReady</span>
//         </Link>

//         {/* User Card */}
//         <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-8 text-center md:text-left">
//           <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Profile</p>
//           <h4 className="text-sm font-bold text-white mt-1">{user.name}</h4>
//           <p className="text-xs text-brand-200 mt-0.5">{user.targetRole}</p>
//         </div>

//         {/* Navigation Menu */}
//         <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-2 md:gap-1.5 flex-1 text-sm font-medium text-slate-400 custom-scrollbar pb-4 md:pb-0">
//           <Link href="/dashboard" className="flex items-center gap-3 bg-brand-500/10 border border-brand-500/20 text-white px-4 py-3 rounded-xl whitespace-nowrap md:whitespace-normal">
//             <TrendingUp className="w-4 h-4 text-brand-500" />
//             Dashboard
//           </Link>
//           <Link href="/resume" className="flex items-center gap-3 hover:bg-white/5 hover:text-white px-4 py-3 rounded-xl transition-all whitespace-nowrap md:whitespace-normal">
//             <FileText className="w-4 h-4" />
//             Resume Scan (ATS)
//           </Link>
//           <Link href="/interview" className="flex items-center gap-3 hover:bg-white/5 hover:text-white px-4 py-3 rounded-xl transition-all whitespace-nowrap md:whitespace-normal">
//             <MessageSquare className="w-4 h-4" />
//             Mock Interviews
//           </Link>
//           <Link href="/roadmap" className="flex items-center gap-3 hover:bg-white/5 hover:text-white px-4 py-3 rounded-xl transition-all whitespace-nowrap md:whitespace-normal">
//             <Compass className="w-4 h-4" />
//             Career Roadmap
//           </Link>
//           <Link href="/resume-builder" className="flex items-center gap-3 hover:bg-white/5 hover:text-white px-4 py-3 rounded-xl transition-all whitespace-nowrap md:whitespace-normal">
//             <ClipboardList className="w-4 h-4" />
//             Resume Builder
//           </Link>
//         </nav>

//         {/* Logout */}
//         <Link href="/" className="flex items-center gap-3 text-slate-500 hover:text-white text-sm font-semibold px-4 py-3 rounded-xl border border-transparent hover:border-white/5 mt-auto hover:bg-red-950/10 hover:text-red-400 transition-all justify-center md:justify-start">
//           <LogOut className="w-4 h-4" />
//           Sign Out
//         </Link>
//       </aside>

//       {/* Main Content Area */}
//       <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl">
//         {/* Welcome Header */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-extrabold text-white">Welcome back, {user.name.split(" ")[0]}!</h1>
//             <p className="text-slate-400 text-sm mt-1">Here is an overview of your job readiness progress.</p>
//           </div>
//           <Link href="/interview" className="glow-btn bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold py-3 px-5 rounded-xl text-sm border border-brand-500/20 shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2 transition-all">
//             <Plus className="w-4 h-4" />
//             Start Mock Interview
//           </Link>
//         </div>

//         {/* Statistics Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           {/* Stat 1 */}
//           <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between relative overflow-hidden">
//             <div className="absolute top-0 right-0 w-16 h-16 bg-brand-500/5 rounded-full blur-xl pointer-events-none" />
//             <div>
//               <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Latest ATS Score</p>
//               <h3 className="text-3xl font-bold text-white mt-2">{stats.resumeScore}%</h3>
//               <p className="text-xs text-brand-200 mt-1 flex items-center gap-1">
//                 <TrendingUp className="w-3.5 h-3.5" /> scan match rate
//               </p>
//             </div>
//             <div className="bg-brand-500/15 border border-brand-500/30 p-3 rounded-xl text-brand-500">
//               <FileText className="w-6 h-6" />
//             </div>
//           </div>

//           {/* Stat 2 */}
//           <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between relative overflow-hidden">
//             <div className="absolute top-0 right-0 w-16 h-16 bg-accent-cyan/5 rounded-full blur-xl pointer-events-none" />
//             <div>
//               <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Interview Score</p>
//               <h3 className="text-3xl font-bold text-white mt-2">{stats.interviewScore}%</h3>
//               <p className="text-xs text-accent-cyan mt-1 flex items-center gap-1">
//                 <Award className="w-3.5 h-3.5" /> graded performance
//               </p>
//             </div>
//             <div className="bg-accent-cyan/15 border border-accent-cyan/30 p-3 rounded-xl text-accent-cyan">
//               <MessageSquare className="w-6 h-6" />
//             </div>
//           </div>

//           {/* Stat 3 */}
//           <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between relative overflow-hidden">
//             <div className="absolute top-0 right-0 w-16 h-16 bg-accent-emerald/5 rounded-full blur-xl pointer-events-none" />
//             <div>
//               <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mock Interviews</p>
//               <h3 className="text-3xl font-bold text-white mt-2">{stats.completedInterviews}</h3>
//               <p className="text-xs text-accent-emerald mt-1 flex items-center gap-1">
//                 <Clock className="w-3.5 h-3.5" /> completed sessions
//               </p>
//             </div>
//             <div className="bg-accent-emerald/15 border border-accent-emerald/30 p-3 rounded-xl text-accent-emerald">
//               <Award className="w-6 h-6" />
//             </div>
//           </div>

//           {/* Stat 4 */}
//           <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between relative overflow-hidden">
//             <div className="absolute top-0 right-0 w-16 h-16 bg-accent-rose/5 rounded-full blur-xl pointer-events-none" />
//             <div>
//               <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Skill Gaps</p>
//               <h3 className="text-3xl font-bold text-white mt-2">{stats.missingSkillsCount}</h3>
//               <p className="text-xs text-accent-rose mt-1 flex items-center gap-1">
//                 <AlertCircle className="w-3.5 h-3.5" /> topics to master
//               </p>
//             </div>
//             <div className="bg-accent-rose/15 border border-accent-rose/30 p-3 rounded-xl text-accent-rose">
//               <Compass className="w-6 h-6" />
//             </div>
//           </div>
//         </div>

//         {/* Dashboard Layout Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Main Actions and History */}
//           <div className="lg:col-span-2 space-y-8">
//             {/* ATS Resume Scanner Card */}
//             <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
//               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
//                 <div className="space-y-2">
//                   <h3 className="text-lg font-bold text-white flex items-center gap-2">
//                     <FileText className="w-5 h-5 text-brand-500" />
//                     ATS Resume Scanner
//                   </h3>
//                   <p className="text-slate-400 text-xs leading-relaxed max-w-md">
//                     Check if your resume matches corporate ATS parameters. Identify missing keywords, formatting errors, and get instant recommendations to beat the screeners.
//                   </p>
//                 </div>
//                 <Link href="/resume" className="glow-btn bg-slate-900 border border-brand-500/20 hover:border-brand-500/40 text-brand-200 font-semibold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all">
//                   Scan Resume
//                   <ArrowUpRight className="w-4 h-4" />
//                 </Link>
//               </div>
//             </div>

//             {/* Recent Resumes & ATS History */}
//             <div className="glass-panel p-6 rounded-2xl border border-white/5">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-base font-bold text-white">Recent Resume Analysis</h3>
//                 <Link href="/resume" className="text-xs text-slate-500 hover:text-white flex items-center gap-0.5">
//                   View all <ChevronRight className="w-3 h-3" />
//                 </Link>
//               </div>
//               <div className="space-y-3">
//                 {resumes.length > 0 ? (
//                   resumes.map((resume) => (
//                     <div key={resume.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
//                       <div className="flex items-center gap-3">
//                         <div className="bg-brand-500/10 p-2.5 rounded-lg text-brand-500">
//                           <FileText className="w-4 h-4" />
//                         </div>
//                         <div>
//                           <h4 className="text-xs font-semibold text-white truncate max-w-[180px] sm:max-w-xs">{resume.filename}</h4>
//                           <p className="text-[10px] text-slate-500 mt-0.5">Uploaded on {resume.date}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-3">
//                         <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
//                           resume.score >= 75 ? "bg-accent-emerald/10 text-accent-emerald" : "bg-accent-amber/10 text-accent-amber"
//                         }`}>
//                           {resume.score}% Match
//                         </span>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-xs text-slate-500 italic p-2">No resumes scanned yet.</p>
//                 )}
//               </div>
//             </div>

//             {/* Past Interviews History */}
//             <div className="glass-panel p-6 rounded-2xl border border-white/5">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-base font-bold text-white">Mock Interview Sessions</h3>
//                 <Link href="/interview" className="text-xs text-slate-500 hover:text-white flex items-center gap-0.5">
//                   Practice more <ChevronRight className="w-3 h-3" />
//                 </Link>
//               </div>
//               <div className="space-y-3">
//                 {interviews.length > 0 ? (
//                   interviews.map((interview) => (
//                     <Link href={interview.status === "COMPLETED" ? `/interview/feedback/${interview.id}` : `/interview/${interview.id}`} key={interview.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer">
//                       <div className="flex items-center gap-3">
//                         <div className="bg-accent-cyan/10 p-2.5 rounded-lg text-accent-cyan">
//                           <MessageSquare className="w-4 h-4" />
//                         </div>
//                         <div>
//                           <h4 className="text-xs font-semibold text-white">{interview.role} Session</h4>
//                           <p className="text-[10px] text-slate-500 mt-0.5">Taken on {interview.date}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-4">
//                         <div className="text-right">
//                           <span className="text-xs font-bold text-white">
//                             {interview.status === "COMPLETED" ? `${interview.overallScore}%` : "In Progress"}
//                           </span>
//                           <p className="text-[9px] text-slate-500">{interview.status === "COMPLETED" ? "Overall Grade" : "Status"}</p>
//                         </div>
//                         <ChevronRight className="w-4 h-4 text-slate-600" />
//                       </div>
//                     </Link>
//                   ))
//                 ) : (
//                   <p className="text-xs text-slate-500 italic p-2">No interviews attempted yet.</p>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Skill Gaps & Roadmap Summary */}
//           <div className="space-y-8">
//             <div className="glass-panel p-6 rounded-2xl border border-white/5">
//               <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
//                 <Compass className="w-4 h-4 text-accent-cyan" />
//                 Target Skill Gaps
//               </h3>
//               <p className="text-xs text-slate-400 mb-4">Identified gaps compared to standard job roles.</p>
              
//               <div className="space-y-3">
//                 {skillGaps.length > 0 ? (
//                   skillGaps.map((gap, i) => (
//                     <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
//                       <div className="flex items-center justify-between mb-1.5">
//                         <span className="text-xs font-bold text-white">{gap.skill}</span>
//                         <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
//                           gap.level === "Missing" ? "bg-accent-rose/10 text-accent-rose" : "bg-accent-amber/10 text-accent-amber"
//                         }`}>
//                           {gap.level}
//                         </span>
//                       </div>
//                       <div className="flex justify-between items-center text-[10px] text-slate-500">
//                         <span>Category: {gap.category}</span>
//                         <Link href="/roadmap" className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-0.5">
//                           Learn <ChevronRight className="w-2.5 h-2.5" />
//                         </Link>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-xs text-slate-500 italic p-2">No skill gaps identified. Well matching profile!</p>
//                 )}
//               </div>

//               <Link href="/roadmap" className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 mt-4 transition-all">
//                 View Career Roadmap
//                 <ArrowUpRight className="w-4 h-4" />
//               </Link>
//             </div>

//             {/* Compliance Note */}
//             <div className="p-5 rounded-2xl bg-brand-500/5 border border-brand-500/10 text-xs text-slate-400 leading-relaxed space-y-2">
//               <div className="flex items-center gap-1 text-slate-300 font-semibold">
//                 <CheckCircle2 className="w-4 h-4 text-brand-500" />
//                 <span>GDPR & UK Data Protection Compliance</span>
//               </div>
//               <p>
//                 HireReady anonymizes uploaded PDF/Word data when sending requests to external AI streams and supports strict cascade account-deletion to permanently wipe data.
//               </p>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }