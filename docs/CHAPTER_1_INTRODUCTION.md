# CHAPTER 1. INTRODUCTION

## 1.1 Project Background

In the contemporary job market, securing employment presents a substantial challenge that extends beyond individual qualifications. Over the last two decades, recruitment procedures have shifted dramatically due to the widespread integration of Applicant Tracking Systems (ATS) and automated candidate screening platforms. An ATS is a software system designed to collect, parse, and rank job applications automatically according to predefined rules before any recruiter inspects the document (Cappelli, 2019). Data from Jobscan (2025) indicates that approximately 98% of Fortune 500 companies and nearly 75% of mid-sized organizations rely on ATS software to manage incoming applications. Consequently, for the majority of job vacancies, an algorithmic filter makes the initial decision regarding whether a candidate's resume reaches human review.

Automated screening processes introduce significant challenges for job seekers. Research published by Harvard Business School demonstrates that standard ATS filtering routinely excludes qualified candidates — described as "hidden workers" — due to rigid keyword matching parameters or parsing failures caused by non-standard visual formatting (Fuller et al., 2021). The study estimated that over 27 million applicants in the United States fall into this category. This form of algorithmic filtering disproportionately impacts entry-level graduates, career changers, and applicants from non-traditional educational backgrounds, as these groups are less likely to align their resume phrasing with specific corporate keywords (Bogen and Rieke, 2018).

Surmounting the initial resume screen represents only the first stage of recruitment. Once short-listed, candidates face technical and behavioural interviews. While structured interviews remain one of the most reliable methods for evaluating candidate competency (Levashina et al., 2014), many job seekers enter interviews without structured practice or objective performance feedback. Commercial interview coaching services in the UK typically cost between £100 and £200 per hour, rendering professional preparation inaccessible for many students and recent graduates (Barrick, Shaffer and DeGrassi, 2009). Advances in large language models (LLMs) such as Google Gemini create an opportunity to deliver accessible, personalized interview preparation without financial cost.

To address these dual challenges, the **HireReady** platform was conceptualised. HireReady functions as a unified, free, AI-powered career mentorship application. It enables candidates to evaluate resumes against ATS parsing parameters, construct ATS-compliant documents, engage in turn-based mock interview simulations with automated feedback, and follow structured learning roadmaps to address identified technical skill gaps.

## 1.2 Problem Statement

An examination of current commercial career preparation platforms (detailed in Chapter 3) reveals four primary limitations affecting job seekers:

1. **Fragmentation across disconnected tools.** Candidates currently utilize separate applications for resume scanning (e.g., Jobscan), resume creation (e.g., Rezi), interview preparation (e.g., Pramp), and skill acquisition (e.g., Coursera). Entering personal data across multiple independent tools introduces unnecessary friction and prevents consolidated progress tracking.
2. **Absence of integrated mock interview practice on document tools.** Commercial resume screeners focus exclusively on text formatting and keyword match percentages. Existing document tools do not provide embedded, turn-based interview practice with automated scoring, forcing candidates to prepare documents and interview responses in isolation.
3. **Identification of skill gaps without guided remediation.** Standard resume screeners highlight missing competencies (such as Docker or React) but do not provide structured learning pathways to acquire those skills, leaving candidates without clear next steps.
4. **Subscription paywalls restricting access.** Core features on competing platforms — including detailed keyword evaluations, AI text rewriting, and mock interviews — are restricted behind monthly subscriptions ranging from $19 to $50 per month. These fees present a barrier for students and unemployed graduates (NACE, 2023).

## 1.3 Aims and Objectives

The primary aim of this project is to design, develop, and evaluate HireReady: a free, integrated AI career mentorship application combining resume scanning, resume building, mock interview practice, and skill gap roadmaps within a single web workspace.

To achieve this overall aim, five specific objectives were defined:

- **Objective 1: Authentication & Profile Management.** Implement a secure user registration and login system utilizing bcrypt password hashing (salt factor 10) and stateless JWT cookies, allowing users to update profiles and execute complete account data deletion.
- **Objective 2: AI ATS Resume Scanner.** Develop a server-side document parser supporting PDF and DOCX document formats that transmits extracted text to the Google Gemini API to return match scores, missing keyword badges, formatting warnings, and actionable feedback.
- **Objective 3: Interactive Resume Builder.** Create a multi-step form editor featuring live split-screen previewing, an AI-powered summary rewrite tool, template choices, and browser-native PDF export.
- **Objective 4: Mock Interview Simulator.** Build a turn-based technical interview chatbot that adapts questions according to candidate job roles and difficulty levels, delivering automated feedback across technical accuracy, communication quality, and grammar.
- **Objective 5: Skill Gap Roadmap Engine.** Develop an engine comparing candidate profile skills against target job role requirements, utilizing Gemini to construct sequential 4-module learning plans and updating user profile skills upon module completion.

