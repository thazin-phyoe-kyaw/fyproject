"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  FileText, Cpu, Compass, MessageSquare, ClipboardList, LogOut,
  Upload, Sparkles, CheckCircle2, AlertTriangle, HelpCircle, 
  ArrowRight, Loader2, ArrowLeft, RefreshCw, Eye, Plus, ChevronRight,
  Trash2
} from "lucide-react";
import { uploadAndScanResume, getResumeReportDetails, getResumeScanHistory, deleteResume } from "@/app/actions/resume";
import { updateUserProfile, logoutUser } from "@/app/actions/auth";

export default function ResumeScan() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080914] flex flex-col items-center justify-center text-center px-4">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
      </div>
    }>
      <ResumeScanContent />
    </Suspense>
  );
}

function ResumeScanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/";
    }
  };

  const [file, setFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState("Full Stack Developer");
  const [experience, setExperience] = useState("Entry Level");
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [analysis, setAnalysis] = useState<{
    matchScore: number;
    missingKeywords: string[];
    formattingIssues: string[];
    aiSuggestions: string;
  } | null>(null);

  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Load history list
  const loadHistory = async () => {
    try {
      const result = await getResumeScanHistory();
      if (result.success && result.resumes) {
        setHistory(result.resumes);
      }
    } catch (err) {
      console.error("Failed to load resume history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Watch for reportId param in the URL
  useEffect(() => {
    const loadReportDetails = async () => {
      if (!reportId) {
        setShowResults(false);
        setAnalysis(null);
        return;
      }
      setScanning(true);
      setScanStep(2);
      setError(null);
      try {
        const result = await getResumeReportDetails(reportId);
        if (result.success && result.report) {
          setAnalysis({
            matchScore: result.report.matchScore,
            missingKeywords: result.report.missingKeywords,
            formattingIssues: result.report.formattingIssues,
            aiSuggestions: result.report.aiSuggestions,
          });
          // Update the jobRole if metadata was saved
          if (result.report.resume) {
            setFile({ name: result.report.resume.fileUrl, size: 0 } as File);
          }
          setShowResults(true);
        } else {
          setError(result.error || "Failed to load historical report.");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch scan results.");
      } finally {
        setScanning(false);
      }
    };

    loadReportDetails();
  }, [reportId]);

  const handleScanAgain = () => {
    setShowResults(false);
    setAnalysis(null);
    setFile(null);
    router.push("/resume");
  };

  const handleDeleteResume = async (e: React.MouseEvent, resumeId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this resume scan and all its reports? This action is permanent.")) {
      return;
    }

    try {
      const result = await deleteResume(resumeId);
      if (result.success) {
        loadHistory();
        if (reportId) {
          router.push("/resume");
        }
      } else {
        alert(result.error || "Failed to delete resume.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete resume due to server connection issues.");
    }
  };

  // Steps for simulated scanning animation
  const scanSteps = [
    "Reading uploaded file format...",
    "Extracting plain text layout...",
    "Correlating text tokens against target job descriptions...",
    "Analyzing semantic keyword density...",
    "Evaluating document structural format..."
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const startScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds the 5MB limit. Please upload a smaller PDF or Word document.");
      return;
    }

    setScanning(true);
    setScanStep(0);
    setShowResults(false);
    setError(null);

    // Simulate progress updates for the visual loading state
    const interval = setInterval(() => {
      setScanStep((prev) => {
        if (prev < scanSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    try {
      // First update the user profile's target role and experience level
      await updateUserProfile({
        targetJobRole: jobRole,
        experience: experience,
        skills: [] // Keep existing skills unchanged
      });

      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);

      // Trigger the real server action
      const result = await uploadAndScanResume(formData);
      
      clearInterval(interval);

      if (result.success && result.report) {
        setAnalysis({
          matchScore: result.report.matchScore,
          missingKeywords: result.report.missingKeywords,
          formattingIssues: result.report.formattingIssues,
          aiSuggestions: result.report.aiSuggestions,
        });
        setScanning(false);
        setShowResults(true);
        loadHistory(); // Refresh scan history on dashboard/resume page
      } else {
        setError(result.error || "Failed to analyze resume. Please try again.");
        setScanning(false);
      }
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      setError(err.message || "An unexpected error occurred during the resume scan.");
      setScanning(false);
    }
  };


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
          <Link href="/resume" className="flex items-center gap-3 bg-brand-500/10 border border-brand-500/20 text-white px-4 py-3 rounded-xl whitespace-nowrap md:whitespace-normal">
            <FileText className="w-4 h-4 text-brand-500" />
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
      <main className="flex-1 p-6 md:p-10 overflow-y-auto md:h-screen w-full max-w-none custom-scrollbar">
        <div className="mb-8">
          <Link href="dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-8 h-8 text-brand-500" />
            ATS Resume Analyzer
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Compare your resume text directly with industry requirements and standard Applicant Tracking Systems.
          </p>
        </div>

        {/* Active Scan Setup Form */}
        {!scanning && !showResults && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
            {/* Form Editor Section */}
            <div className="lg:col-span-2 glass-panel p-8 rounded-2xl border border-white/5 h-fit">
              {error && (
                <div className="mb-6 p-4 bg-red-950/30 border border-red-500/30 rounded-xl text-red-200 text-xs font-semibold">
                  {error}
                </div>
              )}
              <form onSubmit={startScan} className="space-y-6">
                {/* Target Job Role & Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Job Role</label>
                    <input 
                      type="text" 
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      required
                      placeholder="e.g. Full Stack Developer"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Experience Level</label>
                    <select 
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
                    >
                      <option>Entry Level</option>
                      <option>Mid Level</option>
                      <option>Senior Level</option>
                    </select>
                  </div>
                </div>

                {/* Drag and Drop Zone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Upload Resume File</label>
                  <div className="border-2 border-dashed border-white/10 hover:border-brand-500/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-slate-950/20 hover:bg-slate-950/40 transition-all group relative">
                    <input 
                      type="file" 
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-10 h-10 text-slate-500 group-hover:text-brand-500 mb-4 transition-colors" />
                    
                    {file ? (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white flex items-center gap-1.5 justify-center">
                          <FileText className="w-4 h-4 text-brand-500" />
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB • Click or drag to replace</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-300">Drag & drop your resume here, or <span className="text-brand-500 group-hover:underline">browse</span></p>
                        <p className="text-xs text-slate-500">Supports PDF or DOCX files (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <button 
                  type="submit"
                  disabled={!file}
                  className={`glow-btn w-full font-bold py-3.5 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    file 
                      ? "bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white border-brand-500/20 shadow-lg shadow-brand-500/10 cursor-pointer"
                      : "bg-white/5 text-slate-500 border-white/5 cursor-not-allowed"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze My Resume
                </button>
              </form>
            </div>

            {/* Scan History Section */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 h-fit space-y-4">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-base font-bold text-white">Recent Scans History</h3>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  Click a past report below to load its full ATS compatibility scores and detailed feedback.
                </p>
              </div>
              
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
                  </div>
                ) : history.length > 0 ? (
                  history.map((resume) => {
                    const latestReport = resume.analysisReports?.[0];
                    if (!latestReport) return null;
                    const isSelected = reportId === latestReport.id;
                    return (
                      <Link 
                        href={`/resume?reportId=${latestReport.id}`}
                        key={resume.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer block text-left min-w-0 ${
                          isSelected
                            ? "bg-brand-500/10 border-brand-500/30 text-white"
                            : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <FileText className="w-4 h-4 text-brand-500 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-semibold text-white truncate" title={resume.fileUrl}>
                              {resume.fileUrl}
                            </h4>
                            <p className="text-[9px] text-slate-500 mt-0.5">
                              {new Date(resume.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            latestReport.matchScore >= 75 
                              ? "bg-accent-emerald/10 text-accent-emerald" 
                              : "bg-accent-amber/10 text-accent-amber"
                          }`}>
                            {latestReport.matchScore}%
                          </span>
                          <button
                            onClick={(e) => handleDeleteResume(e, resume.id)}
                            className="p-1 hover:bg-white/10 text-slate-500 hover:text-accent-rose rounded transition-colors"
                            title="Delete Scan Report"
                            type="button"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500 italic">
                    No past scans found. Upload a resume to get started.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scanning Progress Screen */}
        {scanning && (
          <div className="glass-panel p-10 rounded-2xl border border-white/5 max-w-xl flex flex-col items-center justify-center text-center py-16 animate-fade-in">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-xl animate-pulse-glow" />
              <Loader2 className="w-12 h-12 text-brand-500 animate-spin relative z-10" />
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2">Analyzing Resume...</h3>
            <p className="text-slate-400 text-sm max-w-xs h-10 flex items-center justify-center">
              {scanSteps[scanStep]}
            </p>

            {/* Simulated progress steps visual checklist */}
            <div className="mt-8 space-y-2 text-left w-full max-w-xs text-xs">
              {scanSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${
                    idx < scanStep 
                      ? "bg-accent-emerald" 
                      : idx === scanStep 
                        ? "bg-brand-500 animate-ping" 
                        : "bg-slate-700"
                  }`} />
                  <span className={idx < scanStep ? "text-slate-400 line-through" : idx === scanStep ? "text-white font-semibold" : "text-slate-600"}>
                    {step.substring(0, 30)}...
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scan Results Screen */}
        {showResults && analysis && (
          <div className="space-y-8 animate-slide-up">
            {/* Scorecard banner */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center gap-6 justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald px-3 py-1 rounded-full text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Checked successfully
                </div>
                <h2 className="text-xl font-bold text-white mt-2">ATS Score Card for {jobRole}</h2>
                <p className="text-slate-400 text-xs">Experience requested: {experience}</p>
              </div>

              {/* Big circular score gauge */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                  <circle cx="56" cy="56" r="48" stroke="#6366f1" strokeWidth="8" fill="transparent" 
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - analysis.matchScore / 100)}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-extrabold text-white">{analysis.matchScore}%</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Match</span>
                </div>
              </div>
            </div>

            {/* Analysis details layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Missing keywords and formatting (50% wide) */}
              <div className="space-y-6">
                {/* Missing Keywords Card */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-accent-amber" />
                    Missing Keywords & Competencies
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Your target job role description highly requests these keywords. We suggest integrating them contextually in your project accomplishments:
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingKeywords.length > 0 ? (
                      analysis.missingKeywords.map((kw, i) => (
                        <span key={i} className="bg-slate-900 border border-accent-amber/20 text-accent-amber px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:border-accent-amber/40 hover:bg-slate-950 transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No major missing keywords identified! Excellent match.</span>
                    )}
                  </div>
                </div>

                {/* Formatting issues */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-accent-rose" />
                    Formatting & Layout Issues
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    We scanned the layout for formatting errors that cause document parser rejections:
                  </p>

                  <div className="space-y-3">
                    {analysis.formattingIssues.length > 0 ? (
                      analysis.formattingIssues.map((issue, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                          <AlertTriangle className="w-4 h-4 text-accent-rose shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-300 leading-relaxed">{issue}</p>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <CheckCircle2 className="w-4 h-4 text-accent-emerald shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-300 leading-relaxed">No layout or formatting issues detected. Highly parsing-optimized structure!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: AI Mentorship & Suggestions */}
              <div className="space-y-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full blur-xl pointer-events-none" />
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    AI Career Mentorship
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Structured advice tailored to your resume:</p>
                  
                  <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {analysis.aiSuggestions}
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button 
                      onClick={handleScanAgain}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Scan Again
                    </button>
                    <Link 
                      href="/interview" 
                      className="flex-1 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-brand-500/20 shadow-lg transition-all"
                    >
                      Mock Interview
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
