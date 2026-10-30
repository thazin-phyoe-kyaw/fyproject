# CHAPTER 2: LITERATURE REVIEW

## 2.1 Applicant Tracking Systems and Automated Recruitment

### 2.1.1 Definition and Historical Context

An Applicant Tracking System (ATS) is a specialised software application designed to automate the administrative workflow of the recruitment process, from receiving and storing job applications to screening, ranking, and shortlisting candidates based on configurable criteria (Cappelli, 2019). The origins of ATS technology can be traced to the late 1990s, when early systems functioned primarily as digital filing cabinets that replaced paper-based application management. However, over the subsequent two decades, these systems evolved into sophisticated algorithmic gatekeepers that actively parse, tokenise, and evaluate the textual content of submitted resumes before any human reviewer encounters them (Sanchez-Monedero, Dencik and Edwards, 2020).

The adoption of ATS technology has become near-universal across the corporate recruitment landscape. Research by Jobscan (2025) indicates that over 98% of Fortune 500 companies deploy some form of ATS, while approximately 75% of mid-sized employers have adopted similar systems. This widespread adoption means that for the majority of job applications submitted in industrialised economies, the first evaluator of a candidate's qualifications is not a human recruiter but an algorithm configured to identify specific keywords, phrases, formatting patterns, and credential markers.

### 2.1.2 The Hidden Worker Problem

The reliance on algorithmic keyword matching introduces systemic risks of qualified candidate exclusion. Fuller et al. (2021), in a comprehensive study conducted by Harvard Business School in partnership with Accenture, coined the term "hidden workers" to describe the millions of candidates who are routinely filtered out by automated screening systems despite possessing the skills and experience required for the roles they apply to. The study estimated that over 27 million workers in the United States alone fall into this category, with the problem being most acute for career changers, candidates with non-traditional educational backgrounds, and those with employment gaps.

Bogen and Rieke (2018) further demonstrated that ATS keyword matching algorithms can inadvertently discriminate against candidates who describe their qualifications using terminology that does not precisely match the keywords configured by the hiring organisation. For example, a candidate who lists "people management" on their resume may be filtered out if the ATS is configured to search for "team leadership," despite the two phrases being semantically equivalent. This rigid lexical matching — as opposed to semantic understanding — represents one of the most significant limitations of contemporary ATS technology and provides a clear rationale for developing tools that help candidates align their resume language with employer expectations.

### 2.1.3 Resume Formatting and Structural Parsing

Beyond keyword matching, ATS platforms evaluate the structural formatting of submitted documents. Research by Zhao et al. (2021) found that resumes containing multi-column layouts, embedded tables, text boxes, headers and footers, or non-standard fonts frequently cause parsing failures in widely used ATS platforms such as Taleo, Workday, and Greenhouse. When a parsing failure occurs, the ATS may extract garbled or incomplete text, leading to artificially low keyword match scores regardless of the actual content quality. This finding underscores the importance of providing candidates with resume building tools that enforce ATS-compatible, single-column formatting — a design principle adopted in the HireReady Resume Builder module.

---

## 2.2 Natural Language Processing and Artificial Intelligence in Recruitment

### 2.2.1 Evolution of AI in Hiring

The application of artificial intelligence to recruitment has evolved through three distinct phases. The first phase, spanning roughly 2000 to 2015, was characterised by rule-based systems that matched candidates to job descriptions using predefined keyword dictionaries and Boolean search logic (Hmoud and Laszlo, 2019). The second phase, emerging around 2015 to 2020, introduced machine learning classifiers trained on historical hiring data to predict candidate suitability, though these systems were criticised for perpetuating historical biases present in their training data (Raghavan et al., 2020). The third and current phase, beginning approximately in 2022, leverages large language models (LLMs) to perform sophisticated natural language understanding tasks including semantic matching, contextual evaluation, and generative content creation (Black and van Esch, 2020).

### 2.2.2 Semantic Analysis versus Lexical Matching

A critical distinction in the literature is between lexical matching and semantic analysis. Traditional ATS systems perform lexical matching, comparing exact word tokens between a resume and a job description. In contrast, modern NLP approaches utilise transformer-based embedding models to compute semantic similarity between phrases, enabling the system to recognise that "managed a cross-functional team" and "led interdepartmental collaboration" convey equivalent meaning despite sharing no common keywords (Devlin et al., 2019). This semantic understanding capability is central to the design of HireReady's AI analysis engine, which uses Google Gemini — a transformer-based LLM — to evaluate resume content at a semantic level rather than relying solely on keyword frequency counts.

