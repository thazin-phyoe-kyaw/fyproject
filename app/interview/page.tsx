"use client"
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Cpu, FileText, MessageSquare, Compass, ClipboardList, LogOut,
  ArrowLeft, ArrowRight, Play, Sparkles, CheckCircle2, 
  HelpCircle, Clock, ShieldCheck, Award, MessageCircle, Loader2
} from "lucide-react";
import { createInterviewSession, getInterviewHistory } from "@/app/actions/interview";
import { logoutUser } from "@/app/actions/auth";

export default function InterviewSetup() {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/";
    }
  };
  const [jobRole, setJobRole] = useState("React Developer");
  const [difficulty, setDifficulty] = useState("Junior");
  const [questionCount, setQuestionCount] = useState("10 Questions");
  const [customCount, setCustomCount] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const result = await getInterviewHistory();
        if (result.success && result.sessions) {
          setHistory(result.sessions);
        }
      } catch (err) {
        console.error("Failed to load interview history:", err);
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, []);

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createInterviewSession(
        jobRole,
        difficulty,
        questionCount,
        jobDescription
      );

      if (result.success && result.sessionId) {
        router.push(`/interview/${result.sessionId}`);
      } else {
        setError(result.error || "Failed to start interview session.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
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
          <Link href="/resume" className="flex items-center gap-3 hover:bg-white/5 hover:text-white px-4 py-3 rounded-xl transition-all whitespace-nowrap md:whitespace-normal">
            <FileText className="w-4 h-4" />
            Resume Scan (ATS)
          </Link>
          <Link href="/interview" className="flex items-center gap-3 bg-brand-500/10 border border-brand-500/20 text-white px-4 py-3 rounded-xl whitespace-nowrap md:whitespace-normal">
            <MessageSquare className="w-4 h-4 text-brand-500" />
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
      <main className="flex-1 p-6 md:p-10 overflow-y-auto md:h-screen max-w-5xl custom-scrollbar">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-brand-500" />
            AI Mock Interview Simulator
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Simulate realistic, turn-based technical or behavioral interviews and receive analytical scores on technical skills, communication, and grammar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Configuration Form (2 cols wide) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Play className="w-5 h-5 text-brand-500" />
                Configure New Session
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-red-950/30 border border-red-500/30 rounded-xl text-red-200 text-xs font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleStartInterview} className="space-y-6">
                {/* Target Job & Difficulty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Job Role</label>
                    <input 
                      type="text" 
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      required
                      placeholder="e.g. React Developer"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Interview Difficulty</label>
                    <select 
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
                    >
                      <option>Junior</option>
                      <option>Mid-level</option>
                      <option>Senior</option>
                    </select>
                  </div>
                </div>

                {/* Length selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Interview Length</label>
                  <div className="flex flex-wrap gap-3 items-center">
                    {["5 Questions", "10 Questions", "15 Questions"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => { setQuestionCount(opt); setCustomCount(""); }}
                        className={`py-3 px-5 rounded-xl border text-xs font-bold transition-all ${
                          questionCount === opt && !customCount
                            ? "bg-brand-500/10 border-brand-500 text-white"
                            : "bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-semibold">or</span>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={customCount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomCount(val);
                          if (val && parseInt(val) >= 1 && parseInt(val) <= 30) {
                            setQuestionCount(`${val} Questions`);
                          }
                        }}
                        placeholder="1-30"
                        className="w-20 bg-slate-950/60 border border-white/10 rounded-xl py-3 px-3 text-white text-center text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Job Description details */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Job Description / Core Requirements (Optional)
                  </label>
                  <textarea 
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={4}
                    placeholder="Paste the job description here so the AI interviewer asks hyper-targeted questions matching the exact requirements..."
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm resize-none custom-scrollbar"
                  />
                </div>

                {/* Start Button */}
                <button 
                  type="submit"
                  disabled={loading}
                  className="glow-btn w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl border border-brand-500/20 shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Initiating AI Interviewer...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      Initiate AI Mock Interview
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Past Interview History */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5">
              <h3 className="text-base font-bold text-white mb-4">Past Interview scorecards</h3>
              
              {historyLoading ? (
                <div className="text-center p-8 flex flex-col items-center justify-center">
                  <Loader2 className="w-6 h-6 text-brand-500 animate-spin mb-2" />
                  <span className="text-xs text-slate-500">Loading interview scorecards...</span>
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((item) => {
                    const parts = item.status.split("|");
                    const limit = parts[1] || "5";
                    const diff = parts[2] || "Junior";
                    const role = parts[3] || "Developer";
                    const date = new Date(item.createdAt).toLocaleDateString();

                    return (
                      <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{role}</h4>
                            <span className="bg-white/5 border border-white/5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md text-slate-400">
                              {diff}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Taken on {date}
                          </p>
                        </div>

                        <div className="flex items-center gap-6">
                          {item.feedback ? (
                            <div className="flex gap-4 text-center">
                              <div>
                                <span className="text-xs font-bold text-slate-300">{item.feedback.technicalScore}%</span>
                                <p className="text-[9px] text-slate-500 uppercase">Technical</p>
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-300">{item.feedback.grammarScore}%</span>
                                <p className="text-[9px] text-slate-500 uppercase">Grammar</p>
                              </div>
                              <div className="border-l border-white/10 pl-4">
                                <span className="text-xs font-bold text-brand-400">{item.feedback.overallScore}%</span>
                                <p className="text-[9px] text-slate-500 uppercase">Overall</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">No feedback generated</span>
                          )}

                          <Link href={`/interview/feedback/${item.id}`} className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-slate-400 hover:text-white shrink-0">
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed border-white/5 rounded-xl bg-slate-950/20">
                  <MessageCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No mock interview sessions recorded yet.</p>
                </div>
              )}
            </div>
          </div>


          {/* Right Column: AI Parameters Information */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-brand-500/10 rounded-full blur-xl pointer-events-none" />
              
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-500" />
                Evaluation Rubric
              </h3>

              <ul className="space-y-4 text-xs text-slate-400">
                <li className="space-y-1">
                  <strong className="text-slate-200">1. Technical Accuracy</strong>
                  <p className="leading-relaxed">
                    Evaluates the depth and logical accuracy of your code implementations or technical architecture explanations.
                  </p>
                </li>
                <li className="space-y-1">
                  <strong className="text-slate-200">2. Communication Quality</strong>
                  <p className="leading-relaxed">
                    Grades your structuring of answers (e.g. using the STAR framework for situational queries) and logical sequence.
                  </p>
                </li>
                <li className="space-y-1">
                  <strong className="text-slate-200">3. Grammar & Correctness</strong>
                  <p className="leading-relaxed">
                    Ensures formal professional vocabulary usage and correct sentence structure.
                  </p>
                </li>
              </ul>
            </div>

            <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-accent-cyan" />
                Interviewer Personality
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                By default, the AI interviewer behaves as a modern, supportive engineering lead. Questions are asked sequentially, giving you ample time to formulate and structure each response.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
