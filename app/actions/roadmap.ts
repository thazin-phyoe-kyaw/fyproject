"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { generateWithFallback } from "@/lib/gemini";

export interface RoadmapStep {
  id: string;
  title: string;
  status: "COMPLETED" | "IN_PROGRESS" | "LOCKED";
  time: string;
  concepts: string[];
  resources: string[];
}

export interface RoadmapOptions {
  pace?: string;
  focus?: string;
}

/**
 * Dynamically generates or retrieves a personalized learning roadmap based on the user's profile and settings.
 */
export async function getPersonalizedRoadmap(options?: RoadmapOptions) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    // Load profile
    const profile = await prisma.profile.findUnique({
      where: { userId: currentUser.id },
    });

    const targetRole = profile?.targetJobRole || "Full Stack Developer";
    const currentSkills = profile?.skills ? profile.skills.split(",").filter(Boolean).map(s => s.trim()) : [];
    const experience = profile?.experience || "Entry Level";

    const selectedPace = options?.pace || "Standard";
    const selectedFocus = options?.focus || "Practical Projects";

    // 1. Check for cached/saved roadmap first
    const savedRoadmap = await prisma.careerRoadmap.findUnique({
      where: { userId: currentUser.id },
      include: {
        modules: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (
      savedRoadmap &&
      savedRoadmap.targetRole === targetRole &&
      savedRoadmap.pace === selectedPace &&
      savedRoadmap.focus === selectedFocus &&
      savedRoadmap.modules.length === 4
    ) {
      const steps: RoadmapStep[] = savedRoadmap.modules.map((mod) => ({
        id: mod.stepId,
        title: mod.title,
        status: mod.status as "COMPLETED" | "IN_PROGRESS" | "LOCKED",
        time: mod.time,
        concepts: mod.concepts.split(",").filter(Boolean).map(c => c.trim()),
        resources: mod.resources.split(",").filter(Boolean).map(r => r.trim()),
      }));

      return {
        success: true,
        targetRole,
        pace: savedRoadmap.pace,
        focus: savedRoadmap.focus,
        steps,
      };
    }

    // 2. Cache miss: generate fresh roadmap via Gemini
    const prompt = `
      You are an expert career mentor and technical development coach.
      The candidate wants to become a "${targetRole}".
      Their current skills are: ${currentSkills.join(", ") || "None specified"}.
      Their experience level is: "${experience}".
      
      Study Pace Preference: "${selectedPace}" (Standard: ~15 hrs/module, Accelerated: ~8 hrs/module, Deep Dive: ~30 hrs/module).
      Learning Focus Preference: "${selectedFocus}" (Practical Projects: focus on building things, Conceptual Theory: focus on core concepts, Interview Prep: focus on common interview questions).
      
      Identify the core skill gaps between their current skills and the typical corporate requirements of the target role, taking their preferences into account.
      Generate a structured, step-by-step career learning path consisting of exactly 4 modules.
      
      Your response must be a JSON array of exactly 4 objects matching this schema:
      [
        {
          "id": "step_1",
          "title": "Module 1: [Name of Module]",
          "status": "IN_PROGRESS", (the first module should be "IN_PROGRESS", others should be "LOCKED")
          "time": "[Estimated hours, e.g. 15 hours]",
          "concepts": string[], (3-5 core technical competencies or sub-topics to learn matching the pace and focus)
          "resources": string[] (2-3 suggested online resources or documentation links matching the focus)
        },
        {
          "id": "step_2",
          "title": "Module 2: [Name of Module]",
          "status": "LOCKED",
          "time": "[Estimated hours]",
          "concepts": string[],
          "resources": string[]
        },
        ...
      ]
    `;

    const result = await generateWithFallback(prompt, { responseMimeType: "application/json" });
    let responseText = result.text.trim();

    // Strip markdown code block wrappers if they exist
    if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let steps: RoadmapStep[];
    try {
      steps = JSON.parse(responseText) as RoadmapStep[];
    } catch (parseErr) {
      console.warn("Roadmap JSON parse failed, running regex fallback parser...", parseErr);
      
      // Attempt manual extraction of exactly 4 modules from response text
      steps = [];
      const moduleBlocks = responseText.split(/{[\s\S]*?"id"\s*:/).slice(1);
      
      for (let i = 0; i < 4; i++) {
        const block = moduleBlocks[i] || "";
        const titleMatch = block.match(/"title"\s*:\s*"([^"]*)"/);
        const timeMatch = block.match(/"time"\s*:\s*"([^"]*)"/);
        
        // Extract concepts
        const conceptsMatch = block.match(/"concepts"\s*:\s*\[([\s\S]*?)\]/);
        const concepts = conceptsMatch 
          ? conceptsMatch[1].split(",").map(c => c.replace(/"/g, "").trim()).filter(Boolean)
          : ["General Development"];
          
        // Extract resources
        const resourcesMatch = block.match(/"resources"\s*:\s*\[([\s\S]*?)\]/);
        const resources = resourcesMatch 
          ? resourcesMatch[1].split(",").map(r => r.replace(/"/g, "").trim()).filter(Boolean)
          : ["Documentation"];

        steps.push({
          id: `step_${i+1}`,
          title: titleMatch ? titleMatch[1] : `Module ${i+1}`,
          status: i === 0 ? "IN_PROGRESS" : "LOCKED",
          time: timeMatch ? timeMatch[1] : "15 hours",
          concepts,
          resources
        });
      }
    }

    // 3. Persist the generated roadmap to the database
    // Delete any old roadmaps first
    await prisma.careerRoadmap.deleteMany({
      where: { userId: currentUser.id },
    });

    await prisma.careerRoadmap.create({
      data: {
        userId: currentUser.id,
        targetRole,
        pace: selectedPace,
        focus: selectedFocus,
        modules: {
          create: steps.map((step, idx) => ({
            stepId: step.id,
            title: step.title,
            status: step.status,
            time: step.time,
            concepts: step.concepts.join(","),
            resources: step.resources.join(","),
            order: idx,
          })),
        },
      },
    });

    return { 
      success: true, 
      targetRole,
      pace: selectedPace,
      focus: selectedFocus,
      steps 
    };
  } catch (error: any) {
    console.error("Roadmap generation error:", error);
    return { success: false, error: error.message || "Failed to generate career roadmap" };
  }
}

/**
 * Updates the completion status of a roadmap module.
 * Dynamically locks/unlocks sequential modules.
 * Syncs completed skills back to the profile settings.
 */
export async function updateRoadmapModuleStatus(stepId: string, newStatus: "COMPLETED" | "IN_PROGRESS") {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const roadmap = await prisma.careerRoadmap.findUnique({
      where: { userId: currentUser.id },
      include: {
        modules: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!roadmap) {
      return { success: false, error: "Roadmap not found" };
    }

    const modules = roadmap.modules;
    const targetModuleIndex = modules.findIndex((m) => m.stepId === stepId);
    if (targetModuleIndex === -1) {
      return { success: false, error: "Module not found" };
    }

    // 1. Update the status of the target module in DB
    await prisma.roadmapModule.update({
      where: { id: modules[targetModuleIndex].id },
      data: { status: newStatus },
    });

    // 2. Unlocking and Locking flows
    if (newStatus === "COMPLETED") {
      // Unlock the immediate next module if locked
      const nextIndex = targetModuleIndex + 1;
      if (nextIndex < modules.length && modules[nextIndex].status === "LOCKED") {
        await prisma.roadmapModule.update({
          where: { id: modules[nextIndex].id },
          data: { status: "IN_PROGRESS" },
        });
      }
    } else if (newStatus === "IN_PROGRESS") {
      // Re-lock all subsequent modules since this is now in progress
      for (let i = targetModuleIndex + 1; i < modules.length; i++) {
        await prisma.roadmapModule.update({
          where: { id: modules[i].id },
          data: { status: "LOCKED" },
        });
      }
    }

    // 3. Skill syncing
    if (newStatus === "COMPLETED") {
      const completedModule = modules[targetModuleIndex];
      const concepts = completedModule.concepts.split(",").map(c => c.trim()).filter(Boolean);

      const profile = await prisma.profile.findUnique({
        where: { userId: currentUser.id },
      });

      if (profile) {
        const existingSkills = profile.skills ? profile.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
        const updatedSkillsSet = new Set([...existingSkills, ...concepts]);
        const updatedSkills = Array.from(updatedSkillsSet).join(", ");

        await prisma.profile.update({
          where: { userId: currentUser.id },
          data: { skills: updatedSkills },
        });
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Update roadmap module status error:", error);
    return { success: false, error: error.message || "Failed to update module status" };
  }
}

/**
 * Deletes current roadmap to force a fresh regenerate with updated parameters.
 */
export async function regenerateRoadmap(options: RoadmapOptions & { targetRole?: string }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    if (options.targetRole) {
      await prisma.profile.update({
        where: { userId: currentUser.id },
        data: { targetJobRole: options.targetRole },
      });
    }

    await prisma.careerRoadmap.deleteMany({
      where: { userId: currentUser.id },
    });

    return getPersonalizedRoadmap(options);
  } catch (error: any) {
    console.error("Regenerate roadmap error:", error);
    return { success: false, error: error.message || "Failed to regenerate career roadmap" };
  }
}