### 2.2.3 Ethical Considerations in AI Recruitment

The deployment of AI systems in recruitment raises significant ethical concerns. Raghavan et al. (2020) conducted a systematic audit of commercial AI hiring tools and found that many lack transparency in their scoring methodologies, making it difficult for candidates to understand why they were accepted or rejected. Sanchez-Monedero, Dencik and Edwards (2020) argued that algorithmic hiring systems risk entrenching existing inequalities unless they are designed with explicit fairness constraints and subjected to regular bias audits. These ethical considerations informed the design of HireReady in two ways: first, the system analyses resumes to help candidates rather than to filter them; and second, all AI-generated recommendations are presented transparently alongside the reasoning that produced them, rather than being reduced to opaque numerical scores.

---

## 2.3 AI-Powered Tutoring and Career Mentoring

### 2.3.1 Intelligent Tutoring Systems

The concept of using AI to provide personalised educational guidance has been studied extensively under the field of Intelligent Tutoring Systems (ITS). VanLehn (2011) conducted a comprehensive meta-analysis comparing the effectiveness of human tutoring, intelligent tutoring systems, and traditional classroom instruction. The study found that well-designed ITS achieved learning gains approximately 76% as effective as one-on-one human tutoring, and significantly outperformed both small-group instruction and unassisted self-study. This finding provides strong academic justification for the use of AI-driven mentoring systems — such as HireReady's interview simulator and career roadmap — in contexts where access to human mentors is limited or prohibitively expensive.

### 2.3.2 The Role of Practice and Feedback in Interview Performance

Research on interview performance consistently identifies two factors as the strongest predictors of candidate success: structured practice with realistic scenarios and timely, specific feedback on performance (Huffcutt and Arthur, 1994). Levashina et al. (2014) found that candidates who engaged in multiple practice interview sessions with structured feedback demonstrated measurably improved performance in subsequent real interviews, particularly in the areas of response structure, technical articulation, and anxiety management. However, access to structured practice opportunities is unevenly distributed: candidates at well-resourced universities or with professional networks have significantly more access to mock interviews than their peers at less affluent institutions (Barrick, Shaffer and DeGrassi, 2009).

HireReady's Turn-Based Mock Interview Simulator is designed to address this access gap by providing unlimited, AI-driven practice sessions with configurable difficulty levels and structured performance feedback across technical accuracy, communication quality, and grammatical correctness.

### 2.3.3 Personalised Learning Pathways

The effectiveness of personalised learning pathways — curricula that adapt to a learner's existing knowledge, goals, and preferred pace — has been demonstrated across multiple educational contexts. Pane et al. (2017) found that students following personalised learning plans achieved significantly greater academic gains compared to those following standardised curricula, particularly in technology-related subjects where prerequisite knowledge chains are well-defined. This research informed the design of HireReady's Career Roadmap Compiler, which generates customised, sequential learning modules based on the specific skill gaps identified between a candidate's current competencies and their target job role.

---

## 2.4 Large Language Models and Google Gemini

### 2.4.1 The Transformer Architecture

The foundation of modern large language models is the Transformer architecture, introduced by Vaswani et al. (2017) in their seminal paper "Attention Is All You Need." The Transformer replaced recurrent neural network architectures with a self-attention mechanism that enables the model to process all tokens in an input sequence simultaneously, dramatically improving both training efficiency and the model's ability to capture long-range dependencies between words. This architectural innovation enabled the development of increasingly large pre-trained language models, including BERT (Devlin et al., 2019), GPT-3 (Brown et al., 2020), and subsequently Google's Gemini family.

### 2.4.2 Google Gemini: Capabilities and API Design

Google Gemini is a family of multimodal large language models developed by Google DeepMind, designed to process and generate text, code, images, and structured data (Google DeepMind, 2024). For the purposes of this project, the text generation capabilities of the Gemini Flash model variants are utilised across four key functional areas: resume ATS analysis, professional summary enhancement, career roadmap compilation, and mock interview question generation and transcript evaluation.

A significant architectural advantage of the Gemini API for this project is its support for structured output via the `responseMimeType: "application/json"` configuration parameter. This feature instructs the model to format its response as valid JSON conforming to a specified schema, reducing the need for extensive post-processing and enabling direct database insertion of AI-generated content (Google, 2024). However, as noted by Wei et al. (2022), even instruction-tuned LLMs can occasionally produce outputs that deviate from the requested format, particularly under high-load conditions or when processing complex prompts. This variability necessitates the implementation of robust fallback parsing mechanisms, which HireReady addresses through its double-pass JSON parser with regex recovery.

