# CHAPTER 5: REQUIREMENTS ANALYSIS AND SPECIFICATION

## 5.1 Chapter Introduction

The purpose of this chapter is to define exactly what the HireReady platform must do, how its features are prioritised, and the technical standards it must meet to be considered successful.

When building a full-stack, AI-powered system within a fixed academic timeline, clear boundaries are essential. Without well-defined requirements, projects risk scope creep — where unplanned features are continuously added, causing delays and reducing overall quality (Stapleton, 2003). To manage the project scope effectively, the requirements listed below were derived directly from the core problems identified in Chapter 1: the barriers job seekers face with automated Applicant Tracking Systems (ATS), the lack of accessible interview preparation tools, the absence of structured skill remediation, and the financial barriers created by premium subscription models.

These requirements serve as the direct blueprint for the database architecture and system design detailed in Chapter 6. They ensure the platform remains stable, secure, and focused entirely on delivering maximum value to the end user.

---

## 5.2 Functional Requirements (MoSCoW Prioritisation)

Following the DSDM (Dynamic Systems Development Method) framework adopted for this project, the features of HireReady are categorised using **MoSCoW prioritisation**. This technique ensures the most critical parts of the application are built first, while less critical features can be adjusted or deferred if time runs short (Abrahamsson et al., 2002).

### 5.2.1 Must-Have Requirements (Core Features)

| Req ID | Requirement | Description |
|:--|:--|:--|
| **FR-01** | User Registration and Login | Users must be able to create an account with a name, email/username, and password, and log in securely to access the platform. |
| **FR-02** | User Profile Setup | Users must be able to set up a profile listing their target job role, experience level (Entry, Mid, Senior), and current skills. |
| **FR-03** | Resume Upload (PDF and DOCX) | The system must allow users to upload their resumes in PDF or Word (.docx) format and safely extract the text content from the file. |
| **FR-04** | AI Resume Scanning (ATS Analysis) | The system must use the Google Gemini API to compare the user's resume text against their target job role, calculating a match score, listing missing keywords, identifying formatting issues, and providing AI improvement suggestions. |
| **FR-05** | AI Mock Interview Simulator | The system must act as a virtual interviewer by asking professional questions one at a time based on the user's target job role and difficulty level, saving the full chat history in the database. |
| **FR-06** | Interview Performance Feedback | Once an interview session ends, the system must grade the entire chat transcript and give the user an overall score, a grammar score, a technical knowledge score, and a detailed written analysis with model answers. |
| **FR-07** | Secure Session Management | The system must use HTTP-only session cookies with JWT tokens to keep users logged in securely. Unauthenticated users must be blocked from accessing protected pages like the dashboard. |

### 5.2.2 Should-Have Requirements

| Req ID | Requirement | Description |
|:--|:--|:--|
| **FR-08** | AI Resume Builder | The system should provide a step-by-step form wizard that helps users create a new resume from scratch by filling in their personal details, work experience, education, and skills. |
| **FR-09** | AI Summary Enhancer | The system should use the Gemini API to rewrite a user's draft professional summary into a polished, action-oriented version tailored to their target job role. |
| **FR-10** | AI Career Skill Roadmap | The system should compare the user's current skills against their target role and generate a structured, 4-module learning plan showing what they need to learn next. |
| **FR-11** | Resume Scan History | The system should save all previous resume scan results so users can go back and review past reports at any time. |
| **FR-12** | Account Settings and Deletion | Users should be able to update their name and email, and permanently delete their account along with all associated data (resumes, interviews, roadmaps). |

### 5.2.3 Could-Have Requirements

| Req ID | Requirement | Description |
|:--|:--|:--|
| **FR-13** | Resume PDF Export | Users could download their built resume as a clean, ATS-friendly PDF file using the browser's print function. |
| **FR-14** | Interview Customisation | Users could be allowed to choose the number of interview questions (5, 10, or 15), the difficulty level (Junior, Mid, Senior), and paste an optional job description for more targeted questions. |
| **FR-15** | Sequential Roadmap Locking | The career roadmap could enforce a sequential order where users must complete Module 1 before Module 2 unlocks, and completing a module automatically adds those skills to the user's profile. |
| **FR-16** | Speech-to-Text and Text-to-Speech | The interview simulator could support voice input via the browser's Web Speech API and read AI questions aloud using speech synthesis for improved accessibility. |

