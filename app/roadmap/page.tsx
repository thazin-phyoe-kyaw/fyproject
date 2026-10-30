"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Cpu, FileText, MessageSquare, Compass, ClipboardList, LogOut,
  ArrowLeft, BookOpen, CheckCircle2, Circle, 
  Clock, Zap, Target, PlayCircle, Loader2, AlertCircle, Sparkles
} from "lucide-react";
import { getPersonalizedRoadmap, updateRoadmapModuleStatus, regenerateRoadmap } from "@/app/actions/roadmap";
import { logoutUser } from "@/app/actions/auth";

export default function CareerRoadmap() {
  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/";
    }
  };
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [localTargetRole, setLocalTargetRole] = useState("Full Stack Developer");
  const [roadmapSteps, setRoadmapSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Customization preferences
  const [pace, setPace] = useState("Standard");
  const [focus, setFocus] = useState("Practical Projects");
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Load roadmap on mount
  useEffect(() => {
    const generateRoadmap = async () => {
      try {
        const result = await getPersonalizedRoadmap();
        if (result.success && result.steps) {
          setRoadmapSteps(result.steps);
          if (result.targetRole) {
            setTargetRole(result.targetRole);
            setLocalTargetRole(result.targetRole);
          }
          if (result.pace) {
            setPace(result.pace);
          }
          if (result.focus) {
            setFocus(result.focus);
          }
        } else {
          setError(result.error || "Failed to generate learning roadmap.");
        }
      } catch (err: any) {
        console.error(err);
        setError("An unexpected error occurred while compiling your career roadmap.");
      } finally {
        setLoading(false);
      }
    };

    generateRoadmap();
  }, []);

  // Update status in DB and refresh roadmap
  const toggleSkillCompleted = async (stepId: string) => {
    const currentStep = roadmapSteps.find(s => s.id === stepId);
    if (!currentStep) return;

    const newStatus = currentStep.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";

    // Optimistically update UI
    setRoadmapSteps((prev) => 
      prev.map((step) => {
        if (step.id === stepId) {
          return { ...step, status: newStatus };
        }
        return step;
      })
    );

    try {
      const result = await updateRoadmapModuleStatus(stepId, newStatus);
      if (result.success) {
        // Re-fetch roadmap to pull updated status values (like unlocked next module)
        const reloadRes = await getPersonalizedRoadmap({ pace, focus });
        if (reloadRes.success && reloadRes.steps) {
          setRoadmapSteps(reloadRes.steps);
        }
      } else {
        alert(result.error || "Failed to save progress.");
        // Rollback
        const reloadRes = await getPersonalizedRoadmap({ pace, focus });
        if (reloadRes.success && reloadRes.steps) {
          setRoadmapSteps(reloadRes.steps);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to sync roadmap status with server.");
    }
  };

  // Regenerate roadmap handler
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setError(null);
    try {
      const result = await regenerateRoadmap({ pace, focus, targetRole: localTargetRole });
      if (result.success && result.steps) {
        setRoadmapSteps(result.steps);
        if (result.targetRole) {
          setTargetRole(result.targetRole);
          setLocalTargetRole(result.targetRole);
        }
      } else {
        setError(result.error || "Failed to regenerate roadmap.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const getCompletedCount = () => {
    return roadmapSteps.filter(s => s.status === "COMPLETED").length;
  };

  const getReadinessPercentage = () => {
    const completed = getCompletedCount();
    // Default base readiness of 45%, add 13% for each module completed (approx)
    return Math.min(100, 45 + completed * 13);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080914] flex flex-col items-center justify-center text-center px-4">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-xl animate-pulse-glow" />
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin relative z-10" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Analyzing Skill Gaps...</h2>
        <p className="text-slate-400 text-xs max-w-xs">
          Please wait while Gemini compares your profile and resume against typical corporate requirements to compile your learning modules.
        </p>
      </div>
    );
  }

  if (error || roadmapSteps.length === 0) {
    return (
      <div className="min-h-screen bg-[#080914] flex flex-col items-center justify-center text-center px-4">
        <div className="p-4 rounded-full bg-red-950/20 border border-red-500/20 text-red-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Failed to Generate Roadmap</h2>
        <p className="text-slate-400 text-xs max-w-xs mb-6">
          {error || "Make sure you configure a valid Google Gemini API Key and upload a resume first."}
        </p>
        <Link href="/dashboard" className="glow-btn bg-slate-900 border border-white/10 text-white px-5 py-2.5 rounded-xl text-xs font-semibold">
          Return to Dashboard
        </Link>
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

        {/* Navigation Menu */}
        <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-2 md:gap-1.5 flex-1 text-sm font-medium text-slate-400 custom-scrollbar pb-4 md:pb-0">
          <Link href="/dashboard" className="flex items-center gap-3 hover:bg-white/5 hover:text-white px-4 py-3 rounded-xl transition-all whitespace-nowrap md:whitespace-normal">
            <Compass className="w-4 h-4" />
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
          <Link href="/roadmap" className="flex items-center gap-3 bg-brand-500/10 border border-brand-500/20 text-white px-4 py-3 rounded-xl whitespace-nowrap md:whitespace-normal">
            <Compass className="w-4 h-4 text-brand-500" />
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
      <main className="flex-1 p-6 md:p-10 overflow-y-auto md:h-screen max-w-5xl custom-scrollbar">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            <Compass className="w-8 h-8 text-brand-500" />
            AI Career Roadmap
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Follow your personalized learning roadmap designed by AI to bridge the gaps between your current resume and the target role.
          </p>
        </div>

        {/* Customization Settings Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 mb-8 space-y-4 relative overflow-hidden">
          <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-brand-500" />
            Roadmap Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Job Role</label>
              <input 
                type="text"
                value={localTargetRole}
                onChange={(e) => setLocalTargetRole(e.target.value)}
                placeholder="e.g. React Developer"
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-brand-500 text-sm transition-all"
              />
              <p className="text-[9px] text-slate-500 mt-1.5">
                Modify your target job title to customize your roadmap dynamically.
              </p>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Study Pacing</label>
              <select 
                value={pace} 
                onChange={(e) => setPace(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-brand-500 text-sm transition-all"
              >
                <option>Standard</option>
                <option>Accelerated</option>
                <option>Deep Dive</option>
              </select>
              <p className="text-[9px] text-slate-500 mt-1.5">
                Standard (~15h/module), Accelerated (~8h/module), Deep Dive (~30h/module)
              </p>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Learning Focus</label>
              <select 
                value={focus} 
                onChange={(e) => setFocus(e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-brand-500 text-sm transition-all"
              >
                <option>Practical Projects</option>
                <option>Conceptual Theory</option>
                <option>Interview Prep</option>
              </select>
              <p className="text-[9px] text-slate-500 mt-1.5">
                Structure steps for hands-on projects, deep concepts, or interview queries.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-white/5">
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="glow-btn bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Regenerating Roadmap...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-brand-300 animate-pulse" />
                  Regenerate learning path
                </>
              )}
            </button>
          </div>
        </div>

        {/* Goal Indicator Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 mb-8 flex flex-col sm:flex-row items-center gap-6 justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/10 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Target Objective</span>
            <h2 className="text-lg font-bold text-white mt-1">Acquire skills for {targetRole} position</h2>
            <p className="text-xs text-slate-400">Pace: {pace} • Focus: {focus} • {getCompletedCount()} of 4 modules completed</p>
          </div>
          <div className="flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 px-4 py-2 rounded-xl">
            <Target className="w-5 h-5 text-brand-500" />
            <span className="text-xs font-bold text-brand-200">Readiness: {getReadinessPercentage()}%</span>
          </div>
        </div>

        {/* Timeline Path */}
        <div className="space-y-8 relative before:absolute before:top-4 before:bottom-4 before:left-[17px] before:w-[2px] before:bg-white/5">
          {roadmapSteps.map((step, idx) => (
            <div key={step.id} className="relative pl-12 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
              {/* Timeline Marker Circle */}
              <button 
                onClick={() => toggleSkillCompleted(step.id)}
                className={`absolute left-0 top-1 w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                  step.status === "COMPLETED"
                    ? "bg-accent-emerald/10 border-accent-emerald text-accent-emerald hover:bg-accent-emerald/20"
                    : step.status === "IN_PROGRESS"
                      ? "bg-brand-500/10 border-brand-500 text-brand-300 animate-pulse"
                      : "bg-slate-950 border-white/10 text-slate-600 cursor-not-allowed"
                }`}
                disabled={step.status === "LOCKED"}
              >
                {step.status === "COMPLETED" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : step.status === "IN_PROGRESS" ? (
                  <PlayCircle className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>

              {/* Module Details Card */}
              <div className={`glass-panel p-6 rounded-2xl border transition-all ${
                step.status === "COMPLETED"
                  ? "border-accent-emerald/20 bg-[#0c191a]/30"
                  : step.status === "IN_PROGRESS"
                    ? "border-brand-500/30 bg-[#0f1124]/30"
                    : "border-white/5 bg-slate-950/20 opacity-60"
              }`}>
                {/* Card Title & Info Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <h3 className={`text-base font-bold ${
                    step.status === "COMPLETED" ? "text-accent-emerald" : "text-white"
                  }`}>{step.title}</h3>
                  
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold uppercase">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {step.time}</span>
                    <span>•</span>
                    <span className={
                      step.status === "COMPLETED" ? "text-accent-emerald" : step.status === "IN_PROGRESS" ? "text-brand-400" : "text-slate-500"
                    }>{step.status.replace("_", " ")}</span>
                  </div>
                </div>

                {/* Concepts list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider block uppercase">Core Competencies</span>
                    <ul className="space-y-1.5 text-slate-300 text-xs">
                      {step.concepts.map((concept: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <Zap className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
                          <span>{concept}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Resource suggestions */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider block uppercase">Suggested Resources</span>
                    <ul className="space-y-1.5 text-slate-400 text-xs">
                      {step.resources.map((resource: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
                          <span className="hover:text-white transition-colors cursor-pointer underline">{resource}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Mark complete trigger button */}
                {step.status !== "LOCKED" && (
                  <div className="border-t border-white/5 pt-4 mt-4 flex justify-end">
                    <button 
                      onClick={() => toggleSkillCompleted(step.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                        step.status === "COMPLETED"
                          ? "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                          : "bg-brand-600 hover:bg-brand-500 text-white border-brand-500/20 shadow-md"
                      }`}
                    >
                      {step.status === "COMPLETED" ? "Mark as In Progress" : "Mark as Completed"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