### 2.4.3 Prompt Engineering for Structured Outputs

Prompt engineering — the practice of designing input instructions to elicit desired behaviours from language models — has emerged as a critical discipline in applied LLM development. White et al. (2023) proposed a taxonomy of prompt patterns for software engineering tasks, demonstrating that clearly structured prompts with explicit output format specifications, role assignments, and constraint boundaries produce significantly more reliable and consistent outputs than open-ended instructions. HireReady applies these principles by assigning specific professional roles to the AI in each prompt (e.g., "You are an expert ATS optimizer and professional recruiter"), specifying exact JSON schemas for structured outputs, and imposing explicit constraints such as word count limits and question count boundaries.

---

## 2.5 Modern Web Application Frameworks for AI Integration

### 2.5.1 Next.js and the App Router Architecture

Next.js is a React-based web application framework developed by Vercel that provides server-side rendering (SSR), static site generation (SSG), and hybrid rendering capabilities out of the box (Vercel, 2024). The introduction of the App Router in Next.js 13 — and refined in subsequent versions through Next.js 16 — represented a paradigm shift in React application architecture by introducing React Server Components (RSC) as the default rendering strategy. Server Components execute exclusively on the server, reducing client-side JavaScript bundle sizes and enabling direct access to server-side resources such as databases and API keys without exposing them to the browser (Abramov and Childs, 2023).

### 2.5.2 Server Actions for Secure AI Processing

Next.js Server Actions — functions marked with the `"use server"` directive — provide a mechanism for executing server-side logic directly from client components without creating explicit API endpoints. This pattern is particularly advantageous for AI-integrated applications because it ensures that sensitive credentials (such as the Gemini API key) remain exclusively within the server runtime environment, eliminating the risk of client-side key exposure (Vercel, 2024). HireReady leverages Server Actions across all AI-dependent features, including resume scanning, summary enhancement, roadmap generation, interview question generation, and transcript evaluation.

### 2.5.3 React 19 and Concurrent Features

React 19, the version utilised in this project, introduces several features relevant to the construction of AI-powered interfaces. The `useTransition` hook enables non-blocking state updates during long-running server requests — such as AI model calls that may take several seconds — ensuring that the user interface remains responsive while waiting for backend processing to complete (React Team, 2024). This capability is leveraged in HireReady's multi-step progress tracker, which provides visual feedback during resume scanning operations, and in the interview chat interface, which displays loading indicators while awaiting AI-generated questions.

---

## 2.6 Database and Object-Relational Mapping Technologies

### 2.6.1 PostgreSQL as a Relational Database

PostgreSQL is an open-source, enterprise-grade relational database management system (RDBMS) known for its robustness, ACID compliance, extensibility, and strong support for complex queries and JSON data types (PostgreSQL Global Development Group, 2024). For this project, PostgreSQL was selected over alternative database technologies (e.g., MongoDB, MySQL, SQLite) based on three criteria: first, its support for complex relational schemas with cascade deletion rules required by the multi-model data architecture; second, its native JSON column support, which enables flexible storage of structured data such as work experience entries and education records without requiring separate junction tables; and third, its strong Prisma ORM compatibility.

### 2.6.2 Prisma ORM for Type-Safe Database Access

Prisma is a next-generation Object-Relational Mapper (ORM) for Node.js and TypeScript that provides a declarative schema definition language, automated migration management, and a fully type-safe query client (Prisma, 2024). Unlike traditional ORMs that map objects to SQL at runtime, Prisma generates a type-safe client library from the schema definition, enabling compile-time detection of invalid queries and ensuring that database operations remain consistent with the defined schema throughout the application lifecycle. This type safety is particularly valuable in a project with nine interconnected database models and multiple cascade deletion pathways, as it prevents runtime errors caused by schema mismatches.

---

## 2.7 Agile Development Methodologies

### 2.7.1 DSDM: Dynamic Systems Development Method

The Dynamic Systems Development Method (DSDM) is an Agile framework originally developed in 1994 by the DSDM Consortium, designed specifically for projects that require rapid delivery of business-critical systems within fixed time constraints (Stapleton, 2003). Unlike Scrum, which emphasises iterative sprints with flexible scope, DSDM prioritises **fixed time and cost** with **adjustable scope**, making it particularly suitable for academic projects where submission deadlines are immovable and available development hours are constrained (Abrahamsson et al., 2002).

### 2.7.2 Timeboxing and MoSCoW Prioritisation

