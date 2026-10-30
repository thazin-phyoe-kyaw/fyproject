"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { generateWithFallback } from "@/lib/gemini";

interface InterviewFeedback {
  overallScore: number;
  grammarScore: number;
  technicalScore: number;
  detailedAnalysis: string;
}

/**
 * Start a new mock interview session.
 * Generates the first question from the AI interviewer.
 */
export async function createInterviewSession(
  jobRole: string,
  difficulty: string,
  questionLimitStr: string,
  jobDescription?: string
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    // The fallback wrapper automatically validates environment configurations

    // Parse question count (e.g. "5 Questions" -> 5)
    let questionLimit = 5;
    const match = questionLimitStr.match(/\d+/);
    if (match) {
      questionLimit = parseInt(match[0], 10);
    }

    // Create session in database (store configuration inside a JSON metadata or we can keep it standard)
    // Wait, the schema.prisma has Status but no difficulty/limit fields. We can append metadata inside Status or format status as "ONGOING:<limit>:<difficulty>:<role>".
    // Or we can just store the target role/difficulty in the first system prompt. That's even cleaner!
    const session = await prisma.interviewSession.create({
      data: {
        userId: currentUser.id,
        status: `ONGOING|${questionLimit}|${difficulty}|${jobRole}`,
      },
    });

    // Generate first question using Gemini

    const prompt = `
      You are behaving as a professional technical interviewer (Engineering Lead/Manager) for the role of "${jobRole}" (${difficulty} level).
      ${jobDescription ? `The job requirements/description is: "${jobDescription}"` : ""}
      
      Your task:
      Begin the interview. Introduce yourself briefly, welcome the candidate, and ask the first interview question. 
      Keep it professional, supportive, and realistic. Ask exactly ONE question. Do not ask multiple questions.
    `;

    const result = await generateWithFallback(prompt);
    const firstQuestion = result.text.trim();

    // Save AI's first message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: "AI",
        message: firstQuestion,
      },
    });

    return { success: true, sessionId: session.id };
  } catch (error: any) {
    console.error("Create interview session error:", error);
    return { success: false, error: error.message || "Failed to start interview" };
  }
}

/**
 * Handle turn-based chat conversation.
 * Saves the user's response and returns the next AI question,
 * or completes and grades the interview if the question limit has been reached.
 */
export async function sendInterviewMessage(sessionId: string, userMessage: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    // Load session and chat history
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        chatHistory: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!session || session.userId !== currentUser.id) {
      return { success: false, error: "Interview session not found" };
    }

    if (session.status.startsWith("COMPLETED")) {
      return { success: false, error: "This interview has already been completed" };
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId,
        sender: "USER",
        message: userMessage,
      },
    });

    // Parse status metadata "ONGOING|limit|difficulty|role"
    const parts = session.status.split("|");
    const limit = parts[1] ? parseInt(parts[1], 10) : 5;
    const difficulty = parts[2] || "Junior";
    const jobRole = parts[3] || "React Developer";

    // Count how many questions the AI has asked so far
    const questionsAsked = session.chatHistory.filter(m => m.sender === "AI").length;

    if (questionsAsked >= limit) {
      // Limit reached! End the interview
      // Update session status to COMPLETED
      await prisma.interviewSession.update({
        where: { id: sessionId },
        data: { status: "COMPLETED" },
      });

      // Save a final AI closing message
      const closingMsg = "Thank you for your response. That concludes our mock interview session! I am compiling your detailed feedback report now. Please wait a moment...";
      await prisma.chatMessage.create({
        data: {
          sessionId,
          sender: "AI",
          message: closingMsg,
        },
      });

      // Trigger background grading (fire-and-forget, don't await)
      completeAndEvaluateSession(sessionId, jobRole, difficulty).catch(err => 
        console.error("Background grading error:", err)
      );

      return { 
        success: true, 
        completed: true,
        aiMessage: closingMsg 
      };
    }

    // Otherwise, generate next question

    // Format chat history for prompt context
    const historyText = session.chatHistory
      .map(m => `${m.sender}: ${m.message}`)
      .join("\n") + `\nUSER: ${userMessage}`;

    const prompt = `
      You are behaving as a professional technical interviewer for the role of "${jobRole}" (${difficulty} level).
      Here is the interview conversation history so far:
      ---
      ${historyText}
      ---
      
      Your task:
      Ask the next logical interview question (this will be question #${questionsAsked + 1} of ${limit}).
      Acknowledge their answer briefly if needed, but do not provide feedback yet. 
      Ask exactly ONE question. Keep your tone professional and engaging.
    `;

    const result = await generateWithFallback(prompt);
    const nextQuestion = result.text.trim();

    // Save AI's message
    await prisma.chatMessage.create({
      data: {
        sessionId,
        sender: "AI",
        message: nextQuestion,
      },
    });

    return { 
      success: true, 
      completed: false,
      aiMessage: nextQuestion 
    };
  } catch (error: any) {
    console.error("Send message error:", error);
    return { success: false, error: error.message || "Failed to process message" };
  }
}

/**
 * Evaluates the interview transcript and generates scores and detailed analysis
 */
