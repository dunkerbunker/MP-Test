import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { comparePassword, createSession } from "../../../lib/auth";
import { Prisma } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({
        success: false,
        error: {
          message: `Method ${req.method} Not Allowed`,
          code: "METHOD_NOT_ALLOWED",
        },
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Email and password are required",
          code: "MISSING_CREDENTIALS",
        },
      });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
        },
      });
    }

    // Validate credentials
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
        },
      });
    }

    // Create a session token and set it as a cookie
    const sessionToken = await createSession(user.id);

    // Set the cookie with SameSite and Secure attributes
    res.setHeader(
      "Set-Cookie",
      `session_token=${sessionToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`, // Consider 'Secure' for production
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error: unknown) {
    console.error("Error during login:", error);

    // Type guard for Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(500).json({
        success: false,
        error: {
          message: "Database error occurred while processing the request",
          code: "DATABASE_ERROR",
          details: error.message,
        },
      });
    }

    // Type guard for general Error
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: {
          message: "An unexpected error occurred during login",
          code: "INTERNAL_SERVER_ERROR",
          details: error.message || "No additional details",
        },
      });
    }

    // Catch-all for unknown error types
    return res.status(500).json({
      success: false,
      error: {
        message: "An unknown error occurred during login",
        code: "INTERNAL_SERVER_ERROR",
        details: String(error) || "No additional details",
      },
    });
  }
}
