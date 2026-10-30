# CHAPTER 4: LEGAL, ETHICAL, SOCIAL, AND PROFESSIONAL ISSUES

As an AI-powered career preparation tool, HireReady handles sensitive personal data including user resumes, career backgrounds, and interview communication records. Building such a system requires careful thought about the legal, ethical, social, and professional responsibilities involved. This chapter explains how each of these concerns is addressed to make sure the application is safe, fair, and responsible.

---

## 4.1 Legal Issues

The main legal concern for HireReady is **data privacy**. Users upload detailed resumes that contain personal information such as names, email addresses, phone numbers, and work histories. They also participate in AI-driven interview chats where their typed responses are stored in the database. Under UK and international data protection law, this classifies as processing personal data, which carries specific legal obligations (ICO, 2024).

To comply with the **UK Data Protection Act 2018** and the principles of the **General Data Protection Regulation (GDPR)**, the platform implements the following safeguards:

### 4.1.1 Data Minimisation (GDPR Article 5(1)(c))

The GDPR requires that organisations collect only the minimum amount of personal data necessary for a specific purpose (Voigt and Von dem Bussche, 2017). HireReady follows this principle strictly. The system only asks for and stores data that is directly needed for the application to work — specifically, user profile details (name, email, target job role, skills), uploaded resume filenames, analysis reports, chat transcripts, and roadmap progress. No unnecessary data such as home addresses, dates of birth, or national identification numbers is collected.

Furthermore, uploaded resume files are **not permanently stored** on the server. Instead, they are processed entirely in-memory as temporary Node.js Buffer objects. Once the text has been extracted and analysed, the binary file data is discarded, and only the filename and the AI-generated analysis report are saved in the database. This approach minimises the volume of personal data retained by the system (ICO, 2024).

### 4.1.2 Secure Storage and Encryption

All sensitive personal data is protected using industry-standard security measures:

- **Password Encryption:** User passwords are never stored in plain text. They are hashed using the `bcrypt` algorithm with a salt factor of 10 rounds before being written to the database. This means that even if the database were compromised, the original passwords could not be recovered (Provos and Mazières, 1999).
- **Session Security:** User sessions are managed using JSON Web Tokens (JWT) stored in HTTP-only cookies with the `sameSite: lax` and `secure` flags enabled. The `httpOnly` attribute prevents client-side JavaScript from accessing the session token, protecting against Cross-Site Scripting (XSS) attacks (OWASP, 2021).
- **Transport Security:** All communication between the user's browser and the server is encrypted using SSL/TLS protocols, preventing data interception during transmission.

### 4.1.3 User Control and Data Erasure (GDPR Article 17)

The GDPR grants individuals the "right to erasure," commonly known as the right to be forgotten (Voigt and Von dem Bussche, 2017). HireReady fully supports this right. If a user chooses to delete their account, the system triggers **cascade deletion** in the PostgreSQL database. This means that when the `User` record is deleted, all related records — including the profile, uploaded resumes, analysis reports, interview sessions, chat messages, feedback scores, built resumes, and career roadmaps — are permanently and immediately erased. Users can also delete individual resume scans without removing their entire account, giving them fine-grained control over their stored data.

---

## 4.2 Ethical Issues

When using Large Language Models (LLMs) like Google Gemini to evaluate resumes and grade interview answers, ethical questions around **algorithmic fairness**, **transparency**, and **potential bias** must be carefully addressed.

### 4.2.1 Mitigating AI Bias

AI language models are trained on massive datasets collected from the internet, which may contain historical hiring biases — for example, patterns that favour certain universities, genders, writing styles, or cultural backgrounds (Bogen and Rieke, 2018). If left unchecked, these biases could lead to unfair or discriminatory evaluations of candidates.

To reduce this risk, HireReady's prompt configurations are carefully designed to instruct the Gemini API to focus strictly on **objective, measurable criteria** such as keyword matches against the target job role, the presence or absence of specific technical skills, document formatting quality, and grammatical correctness. The prompts explicitly avoid requesting subjective judgments about a candidate's background, personality, or demographic characteristics. While this approach does not eliminate the possibility of bias entirely — since bias can be embedded in the model's training data in subtle ways (Raghavan et al., 2020) — it represents a responsible effort to direct the AI towards fair and skill-based evaluation.