### 5.2.4 Won't-Have Requirements (Excluded from This Project)

| Req ID | Requirement | Description |
|:--|:--|:--|
| **FR-17** | Video or Voice Mock Interviews | The system will strictly use text-based chat. It will not use webcams, voice recordings, or audio analysis for interview evaluation. |
| **FR-18** | Direct Job Applications | HireReady is only for practice and preparation. It will not connect to external job sites like LinkedIn or Indeed, and it will not apply for real jobs on behalf of the user. |
| **FR-19** | Multi-Language Support | The system will operate exclusively in English. Translation and localisation features are not included in this development cycle. |

---

## 5.3 Non-Functional Requirements (System Quality)

Non-functional requirements define the technical standards the system must meet to ensure it runs smoothly, securely, and reliably (Sommerville, 2016).

### 5.3.1 Performance

| Req ID | Requirement | Target |
|:--|:--|:--|
| **NFR-01** | Fast Page Loading | All pages must load in under 1.5 seconds on a standard broadband connection. |
| **NFR-02** | Responsive AI Feedback | The app must display a clear loading indicator within 2 seconds of a user action. |
| **NFR-03** | Concurrent User Capacity | The system must handle up to 50 active users at the same time without crashing. |

### 5.3.2 Security and Data Protection

| Req ID | Requirement | Target |
|:--|:--|:--|
| **NFR-04** | Password Encryption | All passwords must be hashed using bcrypt with a minimum salt factor of 10 (Provos and Mazières, 1999). |
| **NFR-05** | Encrypted Data Transmission | All data must be encrypted using SSL/TLS protocols (OWASP, 2021). |
| **NFR-06** | Hidden API Credentials | The Gemini API key, JWT secret, and database connection string must never be exposed to the client-side browser code. |

### 5.3.3 Usability and Design

| Req ID | Requirement | Target |
|:--|:--|:--|
| **NFR-07** | Responsive Design | The layout must function correctly on smartphones (360px+), tablets (768px+), and desktops (1024px+). |
| **NFR-08** | Simple Navigation | A user must be able to start an interview or scan a resume within 3 clicks from the dashboard. |

### 5.3.4 Reliability

| Req ID | Requirement | Target |
|:--|:--|:--|
| **NFR-09** | System Uptime | The application should be available 99.5% of the time during normal conditions. |
| **NFR-10** | Graceful Error Handling | If the Gemini API fails, the sequential model fallback chain should attempt alternative models before reporting failure. |

---

## 5.4 System Scope and Boundaries

### 5.4.1 Project Constraints

| Constraint | Impact |
|:--|:--|
| **Single Developer** | Design focuses on clean, maintainable code rather than complex microservice architectures. |
| **API Dependency** | HireReady depends on Google Gemini. The fallback chain mitigates but cannot eliminate this risk. |
| **Text-Based Files Only** | Cannot scan images, photos of handwritten resumes, or scanned documents without selectable text. |
| **No Automated Testing** | Uses manual testing with structured test plans rather than Jest or Playwright. |
| **Local Development** | Application is developed and tested locally. Cloud deployment is out of scope. |

### 5.4.2 Project Scope Matrix

| ✅ Included in Project Scope | ❌ Excluded from Project Scope |
|:--|:--|
| Reading resume text from PDF and DOCX files | Storing uploaded file binaries permanently in the database |
| Creating an interactive AI text chat for mock interviews | Using real video, audio, or webcam-based interaction |
| Grading user interview answers and providing detailed scores | Providing legal guarantees that the user will get a job |
| Saving user profiles, scan history, and chat records securely | Charging money or adding payment processing systems |
| Building structured resumes with multiple templates | Connecting to external job boards or submitting real applications |
| Generating personalised career learning roadmaps | Supporting languages other than English |