DSDM structures project delivery into discrete, fixed-duration development periods known as **timeboxes**. Each timebox has a defined start and end date, a set of prioritised requirements, and a commitment to deliver working functionality by the timebox deadline (Stapleton, 2003). Requirements within each timebox are prioritised using the **MoSCoW** technique, which categorises features into four groups:

- **Must Have:** Essential features without which the system cannot function.
- **Should Have:** Important features that add significant value but are not critical for basic operation.
- **Could Have:** Desirable features that enhance user experience but can be deferred if time is insufficient.
- **Won't Have (This Time):** Features explicitly excluded from the current delivery cycle but documented for future development.

This combination of timeboxing and MoSCoW prioritisation provides a structured framework for managing scope under time pressure, ensuring that the most critical features are always delivered first while lower-priority enhancements are deferred rather than creating schedule overruns (Abrahamsson et al., 2002).

### 2.7.3 Justification for DSDM over Scrum

While Scrum is the most widely adopted Agile methodology in industry (VersionOne, 2023), DSDM was selected for this project for three specific reasons. First, DSDM's emphasis on fixed timeboxes aligns naturally with academic assessment deadlines, which cannot be renegotiated. Second, DSDM's formal documentation requirements — including feasibility studies, prioritisation matrices, and structured test plans — produce the artefacts expected in a university-level software engineering report. Third, DSDM's single-developer scalability (it does not require the Scrum Master, Product Owner, and Development Team role separation mandated by Scrum) makes it more practical for an individual student project (Stapleton, 2003).

---

## 2.8 Summary of Key Findings

The literature reviewed in this chapter establishes the theoretical and technical foundations underpinning the design of HireReady. The key findings are summarised as follows:

1. **ATS technology creates systematic barriers** for qualified candidates through rigid keyword matching and format-sensitive parsing, with over 27 million workers estimated to be excluded by automated screening in the United States alone (Fuller et al., 2021). Tools that help candidates optimise their resumes for ATS compatibility directly address this algorithmic exclusion.

2. **Modern NLP and LLMs enable semantic-level analysis** of resume content, moving beyond simplistic keyword counting to contextual evaluation of qualifications and experience (Devlin et al., 2019). Google Gemini's structured output capabilities make it particularly suitable for generating actionable, JSON-formatted career recommendations.

3. **Intelligent tutoring systems and structured practice** significantly improve interview performance and skill acquisition (VanLehn, 2011; Levashina et al., 2014), justifying the development of AI-driven mock interview and personalised roadmap features.

4. **The Next.js App Router with Server Actions** provides an optimal architectural foundation for AI-integrated web applications, ensuring API key security, reducing client-side bundle sizes, and enabling seamless server-side AI processing (Vercel, 2024).

5. **DSDM's fixed-timebox, adjustable-scope methodology** is well-suited to academic software engineering projects, providing the structured delivery framework and formal documentation artefacts required for rigorous assessment (Stapleton, 2003).

These findings collectively informed the system architecture, technology selection, AI integration strategy, and project management approach documented in the subsequent chapters of this report.

---

### References (Chapter 2)

