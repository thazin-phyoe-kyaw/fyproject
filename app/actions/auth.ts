"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "hireready_session_super_secret_key_12345";
const SESSION_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds

export interface UserSession {
  id: string;
  email: string;
  name: string;
  targetJobRole?: string;
  experience?: string;
  skills: string[];
}

/**
 * Helper to generate token and set session cookie
 */
async function createSession(userId: string, email: string, name: string) {
  const token = jwt.sign({ userId, email, name }, JWT_SECRET, {
    expiresIn: "7d",
  });

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRY,
  });
}

/**
 * Register a new user and create an empty profile
 */
export async function registerUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      return { success: false, error: "Please fill in all fields" };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long" };
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user and profile
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        profile: {
          create: {
            targetJobRole: "", // Empty to trigger onboarding wizard
            experience: "Entry Level",
            skills: "",
          },
        },
      },
    });

    // Create login session
    await createSession(user.id, user.email, user.name);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: error.message || "Failed to register account" };
  }
}

/**
 * Verify credentials and sign in user
 */
export async function loginUser(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { success: false, error: "Please provide email and password" };
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    // Compare passwords
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid email or password" };
    }

    // Create login session
    await createSession(user.id, user.email, user.name);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, error: error.message || "Failed to sign in" };
  }
}

/**
 * Retrieve current user session and profile info
 */
export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return null;
    }

    const decoded = jwt.verify(sessionToken, JWT_SECRET) as {
      userId: string;
      email: string;
      name: string;
    };

    if (!decoded || !decoded.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      targetJobRole: user.profile?.targetJobRole,
      experience: user.profile?.experience,
      skills: user.profile?.skills ? user.profile.skills.split(",").filter(Boolean) : [],
    };
  } catch (error) {
    // Session token expired or invalid
    return null;
  }
}

/**
 * Sign out user by clearing the session cookie
 */
export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    return { success: true };
  } catch (error: any) {
    console.error("Logout error:", error);
    return { success: false, error: "Failed to sign out" };
  }
}

/**
 * Update user target role, experience and skills in Profile
 */
export async function updateUserProfile(data: {
  targetJobRole: string;
  experience: string;
  skills: string[];
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.profile.update({
      where: { userId: currentUser.id },
      data: {
        targetJobRole: data.targetJobRole,
        experience: data.experience,
        skills: data.skills.join(","),
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Update profile error:", error);
    return { success: false, error: error.message || "Failed to update profile" };
  }
}

/**
 * Update user basic info (name/username and email/identifier)
 */
export async function updateUserInfo(data: {
  name: string;
  email: string;
  targetJobRole?: string;
  skills?: string;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    if (!data.name || !data.email) {
      return { success: false, error: "Name and email are required" };
    }

    // Check if new email is already taken by another user
    if (data.email.toLowerCase() !== currentUser.email.toLowerCase()) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });
      if (existingUser) {
        return { success: false, error: "An account with this email/username already exists" };
      }
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: currentUser.id },
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
        },
      }),
      prisma.profile.upsert({
        where: { userId: currentUser.id },
        update: {
          targetJobRole: data.targetJobRole || "",
          skills: data.skills || "",
        },
        create: {
          userId: currentUser.id,
          targetJobRole: data.targetJobRole || "",
          skills: data.skills || "",
          experience: "Entry Level",
        },
      }),
    ]);

    // Recreate the session with the new credentials
    await createSession(currentUser.id, data.email.toLowerCase(), data.name);

    return { success: true };
  } catch (error: any) {
    console.error("Update user info error:", error);
    return { success: false, error: error.message || "Failed to update settings" };
  }
}

/**
 * Delete user account and cascade delete all records
 */
export async function deleteUserAccount() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    // Cascade delete user in database (Prisma handles deleting profile, resumes, interviews)
    await prisma.user.delete({
      where: { id: currentUser.id },
    });

    // Clear the session cookie
    const cookieStore = await cookies();
    cookieStore.delete("session");

    return { success: true };
  } catch (error: any) {
    console.error("Delete user account error:", error);
    return { success: false, error: error.message || "Failed to delete account" };
  }
}

