# CHAPTER 9. TESTING

## 9.1 Testing Strategy and Approach

A structured manual testing strategy was adopted throughout the HireReady project, applied incrementally across all four development timeboxes. Rather than waiting until final integration to test functionality, each timebox included a dedicated test planning phase and a formal test execution log completed before the timebox was signed off. This approach aligns with the DSDM Agile methodology applied throughout the project (see Chapter 4), ensuring that defects were identified and resolved early rather than accumulating into the final release phase.

The testing strategy covers four distinct testing levels:

- **Unit Testing:** Verifying isolated functions and server actions in isolation, such as password hashing logic, JSON parsing routines, and document extraction calls.
- **Integration Testing:** Confirming that multiple system layers interact as expected — for example, that a file upload triggers correct Gemini API calls, database writes, and UI state updates.
- **Security Testing:** Validating that authentication protections, session cookie configurations, SQL injection safeguards, and access control rules function correctly under adversarial inputs.
- **Usability and Boundary Testing:** Exploring edge cases such as oversized inputs, empty forms, microphone permission rejections, and mobile viewport responsiveness.

All tests were executed manually using **Chrome v138** on a local development environment running **Node.js v22**, **PostgreSQL 16**, and **Next.js 15** with **Prisma 6**.

A total of **49 test cases** were executed across all four timeboxes and the extended test suite. All tests passed. No unresolved defects remained at the point of final submission.

---

## 9.2 Timebox 1 Testing: Core Foundation and Authentication

**Test Period:** July 01, 2026 – July 07, 2026

### 9.2.1 Test Plan

The Timebox 1 test plan focuses on verifying user registration, login, session management, profile setup, and account security controls.

| Test ID | Level | Feature Under Test | Input Vector | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **TC-AUT-01** | Unit | Password encryption | Cleartext password submitted at registration | Stored password must not match raw input; must be saved as a bcrypt hash. |
| **TC-AUT-02** | Integration | Duplicate account prevention | Existing email address re-submitted | Server action returns "An account with this email already exists". |
| **TC-AUT-03** | Integration | HTTP-Only session cookie creation | Valid email and password submitted at login | Cookie named `session` is created and flagged as `HttpOnly: true`. |
| **TC-AUT-04** | Security | Unauthenticated route access | Direct URL navigation to `/dashboard` without login | System redirects to `/login` immediately. |
| **TC-AUT-05** | Integration | Profile skill auto-sync after scan | Resume uploaded with target job role | Profile table is updated with extracted skills from the analysis. |
| **TC-AUT-06** | Integration | Username registration (non-email) | Raw username string (e.g. `student123`) | Registration completes without browser or server email format validation errors. |
| **TC-AUT-07** | Integration | Account settings update | Modified name and email fields | User table fields are updated; active JWT session token is refreshed. |
| **TC-AUT-08** | Security | Cascade account deletion | Delete account request confirmed | User record and all linked Profile, Resume, and ChatMessage records are removed. |
| **TC-AUT-09** | Unit | Password minimum length validation | Password shorter than 6 characters submitted | Server action rejects request and returns a validation error message. |
| **TC-AUT-10** | Integration | Session invalidation on logout | User clicks the Sign Out button | Session cookie is cleared; user is redirected to the `/login` page. |
| **TC-AUT-11** | Security | Profile input sanitization | HTML tags submitted in job role or skills fields | Special characters are safely escaped by Prisma, preventing XSS execution. |
| **TC-AUT-12** | Integration | Session cookie lifetime and flags | Successful login | Cookie inspection confirms `maxAge` is set to 7 days with `HttpOnly: true`. |
| **TC-AUT-13** | Security | SQL injection protection on login | Login payload containing SQL characters | Prisma parameterized queries neutralize the input; login fails with a standard error. |

### 9.2.2 Test Execution Log

