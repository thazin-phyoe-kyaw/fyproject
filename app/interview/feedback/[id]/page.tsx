"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Cpu, FileText, MessageSquare, Compass, ClipboardList, LogOut,
  ArrowLeft, Sparkles, Award, CheckCircle2, AlertCircle, 
  ArrowUpRight, BarChart2, BookOpen, ThumbsUp, RefreshCw, Loader2
} from "lucide-react";
import { getInterviewSessionDetails, retryEvaluation } from "@/app/actions/interview";
import { logoutUser } from "@/app/actions/auth";

interface FeedbackData {
  overallScore: number;
  grammarScore: number;
  technicalScore: number;
  detailedAnalysis: string;
}

export default function InterviewFeedback() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/";
    }
  };

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const MAX_POLLS = 30; // 30 x 3s = 90 seconds max wait

  useEffect(() => {
    if (!sessionId) return;

    let intervalId: NodeJS.Timeout;

    const fetchFeedback = async () => {
      try {
        const result = await getInterviewSessionDetails(sessionId);
        if (result.success && result.session) {
          setSession(result.session);
          
          if (result.session.feedback) {
            setFeedback(result.session.feedback);
            setLoading(false);
            if (intervalId) clearInterval(intervalId);
          } else {
            // Feedback is still generating in the background
            setLoading(true);
          }
        } else {
          setError(result.error || "Failed to load scorecard details");
          setLoading(false);
          if (intervalId) clearInterval(intervalId);
        }
      } catch (err) {
        console.error("Error loading feedback:", err);
        setError("An unexpected error occurred while fetching scorecard");
        setLoading(false);
        if (intervalId) clearInterval(intervalId);
      }
    };

    fetchFeedback();

    // Poll every 3 seconds if feedback is not loaded yet (max 90s)
    intervalId = setInterval(() => {
      setPollCount(prev => {
        if (prev >= MAX_POLLS) {
          clearInterval(intervalId);
          setError("Scorecard is taking longer than expected. Click Retry to try again.");
          setLoading(false);
          return prev;
        }
        fetchFeedback();
        return prev + 1;
      });
    }, 3000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [sessionId]);

  // Helper to format AI's markdown detailed analysis
  const formatMarkdown = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("### ")) {
        return (
          <h4 key={idx} className="text-sm font-bold text-white mt-6 mb-3 flex items-center gap-2 border-b border-white/5 pb-1">
            <Sparkles className="w-4 h-4 text-brand-400" />
            {trimmed.replace("### ", "")}
          </h4>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h3 key={idx} className="text-base font-extrabold text-white mt-8 mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
            <Award className="w-5 h-5 text-accent-cyan" />
            {trimmed.replace("## ", "")}
          </h3>
        );
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const bulletText = trimmed.replace(/^[-*]\s+/, "");
        return (
          <li key={idx} className="list-disc ml-5 text-xs text-slate-300 mb-1.5 leading-relaxed">
            {bulletText}
          </li>
        );
      }
      if (trimmed === "") return <div key={idx} className="h-2" />;
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed mb-2.5">
          {trimmed}
        </p>
      );
    });
  };

  if (loading && !error) {
    return (
      <div className="min-h-screen bg-[#080914] flex flex-col items-center justify-center text-center px-4">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-xl animate-pulse-glow" />
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin relative z-10" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Generating Session Scorecard...</h2>
        <p className="text-slate-400 text-xs max-w-xs">
          Please wait while Google Gemini evaluates your answers for technical accuracy, grammar, and communication quality.
        </p>
      </div>
    );
  }

  const handleRetry = async () => {
    setRetrying(true);
    setError(null);
    try {
      await retryEvaluation(sessionId);
      // Wait a moment then re-fetch
      setTimeout(async () => {
        const result = await getInterviewSessionDetails(sessionId);
        if (result.success && result.session?.feedback) {
          setSession(result.session);
          setFeedback(result.session.feedback);
          setLoading(false);
        } else {
          setError("Still generating. Please try again in a few seconds.");
        }
        setRetrying(false);
      }, 5000);
    } catch (err) {
      setError("Retry failed. Please try again.");
      setRetrying(false);
    }
  };

  if (error || (!loading && !feedback)) {
    return (
      <div className="min-h-screen bg-[#080914] flex flex-col items-center justify-center text-center px-4">
        <div className="p-4 rounded-full bg-red-950/20 border border-red-500/20 text-red-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Scorecard Not Ready</h2>
        <p className="text-slate-400 text-xs max-w-xs mb-6">
          {error || "The AI is still processing your interview. Click Retry to generate your scorecard."}
        </p>
        <div className="flex gap-3">
          <button 
            onClick={handleRetry}
            disabled={retrying}
            className="glow-btn bg-brand-500 border border-brand-400/30 text-white px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {retrying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {retrying ? "Generating..." : "Retry Scorecard"}
          </button>
          <Link href="/interview" className="bg-slate-900 border border-white/10 text-white px-5 py-2.5 rounded-xl text-xs font-semibold">
            Return to Interviews
          </Link>
        </div>
      </div>
    );
  }

  // Parse metadata from status "ONGOING/COMPLETED|limit|difficulty|role"
  const parts = session?.status?.split("|") || [];
  const difficulty = parts[2] || "Junior";
  const jobRole = parts[3] || "React Developer";

  // Calculate estimated communication score based on average of others vs overall
  const communicationScore = Math.min(
    100,
    Math.max(
      30,
      // Math.round((feedback.overallScore * 3 - feedback?.technicalScore - feedback?.grammarScore))
    )
  );

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
          <Link href="/interview" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Interviews
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            <Award className="w-8 h-8 text-brand-500 animate-pulse" />
            Session Performance Scorecard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Detailed criteria-based grading and constructive analysis from your mock session.
          </p>
        </div>

        {/* Top Grade Bar Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Large overall grade circle */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Overall Score</span>
            <div className="text-5xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-brand-500 via-indigo-200 to-accent-cyan">{feedback.overallScore}%</div>
            <span className="text-xs font-bold text-accent-emerald mt-2 uppercase tracking-wide flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Checked
            </span>
          </div>

          {/* Individual core sub-scores */}
          <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-center space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-brand-500" />
              Criteria Scores Breakdown
            </h3>
            
            {/* Score 1 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Technical Knowledge</span>
                <span className="text-white font-bold">{feedback.technicalScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: `${feedback.technicalScore}%` }} />
              </div>
            </div>

            {/* Score 2 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Communication & Structure (STAR)</span>
                <span className="text-white font-bold">{communicationScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-accent-cyan rounded-full" style={{ width: `${communicationScore}%` }} />
              </div>
            </div>

            {/* Score 3 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Grammar & Professional Tone</span>
                <span className="text-white font-bold">{feedback.grammarScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-accent-amber rounded-full" style={{ width: `${feedback.grammarScore}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed AI Report */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 mb-8">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent-cyan" />
            AI Interviewer Evaluation Report
          </h3>
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-6 overflow-hidden">
            {formatMarkdown(feedback.detailedAnalysis)}
          </div>
        </div>

        {/* CTA Footer */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12 border-t border-white/5 pt-8">
          <Link href="/interview" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-6 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all">
            <RefreshCw className="w-4 h-4" />
            Practice Another Interview
          </Link>
          <Link href="/roadmap" className="w-full sm:w-auto glow-btn bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-brand-500/20 shadow-lg transition-all">
            View Skill Gap Roadmap
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
