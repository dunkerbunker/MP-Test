export const config = {
  runtime: "nodejs",
};

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { NextApiRequest } from "next"; // Change to NextApiRequest
import { NextRequest } from "next/server"; // Change to NextRequest

const prisma = new PrismaClient();
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Hash the password
export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

// Compare the password
export async function comparePassword(
  password: string,
  hashedPassword: string,
) {
  // return await bcrypt.compare(password, hashedPassword);
  return password === hashedPassword; // Change to compare passwords in plain text
}

// Create a session token
export async function createSession(userId: number) {
  const sessionToken = uuidv4();
  const expirationTime = new Date(Date.now() + SESSION_DURATION);

  await prisma.session.create({
    data: {
      userId,
      sessionToken,
      expiresAt: expirationTime,
    },
  });

  return sessionToken;
}

// Validate the session token
export async function validateSession(req: NextRequest | NextApiRequest) {
  let token: string | null = null;

  // For NextRequest (middleware)
  if (req instanceof NextRequest) {
    token = req.cookies.get("session_token")?.value || null;
  }
  // For NextApiRequest (API routes)
  else if ("cookies" in req) {
    token = req.cookies["session_token"] || null;
  }

  if (!token) {
    return null;
  }

  // Fetch the session from the database using Prisma
  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: true },
  });

  // Check if session exists and hasn't expired
  if (!session || new Date() > session.expiresAt) {
    return null;
  }

  // Return the user associated with the session
  return session.user;
}

// Logout the session
export async function logoutSession(req: NextApiRequest) {
  // Change to NextApiRequest
  const token = req.cookies["session_token"]; // Change to handle cookies in NextApiRequest
  if (token) {
    await prisma.session.deleteMany({
      where: { sessionToken: token },
    });
  }
}