export async function completeAndEvaluateSession(sessionId: string, jobRole: string, difficulty: string) {
  try {
    // Fetch all messages
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { timestamp: "asc" },
    });

    if (messages.length === 0) return { success: false, error: "No transcript history" };

    const transcript = messages
      .map(m => `${m.sender}: ${m.message}`)
      .join("\n");

    // Model call will use the fallback wrapper

    // Trim transcript if too long (keep first 2 + last N messages to reduce token count)
    const MAX_TRANSCRIPT_CHARS = 8000;
    let trimmedTranscript = transcript;
    if (transcript.length > MAX_TRANSCRIPT_CHARS) {
      const msgs = messages.map(m => `${m.sender}: ${m.message}`);
      // Keep first 2 messages (intro + first Q) and as many recent as fit
      const intro = msgs.slice(0, 2).join("\n");
      const remaining = msgs.slice(2);
      let recentMessages: string[] = [];
      let charCount = intro.length + 50; // buffer for separator
      for (let i = remaining.length - 1; i >= 0; i--) {
        if (charCount + remaining[i].length > MAX_TRANSCRIPT_CHARS) break;
        recentMessages.unshift(remaining[i]);
        charCount += remaining[i].length;
      }
      trimmedTranscript = intro + "\n...\n" + recentMessages.join("\n");
    }

    const prompt = `
      You are an expert technical interviewer and communication coach.
      Evaluate the following mock interview transcript for a "${jobRole}" role (${difficulty} difficulty).
      
      Review the candidate's answers for:
      1. Technical accuracy and depth of explanations.
      2. Communication structure (like using the STAR framework for behavioral or clear bullet points for technical questions).
      3. Vocabulary, professionalism, and grammar.
      
      Provide a structured evaluation in JSON format matching this schema exactly:
      {
        "overallScore": number, (integer between 0 and 100)
        "grammarScore": number, (integer between 0 and 100)
        "technicalScore": number, (integer between 0 and 100)
        "detailedAnalysis": string (markdown formatting, including:
          ### 1. Strengths
          - Bullet points of what they did well
          
          ### 2. Areas for Improvement
          - Bullet points of what to improve
          
          ### 3. Question-by-Question Analysis
          - Review of specific questions asked and how they could improve their specific answer.
          - Provide a sample "Model Answer" for each question.
        )
      }
      
      Transcript:
      ---
      ${trimmedTranscript}
      ---
    `;

    const result = await generateWithFallback(prompt, { responseMimeType: "application/json" });
    let responseText = result.text.trim();

    // Strip markdown code block wrappers if they exist
    if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let evaluation: InterviewFeedback;
    try {
      evaluation = JSON.parse(responseText) as InterviewFeedback;
    } catch (parseErr) {
      console.warn("Gemini evaluation JSON parse failed, running regex fallback parser...", parseErr);
      
      // Extract scores using regex
      const overallMatch = responseText.match(/"overallScore"\s*:\s*(\d+)/);
      const grammarMatch = responseText.match(/"grammarScore"\s*:\s*(\d+)/);
      const technicalMatch = responseText.match(/"technicalScore"\s*:\s*(\d+)/);
      
      // Extract the detailedAnalysis text
      let detailedText = "";
      const analysisRegex = /"detailedAnalysis"\s*:\s*"([\s\S]*?)"\s*[\},]/;
      const analysisMatch = responseText.match(analysisRegex);
      if (analysisMatch) {
        detailedText = analysisMatch[1]
          .replace(/\\"/g, '"')
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t');
      } else {
        // Fallback: If we couldn't match the specific field, use the response text itself
        detailedText = responseText;
      }

      evaluation = {
        overallScore: overallMatch ? parseInt(overallMatch[1], 10) : 70,
        grammarScore: grammarMatch ? parseInt(grammarMatch[1], 10) : 70,
        technicalScore: technicalMatch ? parseInt(technicalMatch[1], 10) : 70,
        detailedAnalysis: detailedText || "Could not parse analysis details automatically. The interview was completed successfully."
      };
    }

    // Save feedback
    await prisma.feedback.create({
      data: {
        sessionId,
        overallScore: evaluation.overallScore,
        grammarScore: evaluation.grammarScore,
        technicalScore: evaluation.technicalScore,
        detailedAnalysis: evaluation.detailedAnalysis,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Interview evaluation error:", error);
    return { success: false, error: error.message || "Failed to generate evaluation" };
  }
}

/**
 * Fetch details of a single interview session including history and feedback
 */
export async function getInterviewSessionDetails(sessionId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        chatHistory: {
          orderBy: { timestamp: "asc" },
        },
        feedback: true,
      },
    });

    if (!session || session.userId !== currentUser.id) {
      return { success: false, error: "Session not found" };
    }

    return { success: true, session };
  } catch (error: any) {
    console.error("Get session details error:", error);
    return { success: false, error: error.message || "Failed to load session details" };
  }
}

/**
 * Fetch all completed interview sessions for the current user
 */
export async function getInterviewHistory() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const sessions = await prisma.interviewSession.findMany({
      where: { 
        userId: currentUser.id,
      },
      include: {
        feedback: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, sessions };
  } catch (error: any) {
    console.error("Get interview history error:", error);
    return { success: false, error: error.message || "Failed to load interview history" };
  }
}

/**
 * Retry evaluation for a session that failed grading.
 * Called from the feedback page if no feedback exists yet.
 */
export async function retryEvaluation(sessionId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== currentUser.id) {
      return { success: false, error: "Session not found" };
    }

    // Check if feedback already exists
    const existingFeedback = await prisma.feedback.findUnique({
      where: { sessionId },
    });
    if (existingFeedback) {
      return { success: true }; // Already graded
    }

    // Extract role and difficulty from status history
    const parts = session.status.split("|");
    const difficulty = parts[2] || "Junior";
    const jobRole = parts[3] || "Software Developer";

    return await completeAndEvaluateSession(sessionId, jobRole, difficulty);
  } catch (error: any) {
    console.error("Retry evaluation error:", error);
    return { success: false, error: error.message || "Failed to retry evaluation" };
  }
}
