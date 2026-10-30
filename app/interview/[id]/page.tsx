"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Cpu, MessageSquare, ArrowLeft, Send, Sparkles, Loader2,
  Clock, ShieldAlert, BookOpen, AlertCircle, HelpCircle, CheckCircle,
  Mic, Volume2, VolumeX
} from "lucide-react";
import { getInterviewSessionDetails, sendInterviewMessage } from "@/app/actions/interview";

interface Message {
  id: string;
  sender: "AI" | "USER";
  text: string;
  timestamp: Date;
}

export default function ActiveInterview() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [questionLimit, setQuestionLimit] = useState(5);
  const [jobRole, setJobRole] = useState("React Developer");
  const [difficulty, setDifficulty] = useState("Junior");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReadAloud, setIsReadAloud] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onresult = (event: any) => {
      const currentResultIndex = event.resultIndex;
      const transcript = event.results[currentResultIndex][0].transcript;
      if (event.results[currentResultIndex].isFinal) {
        setInputText((prev) => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + transcript);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Trigger speech synthesis when a new AI message arrives and Read Aloud is enabled
  useEffect(() => {
    if (!isReadAloud || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.sender === "AI") {
      speakText(lastMsg.text);
    }
  }, [messages, isReadAloud]);

  // Cleanup synthesis and speech recognition on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Load session history on mount
  useEffect(() => {
    if (!sessionId) return;

    const loadSession = async () => {
      try {
        const result = await getInterviewSessionDetails(sessionId);
        if (result.success && result.session) {
          const session = result.session;
          
          // Map database chat history to local message state
          const history: Message[] = session.chatHistory.map((m: any) => ({
            id: m.id,
            sender: m.sender as "AI" | "USER",
            text: m.message,
            timestamp: new Date(m.timestamp),
          }));
          
          setMessages(history);

          // Parse metadata "ONGOING|limit|difficulty|role" or check completed
          if (session.status.startsWith("COMPLETED")) {
            setIsCompleted(true);
            setQuestionIndex(history.filter(m => m.sender === "AI").length);
          } else {
            const parts = session.status.split("|");
            const limit = parts[1] ? parseInt(parts[1], 10) : 5;
            const diff = parts[2] || "Junior";
            const role = parts[3] || "React Developer";
            
            setQuestionLimit(limit);
            setDifficulty(diff);
            setJobRole(role);
            
            const aiQuestionCount = history.filter(m => m.sender === "AI").length;
            setQuestionIndex(aiQuestionCount);
          }
        } else {
          setError(result.error || "Failed to load interview session.");
        }
      } catch (err) {
        console.error("Error loading session:", err);
        setError("An unexpected error occurred while loading this session.");
      }
    };

    loadSession();
  }, [sessionId]);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Session elapsed timer simulation
  useEffect(() => {
    if (isCompleted) return;
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping || isCompleted) return;

    const userText = inputText.trim();
    setInputText("");

    // Append user message immediately on UI
    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: "USER",
      text: userText,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    
    setIsTyping(true);

    try {
      // Trigger the server action to process answer and get next turn
      const result = await sendInterviewMessage(sessionId, userText);
      setIsTyping(false);

      if (result.success && result.aiMessage) {
        const aiMsg: Message = {
          id: `ai_${Date.now()}`,
          sender: "AI",
          text: result.aiMessage,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, aiMsg]);
        
        if (result.completed) {
          setIsCompleted(true);
        } else {
          setQuestionIndex((prev) => prev + 1);
        }
      } else {
        setError(result.error || "Failed to receive AI response. Please try again.");
      }
    } catch (err) {
      setIsTyping(false);
      console.error(err);
      setError("Failed to communicate with the AI interviewer.");
    }
  };

  const handleEndSession = () => {
    router.push(`/interview/feedback/${sessionId}`);
  };


  return (
    <div className="min-h-screen flex flex-col bg-[#080914]">
      {/* Top Header Panel */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/interview" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="border-l border-white/10 pl-3">
            <h2 className="text-sm font-bold text-white">Active Practice Session</h2>
            <p className="text-[10px] text-slate-500">{jobRole} Role • {difficulty} Difficulty</p>
          </div>
        </div>

        {/* Dynamic HUD indicators */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg text-xs text-slate-300">
            <Clock className="w-4 h-4 text-brand-500" />
            <span>Time Elapsed: {formatTime(timeElapsed)}</span>
          </div>

          {/* Read Aloud Toggle */}
          <button
            onClick={() => {
              const newState = !isReadAloud;
              setIsReadAloud(newState);
              if (!newState && typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
            }}
            className={`flex items-center gap-2 border px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              isReadAloud 
                ? "bg-brand-500/20 border-brand-500/30 text-brand-200" 
                : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
            }`}
            title="Toggle Read Aloud for AI questions"
          >
            {isReadAloud ? <Volume2 className="w-4 h-4 text-brand-500" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span className="hidden sm:inline">Read Aloud</span>
          </button>

          <div className="flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 rounded-lg text-xs text-brand-200">
            <MessageSquare className="w-4 h-4 text-brand-500" />
            <span>Progress: {!isCompleted ? `Q ${questionIndex} of ${questionLimit}` : "Finished"}</span>
          </div>

          <button 
            onClick={handleEndSession}
            className="bg-accent-rose/10 hover:bg-accent-rose/20 border border-accent-rose/20 text-accent-rose font-bold py-1.5 px-3 rounded-lg text-xs transition-all"
          >
            End & Grade
          </button>
        </div>
      </header>

      {/* Main Panel layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Chat Message Window Area (Left Column, flex-1) */}
        <div className="flex-1 flex flex-col justify-between h-[calc(100vh-68px)] relative">
          {error && (
            <div className="m-4 p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-red-200 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Scrollable messages container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.sender === "USER" ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed border ${
                    msg.sender === "USER"
                      ? "bg-slate-900 border-white/5 text-slate-100 shadow-md"
                      : "bg-[#111326]/60 border-brand-500/10 text-slate-200 shadow-lg shadow-brand-500/5 relative"
                  }`}>
                    {/* Speaker Header */}
                    <div className="flex items-center justify-between gap-1.5 text-[10px] text-slate-500 mb-1.5 font-bold tracking-wider uppercase w-full">
                      <div className="flex items-center gap-1.5">
                        {msg.sender === "AI" ? (
                          <>
                            <Cpu className="w-3.5 h-3.5 text-brand-500" />
                            <span>AI Interviewer</span>
                          </>
                        ) : (
                          <>
                            <span>Candidate</span>
                          </>
                        )}
                      </div>
                      
                      {msg.sender === "AI" && (
                        <button
                          onClick={() => speakText(msg.text)}
                          className="text-slate-500 hover:text-white p-0.5 rounded transition-all cursor-pointer"
                          title="Read this message aloud"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}

              {/* AI Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start animate-pulse">
                  <div className="max-w-[85%] rounded-2xl p-4 text-sm bg-[#111326]/60 border border-brand-500/10 text-slate-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
                    <span className="text-xs font-semibold">AI Interviewer is formulating feedback & next prompt...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Form input footer area */}
          <div className="border-t border-white/5 p-4 bg-slate-950/40 backdrop-blur-md">
            <div className="max-w-3xl mx-auto">
              {!isCompleted ? (
                <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                  <div className="flex-1 relative">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                      placeholder={isRecording ? "Listening..." : "Type your response here... (Press Enter to submit, Shift+Enter for newline)"}
                      rows={2}
                      className="w-full bg-slate-950/77 border border-white/10 rounded-2xl py-3 pl-12 pr-12 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm resize-none custom-scrollbar"
                    />
                    {/* Microphone Dictation Button */}
                    <button
                      type="button"
                      onClick={toggleRecording}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all cursor-pointer ${
                        isRecording 
                          ? "bg-red-500 text-white animate-pulse" 
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                      title={isRecording ? "Stop dictation" : "Start dictation"}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isTyping}
                    className={`p-3.5 rounded-2xl border flex items-center justify-center transition-all ${
                      inputText.trim() && !isTyping
                        ? "bg-brand-600 hover:bg-brand-500 text-white border-brand-500/20 shadow-lg shadow-brand-500/20"
                        : "bg-white/5 text-slate-600 border-white/5 cursor-not-allowed"
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="flex items-center justify-center gap-2 text-accent-emerald text-sm font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    <span>Mock Interview Completed Successfully!</span>
                  </div>
                  <button 
                    onClick={handleEndSession}
                    className="glow-btn bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl border border-brand-500/20 shadow-lg flex items-center justify-center gap-2 mx-auto text-sm transition-all"
                  >
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    View Detailed Performance Scorecard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Tips and Coaching Sidebar (Right Column) */}
        <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/5 glass-panel p-6 shrink-0 z-10 overflow-y-auto custom-scrollbar h-[calc(100vh-68px)]">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent-cyan" />
            Live Interview Coaching
          </h3>

          <div className="space-y-6 text-xs leading-relaxed text-slate-400">
            {/* Tip 1 */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
              <span className="text-slate-200 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-brand-500" />
                Explain your thought process
              </span>
              <p>
                Don't just write short answers. Explain the "why" and "how". Detail runtime trade-offs and alternative strategies.
              </p>
            </div>

            {/* Tip 2 */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5">
              <span className="text-slate-200 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-accent-cyan" />
                Use structural frameworks
              </span>
              <p>
                When answering behavioral questions, use the **STAR** method: **S**ituation, **T**ask, **A**ction, **R**esult.
              </p>
            </div>

            {/* Hint list */}
            <div className="space-y-2">
              <span className="text-slate-300 font-semibold block">Topics commonly asked in React:</span>
              <div className="flex flex-wrap gap-1.5">
                {["Reconciliation", "Hooks lifecycle", "Context API", "React.memo", "Hydration", "Strict Mode"].map((topic, i) => (
                  <span key={i} className="bg-white/5 border border-white/5 text-[10px] text-slate-400 px-2 py-1 rounded-lg">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <div className="flex gap-2 text-slate-500 text-[10px] items-start leading-normal">
                <ShieldAlert className="w-4 h-4 shrink-0 text-slate-600 mt-0.5" />
                <p>
                  Interview sessions are strictly text-based as per constraints. Your scores will be stored locally.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