| Test ID | Result | Notes |
| :--- | :--- | :--- |
| TC-AUT-01 | **PASSED** | Stored password confirmed as a bcrypt `$2b$10$...` hash in the database. |
| TC-AUT-02 | **PASSED** | Duplicate email submission captured gracefully; error rendered in the form without a server crash. |
| TC-AUT-03 | **PASSED** | Chrome DevTools confirmed `HttpOnly` flag on the `session` cookie, blocking JavaScript access. |
| TC-AUT-04 | **PASSED** | Unauthenticated navigation to `/dashboard` immediately redirected to `/login`. |
| TC-AUT-05 | **PASSED** | Profile table updated correctly after resume scan; updated target role displayed on dashboard. |
| TC-AUT-06 | **PASSED** | Account created successfully using raw username; profile initialized with default values. |
| TC-AUT-07 | **PASSED** | Settings change persisted to database; JWT refreshed with updated user data. |
| TC-AUT-08 | **PASSED** | Deleting account cascaded to Profile, Resume, and ChatMessage tables via Prisma cascade delete rules. |
| TC-AUT-09 | **PASSED** | Password `12345` (5 characters) rejected at form submission with a validation error. |
| TC-AUT-10 | **PASSED** | Sign-out cleared the `session` cookie in the browser and redirected to `/login`. |
| TC-AUT-11 | **PASSED** | HTML tags submitted in skill fields rendered as escaped literal text, not executed by the browser. |
| TC-AUT-12 | **PASSED** | Cookie inspection confirmed 7-day expiry and `HttpOnly` flag under simulated production mode. |
| TC-AUT-13 | **PASSED** | SQL injection string `' OR 1=1` returned "Invalid email or password", confirming safe query parameterization. |

### 9.2.3 Defect Resolution Log

| Bug ID | Symptom | Resolution |
| :--- | :--- | :--- |
| **Bug #001** | Registration accepted passwords shorter than 6 characters. | Minimum length validation check added to the form submit handler and Server Action boundary. |
| **Bug #002** | Empty skills values caused array serialization errors on profile page load. | Profile reader refactored to use `.split(",").filter(Boolean)` to handle empty skill strings safely. |

---

## 9.3 Timebox 2 Testing: AI Resume Intelligence

**Test Period:** August 04, 2026 – August 10, 2026

### 9.3.1 Test Plan

The Timebox 2 test plan validates document parsing, Gemini API integration, fallback behavior, and ATS scan history features.

| Test ID | Level | Feature Under Test | Input Vector | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **TC-RES-01** | Unit | PDF text parser | Standard PDF file uploaded | Extracted plain text string returned successfully. |
| **TC-RES-02** | Unit | DOCX text parser | Standard DOCX file uploaded | Extracted plain text string returned successfully. |
| **TC-RES-03** | Integration | Gemini API sequential model fallback | Primary model returns HTTP 429 | System fails over to the secondary model without throwing an unhandled error. |
| **TC-RES-04** | Integration | Invalid file format rejection | `.png` or `.txt` file uploaded | Server action rejects the file and returns "Unsupported file format." |
| **TC-RES-05** | Integration | Skill gap mapping display | Missing keywords returned from Gemini scan | Dashboard correctly filters and displays gaps against existing profile skills. |
| **TC-RES-06** | Integration | File size boundary enforcement | Resume file larger than 5 MB uploaded | Upload rejected immediately with a validation warning before parsing begins. |
| **TC-RES-07** | Integration | Corrupted binary file handling | Damaged PDF or DOCX byte stream uploaded | Server catches parser exception and returns "Failed to extract text from file." |
| **TC-RES-08** | Integration | Image-only (textless) PDF handling | Scanned PDF with no selectable text | Parser returns empty string; system prompts user to upload a text-readable version. |
| **TC-RES-09** | Integration | Special character escaping in content | Resume containing quotation marks and backslashes | Regex recovery sanitizes Gemini output; JSON parses successfully. |
| **TC-RES-10** | Integration | Scan history record navigation | Selecting a record in the history panel | URL updates to `?reportId=xxx`; historical ATS scorecard loads correctly. |

### 9.3.2 Test Execution Log