## 1.4 Project Scope

### 1.4.1 Included in Scope

- User account registration, authentication, and profile settings management.
- PDF and DOCX file upload processing with server-side text extraction.
- AI-driven ATS resume evaluation utilizing the Gemini API with sequential model failover logic. The orchestrator follows a Sequential Model Fallback Chain: `gemini-3.5-flash → gemini-3.5-flash-lite → gemini-2.0-flash → gemini-2.0-flash-lite`. If the primary model returns a 429 (rate‑limit) or other failure, the system automatically retries the next model in the chain, ensuring stability.
- Saved resume scan history logging and past report deletion.
- Multi-step resume builder form wizard with live preview and AI summary enhancement.
- Browser print-based PDF export formatted for ATS compliance.
- Interactive turn-based mock interview chatbot with adjustable difficulty and question limits.
- Automatic interview transcript grading providing radial scores and sample answers.
- Speech-to-text dictation and text-to-speech audio narration for accessibility.
- 4-module sequential learning roadmaps with module locking and automatic profile skill synchronization.
- Responsive dark-mode glassmorphic user interface.

### 1.4.2 Excluded from Scope

- Live video recording or real-time facial expression analysis.
- Recruiter or hiring manager administration panels.
- Direct API integration with corporate ATS platforms (e.g., Workday, Greenhouse).
- Cloud hosting deployment (evaluated within a local development environment).
- Multi-language translation capabilities.
- Third-party social OAuth authentication (Google or GitHub sign-in).

## 1.5 Target Users

HireReady is designed to support three primary user groups:

1. **University students and recent graduates** entering the job market who have little to no experience with ATS software or structured interview methods.
2. **Career changers and mid-level job seekers** moving into new technical industries who need to identify and bridge specific skill gaps.
3. **Job seekers on tight budgets**, including students in developing nations, for whom monthly subscription fees for career tools are a real financial barrier.

## 1.6 Report Structure

This report is divided into twelve chapters following the software development lifecycle:

- **Chapter 1 (Introduction):** Sets out the background context, problem statement, aims, objectives, and scope.
- **Chapter 2 (Literature Review):** Reviews research behind ATS systems, recruitment NLP, intelligent tutoring systems, LLMs, Next.js architecture, and DSDM agile methods.
- **Chapter 3 (Comparative Analysis):** Compares Jobscan, Rezi, and Resume Worded to highlight existing platform gaps.
- **Chapter 4 (Legal, Ethical, Social, Professional Issues):** Explains GDPR data handling, AI bias reduction, accessibility tools, and BCS professional ethics.
- **Chapter 5 (Requirements Specification):** Lists functional and non-functional requirements prioritized with MoSCoW.
- **Chapter 6 (System Design):** Outlines full-stack system architecture, database ERD schema, UML class diagrams, and design tokens.
- **Chapters 7–10 (Implementation Timeboxes):** Documents technical execution across Timeboxes 1 through 4.
- **Chapter 11 (Evaluation of the System):** Evaluates requirement fulfillment, AI system stability, performance, security, and usability.
- **Chapter 12 (Conclusion and Future Work):** Summarizes overall project outcomes, limitations, and future feature ideas.

---

### References (Chapter 1)

- Barrick, M.R., Shaffer, J.A. and DeGrassi, S.W. (2009) 'What you see may not be what you get: Relationships among self-presentation tactics and ratings of interview and job performance', *Journal of Applied Psychology*, 94(6), pp. 1394–1411.
- Bogen, M. and Rieke, A. (2018) *Help Wanted: An Examination of Hiring Algorithms, Equity, and Bias*. Washington, DC: Upturn.
- Cappelli, P. (2019) 'Your Approach to Hiring Is All Wrong', *Harvard Business Review*, 97(3), pp. 48–58.
- Fuller, J.B., Raman, M., Sage-Gavin, E. and Hines, K. (2021) *Hidden Workers: Untapped Talent*. Boston, MA: Harvard Business School Publishing.
- Jobscan (2025) *About Jobscan: ATS Resume Optimization*. Available at: https://www.jobscan.co/about (Accessed: 15 August 2026).
- Levashina, J., Hartwell, C.J., Morgeson, F.P. and Campion, M.A. (2014) 'The Structured Employment Interview: Narrative and Quantitative Review of the Research Literature', *Personnel Psychology*, 67(1), pp. 241–293.
- National Association of Colleges and Employers (2023) *Student Survey Report 2023*. Bethlehem, PA: NACE.