### 4.2.2 Transparency of Evaluation Metrics

Users have a right to understand how they are being evaluated. HireReady does not simply generate a score without explanation. Every evaluation — whether it is a resume ATS scan or an interview performance grade — is accompanied by a **detailed, written explanation** that clearly states the reasoning behind the result. For example:

- In the ATS scanner, users see exactly which keywords are missing, which formatting issues were detected, and what specific improvements are suggested.
- In the interview feedback, users receive question-by-question analysis showing their response, the areas where they fell short, and a model answer for comparison.

This level of transparency ensures that users can learn from the feedback rather than being left confused by an unexplained number. As Sanchez-Monedero, Dencik and Edwards (2020) argue, transparency in algorithmic systems is essential for maintaining user trust and enabling meaningful human oversight.

### 4.2.3 Candidate-Side AI Ethics

An important ethical distinction is that HireReady uses AI to **help candidates**, not to **filter them out**. Unlike employer-side ATS tools that use algorithms to reject applicants, HireReady operates entirely on the candidate's side of the recruitment process. The system empowers users to understand and improve their applications rather than making hiring decisions on their behalf. This candidate-centric design avoids the most serious ethical concerns associated with AI in recruitment, where algorithmic decisions can directly affect a person's livelihood (Bogen and Rieke, 2018).

---

## 4.3 Social Issues

Automated recruitment systems can create anxiety and inequality in the job market. Candidates are often rejected by a computer algorithm before a human recruiter ever sees their application, and many do not understand why they were rejected or how to improve (Fuller et al., 2021).

### 4.3.1 Reducing Social Inequality

One of the most significant social problems in career preparation is the **digital divide** between those who can afford professional help and those who cannot. Wealthier job seekers can pay for private career coaches (typically $100–$300 per session), premium resume review subscriptions, and professional interview training. Meanwhile, low-income students, recent graduates, and job seekers in developing countries often have no access to these resources (NACE, 2023).

HireReady is designed to reduce this inequality. The platform is **completely free** with no paywalls, no subscription tiers, and no usage limits. All core features — resume scanning, resume building, mock interviews, and career roadmaps — are available to every user without any payment. This design decision ensures that a first-generation university student has access to the same AI-powered career preparation tools as someone who can afford a premium subscription service.

### 4.3.2 Accessibility Features

To make the platform more inclusive, the interview simulator includes **Speech-to-Text** input (allowing users to dictate their answers using a microphone) and **Text-to-Speech** narration (allowing AI-generated interview questions to be read aloud). These features improve accessibility for users with visual impairments, motor disabilities, or those who are more comfortable with spoken communication than typing.

### 4.3.3 Avoiding Over-Reliance on AI

While the AI provides helpful guidance, it is important that users do not treat it as an absolute authority. AI language models can sometimes produce inaccurate, inconsistent, or overly generic advice — a phenomenon known as "hallucination" in LLM research (Ji et al., 2023). The HireReady interface presents the system as a **preparatory practice tool**, not a definitive replacement for human judgment. Users are encouraged to use the AI feedback as a starting point for improvement and to seek additional human feedback from mentors, career advisors, and peers when possible.

---

## 4.4 Professional Issues

As a software engineering student, the developer has a professional duty to follow safe engineering practices, protect user confidentiality, and conduct ethical testing. These responsibilities align with the **British Computer Society (BCS) Code of Conduct**, which requires members to act with integrity, competence, and respect for public interest (BCS, 2022).

### 4.4.1 Secure Software Engineering Practices

Security is handled at the code level throughout the application. The architecture uses **Next.js Server Actions** to process all AI queries and database operations on the server side. This design guarantees that private credentials — including the Gemini API key, the JWT secret, and the database connection string — are completely hidden from the user's browser. Even if a user inspects the client-side JavaScript source code, they cannot find or steal these credentials. This prevents malicious users from abusing the AI API or accessing the database directly (OWASP, 2021).