| Test ID | Result | Notes |
| :--- | :--- | :--- |
| TC-RES-01 | **PASSED** | PDF parsed successfully. Average extraction time: 34 ms. |
| TC-RES-02 | **PASSED** | DOCX parsed successfully. Average extraction time: 42 ms. |
| TC-RES-03 | **PASSED** | Quota exceeded error on `gemini-3.5-flash` triggered automatic failover to `gemini-3.5-flash-lite`. |
| TC-RES-04 | **PASSED** | Image file upload blocked at the client-side input validation step before any server processing. |
| TC-RES-05 | **PASSED** | Skill gap panel correctly hid skills already listed in the candidate profile, showing only true gaps. |
| TC-RES-06 | **PASSED** | A 6.2 MB document upload was rejected immediately without triggering server-side parser processing. |
| TC-RES-07 | **PASSED** | Damaged document returned a user-friendly error message; no server crash or unhandled exception occurred. |
| TC-RES-08 | **PASSED** | Scanned image resume returned empty text; system displayed guidance to upload a text-readable file. |
| TC-RES-09 | **PASSED** | Double quotes inside description bullets did not cause JSON evaluation failures; regex fallback parsed successfully. |
| TC-RES-10 | **PASSED** | Selecting a history item updated the URL query parameter and loaded the correct scorecard instantly. |

### 9.3.3 Defect Resolution Log

No new defects were identified during Timebox 2 testing. The model fallback chain and JSON recovery parser operated as designed across all tested scenarios.

---

## 9.4 Timebox 3 Testing: AI Resume Builder and Career Roadmap

**Test Period:** August 20, 2026 – August 24, 2026

### 9.4.1 Test Plan

The Timebox 3 test plan verifies the multi-step resume builder, AI summary rewriter, PDF export, roadmap generation, and sequential module locking.

| Test ID | Level | Feature Under Test | Input Vector | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **TC-RMB-01** | Unit | Resume form field persistence | Fields updated, wizard step changed | Database fields match the user's inputs after step navigation. |
| **TC-RMB-02** | Integration | AI Summary Enhancer | Raw draft professional summary submitted | Enhanced summary returned, tailored to target job role and 70–100 words. |
| **TC-RMB-03** | Integration | Template selector responsiveness | Layout option clicked | Preview panel updates immediately without a full page reload. |
| **TC-RMB-04** | Security | SQL injection in resume text fields | SQL characters submitted in name or description | Input stored as a literal string; no database query manipulation occurs. |
| **TC-RMB-05** | Usability | PDF export print mode | "Export PDF" button clicked | Browser print dialog opens; navigation sidebar and editor are hidden. |
| **TC-RMP-01** | Integration | Roadmap pace customizer | Accelerated or deep-dive pace selection | Gemini returns modules with updated duration and topic depth matching the preference. |
| **TC-RMP-02** | Integration | Sequential module locking | Module 1 marked as completed | Module 2 status changes to `IN_PROGRESS`; modules 3 and 4 remain `LOCKED`. |
| **TC-RMP-03** | Integration | Profile skill synchronization | Module marked completed | Module concepts are appended to the candidate's profile skills list. |
| **TC-RMP-04** | Unit | JSON parsing recovery | Malformed JSON returned from Gemini | Regex extraction fallback isolates module data without crashing the action. |

### 9.4.2 Test Execution Log

| Test ID | Result | Notes |
| :--- | :--- | :--- |
| TC-RMB-01 | **PASSED** | Step navigation triggered automatic database save; confirmed data persisted to `BuiltResume` table. |
| TC-RMB-02 | **PASSED** | AI-enhanced summary included target role keywords. Average processing time: 1.8 seconds. |
| TC-RMB-03 | **PASSED** | Classic, Modern Minimalist, and Tech Compact layouts all rendered correctly with selected accent colors. |
| TC-RMB-04 | **PASSED** | SQL string saved as literal text; no database error or query manipulation detected. |
| TC-RMB-05 | **PASSED** | Print preview correctly hid the editor sidebar and navigation, producing a clean single-page resume layout. |
| TC-RMP-01 | **PASSED** | Accelerated pace returned approximately 8-hour module estimates; deep-dive pace returned 15+ hours. |
| TC-RMP-02 | **PASSED** | Sequential unlock confirmed; locked modules showed disabled completion buttons with hover state indicators. |
| TC-RMP-03 | **PASSED** | Profile skills updated with module concepts on completion; duplicates were de-duplicated using a `Set`. |
| TC-RMP-04 | **PASSED** | Regex fallback successfully extracted module titles and concepts from a partial malformed JSON payload. |

