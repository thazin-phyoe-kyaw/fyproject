import Link from "next/link";
import { Cpu, FileText, MessageSquare, Compass, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080914] text-slate-100 flex flex-col font-sans selection:bg-brand-500/30 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-brand-500/20 border border-brand-500/30 p-2 rounded-lg text-brand-500">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-wider text-white">HireReady</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="glow-btn bg-brand-600 hover:bg-brand-500 text-white font-bold py-2 px-4 rounded-xl text-xs border border-brand-500/20 transition-all">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 sm:py-24 space-y-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto relative">
          <div className="absolute inset-x-0 -top-40 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-200 px-3.5 py-1.5 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
            AI-Powered Career Co-Pilot
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight">
            Optimize your resume.<br />
            Ace your mock interviews.
          </h1>
          
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            HireReady acts as your virtual career mentor, analyzing your resume against corporate ATS standards, practicing interactive turn-based interviews, and mapping custom paths to close your skill gaps.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link 
              href="/register" 
              className="glow-btn bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold py-3.5 px-8 rounded-xl border border-brand-500/20 shadow-lg flex items-center justify-center gap-2 text-sm transition-all w-full sm:w-auto"
            >
              Start Free Today
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/login" 
              className="bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 px-8 rounded-xl text-sm flex items-center justify-center border border-white/5 transition-all w-full sm:w-auto"
            >
              Sign In to Profile
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          {/* Card 1 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="bg-brand-500/10 border border-brand-500/20 w-12 h-12 rounded-xl flex items-center justify-center text-brand-500">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">ATS Resume Scan</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Scan your PDF resumes using local parsers and analyze keyword match rates, formatting failures, and structural ATS gaps tailored to target job descriptions.
              </p>
            </div>
            <Link href="/login" className="text-xs text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1.5 pt-6 transition-colors">
              Scan now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="bg-accent-cyan/10 border border-accent-cyan/20 w-12 h-12 rounded-xl flex items-center justify-center text-accent-cyan">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Turn-Based Mock Interviews</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Participate in interactive, custom chat interviews. Gemini grades your responses on technical correctness, grammar structure, and professional STAR delivery.
              </p>
            </div>
            <Link href="/login" className="text-xs text-accent-cyan hover:text-accent-cyan/80 font-bold flex items-center gap-1.5 pt-6 transition-colors">
              Start practice <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="bg-accent-emerald/10 border border-accent-emerald/20 w-12 h-12 rounded-xl flex items-center justify-center text-accent-emerald">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Personalized Skill Roadmap</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Compare your current resume skill competencies against target vacancies. Gemini maps exactly 4 interactive step-by-step modules to close the gaps.
              </p>
            </div>
            <Link href="/login" className="text-xs text-accent-emerald hover:text-accent-emerald/80 font-bold flex items-center gap-1.5 pt-6 transition-colors">
              Explore path <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Technical compliance and support */}
        <div className="border-t border-white/5 pt-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-slate-600" />
            <span>GDPR, DSDM & MoSCoW University Specification Project</span>
          </div>
          <div className="flex gap-4">
            <span>Next.js 16</span>
            <span>Tailwind v4</span>
            <span>Prisma ORM</span>
            <span>PostgreSQL</span>
          </div>
        </div>
      </main>
    </div>
  );
}
