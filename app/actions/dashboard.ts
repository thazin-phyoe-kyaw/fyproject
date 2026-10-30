"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";

export interface DashboardData {
  success: boolean;
  error?: string;
  user?: {
    name: string;
    email: string;
    targetRole: string;
    experience: string;
    skills: string[];
  };
  stats?: {
    resumeScore: number;
    interviewScore: number;
    completedInterviews: number;
    missingSkillsCount: number;
  };
  resumes?: Array<{
    id: string;
    reportId: string;
    filename: string;
    date: string;
    score: number;
  }>;
  interviews?: Array<{
    id: string;
    role: string;
    date: string;
    overallScore: number;
    status: string;
  }>;
  skillGaps?: Array<{
    skill: string;
    category: string;
    level: string;
  }>;
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    // Load profile
    const profile = await prisma.profile.findUnique({
      where: { userId: currentUser.id }
    });

    const targetRole = profile?.targetJobRole || "Full Stack Developer";
    const userSkills = profile?.skills ? profile.skills.split(",").filter(Boolean) : [];
    const experience = profile?.experience || "Entry Level";

    // Fetch scans
    const scans = await prisma.resume.findMany({
      where: { userId: currentUser.id },
      include: {
        analysisReports: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { uploadedAt: "desc" },
      take: 5
    });

    // Fetch interviews with feedback
    const sessions = await prisma.interviewSession.findMany({
      where: { userId: currentUser.id },
      include: { feedback: true },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    // Compute stats
    const latestScanScore = scans[0]?.analysisReports[0]?.matchScore || 0;
    
    const completedSessions = sessions.filter(s => s.status.startsWith("COMPLETED"));
    const gradedSessions = completedSessions.filter(s => s.feedback !== null);
    
    const avgInterviewScore = gradedSessions.length > 0
      ? Math.round(gradedSessions.reduce((acc, s) => acc + (s.feedback?.overallScore || 0), 0) / gradedSessions.length)
      : 0;

    // Dynamically derive some skill gaps based on target role
    let defaultGaps = [
      { skill: "Docker & Containerization", category: "DevOps", level: "Missing" },
      { skill: "Unit Testing (Jest/Cypress)", category: "Testing", level: "Weak" },
    ];

    const targetRoleLower = (targetRole || "Full Stack Developer").toLowerCase();
    if (targetRoleLower.includes("backend") || targetRoleLower.includes("full stack")) {
      defaultGaps.push({ skill: "Redis Caching & Queue Management", category: "Backend", level: "Missing" });
    } else if (targetRoleLower.includes("frontend") || targetRoleLower.includes("react")) {
      defaultGaps.push({ skill: "Tailwind CSS v4 & Theme config", category: "Frontend", level: "Weak" });
    } else {
      defaultGaps.push({ skill: "System Architecture Design", category: "System", level: "Missing" });
    }

    // Filter out gaps if the user already has them in their profile skills list
    const filteredGaps = defaultGaps.filter(gap => 
      !userSkills.some(s => (s || "").toLowerCase().includes((gap.skill || "").split(" ")[0].toLowerCase()))
    );

    return {
      success: true,
      user: {
        name: currentUser.name,
        email: currentUser.email,
        targetRole,
        experience,
        skills: userSkills
      },
      stats: {
        resumeScore: latestScanScore,
        interviewScore: avgInterviewScore,
        completedInterviews: completedSessions.length,
        missingSkillsCount: filteredGaps.length
      },
      resumes: scans.map(s => ({
        id: s.id,
        reportId: s.analysisReports[0]?.id || "",
        filename: s.fileUrl,
        date: new Date(s.uploadedAt).toLocaleDateString(),
        score: s.analysisReports[0]?.matchScore || 0
      })),
      interviews: sessions.map(s => {
        const parts = s.status.split("|");
        const role = parts[3] || "Developer";
        return {
          id: s.id,
          role,
          date: new Date(s.createdAt).toLocaleDateString(),
          overallScore: s.feedback?.overallScore || 0,
          status: s.status.startsWith("COMPLETED") ? "COMPLETED" : "ONGOING"
        };
      }),
      skillGaps: filteredGaps
    };
  } catch (error: any) {
    console.error("Dashboard data load error:", error);
    return { success: false, error: error.message || "Failed to load dashboard statistics" };
  }
}