### 9.4.3 Defect Resolution Log

| Bug ID | Symptom | Resolution |
| :--- | :--- | :--- |
| **Bug #005** | Browser autofill triggered multiple rapid database saves, causing performance lag. | Save trigger changed from input blur events to wizard step changes and explicit save button clicks. |
| **Bug #006** | Gemini occasionally returned 3 modules instead of the required 4, causing parsing errors. | System prompt updated to strictly require exactly 4 JSON objects; a validation check was added to throw an error if the count did not match. |

---

## 9.5 Timebox 4 Testing: Mock Interview Simulator

**Test Period:** September 25, 2026 – October 02, 2026

### 9.5.1 Test Plan

The Timebox 4 test plan validates interview session creation, turn-based message tracking, question limit enforcement, transcript grading, and session access control.

| Test ID | Level | Feature Under Test | Input Vector | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **TC-INT-01** | Unit | Interview session initialization | Custom job role, difficulty, and question count | Session saved to database with encoded status string containing all configurations. |
| **TC-INT-02** | Unit | First question relevance | Target role and difficulty level set | First AI question is contextually appropriate to the selected role and level. |
| **TC-INT-03** | Integration | Turn-based message tracking | Sequential candidate responses submitted | Message counts increment correctly; send button disables during processing to prevent double submission. |
| **TC-INT-04** | Integration | Question limit trigger | Final question answered | Chat closes, session status updates to `COMPLETED`, and evaluation is triggered automatically. |
| **TC-INT-05** | Integration | Evaluation JSON parser recovery | Malformed or partially incomplete grading JSON | Regex fallback extracts scores and markdown feedback text without crashing. |
| **TC-INT-06** | Security | Session access control | Request made to access another user's session ID | Request blocked with "Session not found" or "Unauthorized" error. |

### 9.5.2 Test Execution Log

| Test ID | Result | Notes |
| :--- | :--- | :--- |
| TC-INT-01 | **PASSED** | Database confirmed session status string encoded job role, difficulty, and question limit correctly. |
| TC-INT-02 | **PASSED** | First generated question matched the selected role and difficulty in all tested configurations. |
| TC-INT-03 | **PASSED** | Turn counter incremented correctly; no duplicate submissions observed after disabling button during processing. |
| TC-INT-04 | **PASSED** | Session status flipped to `COMPLETED` on the final answer; evaluation grading triggered immediately. |
| TC-INT-05 | **PASSED** | Regex fallback extracted numeric scores and written feedback from a deliberately malformed JSON payload. |
| TC-INT-06 | **PASSED** | Attempting to access a different user's session ID returned an access denied error without exposing data. |

### 9.5.3 Defect Resolution Log

| Bug ID | Symptom | Resolution |
| :--- | :--- | :--- |
| **Bug #007** | Double-clicking the send button submitted empty messages, causing server parsing errors. | Client-side disabled states applied to the input field and submit button during active API processing. |
| **Bug #008** | Long interviews (15 questions) exceeded Gemini context window limits when full history was sent. | History payload optimized to send only the last 6 message turns to the model, reducing token usage. |

---

## 9.6 Extended Testing: Boundary, Security, AI Resiliency, and Accessibility

This extended test suite applies additional testing perspectives beyond standard functional verification, targeting boundary inputs, adversarial security vectors, AI resilience under unexpected model outputs, and client-side accessibility features.

### 9.6.1 Test Plan

