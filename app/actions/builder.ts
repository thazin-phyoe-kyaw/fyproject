"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { generateWithFallback } from "@/lib/gemini";

export interface BuiltResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  skills: string;
  experience: any[];
  education: any[];
  template?: string;
  themeColor?: string;
}

/**
 * Enhances a draft resume summary using Google Gemini AI, aligning it to a target job role.
 */
export async function enhanceResumeSummary(summaryText: string, targetRole: string) {
  try {
    const prompt = `
      You are an expert resume writer and recruiter.
      Enhance the following draft candidate summary to make it highly professional, attractive, and aligned with the target job role: "${targetRole}".
      Focus on action-oriented keywords. Do not use placeholders or generic phrases.
      Keep the length concise, between 70 to 100 words (3-4 sentences max).
      
      Draft Summary:
      "${summaryText}"
      
      Enhanced Summary:
    `;

    const result = await generateWithFallback(prompt);
    const enhancedText = result.text.replace(/^"|"$/g, "").trim(); // Remove leading/trailing quotes if present

    return { success: true, enhancedSummary: enhancedText };
  } catch (error: any) {
    console.error("Enhance summary error:", error);
    return { success: false, error: error.message || "Failed to enhance summary" };
  }
}

/**
 * Retrieves the saved resume draft for the current authenticated user.
 * If none exists, returns a pre-populated default object.
 */
export async function getBuiltResume() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const savedResume = await prisma.builtResume.findUnique({
      where: { userId: currentUser.id },
    });

    if (savedResume) {
      return { 
        success: true, 
        resume: {
          ...savedResume,
          experience: savedResume.experience as any[],
          education: savedResume.education as any[]
        }
      };
    }

    // Fallback: pre-populate defaults from profile settings
    const profile = await prisma.profile.findUnique({
      where: { userId: currentUser.id },
    });

    const defaultResume = {
      name: currentUser.name || "",
      email: currentUser.email || "",
      phone: "",
      location: "",
      website: "",
      summary: "",
      skills: profile?.skills || "",
      experience: [],
      education: [],
      template: "classic",
      themeColor: "slate",
    };

    return { success: true, resume: defaultResume, isNew: true };
  } catch (error: any) {
    console.error("Get built resume error:", error);
    return { success: false, error: error.message || "Failed to retrieve resume draft" };
  }
}

/**
 * Saves or updates the candidate's resume builder details in the database.
 */
export async function saveBuiltResume(data: BuiltResumeData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const savedResume = await prisma.builtResume.upsert({
      where: { userId: currentUser.id },
      update: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        website: data.website,
        summary: data.summary,
        skills: data.skills,
        experience: data.experience || [],
        education: data.education || [],
        template: data.template || "classic",
        themeColor: data.themeColor || "slate",
      },
      create: {
        userId: currentUser.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        website: data.website,
        summary: data.summary,
        skills: data.skills,
        experience: data.experience || [],
        education: data.education || [],
        template: data.template || "classic",
        themeColor: data.themeColor || "slate",
      },
    });

    return { 
      success: true, 
      resume: {
        ...savedResume,
        experience: savedResume.experience as any[],
        education: savedResume.education as any[]
      } 
    };
  } catch (error: any) {
    console.error("Save built resume error:", error);
    return { success: false, error: error.message || "Failed to save resume draft" };
  }
}
