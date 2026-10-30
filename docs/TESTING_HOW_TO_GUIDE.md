# How to Run Each Test Case — Step-by-Step Guide

Run your local development server first:
```
npm run dev
```
Then open Chrome and go to: http://localhost:3000

---

## TC-01 — Form Validation (Required Field Check)
**What it tests:** Does the Resume Builder stop you from moving to the next step if Name or Email are empty?

**Steps:**
1. Log in and go to the Resume Builder page (`/builder`)
2. Clear the Name field and Email field so they are both empty
3. Click the "Next Step" or "Continue" button

**What to check (PASS if):**
- The page does NOT move to the next step
- Red error messages appear underneath the empty fields (e.g. "Name is required", "Email is required")
- These are Zod validation errors shown inline on the form

---

## TC-02 — AI Summary Enhancer — Security Input Sanitization
**What it tests:** If you type HTML or SQL code into the Summary text box, does it get saved safely without executing?

**Steps:**
1. Go to the Resume Builder and navigate to the Summary step
2. In the Professional Summary text area, type:
   `<script>alert('hacked')</script>` or `'; DROP TABLE users;--`
3. Click "AI Enhance" to submit it to the AI

**What to check (PASS if):**
- No alert box pops up in the browser
- The enhanced result is returned normally (the AI just treats it as plain text)
- Open the database or check the response — the text is stored as-is (as a literal string), NOT executed

---

## TC-03 — Resume Draft Auto-Save on Step Change
**What it tests:** When you change wizard steps, does your data save automatically without clicking a Save button?

**Steps:**
1. Go to Resume Builder (`/builder`)
2. Fill in the Name, Email, and some text in the Summary field
3. Click "Next Step" to move to the next section of the form (e.g. Education)

**What to check (PASS if):**
- After clicking Next, go back to Step 1 — your Name, Email, and Summary are still there
- You did NOT click a manual Save button — it saved automatically
- (Optional: check your database `BuiltResume` table — a record should exist with your data)

---

## TC-04 — Experience Item Deletion and Persistence
**What it tests:** If you delete a work experience row, does it stay deleted after a page refresh?

**Steps:**
1. Go to Resume Builder and navigate to the Work Experience step
2. Add at least one experience item (e.g. "Intern at Google")
3. Click the Delete / Remove button on that experience row
4. Press F5 or refresh the page

**What to check (PASS if):**
- After refreshing, the deleted experience item is gone
- It does NOT reappear on the page
- The deletion was persisted to the database (not just removed from the screen temporarily)

---

## TC-05 — LLM Malformed JSON — Fallback Regex Parser
**What it tests:** If the AI returns broken/invalid JSON, does the app handle it gracefully instead of crashing?

**Steps:**
1. This test is harder to trigger naturally — the simplest way is:
   - Go to the Career Roadmap page (`/roadmap`)
   - Generate a roadmap for any target role
2. While the roadmap generates, watch the page — it should complete and show 4 modules

**What to check (PASS if):**
- The roadmap page shows 4 modules successfully
- The app does NOT show a white error page or "Something went wrong"
- If you can check the server logs (`npm run dev` terminal), you may see a "Regex fallback used" log message on certain runs

> Note: This test verifies the system's resilience. As long as the roadmap always loads 4 modules without ever crashing, the fallback is working correctly.

---

## TC-06 — AI Pacing Adjustment
**What it tests:** When you choose "Accelerated" pacing, does the roadmap show shorter (~8 hour) time estimates?

**Steps:**
1. Go to the Career Roadmap page (`/roadmap`)
2. Look for a pacing or pace preference option (e.g. "Accelerated", "Balanced", "Deep Dive")
3. Select "Accelerated"
4. Click Generate Roadmap

**What to check (PASS if):**
- Each of the 4 modules shows a time estimate of approximately 8 hours (or similar short timeframe)
- If you switch to "Deep Dive" or "Balanced", the time estimates are longer (e.g. 15+ hours)

---

## TC-07 — Sequential Module Unlock
**What it tests:** When you complete Module 1, does Module 2 unlock automatically while 3 and 4 stay locked?

**Steps:**
1. Generate a roadmap on the Career Roadmap page
2. Find Module 1 — it should show as "IN PROGRESS"
3. Click the "Mark as Completed" button on Module 1

**What to check (PASS if):**
- Module 1 shows as COMPLETED (with a tick/checkmark)
- Module 2 changes to IN PROGRESS (unlocked)
- Module 3 and Module 4 still show as LOCKED (greyed out, not clickable)