| Test ID | Category | Feature Under Test | Input Vector | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **TC-AUT-14** | Boundary | Unicode and UTF-8 name support | Burmese script name submitted at registration | Name stored correctly in the database and rendered without corruption on the dashboard. |
| **TC-AUT-15** | Security | Session hijacking prevention | JavaScript `document.cookie` executed in the browser console | The `session` cookie returns an empty string, confirming the `HttpOnly` flag blocks script access. |
| **TC-AUT-16** | Functional | Empty profile field submission | Registration with blank skills and job role | System creates a default profile; onboarding prompt appears to guide setup completion. |
| **TC-RES-11** | Boundary | High-density keyword resume | Resume with 100+ repeated identical keywords | Gemini returns a 100% match score without UI overflow or rendering errors. |
| **TC-RES-12** | Security | PDF decompression bomb | Nested or recursively compressed PDF file uploaded | PDF parser fails gracefully with an extraction error, without excessive CPU or memory consumption. |
| **TC-RES-13** | AI Resiliency | Whitespace-wrapped JSON output | Gemini response with leading whitespace, markdown fences, or backslashes | Regex cleanup strips wrappers and returns valid, parseable JSON. |
| **TC-RMB-06** | Boundary | Oversized work experience text | Work experience bullet point with 2,000+ words | Record saves to the database; print stylesheet wraps text cleanly without layout overflow. |
| **TC-RMB-07** | Usability | Mobile viewport responsiveness | Browser resized to 360 px width | Form wizard and preview panel stack vertically; all buttons remain accessible. |
| **TC-RMP-05** | Functional | Out-of-order module completion | Attempting to complete Module 3 while Module 2 is locked | Completion button is disabled; locked state is visually indicated to the user. |
| **TC-RMP-06** | AI Resiliency | Roadmap with empty skill profile | Roadmap generation requested with no skills saved in profile | Gemini generates a foundational entry-level roadmap without errors. |
| **TC-INT-07** | Usability | Microphone permission denial | User denies microphone access in browser popup | Mic icon is disabled; text input remains active for manual answer entry. |
| **TC-INT-08** | AI Resiliency | Multi-question AI response | Gemini returns multiple questions in a single turn | Prompt constraints enforce exactly one question per turn; excess content is handled gracefully. |
| **TC-INT-09** | Usability | Text-to-speech cancel toggle | Mute speaker icon clicked during active audio narration | `speechSynthesis.cancel()` fires immediately and stops narration mid-sentence. |
| **TC-INT-10** | Security | SQL injection in interview transcript | SQL commands submitted as a candidate response | Message stored as literal text; database schema remains unaffected. |
| **TC-INT-11** | Boundary | Maximum question count session | Full 15-question mock interview completed | All 15 turns tracked correctly; session completes and grading is generated from all 15 responses. |

### 9.6.2 Test Execution Log

| Test ID | Result | Notes |
| :--- | :--- | :--- |
| TC-AUT-14 | **PASSED** | UTF-8 Burmese name stored and rendered correctly on the candidate dashboard without character corruption. |
| TC-AUT-15 | **PASSED** | `document.cookie` in DevTools returned an empty string, confirming the `HttpOnly` flag was active. |
| TC-AUT-16 | **PASSED** | Default profile created on submission; onboarding banner displayed to prompt completion. |
| TC-RES-11 | **PASSED** | High-density keyword scan returned 100% match score without visual overflow or layout issues. |
| TC-RES-12 | **PASSED** | Recursive PDF triggered a parser exception caught by the server; "Could not extract text" message returned. |
| TC-RES-13 | **PASSED** | Trailing whitespace and markdown fences stripped by regex; JSON parsed and saved correctly. |
| TC-RMB-06 | **PASSED** | A 2,500-word bullet saved to the database; print layout displayed the text with correct line wrapping. |
| TC-RMB-07 | **PASSED** | At 360 px viewport, preview panel stacked below the form wizard; all action buttons remained clickable. |
| TC-RMP-05 | **PASSED** | Completion button for Module 3 was disabled while Module 2 remained locked; hover state confirmed locking. |
| TC-RMP-06 | **PASSED** | Gemini generated a foundational roadmap starting with JavaScript, HTML, and CSS when no profile skills were listed. |
| TC-INT-07 | **PASSED** | Mic icon disabled on permission denial; text input box remained fully functional for manual entry. |
| TC-INT-08 | **PASSED** | Prompt constraints enforced single-question turns across all tested interview rounds. |
| TC-INT-09 | **PASSED** | Speaker icon click triggered immediate cancellation of active speech synthesis output mid-sentence. |
| TC-INT-10 | **PASSED** | SQL string saved as literal chat text; database schema and data remained unaffected. |
| TC-INT-11 | **PASSED** | 15-question interview tracked all turns correctly; grading report generated from the full 15-turn transcript. |

