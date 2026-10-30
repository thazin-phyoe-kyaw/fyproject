# CHAPTER 3: COMPARATIVE ANALYSIS OF EXISTING SYSTEMS

## 3.1 Overview of Existing Platforms

Before designing the HireReady system, a comprehensive review of the most prominent commercial platforms operating in the AI-assisted career preparation domain was conducted. The purpose of this analysis was to identify existing capabilities, assess market maturity, and critically evaluate functional limitations that present opportunities for innovation. Three platforms were selected for review based on their industry prominence, user adoption rates, and relevance to the project's target use case: **Jobscan**, **Rezi**, and **Resume Worded**. Each platform was evaluated across six key dimensions: ATS keyword analysis, resume building, mock interview preparation, career progression guidance, pricing accessibility, and technology integration depth.

### 3.1.1 Jobscan

Jobscan (https://www.jobscan.co) is one of the most widely adopted ATS resume optimization tools, serving over 1.5 million users globally (Jobscan, 2025). The platform's core value proposition centres on comparing a candidate's uploaded resume against a specific job description to calculate an ATS match rate. Users paste their resume text and a target job description into the Jobscan interface, and the system returns a percentage score alongside a list of missing hard skills, soft skills, and formatting recommendations.

**Core Features:**
- **Keyword Matching Engine:** Compares resume tokens against job description keywords, generating match rate percentages for hard skills, soft skills, and job title alignment.
- **ATS Compatibility Checker:** Scans document formatting to detect elements known to cause parsing failures in corporate ATS platforms (e.g., tables, headers/footers, graphics, non-standard fonts).
- **LinkedIn Profile Optimization:** Extends analysis beyond resumes to LinkedIn profiles, checking headline strength, summary keywords, and section completeness.
- **Cover Letter Generator:** Uses AI to draft cover letters tailored to specific job descriptions.
- **Job Tracker Dashboard:** Allows users to track job applications and save historical scan results.

**Pricing Model:** Jobscan operates on a freemium-to-subscription model. Free users are limited to approximately 5 scans per month. The full-access subscription is priced at approximately $49.95 per month (or $89.95 for a quarterly plan), placing it firmly in the premium tier for individual job seekers.

### 3.1.2 Rezi

Rezi (https://www.rezi.ai) positions itself as an "AI-powered resume builder" that combines structured resume creation with AI writing assistance. Founded in 2018, the platform has gained traction among technology professionals and career changers due to its emphasis on ATS-compliant formatting and AI-generated bullet point writing.

**Core Features:**
- **AI Resume Builder:** Provides a structured, step-by-step resume editor with predefined templates that enforce ATS-friendly single-column layouts.
- **AI Bullet Point Writer:** Uses GPT-based models to generate or rewrite work experience bullet points based on job title, company, and responsibility descriptions.
- **ATS Resume Checker:** Analyses completed resumes for ATS compatibility issues, including section ordering, font readability, and keyword density.
- **AI Cover Letter and Resignation Letter Generators:** Extends AI writing capabilities to additional job application documents.
- **Template Library:** Offers multiple resume layout templates categorised by industry (e.g., technology, finance, creative).

**Pricing Model:** Rezi offers a limited free tier that allows users to create one resume with basic formatting. The Pro plan is priced at approximately $29 per month, with a lifetime access option at $129. AI writing features (bullet point generation, cover letters) are available exclusively on the Pro plan.

### 3.1.3 Resume Worded

Resume Worded (https://resumeworded.com) is an AI-driven resume and LinkedIn profile review platform developed with input from recruitment professionals at firms including Goldman Sachs and Google. The platform is notable for its emphasis on actionable, line-by-line feedback rather than a single aggregate score.

**Core Features:**
- **Score My Resume:** Uploads a resume in PDF format and returns a score out of 100 alongside categorised feedback across impact, brevity, style, sections, and skills dimensions.
- **Targeted Resume Analysis:** Allows users to specify a target job title, after which the AI tailors its feedback to the requirements typical of that role.
- **LinkedIn Review:** Analyses LinkedIn profiles and provides specific recommendations for headline optimisation, summary enhancement, and experience section improvements.
- **Sample Bullet Points Library:** Curates a library of strong bullet point examples organised by job function to serve as writing references.
- **Networking Email Generator:** Generates professional networking outreach emails based on user context.

**Pricing Model:** Resume Worded provides a free tier offering limited resume reviews per month. The Pro subscription is priced at approximately $19 per month (or $79 per year), positioning it as the most affordable of the three competitors analysed.

---

## 3.2 Feature-by-Feature Comparison

To establish a rigorous and objective basis for evaluating the capabilities of existing platforms against the proposed HireReady system, a structured feature comparison matrix was developed. The matrix evaluates each platform across eighteen critical functional dimensions that collectively represent the requirements of a comprehensive AI-powered career mentoring solution. Each feature is rated using a standardised assessment scale:

- **✅ Full Support** — Feature is fully implemented and functional.
- **⚠️ Partial Support** — Feature exists but with significant limitations.
- **❌ Not Available** — Feature is not present in the platform.

### Table 3.1: Comparative Feature Matrix

| # | Feature Dimension | Jobscan | Rezi | Resume Worded | HireReady (Proposed) |
|:--|:--|:--:|:--:|:--:|:--:|
| 1 | ATS Resume Keyword Analysis | ✅ Full | ⚠️ Partial | ✅ Full | ✅ Full |
| 2 | Resume Match Score (%) | ✅ Full | ⚠️ Partial | ✅ Full | ✅ Full |
| 3 | Missing Keyword Identification | ✅ Full | ❌ Not Available | ✅ Full | ✅ Full |
| 4 | Formatting and Layout Issue Detection | ✅ Full | ✅ Full | ⚠️ Partial | ✅ Full |
| 5 | AI-Powered Resume Builder | ❌ Not Available | ✅ Full | ❌ Not Available | ✅ Full |
| 6 | AI Summary/Bullet Enhancer | ❌ Not Available | ✅ Full | ❌ Not Available | ✅ Full |
| 7 | Interactive Mock Interview Simulator | ❌ Not Available | ❌ Not Available | ❌ Not Available | ✅ Full |
| 8 | AI Performance Grading (Interview) | ❌ Not Available | ❌ Not Available | ❌ Not Available | ✅ Full |
| 9 | Personalised Career Skill Roadmap | ❌ Not Available | ❌ Not Available | ❌ Not Available | ✅ Full |
| 10 | Sequential Skill Progression Tracking | ❌ Not Available | ❌ Not Available | ❌ Not Available | ✅ Full |
| 11 | PDF/DOCX Multi-Format Upload | ⚠️ PDF Only | ⚠️ PDF Only | ⚠️ PDF Only | ✅ Full |
| 12 | Resume Export to PDF | ❌ Not Available | ✅ Full | ❌ Not Available | ✅ Full |
| 13 | Free Unlimited Core Access | ❌ Paywalled | ❌ Paywalled | ❌ Paywalled | ✅ Full |
| 14 | Job Description Required for Scan | ✅ Required | ⚠️ Optional | ❌ Not Required | ❌ Not Required |
| 15 | API Model Failover Resilience | ❌ Unknown (Proprietary) | ❌ Unknown (Proprietary) | ❌ Unknown (Proprietary) | ✅ Full |
| 16 | Speech-to-Text Interview Input | ❌ Not Available | ❌ Not Available | ❌ Not Available | ✅ Full |
| 17 | Text-to-Speech AI Question Narration | ❌ Not Available | ❌ Not Available | ❌ Not Available | ✅ Full |
| 18 | Automatic Profile Skill Extraction | ❌ Not Available | ❌ Not Available | ❌ Not Available | ✅ Full |

### 3.2.1 Analysis of Feature Distribution

The comparison matrix reveals several critical observations:

1. **No existing platform provides an integrated mock interview simulator.** All three competitors focus exclusively on document-level analysis (resumes, LinkedIn profiles, cover letters) and do not address the interview preparation phase of the job application lifecycle. This is a significant gap, as interview performance is consistently cited as the most decisive factor in hiring outcomes (Huffcutt and Arthur, 1994; Levashina et al., 2014).

2. **Career progression and skill development are entirely absent.** None of the evaluated platforms offer structured learning roadmaps or skill gap remediation pathways. Candidates are left to independently determine how to address the weaknesses identified in their resume scans, which creates an incomplete feedback loop.

3. **All competitors enforce paywall restrictions on core features.** While each platform offers a limited free tier, the most valuable analytical features (detailed keyword reports, AI-generated content, historical tracking) require paid subscriptions ranging from $19 to $49.95 per month. This pricing structure creates a significant barrier for entry-level candidates, university students, and job seekers in developing economies who stand to benefit most from career preparation tools.

4. **File format support is universally limited.** All three competitors accept only PDF uploads for resume scanning. Candidates who draft their resumes in Microsoft Word (.docx format) — which remains the most common document creation tool in academic and professional contexts (Rieh and Xie, 2006) — must manually convert their files before scanning, adding unnecessary friction to the user workflow.

---

## 3.3 Identification of System Drawbacks and Gaps

This section critically examines the key limitations identified across the three existing platforms, structured into thematic categories that informed the design priorities for HireReady.

### 3.3.1 Gap 1: Absence of Interview Preparation Tools

The most significant limitation shared by all three platforms is the complete absence of interactive interview practice functionality. While Jobscan, Rezi, and Resume Worded effectively help candidates prepare their application documents, they abandon the candidate at the point where document preparation ends and interview preparation begins. This creates a **broken career preparation pipeline**: candidates may submit ATS-optimised resumes that successfully pass automated screening, only to underperform in subsequent interview rounds due to lack of preparation.

Research by Barrick, Shaffer, and DeGrassi (2009) demonstrates that structured interview practice with targeted feedback significantly improves candidate performance. The absence of this capability in existing platforms forces candidates to seek separate, often expensive, interview preparation services (e.g., Pramp, Interviewing.io, or private coaching sessions costing $100–$300 per hour).

HireReady addresses this gap through its **Turn-Based Mock Interview Simulator**, which conducts customisable mock interviews across configurable difficulty levels (Junior, Mid, Senior), question counts (5, 10, 15), and target job roles, followed by structured AI grading across technical accuracy, communication quality, and grammar.

### 3.3.2 Gap 2: No Structured Skill Gap Remediation

When a resume scan identifies missing keywords or skill deficiencies, existing platforms merely list these gaps without providing any actionable pathway for the candidate to acquire the missing competencies. For example, if Jobscan identifies that a candidate is missing "Docker" and "Kubernetes" from their resume, the platform does not suggest how, where, or in what order the candidate should learn these technologies. This limitation leaves candidates in a state of **informational overload without directional guidance**.

HireReady addresses this gap through its **AI Career Roadmap Compiler**, which takes the candidate's existing skills, target job role, experience level, and preferred learning pace as inputs, and generates a structured, sequential 4-module learning path using the Google Gemini API. Each module includes estimated time commitments, core concepts to learn, and recommended learning resources. The sequential locking mechanism ensures candidates follow a logically ordered progression, and completing modules automatically updates the candidate's profile skills, simulating real career growth.

### 3.3.3 Gap 3: Fragmented Tooling Across Multiple Platforms

Current market solutions force candidates to use multiple disconnected tools to manage different phases of their career preparation:
- **Jobscan or Resume Worded** for resume analysis.
- **Rezi** for resume building.
- **A separate platform** (e.g., Pramp, LeetCode, Interviewing.io) for interview practice.
- **Another platform** (e.g., Coursera, Udemy, Roadmap.sh) for skill development.

This fragmentation creates several problems: inconsistent user experiences across platforms, duplicated data entry (e.g., re-entering job roles and skills on each platform), inability to track holistic progress, and increased subscription costs across multiple services.

HireReady consolidates all four phases — **resume analysis**, **resume building**, **interview simulation**, and **skill roadmapping** — into a single, unified platform with a shared user profile and database. Skills identified through resume scanning automatically populate the user's profile, which then feeds into both the roadmap generator and the interview simulator, creating a **closed-loop career preparation ecosystem**.

### 3.3.4 Gap 4: Financial Accessibility Barriers

The cumulative cost of accessing premium features across competing platforms presents a significant financial barrier:

| Platform | Monthly Cost | Annual Cost |
|:--|:--|:--|
| Jobscan (Premium) | $49.95 | ~$599 |
| Rezi (Pro) | $29.00 | ~$348 |
| Resume Worded (Pro) | $19.00 | $79 |
| **Combined (all three)** | **$97.95** | **~$1,026** |

*Table 3.3: Cumulative subscription costs for accessing premium career preparation features.*

For university students, recent graduates, and job seekers in emerging markets — the demographics most in need of career preparation support — these costs are prohibitive. A survey by the National Association of Colleges and Employers (NACE, 2023) found that 72% of graduating students report financial constraints as a barrier to accessing professional development tools.

HireReady is designed as a **completely free, open-access platform** with no feature gating, no subscription tiers, and no usage limits on core functionality. This design decision is rooted in the project's academic ethos and its commitment to democratising access to AI-powered career mentoring.

### 3.3.5 Gap 5: Limited AI Resilience and Transparency

All three commercial platforms operate on proprietary, closed-source AI pipelines. Users have no visibility into the models used, no control over fallback behaviour when APIs fail, and no ability to verify the reasoning behind AI-generated recommendations. When API rate limits or service disruptions occur, users typically encounter generic error messages with no graceful degradation.

HireReady implements a **transparent, sequential AI model fallback chain** that automatically cycles through four Gemini model variants (`gemini-3.5-flash` → `gemini-3.5-flash-lite` → `gemini-2.0-flash` → `gemini-2.0-flash-lite`) when rate limits (HTTP 429) or deprecation errors (HTTP 404) are encountered. Additionally, a **double-pass JSON parser** with regex recovery ensures that even malformed AI responses are salvaged into usable structured data, preventing application crashes. These mechanisms are fully documented in the codebase and traceable through server-side logging.

### 3.3.6 Gap 6: No Dual Document Format Support

As identified in the feature matrix (Table 3.1, Row 11), all three competitors limit resume uploads to PDF format exclusively. This creates unnecessary friction for the significant user base that drafts resumes in Microsoft Word (.docx), which remains the dominant document creation format in both academic and professional settings. Users are forced to manually convert their Word documents to PDF before uploading, introducing an additional step that can deter less technically proficient candidates.

HireReady supports both **PDF and DOCX** formats natively, using `pdf-parse` for PDF binary parsing and `mammoth` for DOCX text extraction. Both parsers operate directly on in-memory Buffers, eliminating the need for permanent file storage and enhancing user data privacy.

---

## 3.4 Justification of the Proposed HireReady Solution

### 3.4.1 Synthesis of Identified Gaps

The comparative analysis conducted in Sections 3.2 and 3.3 reveals a consistent pattern: existing commercial platforms deliver strong but narrowly scoped solutions that address individual phases of the career preparation lifecycle in isolation, while leaving critical gaps in interview readiness, skill development, platform integration, financial accessibility, and AI resilience. Table 3.4 summarises the mapping between identified gaps and HireReady's corresponding design responses.

### Table 3.4: Gap-to-Solution Traceability Matrix

| Gap ID | Identified Gap | HireReady Response | Implementation Module |
|:--|:--|:--|:--|
| G-01 | No interactive interview preparation | Turn-based mock interview simulator with AI grading | Timebox 4: Interview Simulator |
| G-02 | No structured skill gap remediation | AI-compiled 4-module career roadmap with sequential locking | Timebox 3: Career Roadmap Compiler |
| G-03 | Fragmented tooling across platforms | Unified platform with shared profile and closed-loop data flow | All Timeboxes (Integrated Architecture) |
| G-04 | Financial barriers (paywalled features) | Fully free, open-access platform with no usage limits | System-wide design decision |
| G-05 | Limited AI resilience and transparency | Sequential model fallback chain with regex JSON recovery | Timebox 2: Gemini Fallback Engine |
| G-06 | PDF-only upload support | Native PDF and DOCX parsing with in-memory Buffers | Timebox 2: Document Parser Engine |

### 3.4.2 Why Existing Platforms Cannot Be Extended

A natural question arising from this analysis is whether it would be more practical to extend an existing platform rather than build a custom solution. Three factors justify the development of a bespoke system:

1. **Proprietary Lock-In:** All three platforms operate as closed-source commercial products. Their APIs, data models, and AI pipelines are not available for academic research, customisation, or extension. Building upon them would require licensing agreements that are both financially and legally prohibitive for an academic project.

2. **Architectural Incompatibility:** The interview simulation and career roadmapping features identified as critical gaps require fundamental architectural components — stateful turn-based session management, sequential module locking, and profile skill syncing — that do not exist in any of the evaluated platforms. Retrofitting these capabilities into an existing system would require access to its source code and database schema, which is not possible with proprietary software.

3. **Academic Research Requirements:** This project is undertaken as a Final Year Software Engineering Project with the objective of demonstrating competency in full-stack system design, AI integration, database engineering, and agile development methodology. Building upon an existing third-party platform would not satisfy the requirement to demonstrate end-to-end engineering capability.

### 3.4.3 The HireReady Value Proposition

Based on the analysis presented in this chapter, HireReady is positioned as a **unified, free, AI-powered career mentoring co-pilot** that addresses the six critical gaps identified across the competitive landscape. The platform is architected to deliver:

1. **End-to-End Career Preparation:** From resume scanning and building to interview simulation and skill development, all within a single platform.
2. **Intelligent Data Flow:** Skills extracted from resume scans automatically feed into profile data, which informs both roadmap generation and interview question targeting, creating a cohesive and contextually aware preparation experience.
3. **Resilient AI Integration:** The sequential model fallback chain and double-pass JSON parser ensure that AI-powered features remain available even under adverse conditions (rate limits, malformed outputs, model deprecations).
4. **Zero-Cost Access:** All features are available without subscriptions, paywalls, or usage limits, ensuring equitable access for all candidates regardless of financial circumstances.
5. **Academic Rigour:** The system is developed using industry-standard technologies (Next.js 16, React 19, Prisma ORM, PostgreSQL, Google Gemini API) and follows the DSDM Agile methodology with timeboxed delivery, MoSCoW prioritisation, and comprehensive test plans.

---

## 3.5 Chapter Summary

This chapter conducted a systematic comparative analysis of three leading commercial platforms — Jobscan, Rezi, and Resume Worded — to evaluate the current state of AI-assisted career preparation tools and identify opportunities for innovation. The analysis revealed six critical gaps: the absence of interactive interview preparation, the lack of structured skill gap remediation, fragmented tooling requiring multiple platform subscriptions, prohibitive pricing for target demographics, limited AI resilience and transparency, and restrictive file format support. The proposed HireReady system directly addresses each identified gap through purpose-built modules delivered across four agile timeboxes, establishing a clear and evidence-based justification for the development of a custom solution.

---

### References (Chapter 3)

- Barrick, M.R., Shaffer, J.A. and DeGrassi, S.W. (2009) 'What you see may not be what you get: Relationships among self-presentation tactics and ratings of interview and job performance', *Journal of Applied Psychology*, 94(6), pp. 1394–1411.
- Huffcutt, A.I. and Arthur, W. (1994) 'Hunter and Hunter (1984) revisited: Interview validity for entry-level jobs', *Journal of Applied Psychology*, 79(2), pp. 184–190.
- Jobscan (2025) *About Jobscan: ATS Resume Optimization*. Available at: https://www.jobscan.co/about (Accessed: 15 August 2026).
- Levashina, J., Hartwell, C.J., Morgeson, F.P. and Campion, M.A. (2014) 'The Structured Employment Interview: Narrative and Quantitative Review of the Research Literature', *Personnel Psychology*, 67(1), pp. 241–293.
- National Association of Colleges and Employers (2023) *Student Survey Report 2023*. Bethlehem, PA: NACE.
- Rezi (2025) *AI Resume Builder*. Available at: https://www.rezi.ai (Accessed: 15 August 2026).
- Resume Worded (2025) *AI Resume Review and LinkedIn Optimization*. Available at: https://resumeworded.com (Accessed: 15 August 2026).
- Rieh, S.Y. and Xie, B. (2006) 'Analysis of multiple query reformulations on the web: The interactive information retrieval context', *Information Processing and Management*, 42(3), pp. 751–768.
