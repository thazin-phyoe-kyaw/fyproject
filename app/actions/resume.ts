"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { generateWithFallback } from "@/lib/gemini";

interface ATSAnalysis {
  matchScore: number;
  missingKeywords: string[];
  formattingIssues: string[];
  aiSuggestions: string;
}

/**
 * Parses resume binary file (PDF or DOCX), sends text to Gemini AI for ATS analysis,
 * and saves both the resume metadata and the generated report in the database.
 */
export async function uploadAndScanResume(formData: FormData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "You must be signed in to scan your resume" };
    }

    const file = formData.get("file");
    if (!file || typeof file === "string" || !(file instanceof Blob)) {
      return { success: false, error: "No file was uploaded" };
    }

    if (file.size === 0) {
      return { success: false, error: "File contains no text" };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "File size exceeds the 5MB limit. Please upload a smaller PDF or Word document." };
    }

    // Verify file extension safely
    const filename = (file instanceof File ? file.name : "resume.pdf") || "resume.pdf";
    const lowercaseFilename = filename.toLowerCase();
    const isPdf = lowercaseFilename.endsWith(".pdf");
    const isDocx = lowercaseFilename.endsWith(".docx");

    if (!isPdf && !isDocx) {
      return { success: false, error: "Unsupported format. Please upload a PDF or DOCX file." };
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let extractedText = "";

    // Extract text
    if (isPdf) {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      extractedText = result.text;
    } else {
      const parsedDoc = await mammoth.extractRawText({ buffer });
      extractedText = parsedDoc.value;
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return { success: false, error: "File contains no text" };
    }

    // Get user target role and skills for context
    const profile = await prisma.profile.findUnique({
      where: { userId: currentUser.id },
    });
    const targetRole = profile?.targetJobRole || "Full Stack Developer";

    // The fallback wrapper automatically validates environment configurations

    const prompt = `
      You are an expert ATS (Applicant Tracking System) optimizer and professional recruiter.
      Analyze the following resume text against the target job role: "${targetRole}".
      
      Provide a detailed evaluation in JSON format. The response must match this schema exactly:
      {
        "matchScore": number, (an integer between 0 and 100 representing match percentage)
        "missingKeywords": string[], (key technical terms, tools, or concepts missing from the resume but crucial for this role)
        "formattingIssues": string[], (formatting or structural improvements such as missing sections, bad fonts, layout issues)
        "aiSuggestions": string (a detailed, markdown-formatted string with specific tips on how to improve bullet points, structure, or content)
      }
      
      Resume Text:
      ---
      ${extractedText}
      ---
    `;

    const result = await generateWithFallback(prompt, { responseMimeType: "application/json" });
    let responseText = result.text.trim();

    // Strip markdown code block wrappers if they exist
    if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    
    let analysis: ATSAnalysis;
    try {
      analysis = JSON.parse(responseText) as ATSAnalysis;
    } catch (parseErr) {
      console.warn("Standard JSON.parse failed, attempting control character escape...", parseErr);
      try {
        // Replace unescaped literal newlines/tabs inside double-quoted string values in JSON
        const sanitizedText = responseText.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match, p1) => {
          return '"' + p1.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"';
        });
        analysis = JSON.parse(sanitizedText) as ATSAnalysis;
      } catch (parseErr2) {
        console.warn("Sanitized JSON parse failed, running regex fallback parser...", parseErr2);
        
        const scoreMatch = responseText.match(/"matchScore"\s*:\s*(\d+)/);
        
        // Extract array of missing keywords
        const keywordsRegex = /"missingKeywords"\s*:\s*\[([\s\S]*?)\]/;
        const keywordsMatch = responseText.match(keywordsRegex);
        let missingKeywords: string[] = [];
        if (keywordsMatch) {
          missingKeywords = keywordsMatch[1]
            .split(",")
            .map(s => s.replace(/"/g, "").trim())
            .filter(Boolean);
        }

        // Extract array of formatting issues
        const formatRegex = /"formattingIssues"\s*:\s*\[([\s\S]*?)\]/;
        const formatMatch = responseText.match(formatRegex);
        let formattingIssues: string[] = [];
        if (formatMatch) {
          formattingIssues = formatMatch[1]
            .split(",")
            .map(s => s.replace(/"/g, "").trim())
            .filter(Boolean);
        }

        // Extract suggestions string: locate aiSuggestions and grab until the end of the JSON object
        let suggestions = "";
        const suggestionsStartIdx = responseText.indexOf('"aiSuggestions"');
        if (suggestionsStartIdx !== -1) {
          const firstQuoteIdx = responseText.indexOf('"', suggestionsStartIdx + '"aiSuggestions"'.length);
          if (firstQuoteIdx !== -1) {
            const lastBraceIdx = responseText.lastIndexOf('}');
            let suggestionsVal = responseText.slice(firstQuoteIdx + 1, lastBraceIdx !== -1 ? lastBraceIdx : undefined).trim();
            // Remove trailing quote if present
            if (suggestionsVal.endsWith('"')) {
              suggestionsVal = suggestionsVal.slice(0, -1);
            } else if (suggestionsVal.endsWith('",') || suggestionsVal.endsWith('"}')) {
              suggestionsVal = suggestionsVal.slice(0, -2);
            } else if (suggestionsVal.match(/"\s*$/)) {
              suggestionsVal = suggestionsVal.replace(/"\s*$/, "");
            }
            suggestions = suggestionsVal.replace(/\\"/g, '"').replace(/\\n/g, '\n');
          }
        }

        analysis = {
          matchScore: scoreMatch ? parseInt(scoreMatch[1], 10) : 60,
          missingKeywords,
          formattingIssues,
          aiSuggestions: suggestions || "Analysis completed successfully. Please review keyword findings."
        };
      }
    }

    // Save Resume and Analysis Report
    const savedResume = await prisma.resume.create({
      data: {
        userId: currentUser.id,
        fileUrl: file.name,
        analysisReports: {
          create: {
            matchScore: analysis.matchScore,
            missingKeywords: analysis.missingKeywords.join(","),
            formattingIssues: analysis.formattingIssues.join(","),
            aiSuggestions: analysis.aiSuggestions,
          },
        },
      },
      include: {
        analysisReports: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    // Extract skills if possible and update user's profile, merging and deduplicating
    if (profile) {
      // Prompt Gemini to extract skills listed in the resume text
      const skillPrompt = `
        List the professional skills mentioned in the following resume text. 
        Return a JSON array of strings: string[].
        Resume:
        ${extractedText}
      `;
      try {
        const skillResult = await generateWithFallback(skillPrompt, { responseMimeType: "application/json" });
        const skillsArray = JSON.parse(skillResult.text) as string[];
        if (Array.isArray(skillsArray) && skillsArray.length > 0) {
          const existingSkills = profile.skills ? profile.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
          
          // Deduplicate and merge skills (case-insensitive deduplication, preserving case)
          const mergedSkills = [...existingSkills];
          skillsArray.forEach(newSkill => {
            const cleanNew = newSkill.trim();
            if (cleanNew && !mergedSkills.some(s => s.toLowerCase() === cleanNew.toLowerCase())) {
              mergedSkills.push(cleanNew);
            }
          });

          await prisma.profile.update({
            where: { userId: currentUser.id },
            data: {
              skills: mergedSkills.slice(0, 25).join(","), // store up to 25 key skills
            },
          });
        }
      } catch (skillErr) {
        console.error("Non-blocking error extracting profile skills:", skillErr);
      }
    }

    const firstReport = savedResume.analysisReports[0];
    return { 
      success: true, 
      report: {
        ...firstReport,
        missingKeywords: firstReport.missingKeywords ? firstReport.missingKeywords.split(",").filter(Boolean) : [],
        formattingIssues: firstReport.formattingIssues ? firstReport.formattingIssues.split(",").filter(Boolean) : []
      },
      filename: savedResume.fileUrl
    };
  } catch (error: any) {
    console.error("Resume scan error:", error);
    return { success: false, error: error.message || "An error occurred while scanning the resume" };
  }
}

/**
 * Fetch all resume scan history for the current user
 */
export async function getResumeScanHistory() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: currentUser.id },
      include: {
        analysisReports: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { uploadedAt: "desc" },
    });

    // Map database comma-separated strings back to arrays
    const formattedResumes = resumes.map(r => ({
      ...r,
      analysisReports: r.analysisReports.map(rep => ({
        ...rep,
        missingKeywords: rep.missingKeywords ? rep.missingKeywords.split(",").filter(Boolean) : [],
        formattingIssues: rep.formattingIssues ? rep.formattingIssues.split(",").filter(Boolean) : []
      }))
    }));

    return { success: true, resumes: formattedResumes };
  } catch (error: any) {
    console.error("Fetch resume history error:", error);
    return { success: false, error: error.message || "Failed to load resume history" };
  }
}

/**
 * Fetch a single resume report details
 */
export async function getResumeReportDetails(reportId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const report = await prisma.analysisReport.findUnique({
      where: { id: reportId },
      include: {
        resume: true,
      },
    });

    if (!report || report.resume.userId !== currentUser.id) {
      return { success: false, error: "Report not found" };
    }

    const formattedReport = {
      ...report,
      missingKeywords: report.missingKeywords ? report.missingKeywords.split(",").filter(Boolean) : [],
      formattingIssues: report.formattingIssues ? report.formattingIssues.split(",").filter(Boolean) : []
    };

    return { success: true, report: formattedReport };
  } catch (error: any) {
    console.error("Fetch report details error:", error);
    return { success: false, error: error.message || "Failed to load report details" };
  }
}

/**
 * Permanently deletes a single resume scan history and its reports from the database
 */
export async function deleteResume(resumeId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume || resume.userId !== currentUser.id) {
      return { success: false, error: "Resume scan report not found" };
    }

    // Deleting the Resume automatically triggers a cascade delete on AnalysisReport
    await prisma.resume.delete({
      where: { id: resumeId },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Delete resume error:", error);
    return { success: false, error: error.message || "Failed to delete resume scan" };
  }
}