---

## TC-08 — Profile Skill Sync on Module Completion
**What it tests:** When you complete a module, do the skills from that module get added to your Profile?

**Steps:**
1. Before you begin — go to your Profile settings and note your current skills list
2. Go to the Career Roadmap page and complete Module 1 (click "Mark as Completed")
3. Go back to your Profile page

**What to check (PASS if):**
- Your Profile skills list now includes the new concepts from Module 1
- These new skills were NOT there before you completed the module
- They were added automatically (you did not manually type them)

---

## TC-09 — Skill Deduplication on Profile Sync
**What it tests:** If your profile already has a skill (e.g. "JavaScript"), and a completed module also contains "JavaScript", does it appear twice?

**Steps:**
1. Go to your Profile and manually add "JavaScript" to your skills (if not already there)
2. Generate a roadmap for a role that will include JavaScript (e.g. "React Developer")
3. Complete Module 1 (which likely includes JavaScript concepts)
4. Go back to your Profile and look at your skills list

**What to check (PASS if):**
- "JavaScript" appears only ONCE in your skills list — not twice
- No duplicate entries appear even though the same skill was in both places

---

## TC-10 — Fallback Regex Parser — Roadmap Module Recovery
**What it tests:** The same as TC-05 but confirms exactly 4 modules are always extracted

**Steps:**
1. Generate a roadmap for any target job role
2. Count the number of modules shown on the page

**What to check (PASS if):**
- Exactly 4 modules are displayed every time
- The app never shows fewer than 4 or crashes

---

## TC-11 — Roadmap Regeneration on Role Change
**What it tests:** If you change your Target Job Role, does the roadmap update to match the new role?

**Steps:**
1. Generate a roadmap for "React Developer" — note the module titles
2. Go to Profile settings and change your Target Job Role to "Data Scientist"
3. Go back to the Roadmap page and generate a new roadmap

**What to check (PASS if):**
- The new roadmap modules are different from the React Developer ones
- Module topics now reflect Data Science (e.g. Python, Machine Learning, Pandas)
- The old React Developer roadmap is replaced by the new one

---

## TC-12 — AI Summary Enhancer — Empty Input Validation
**What it tests:** If the Summary text box is completely empty and you click "AI Enhance", does it give an error instead of calling the AI?

**Steps:**
1. Go to the Resume Builder and navigate to the Summary step
2. Make sure the Professional Summary text area is completely empty
3. Click the "AI Enhance" button

**What to check (PASS if):**
- An error message appears such as "Please enter a summary draft"
- The AI is NOT called (no loading spinner, no result returned)
- You cannot submit an empty summary to the AI

---

## TC-13 — Locked Module Click Protection
**What it tests:** Can you click the "Mark as Completed" button on a LOCKED module?

**Steps:**
1. Generate a roadmap — Modules 2, 3, 4 should all be LOCKED initially
2. Try to click the "Mark as Completed" button on Module 3 or Module 4 (which are LOCKED)

**What to check (PASS if):**
- The button is greyed out / disabled — you cannot click it
- If you inspect the button in Chrome DevTools, it has a `disabled` attribute
- The module status in the database stays LOCKED (nothing changes)

---

## TC-14 — Resume Builder — Input Security Sanitization
**What it tests:** Can HTML or SQL injections submitted in resume text fields cause any security issues?

**Steps:**
1. Go to Resume Builder and navigate to Work Experience step
2. In the Job Title or Description field, type:
   `<b>hacked</b>` or `'; DROP TABLE "User";--`
3. Save the resume (change step to trigger auto-save)
4. Go back to that step and look at the saved text

**What to check (PASS if):**
- The text is shown as plain text exactly as you typed it — not as bold HTML or executed script
- `<b>hacked</b>` appears literally, NOT as bold text
- The database and application are completely unaffected

---

## TC-15 — Mobile Viewport Responsive Layout
**What it tests:** Does the Resume Builder look correct on a small mobile screen?

**Steps:**
1. Go to the Resume Builder page in Chrome
2. Press F12 to open Chrome DevTools
3. Click the "Toggle Device Toolbar" icon (looks like a phone/tablet icon) at the top of DevTools
4. Set the dimensions to 360 x 800 (or select "Galaxy S8+" from the device dropdown)

**What to check (PASS if):**
- The form wizard (left panel) and the live preview (right panel) stack vertically (one on top of the other)
- There is no horizontal scrollbar
- All buttons (Next Step, Save, Export PDF) are still visible and clickable
- Nothing overlaps or is cut off