Additionally, all database queries are executed through the **Prisma ORM**, which uses parameterised queries by default. This protects the system against SQL injection attacks, where an attacker attempts to manipulate database queries by inserting malicious code into input fields (OWASP, 2021).

### 4.4.2 User Confidentiality

During development and database management, all user data is treated with strict confidentiality. No real-world user data or resumes are exposed in public code repositories. The `.env` file containing API keys and database credentials is listed in `.gitignore` to prevent accidental publication of secrets. The development database uses sample test data rather than real personal information.

### 4.4.3 Ethical User Acceptance Testing (UAT)

When testing the application with peers and classmates to gather usability feedback, participation is **completely voluntary**. Testers are informed about the purpose of the testing and advised not to upload highly sensitive personal details such as real home addresses, national identification numbers, or financial information. All sample test accounts and their associated data can be easily and permanently removed from the database once testing concludes, ensuring that no tester's personal information is retained beyond the testing period.

---

## 4.5 Chapter Summary

This chapter examined the legal, ethical, social, and professional responsibilities associated with developing an AI-powered career preparation platform. Legally, HireReady complies with the UK Data Protection Act 2018 and GDPR principles through data minimisation, password encryption, in-memory file processing, and full cascade deletion. Ethically, the system mitigates AI bias through carefully designed prompts and provides transparent, explainable evaluation metrics. Socially, the platform addresses inequality by offering free, unlimited access to career preparation tools with built-in accessibility features. Professionally, the developer follows secure coding practices, protects user confidentiality, and conducts ethical user testing in alignment with the BCS Code of Conduct.

---

### References (Chapter 4)

- BCS, The Chartered Institute for IT (2022) *Code of Conduct for BCS Members*. Available at: https://www.bcs.org/membership-and-registrations/become-a-member/bcs-code-of-conduct/ (Accessed: 17 August 2026).
- Bogen, M. and Rieke, A. (2018) *Help Wanted: An Examination of Hiring Algorithms, Equity, and Bias*. Washington, DC: Upturn.
- Fuller, J.B., Raman, M., Sage-Gavin, E. and Hines, K. (2021) *Hidden Workers: Untapped Talent*. Boston, MA: Harvard Business School Publishing.
- ICO (2024) *Guide to the UK General Data Protection Regulation (UK GDPR)*. Information Commissioner's Office. Available at: https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/ (Accessed: 17 August 2026).
- Ji, Z., Lee, N., Frieske, R., Yu, T., Su, D., Xu, Y., Ishii, E., Bang, Y., Madotto, A. and Fung, P. (2023) 'Survey of Hallucination in Natural Language Generation', *ACM Computing Surveys*, 55(12), pp. 1–38.
- National Association of Colleges and Employers (2023) *Student Survey Report 2023*. Bethlehem, PA: NACE.
- OWASP (2021) *OWASP Top Ten Web Application Security Risks*. Available at: https://owasp.org/www-project-top-ten/ (Accessed: 17 August 2026).
- Provos, N. and Mazières, D. (1999) 'A Future-Adaptable Password Scheme', *Proceedings of the USENIX Annual Technical Conference*. Monterey, CA, pp. 81–91.
- Raghavan, M., Barocas, S., Kleinberg, J. and Levy, K. (2020) 'Mitigating Bias in Algorithmic Hiring: Evaluating Claims and Practices', *Proceedings of the 2020 ACM Conference on Fairness, Accountability, and Transparency (FAT)*. Barcelona, Spain, pp. 469–481.
- Sanchez-Monedero, J., Dencik, L. and Edwards, L. (2020) 'What does it mean to "solve" the problem of discrimination in hiring? Social, technical and legal perspectives from the UK on automated hiring systems', *Proceedings of the 2020 ACM Conference on Fairness, Accountability, and Transparency (FAT)*. Barcelona, Spain, pp. 458–468.
- Voigt, P. and Von dem Bussche, A. (2017) *The EU General Data Protection Regulation (GDPR): A Practical Guide*. Cham: Springer International Publishing.
