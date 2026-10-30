"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Cpu, FileText, MessageSquare, Compass, ClipboardList, LogOut,
  ArrowLeft, ArrowRight, Sparkles, Download, Plus, Trash2, 
  Mail, Phone, MapPin, Link2, Briefcase, GraduationCap,
  Loader2, CheckCircle2, AlertCircle, Save
} from "lucide-react";
import { enhanceResumeSummary, getBuiltResume, saveBuiltResume } from "@/app/actions/builder";
import { logoutUser } from "@/app/actions/auth";

export default function ResumeBuilder() {
  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/";
    }
  };
  const [step, setStep] = useState(1);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error" | "unsaved">("saved");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Form Fields State
  const [personal, setPersonal] = useState({
    name: "Thazin Phyoe",
    email: "thazin.phyoe@example.com",
    phone: "+95 9 123456789",
    location: "Yangon, Myanmar",
    website: "github.com/thazinphyoe"
  });

  const [summary, setSummary] = useState(
    "I am a computing student looking for a developer job. I have experience with React and Node.js and want to learn more."
  );

  const [experience, setExperience] = useState<any[]>([
    {
      id: "exp_1",
      role: "Web Developer Intern",
      company: "KMD Software Solutions",
      duration: "Jan 2026 - Present",
      bullets: "Worked on client frontend using React. Fixed layout bugs and integrated API requests. Managed code with Git."
    }
  ]);

  const [education, setEducation] = useState<any[]>([
    {
      id: "edu_1",
      degree: "B.Sc (Hons) Computing",
      school: "KMD / University of Greenwich",
      duration: "2023 - 2026"
    }
  ]);

  const [skills, setSkills] = useState("JavaScript, TypeScript, React, Next.js, Node.js, Express, PostgreSQL, Tailwind CSS");
  const [template, setTemplate] = useState("classic");
  const [themeColor, setThemeColor] = useState("slate");

  // Fetch saved resume on mount
  useEffect(() => {
    const loadResume = async () => {
      try {
        const result = await getBuiltResume();
        if (result.success && result.resume) {
          const res = result.resume;
          setPersonal({
            name: res.name || "",
            email: res.email || "",
            phone: res.phone || "",
            location: res.location || "",
            website: res.website || "",
          });
          setSummary(res.summary || "");
          setSkills(res.skills || "");
          setExperience(res.experience || []);
          setEducation(res.education || []);
          setTemplate(res.template || "classic");
          setThemeColor(res.themeColor || "slate");
        }
      } catch (err) {
        console.error("Failed to load resume draft:", err);
      } finally {
        setLoadingData(false);
      }
    };
    loadResume();
  }, []);

  // Save draft handler
  const handleSave = async (silent = false) => {
    if (silent) {
      setSaveStatus("saving");
    } else {
      setIsSaving(true);
    }

    try {
      const result = await saveBuiltResume({
        name: personal.name,
        email: personal.email,
        phone: personal.phone,
        location: personal.location,
        website: personal.website,
        summary,
        skills,
        experience,
        education,
        template,
        themeColor
      });

      if (result.success) {
        setSaveStatus("saved");
        if (!silent) showToast("Resume draft saved successfully!", "success");
      } else {
        setSaveStatus("error");
        if (!silent) showToast(result.error || "Failed to save resume draft.", "error");
      }
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      if (!silent) showToast("Connection failure while saving resume.", "error");
    } finally {
      if (!silent) setIsSaving(false);
    }
  };

  // Auto-save whenever structural fields change (debounced or step triggered)
  const handleStepChange = async (nextStep: number) => {
    if (step === 1 && nextStep > 1) {
      const newErrors: { name?: string; email?: string } = {};
      if (!personal.name.trim()) {
        newErrors.name = "String must contain at least 1 character(s)";
      }
      if (!personal.email.trim()) {
        newErrors.email = "Invalid email";
      } else if (!personal.email.includes("@")) {
        newErrors.email = "Invalid email";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    setErrors({});
    await handleSave(true);
    setStep(nextStep);
  };

  // AI enhance summary handler
  const handleEnhanceSummary = async () => {
    if (!summary.trim()) {
      setSummaryError("Please enter a summary draft");
      return;
    }
    setSummaryError(null);
    setIsEnhancing(true);
    try {
      const result = await enhanceResumeSummary(summary, skills);
      if (result.success && result.enhancedSummary) {
        setSummary(result.enhancedSummary);
        setSaveStatus("unsaved");
        showToast("Summary enhanced successfully!", "success");
      } else {
        setSummaryError(result.error || "Failed to enhance summary using AI.");
      }
    } catch (err) {
      console.error(err);
      setSummaryError("Failed to connect to the AI summarizer service.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAddExperience = () => {
    setExperience((prev) => [
      ...prev,
      {
        id: `exp_${Date.now()}`,
        role: "Software Intern",
        company: "New Tech Co.",
        duration: "Jun 2025 - Dec 2025",
        bullets: "Describe your job accomplishments here..."
      }
    ]);
    setSaveStatus("unsaved");
  };

  const handleRemoveExperience = (id: string) => {
    setExperience((prev) => prev.filter((item) => item.id !== id));
    setSaveStatus("unsaved");
  };

  const handleAddEducation = () => {
    setEducation((prev) => [
      ...prev,
      {
        id: `edu_${Date.now()}`,
        degree: "Certification / Degree Name",
        school: "College / University Name",
        duration: "Year - Year"
      }
    ]);
    setSaveStatus("unsaved");
  };

  const handleRemoveEducation = (id: string) => {
    setEducation((prev) => prev.filter((item) => item.id !== id));
    setSaveStatus("unsaved");
  };

  // Helper styles based on template / accent theme
  const getThemeColorClass = () => {
    switch (themeColor) {
      case "indigo": return "text-indigo-600 border-indigo-200";
      case "emerald": return "text-emerald-600 border-emerald-200";
      default: return "text-slate-800 border-slate-200";
    }
  };

  const getThemeBulletClass = () => {
    switch (themeColor) {
      case "indigo": return "border-l-indigo-500";
      case "emerald": return "border-l-emerald-500";
      default: return "border-l-slate-400";
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#080914] flex flex-col items-center justify-center text-center px-4">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-xl animate-pulse-glow" />
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin relative z-10" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Loading Resume Template...</h2>
        <p className="text-slate-400 text-xs max-w-xs">
          Syncing draft details from secure workspace database.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080914] md:max-h-screen md:overflow-hidden print:block print:bg-white print:text-black">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 md:h-screen md:sticky md:top-0 border-b md:border-b-0 md:border-r border-white/5 glass-panel flex flex-col p-6 shrink-0 z-20 md:overflow-y-auto print:hidden">
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
          <Link href="/roadmap" className="flex items-center gap-3 hover:bg-white/5 hover:text-white px-4 py-3 rounded-xl transition-all whitespace-nowrap md:whitespace-normal">
            <Compass className="w-4 h-4" />
            Career Roadmap
          </Link>
          <Link href="/resume-builder" className="flex items-center gap-3 bg-brand-500/10 border border-brand-500/20 text-white px-4 py-3 rounded-xl whitespace-nowrap md:whitespace-normal">
            <ClipboardList className="w-4 h-4 text-brand-500" />
            Resume Builder
          </Link>
        </nav>

        {/* Logout */}
        <button onClick={handleLogout} className="w-full flex items-center gap-3 text-slate-500 hover:text-white text-sm font-semibold px-4 py-3 rounded-xl border border-transparent hover:border-white/5 mt-auto hover:bg-red-950/10 hover:text-red-400 transition-all justify-center md:justify-start cursor-pointer text-left">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </aside>

      {/* Main Content Area: Split Screen */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden h-screen print:h-auto print:block print:p-0">
        {/* Left Column: Form Editor (50% width on desktop) */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto border-r border-white/5 custom-scrollbar h-full print:hidden">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-white mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
              <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-brand-500" />
                AI Resume Builder
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Create an ATS-friendly, plain text formatting resume using dynamic forms.
              </p>
            </div>
            
            {/* Save Status Actions */}
            <div className="flex items-center gap-2.5 bg-slate-900/60 border border-white/5 px-3 py-2 rounded-xl">
              {saveStatus === "saving" && (
                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" /> Autosaving...
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" /> Changes saved in DB
                </span>
              )}
              {saveStatus === "unsaved" && (
                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-brand-400" /> Unsaved changes
                </span>
              )}
              {saveStatus === "error" && (
                <span className="text-[10px] font-semibold text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Save error
                </span>
              )}
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="bg-brand-500/10 hover:bg-brand-500/20 text-brand-200 border border-brand-500/20 font-bold px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 transition-all"
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                Save Now
              </button>
            </div>
          </div>

          {/* Form Wizard Navigation */}
          <div className="flex border-b border-white/5 pb-2 mb-6 gap-4 text-xs font-semibold text-slate-500">
            {["1. Personal Info", "2. Summary", "3. Experience & Edu", "4. Skills"].map((label, idx) => (
              <button
                key={label}
                onClick={() => handleStepChange(idx + 1)}
                className={`pb-2 border-b-2 transition-all ${
                  step === idx + 1 ? "border-brand-500 text-white font-bold" : "border-transparent hover:text-slate-300"
                }`}
              >
                {label === "3. Experience & Edu" ? "3. Accomplishments & Education" : label}
              </button>
            ))}
          </div>

          {/* Wizard Forms */}
          <div className="space-y-6">
            {step === 1 && (
              <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-4 animate-fade-in">
                <h3 className="text-sm font-bold text-white mb-4">Personal Contact Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={personal.name}
                      onChange={(e) => {
                        setPersonal({ ...personal, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: undefined });
                        setSaveStatus("unsaved");
                      }}
                      className={`w-full bg-slate-950/60 border rounded-lg py-2.5 px-3 text-white text-xs focus:outline-none transition-all ${
                        errors.name ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-brand-500"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-[10px] mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={personal.email}
                      onChange={(e) => {
                        setPersonal({ ...personal, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: undefined });
                        setSaveStatus("unsaved");
                      }}
                      className={`w-full bg-slate-950/60 border rounded-lg py-2.5 px-3 text-white text-xs focus:outline-none transition-all ${
                        errors.email ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-brand-500"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={personal.phone}
                      onChange={(e) => {
                        setPersonal({ ...personal, phone: e.target.value });
                        setSaveStatus("unsaved");
                      }}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-white text-xs focus:outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                    <input 
                      type="text" 
                      value={personal.location}
                      onChange={(e) => {
                        setPersonal({ ...personal, location: e.target.value });
                        setSaveStatus("unsaved");
                      }}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-white text-xs focus:outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">GitHub / LinkedIn URL</label>
                  <input 
                    type="text" 
                    value={personal.website}
                    onChange={(e) => {
                      setPersonal({ ...personal, website: e.target.value });
                      setSaveStatus("unsaved");
                    }}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-white text-xs focus:outline-none focus:border-brand-500 transition-all"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-4 animate-fade-in">
                {summaryError && (
                  <div className="bg-red-950/40 border border-red-500/20 text-red-200 text-[11px] p-2.5 rounded-lg flex items-center gap-2 animate-fade-in mb-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{summaryError}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-white">Professional Summary</h3>
                  <button
                    type="button"
                    onClick={handleEnhanceSummary}
                    disabled={isEnhancing}
                    className="bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 text-brand-300 font-bold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 transition-all"
                  >
                    {isEnhancing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
                    )}
                    AI Enhance
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">Write a brief description of your career focus. Click 'AI Enhance' to formulate a highly targeted summary.</p>
                <textarea 
                  value={summary}
                  onChange={(e) => {
                    setSummary(e.target.value);
                    if (summaryError) setSummaryError(null);
                    setSaveStatus("unsaved");
                  }}
                  rows={6}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-3 px-3 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-all resize-none custom-scrollbar"
                />
              </div>
            )}

            {step === 3 && (
              <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Work Accomplishments</h3>
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 font-semibold px-2.5 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Job
                  </button>
                </div>

                {experience.map((exp, idx) => (
                  <div key={exp.id} className="p-4 rounded-lg bg-slate-950/30 border border-white/5 space-y-4 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="absolute top-4 right-4 text-slate-600 hover:text-accent-rose transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Job Position #{idx + 1}</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-1">Job Role</label>
                        <input 
                          type="text" 
                          value={exp.role}
                          onChange={(e) => {
                            const newExp = [...experience];
                            newExp[idx].role = e.target.value;
                            setExperience(newExp);
                            setSaveStatus("unsaved");
                          }}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-1">Duration</label>
                        <input 
                          type="text" 
                          value={exp.duration}
                          onChange={(e) => {
                            const newExp = [...experience];
                            newExp[idx].duration = e.target.value;
                            setExperience(newExp);
                            setSaveStatus("unsaved");
                          }}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-1">Company</label>
                        <input 
                          type="text" 
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...experience];
                            newExp[idx].company = e.target.value;
                            setExperience(newExp);
                            setSaveStatus("unsaved");
                          }}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-1">Bullet Point Descriptions</label>
                        <textarea 
                          value={exp.bullets}
                          onChange={(e) => {
                            const newExp = [...experience];
                            newExp[idx].bullets = e.target.value;
                            setExperience(newExp);
                            setSaveStatus("unsaved");
                          }}
                          rows={3}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-white text-xs focus:outline-none focus:border-brand-500 resize-none custom-scrollbar"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Education Section */}
                <div className="border-t border-white/5 pt-6 mt-6 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Education History</h3>
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 font-semibold px-2.5 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Education
                  </button>
                </div>

                {education.map((edu, idx) => (
                  <div key={edu.id} className="p-4 rounded-lg bg-slate-950/30 border border-white/5 space-y-4 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(edu.id)}
                      className="absolute top-4 right-4 text-slate-600 hover:text-accent-rose transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Education Record #{idx + 1}</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-1">Degree / Certification</label>
                        <input 
                          type="text" 
                          value={edu.degree}
                          onChange={(e) => {
                            const newEdu = [...education];
                            newEdu[idx].degree = e.target.value;
                            setEducation(newEdu);
                            setSaveStatus("unsaved");
                          }}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-1">Duration</label>
                        <input 
                          type="text" 
                          value={edu.duration}
                          onChange={(e) => {
                            const newEdu = [...education];
                            newEdu[idx].duration = e.target.value;
                            setEducation(newEdu);
                            setSaveStatus("unsaved");
                          }}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-1">School / University / Organization</label>
                      <input 
                        type="text" 
                        value={edu.school}
                        onChange={(e) => {
                          const newEdu = [...education];
                          newEdu[idx].school = e.target.value;
                          setEducation(newEdu);
                          setSaveStatus("unsaved");
                        }}
                        className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-4 animate-fade-in">
                <h3 className="text-sm font-bold text-white mb-2">Technical Skills & Competencies</h3>
                <p className="text-[10px] text-slate-500">Provide comma-separated keywords for skills, tools, and languages (e.g. JavaScript, React, Postgres):</p>
                <textarea 
                  value={skills}
                  onChange={(e) => {
                    setSkills(e.target.value);
                    setSaveStatus("unsaved");
                  }}
                  rows={4}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-3 px-3 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-all resize-none custom-scrollbar"
                />
              </div>
            )}
          </div>

          {/* Form Wizard Navigation Buttons */}
          <div className="flex gap-4 justify-between mt-8 border-t border-white/5 pt-6">
            <button
              onClick={() => handleStepChange(Math.max(1, step - 1))}
              disabled={step === 1}
              className={`text-xs font-bold py-2.5 px-4 rounded-xl border transition-all ${
                step === 1
                  ? "bg-white/5 text-slate-600 border-white/5 cursor-not-allowed"
                  : "bg-slate-900 border-white/5 text-white hover:bg-slate-950"
              }`}
            >
              Previous Step
            </button>
            
            {step < 4 ? (
              <button
                onClick={() => handleStepChange(Math.min(4, step + 1))}
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1 border border-brand-500/20 shadow-md transition-all"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  await handleSave(true);
                  window.print();
                }}
                className="glow-btn bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold py-2.5 px-5 rounded-xl border border-brand-500/20 shadow-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export Resume PDF
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Live Resume Preview (50% width on desktop) */}
        <div className="hidden lg:flex flex-col w-[50%] p-6 md:p-8 bg-slate-950/20 border-l border-white/5 h-full overflow-y-auto custom-scrollbar print:block print:w-full print:p-0 print:bg-transparent print:border-none print:h-auto">
          
          {/* Customization Layout Controls (Only visible on web layout) */}
          <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl mb-6 flex flex-col gap-4 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Layout Template</label>
                <div className="flex gap-2">
                  {[
                    { id: "classic", name: "Classic" },
                    { id: "modern", name: "Modern Minimal" },
                    { id: "tech", name: "Tech Compact" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTemplate(t.id);
                        setSaveStatus("unsaved");
                        // Trigger a background save shortly
                        setTimeout(() => saveBuiltResume({
                          name: personal.name,
                          email: personal.email,
                          phone: personal.phone,
                          location: personal.location,
                          website: personal.website,
                          summary,
                          skills,
                          experience,
                          education,
                          template: t.id,
                          themeColor
                        }), 100);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        template === t.id
                          ? "bg-brand-500/10 border-brand-500 text-white"
                          : "bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Accent Theme</label>
                <div className="flex gap-2">
                  {[
                    { id: "slate", name: "Slate", class: "bg-slate-500" },
                    { id: "indigo", name: "Indigo", class: "bg-indigo-500" },
                    { id: "emerald", name: "Emerald", class: "bg-emerald-500" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setThemeColor(c.id);
                        setSaveStatus("unsaved");
                        setTimeout(() => saveBuiltResume({
                          name: personal.name,
                          email: personal.email,
                          phone: personal.phone,
                          location: personal.location,
                          website: personal.website,
                          summary,
                          skills,
                          experience,
                          education,
                          template,
                          themeColor: c.id
                        }), 100);
                      }}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-semibold flex items-center gap-1.5 transition-all ${
                        themeColor === c.id
                          ? "border-white/20 text-white bg-white/5"
                          : "border-white/5 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${c.class}`} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6 print:hidden">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live Software-Friendly Preview</span>
            <button 
              onClick={async () => {
                await handleSave(true);
                window.print();
              }}
              className="text-[10px] font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Save PDF
            </button>
          </div>

          {/* Actual resume sheet mockup */}
          <div className="bg-white text-slate-900 p-8 rounded-xl shadow-xl w-full min-h-[700px] text-xs font-sans space-y-6 print:p-0 print:shadow-none print:rounded-none">
            
            {/* CLASSIVE LAYOUT */}
            {template === "classic" && (
              <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="text-center space-y-1.5 border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-bold tracking-wide uppercase text-slate-800">{personal.name || "YOUR NAME"}</h2>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-slate-600">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {personal.email}</span>
                    {personal.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {personal.phone}</span>}
                    {personal.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {personal.location}</span>}
                    {personal.website && <span className="flex items-center gap-1"><Link2 className="w-3 h-3" /> {personal.website}</span>}
                  </div>
                </div>

                {/* Summary */}
                {summary && (
                  <div className="space-y-1.5">
                    <h3 className={`text-xs font-bold uppercase tracking-wider border-b pb-0.5 ${getThemeColorClass()}`}>Professional Summary</h3>
                    <p className="text-slate-600 leading-relaxed text-[10px]">{summary}</p>
                  </div>
                )}

                {/* Work History */}
                {experience.length > 0 && (
                  <div className="space-y-3">
                    <h3 className={`text-xs font-bold uppercase tracking-wider border-b pb-0.5 flex items-center gap-1 ${getThemeColorClass()}`}><Briefcase className="w-3.5 h-3.5" /> Professional Experience</h3>
                    
                    {experience.map((exp) => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>{exp.role || "Job Role"}</span>
                          <span className="text-[10px] text-slate-500 font-normal">{exp.duration || "Duration"}</span>
                        </div>
                        <div className="text-slate-600 italic text-[10px]">{exp.company || "Company Name"}</div>
                        <p className={`text-[10px] text-slate-600 leading-relaxed pl-3 border-l-2 ${getThemeBulletClass()} mt-1`}>{exp.bullets || "Bullets details..."}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Education */}
                {education.length > 0 && (
                  <div className="space-y-3">
                    <h3 className={`text-xs font-bold uppercase tracking-wider border-b pb-0.5 flex items-center gap-1 ${getThemeColorClass()}`}><GraduationCap className="w-3.5 h-3.5" /> Education</h3>
                    
                    {education.map((edu) => (
                      <div key={edu.id} className="space-y-0.5">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>{edu.degree}</span>
                          <span className="text-[10px] text-slate-500 font-normal">{edu.duration}</span>
                        </div>
                        <div className="text-slate-600 text-[10px]">{edu.school}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills */}
                {skills && (
                  <div className="space-y-1.5">
                    <h3 className={`text-xs font-bold uppercase tracking-wider border-b pb-0.5 ${getThemeColorClass()}`}>Core Competencies</h3>
                    <div className="text-[10px] text-slate-600 leading-relaxed font-sans">
                      {skills.split(",").map((s, i) => s.trim()).filter(Boolean).map((skill, idx, arr) => (
                        <span key={idx}>
                          <span>{skill}</span>
                          {idx < arr.length - 1 && <span className="mx-2 text-slate-300">•</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODERN MINIMALIST LAYOUT */}
            {template === "modern" && (
              <div className="space-y-6 animate-fade-in font-serif">
                {/* Header */}
                <div className="space-y-2 text-left">
                  <h2 className="text-2xl font-semibold tracking-wide text-slate-900">{personal.name || "YOUR NAME"}</h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 font-sans">
                    <span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5 text-slate-400" /> {personal.email}</span>
                    {personal.phone && <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5 text-slate-400" /> {personal.phone}</span>}
                    {personal.location && <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5 text-slate-400" /> {personal.location}</span>}
                    {personal.website && <span className="flex items-center gap-1"><Link2 className="w-2.5 h-2.5 text-slate-400" /> {personal.website}</span>}
                  </div>
                </div>

                <div className="h-[1px] bg-slate-200 my-4" />

                {/* Summary */}
                {summary && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans">
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${getThemeColorClass()} md:col-span-1`}>
                      About Me
                    </div>
                    <div className="text-slate-600 leading-relaxed text-[10px] md:col-span-3">
                      {summary}
                    </div>
                  </div>
                )}

                {/* Work History */}
                {experience.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans border-t border-slate-100 pt-4">
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${getThemeColorClass()} md:col-span-1`}>
                      Experience
                    </div>
                    <div className="space-y-4 md:col-span-3">
                      {experience.map((exp) => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                            <span>{exp.role || "Job Role"}</span>
                            <span className="text-[9px] text-slate-400 font-normal">{exp.duration || "Duration"}</span>
                          </div>
                          <div className="text-slate-500 italic text-[10px]">{exp.company || "Company Name"}</div>
                          <p className="text-[10px] text-slate-600 leading-relaxed mt-1 font-serif">{exp.bullets || "Bullets details..."}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {education.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans border-t border-slate-100 pt-4">
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${getThemeColorClass()} md:col-span-1`}>
                      Education
                    </div>
                    <div className="space-y-3 md:col-span-3">
                      {education.map((edu) => (
                        <div key={edu.id} className="space-y-0.5">
                          <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                            <span>{edu.degree}</span>
                            <span className="text-[9px] text-slate-400 font-normal">{edu.duration}</span>
                          </div>
                          <div className="text-slate-500 text-[10px]">{edu.school}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {skills && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans border-t border-slate-100 pt-4">
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${getThemeColorClass()} md:col-span-1`}>
                      Skills
                    </div>
                    <div className="text-[10px] text-slate-600 leading-relaxed md:col-span-3 font-serif">
                      {skills.split(",").map((s, i) => s.trim()).filter(Boolean).map((skill, idx, arr) => (
                        <span key={idx}>
                          <span>{skill}</span>
                          {idx < arr.length - 1 && <span className="mx-2 text-slate-300">•</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TECH COMPACT LAYOUT */}
            {template === "tech" && (
              <div className="space-y-4 animate-fade-in font-mono text-[11px] leading-tight">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-300 pb-2">
                  <div className="space-y-0.5">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tighter uppercase">{personal.name || "YOUR NAME"}</h2>
                    {skills && (
                      <p className={`text-[9px] font-bold ${getThemeColorClass()} uppercase`}>
                        {skills.split(",").slice(0, 4).join(" | ")}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-[9px] text-slate-500 space-y-0.5 font-sans">
                    <div>{personal.email}</div>
                    {personal.phone && <div>{personal.phone}</div>}
                    {personal.location && <div>{personal.location}</div>}
                    {personal.website && <div className="font-semibold text-slate-700">{personal.website}</div>}
                  </div>
                </div>

                {/* Summary */}
                {summary && (
                  <div className="space-y-1">
                    <strong className={`uppercase text-[10px] tracking-tight block ${getThemeColorClass()}`}>&gt; Profile Summary</strong>
                    <p className="text-slate-600 pl-2 border-l border-slate-300 font-sans text-[10px]">{summary}</p>
                  </div>
                )}

                {/* Work History */}
                {experience.length > 0 && (
                  <div className="space-y-2">
                    <strong className={`uppercase text-[10px] tracking-tight block ${getThemeColorClass()}`}>&gt; Professional Experience</strong>
                    
                    {experience.map((exp) => (
                      <div key={exp.id} className="pl-2 border-l border-slate-300 space-y-0.5">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{exp.role ? exp.role.toUpperCase() : "JOB POSITION"} @ {exp.company ? exp.company.toUpperCase() : "COMPANY"}</span>
                          <span className="text-[9px] text-slate-500 font-normal font-sans">{exp.duration}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-snug font-sans pl-2 border-l border-slate-100">{exp.bullets}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Education */}
                {education.length > 0 && (
                  <div className="space-y-2">
                    <strong className={`uppercase text-[10px] tracking-tight block ${getThemeColorClass()}`}>&gt; Education History</strong>
                    
                    {education.map((edu) => (
                      <div key={edu.id} className="pl-2 border-l border-slate-300 flex justify-between font-sans text-[10px]">
                        <div>
                          <strong className="text-slate-700 font-mono">{edu.degree}</strong>
                          <span className="text-slate-500"> - {edu.school}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-normal shrink-0">{edu.duration}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills */}
                {skills && (
                  <div className="space-y-1">
                    <strong className={`uppercase text-[10px] tracking-tight block ${getThemeColorClass()}`}>&gt; Core Competencies</strong>
                    <div className="pl-2 border-l border-slate-300 text-slate-700 text-[9.5px] leading-relaxed font-sans">
                      {skills.split(",").map((s, i) => s.trim()).filter(Boolean).map((skill, idx, arr) => (
                        <span key={idx}>
                          <span>{skill}</span>
                          {idx < arr.length - 1 && <span className={`mx-2 font-bold ${getThemeColorClass()}`}>•</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Premium Enterprise Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl border border-white/10 shadow-2xl backdrop-blur-lg max-w-sm transition-all animate-fade-in bg-slate-950/90 text-slate-100 ${
          toast.type === "success" 
            ? "border-l-4 border-l-emerald-500" 
            : "border-l-4 border-l-red-500"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <div className="flex-1">
            <p className="text-xs font-bold text-white leading-none">{toast.type === "success" ? "Success" : "Error"}</p>
            <p className="text-[11px] text-slate-400 mt-1">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
