# CHAPTER 10: EVALUATION AND RESULTS

## 10.1 Evaluation Against Objectives

The table below evaluates whether each objective defined in Chapter 1 was successfully achieved.

| Objective | Description | Met? | Evidence |
|:--|:--|:--|:--|
| **Obj 1** | Secure authentication and profile management | ✅ Yes | User registration, login, profile CRUD, password update, and cascade account deletion all implemented and tested. Bcrypt hashing and JWT cookies verified. |
| **Obj 2** | AI-powered ATS resume scanner (PDF + DOCX) | ✅ Yes | Both PDF and DOCX parsing working via pdf-parse and mammoth. Gemini API returns match scores, missing keywords, formatting issues, and suggestions. Scan history saved. |
| **Obj 3** | Interactive resume builder with AI enhancement | ✅ Yes | Multi-step wizard form, AI summary enhancer, 3 layout templates, customisable accent colours, and browser PDF export all functional. |
| **Obj 4** | Turn-based mock interview simulator with AI grading | ✅ Yes | Configurable interviews (role, difficulty, question count). Turn-based chat with AI. End-of-session grading across overall, grammar, and technical scores with detailed analysis. |
| **Obj 5** | Personalised career skill roadmap engine | ✅ Yes | AI generates 4-module sequential roadmap. Modules unlock progressively. Completing a module auto-syncs new skills to user profile. |

**Result: All 5 objectives were fully achieved.**

## 10.2 Requirements Fulfilment Summary

| Priority | Total | Implemented | Rate |
|:--|:--|:--|:--|
| Must-Have (FR-01 to FR-07) | 7 | 7 | **100%** |
| Should-Have (FR-08 to FR-12) | 5 | 5 | **100%** |
| Could-Have (FR-13 to FR-16) | 4 | 4 | **100%** |
| Won't-Have (FR-17 to FR-19) | 3 | 0 (excluded by design) | N/A |
| Non-Functional (NFR-01 to NFR-10) | 10 | 10 | **100%** |

All Must-Have, Should-Have, and Could-Have requirements were delivered. The effective timebox planning and MoSCoW prioritisation ensured that even the Could-Have features were completed within the development timeline.

## 10.3 System Strengths

1. **Unified Platform:** HireReady is the only system reviewed in Chapter 3 that combines resume scanning, resume building, mock interviews, and career roadmapping in a single application with shared data flow.

2. **AI Resilience:** The sequential 4-model fallback chain with double-pass JSON parsing ensures that AI features remain operational even when individual Gemini models are rate-limited or unavailable.

3. **Zero Cost:** Unlike Jobscan ($49.95/month), Rezi ($29/month), and Resume Worded ($19/month), HireReady offers all features completely free with no usage limits.

4. **Data Privacy:** Resume files are processed in-memory and never permanently stored. Cascade deletion ensures complete data erasure when users delete their accounts.

5. **Closed-Loop Data Flow:** Skills extracted from resume scans feed into the user profile, which informs both the roadmap generator and interview question targeting — creating a connected preparation experience.

## 10.4 System Limitations

An honest evaluation must also acknowledge the system's weaknesses:

1. **No Real ATS Validation:** The system uses Gemini to simulate ATS analysis, but it does not connect to actual corporate ATS platforms (e.g., Workday, Greenhouse). The match scores are AI-estimated, not verified against real employer systems.

2. **AI Hallucination Risk:** Gemini can occasionally generate inaccurate suggestions, irrelevant keywords, or generic roadmap content. While prompt engineering reduces this, it cannot eliminate it entirely (Ji et al., 2023).

3. **No Automated Testing:** Due to time constraints, all testing was manual. Automated testing with Jest or Playwright would improve regression coverage and long-term maintainability.

4. **Single-User Architecture:** The system runs on a local development server. No cloud deployment, load balancing, or production infrastructure was implemented.

5. **Text-Only Interviews:** The mock interview uses text chat only. Real interviews involve body language, tone of voice, and facial expressions, which cannot be assessed in a text-based system.

## 10.5 Lessons Learned

1. **Prompt Engineering is Critical:** The quality of AI outputs depended heavily on how prompts were structured. Adding explicit JSON schemas, role assignments, and constraint boundaries dramatically improved response consistency.

2. **Fallback Design Saves Projects:** Implementing the model fallback chain early prevented multiple development blockers when individual Gemini models hit rate limits during testing.

3. **MoSCoW Works:** Strictly prioritising features prevented scope creep. The Must-Have features were solid before any Should-Have work began.

4. **In-Memory Processing is Safer:** Processing resume files as Buffers rather than saving them to disk simplified both the security model and the data deletion logic.