- Abrahamsson, P., Salo, O., Ronkainen, J. and Warsta, J. (2002) *Agile Software Development Methods: Review and Analysis*. Espoo: VTT Publications 478.
- Abramov, D. and Childs, J. (2023) 'React Server Components', *React RFC*. Available at: https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md (Accessed: 15 August 2026).
- Barrick, M.R., Shaffer, J.A. and DeGrassi, S.W. (2009) 'What you see may not be what you get: Relationships among self-presentation tactics and ratings of interview and job performance', *Journal of Applied Psychology*, 94(6), pp. 1394–1411.
- Black, J.S. and van Esch, P. (2020) 'AI-enabled recruiting: What is it and how should a manager use it?', *Business Horizons*, 63(2), pp. 215–226.
- Bogen, M. and Rieke, A. (2018) *Help Wanted: An Examination of Hiring Algorithms, Equity, and Bias*. Washington, DC: Upturn.
- Brown, T.B., Mann, B., Ryder, N., Subbiah, M., Kaplan, J., Dhariwal, P., Neelakantan, A., Shyam, P., Sastry, G., Askell, A., Agarwal, S., Herbert-Voss, A., Krueger, G., Henighan, T., Child, R., Ramesh, A., Ziegler, D.M., Wu, J., Winter, C., Hesse, C., Chen, M., Sigler, E., Litwin, M., Gray, S., Chess, B., Clark, J., Berner, C., McCandlish, S., Radford, A., Sutskever, I. and Amodei, D. (2020) 'Language Models are Few-Shot Learners', *Advances in Neural Information Processing Systems*, 33, pp. 1877–1901.
- Cappelli, P. (2019) 'Your Approach to Hiring Is All Wrong', *Harvard Business Review*, 97(3), pp. 48–58.
- Devlin, J., Chang, M., Lee, K. and Toutanova, K. (2019) 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding', *Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics (NAACL)*. Minneapolis, MN, pp. 4171–4186.
- Fuller, J.B., Raman, M., Sage-Gavin, E. and Hines, K. (2021) *Hidden Workers: Untapped Talent*. Boston, MA: Harvard Business School Publishing.
- Google (2024) *Gemini API: Structured Output Documentation*. Available at: https://ai.google.dev/gemini-api/docs/structured-output (Accessed: 15 August 2026).
- Google DeepMind (2024) *Gemini: A Family of Highly Capable Multimodal Models*. Available at: https://deepmind.google/technologies/gemini/ (Accessed: 15 August 2026).
- Hmoud, B. and Laszlo, V. (2019) 'Will artificial intelligence take over human resources recruitment and selection?', *Network Intelligence Studies*, 7(13), pp. 21–30.
- Huffcutt, A.I. and Arthur, W. (1994) 'Hunter and Hunter (1984) revisited: Interview validity for entry-level jobs', *Journal of Applied Psychology*, 79(2), pp. 184–190.
- Jobscan (2025) *About Jobscan: ATS Resume Optimization*. Available at: https://www.jobscan.co/about (Accessed: 15 August 2026).
- Levashina, J., Hartwell, C.J., Morgeson, F.P. and Campion, M.A. (2014) 'The Structured Employment Interview: Narrative and Quantitative Review of the Research Literature', *Personnel Psychology*, 67(1), pp. 241–293.
- Pane, J.F., Steiner, E.D., Baird, M.D. and Hamilton, L.S. (2017) *Informing Progress: Insights on Personalized Learning Implementation and Effects*. Santa Monica, CA: RAND Corporation.
- PostgreSQL Global Development Group (2024) *PostgreSQL 16 Documentation*. Available at: https://www.postgresql.org/docs/16/ (Accessed: 15 August 2026).
- Prisma (2024) *Prisma Documentation: Overview*. Available at: https://www.prisma.io/docs (Accessed: 15 August 2026).
- Raghavan, M., Barocas, S., Kleinberg, J. and Levy, K. (2020) 'Mitigating Bias in Algorithmic Hiring: Evaluating Claims and Practices', *Proceedings of the 2020 ACM Conference on Fairness, Accountability, and Transparency (FAT)*. Barcelona, Spain, pp. 469–481.
- React Team (2024) *React 19 Release Notes*. Available at: https://react.dev/blog/2024/12/05/react-19 (Accessed: 15 August 2026).
- Sanchez-Monedero, J., Dencik, L. and Edwards, L. (2020) 'What does it mean to "solve" the problem of discrimination in hiring? Social, technical and legal perspectives from the UK on automated hiring systems', *Proceedings of the 2020 ACM Conference on Fairness, Accountability, and Transparency (FAT)*. Barcelona, Spain, pp. 458–468.
- Stapleton, J. (2003) *DSDM: Business Focused Development*. 2nd edn. Harlow: Addison-Wesley.
- VanLehn, K. (2011) 'The Relative Effectiveness of Human Tutoring, Intelligent Tutoring Systems, and Other Tutoring Systems', *Educational Psychologist*, 46(4), pp. 197–221.
- Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A.N., Kaiser, L. and Polosukhin, I. (2017) 'Attention Is All You Need', *Advances in Neural Information Processing Systems*, 30, pp. 5998–6008.
- Vercel (2024) *Next.js Documentation*. Available at: https://nextjs.org/docs (Accessed: 15 August 2026).
- VersionOne (2023) *17th Annual State of Agile Report*. Atlanta, GA: Digital.ai.
- Wei, J., Wang, X., Schuurmans, D., Bosma, M., Ichter, B., Xia, F., Chi, E., Le, Q.V. and Zhou, D. (2022) 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models', *Advances in Neural Information Processing Systems*, 35, pp. 24824–24837.
- White, J., Fu, Q., Hays, S., Sandborn, M., Olea, C., Gilbert, H., Elnashar, A., Spencer-Smith, J. and Schmidt, D.C. (2023) 'A Prompt Pattern Catalog to Enhance Prompt Engineering with ChatGPT', *arXiv preprint arXiv:2302.11382*.
- Zhao, W., He, L., Deng, W. and Wu, J. (2021) 'Resume Parsing and Standardization Using Natural Language Processing', *Journal of Physics: Conference Series*, 1757(1), 012058.