---

## 9.7 Overall Testing Summary

The following table consolidates all test execution results across the four timeboxes and the extended test suite.

| Test Phase | Tests Executed | Passed | Failed | Bugs Found | Bugs Resolved |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Timebox 1 — Authentication** | 13 | 13 | 0 | 2 | 2 |
| **Timebox 2 — Resume Intelligence** | 10 | 10 | 0 | 0 | 0 |
| **Timebox 3 — Resume Builder and Roadmap** | 9 | 9 | 0 | 2 | 2 |
| **Timebox 4 — Mock Interview Simulator** | 6 | 6 | 0 | 2 | 2 |
| **Extended — Boundary, Security, AI Resiliency** | 15 | 15 | 0 | 0 | 0 |
| **TOTAL** | **49** | **49** | **0** | **6** | **6** |

All 49 test cases passed upon execution. All 6 defects identified during testing were resolved prior to timebox sign-off. No outstanding defects remained at the time of final submission.

---

### References (Chapter 9)

- Kaner, C., Falk, J. and Nguyen, H.Q. (1999) *Testing Computer Software*. 2nd edn. New York: John Wiley and Sons.
- Myers, G.J., Sandler, C. and Badgett, T. (2011) *The Art of Software Testing*. 3rd edn. Hoboken, NJ: Wiley.
- OWASP Foundation (2021) *OWASP Top Ten Security Risks*. Available at: https://owasp.org/www-project-top-ten/ (Accessed: 10 September 2026).

---

## 9.8 Timebox 3 and 4 Focused Test Suite (Resume Builder, Roadmap and Interview Simulator)

The following 15 test cases were designed specifically to verify the most critical user-facing features of Timebox 3 (AI Resume Builder and Career Roadmap) and Timebox 4 (Interview Simulator). Each test case has been reviewed and corrected to ensure the Feature/Scenario title accurately reflects the Input Vector and Expected Outcome.

### 9.8.1 Test Plan

| Test ID | Feature / Scenario Under Test | Input Vector / Condition | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **TC-01** | Form Validation — Required Field Check | Click Next Step without filling name and email | Navigation is blocked; inline red Zod validation error messages are displayed beneath the empty fields. |
| **TC-02** | AI Summary Enhancer — Security Input Sanitization | Submit special HTML or SQL characters in the summary input field | Input is stored as a literal string in the database, preventing XSS and SQL injection. |
| **TC-03** | Resume Draft Auto-Save on Step Change | Modify fields and change wizard step | Draft data is saved automatically to the `BuiltResume` table in PostgreSQL without a manual save action. |
| **TC-04** | Experience Item Deletion and Persistence | Delete an experience item row and refresh the page | Database record is updated immediately; the deleted item does not reappear after page reload. |
| **TC-05** | LLM Malformed JSON — Fallback Regex Parser | Invalid or malformed JSON string returned by the language model | Fallback regex parser extracts the required roadmap modules without crashing the application. |
| **TC-06** | AI Pacing Adjustment | Select "Accelerated" pacing mode on the roadmap configuration page | Gemini updates module time estimates to approximately 8 hours per module. |
| **TC-07** | Sequential Module Unlock | Mark Module 1 as completed | Module 2 status shifts to `IN_PROGRESS`; Modules 3 and 4 remain `LOCKED`. |
| **TC-08** | Profile Skill Sync on Module Completion | Complete a module containing new skill concepts | Skill concepts from the module are appended to the skills column in the PostgreSQL Profile table. |
| **TC-09** | Skill Deduplication on Profile Sync | Sync module skills that already exist in the candidate's profile | JavaScript `Set` deduplicates elements before the merged skills list is saved back to the database. |
| **TC-10** | Fallback Regex Parser — Roadmap Module Recovery | AI returns a malformed JSON roadmap response | Parser extracts exactly 4 module objects without crashing the application. |
| **TC-11** | Roadmap Regeneration on Role Change | Change the Target Job Role on the roadmap configuration page | The Profile table is updated with the new role, and a new customized roadmap is generated via Gemini. |
| **TC-12** | AI Summary Enhancer — Empty Input Validation | Submit an empty string to the AI Summary Enhancer | Server action blocks submission and returns the message "Please enter a summary draft". |
| **TC-13** | Locked Module Click Protection | Click directly on a locked module in the progress tracker | The completion checkbox remains disabled and the module status stays `LOCKED` in the database. |
| **TC-14** | Resume Builder — Input Security Sanitization | Submit HTML tags or SQL injection strings in resume builder text fields | Prisma parameterized queries escape all special characters, preventing injection attacks. |
| **TC-15** | Mobile Viewport Responsive Layout | Scale the browser screen down to mobile dimensions (360 px width) | Form wizard and live preview panels stack vertically without any UI overflow or visual bugs. |

### 9.8.2 Test Execution Log

All 15 test cases were executed manually during the Timebox 3 and Timebox 4 testing phases using Chrome v138 on a local development environment.

| Test ID | Result | Notes |
| :--- | :--- | :--- |
| TC-01 | **PASSED** | Zod schema validation blocked step navigation and rendered inline error messages for the empty name and email fields. |
| TC-02 | **PASSED** | HTML and SQL characters submitted to the AI Summary Enhancer were stored as escaped literal strings; no script was executed and no query was manipulated. |
| TC-03 | **PASSED** | Changing wizard steps triggered an automatic `saveBuiltResume` server action call; data was confirmed in the `BuiltResume` table immediately. |
| TC-04 | **PASSED** | After deleting an experience row and refreshing, the deleted item was not present in the database and did not reappear in the UI. |
| TC-05 | **PASSED** | A deliberately malformed JSON string from the language model was intercepted; the regex fallback extracted all 4 modules successfully without an application crash. |
| TC-06 | **PASSED** | Selecting the "Accelerated" pace option returned module time estimates of approximately 8 hours per module from the Gemini API. |
| TC-07 | **PASSED** | Marking Module 1 as completed updated its status to `COMPLETED`, changed Module 2 to `IN_PROGRESS`, and left Modules 3 and 4 as `LOCKED`. |
| TC-08 | **PASSED** | Completing a module appended the module's skill concepts to the `skills` field of the Profile record in PostgreSQL. |
| TC-09 | **PASSED** | Skills already present in the profile were deduplicated using a JavaScript `Set` before the merged list was written back to the database, confirming no duplicate entries. |
| TC-10 | **PASSED** | The regex fallback parser correctly identified and extracted all 4 module objects from a partial and malformed JSON payload without throwing an error. |
| TC-11 | **PASSED** | Changing the target role updated the Profile record and triggered a fresh Gemini request, producing a newly customized roadmap tailored to the updated role. |
| TC-12 | **PASSED** | Submitting an empty summary field triggered the server-side validation check, which returned "Please enter a summary draft" without calling the Gemini API. |
| TC-13 | **PASSED** | Clicking a locked module did not trigger any state change; the completion button remained disabled and the module status remained `LOCKED` in the database. |
| TC-14 | **PASSED** | HTML and SQL characters submitted across all resume builder fields were stored as literal text by Prisma parameterized queries; no injection or script execution occurred. |
| TC-15 | **PASSED** | At a 360 px viewport width, the form wizard stacked above the live preview panel and all buttons remained visible and fully clickable without horizontal scrolling. |

