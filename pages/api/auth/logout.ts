import { NextApiRequest, NextApiResponse } from "next";
import { logoutSession } from "../../../lib/auth";

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

    // Perform the logout action
    await logoutSession(req); // Passing NextApiRequest here

    // Clear the session cookie
    res.setHeader("Set-Cookie", "session_token=; HttpOnly; Path=/; Max-Age=0");

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error: unknown) {
    // Type guard to check if it's an instance of Error
    if (error instanceof Error) {
      console.error("Error during logout:", error.message);
      return res.status(500).json({
        success: false,
        error: {
          message: "An unexpected error occurred during logout",
          code: "INTERNAL_SERVER_ERROR",
          details: error.message || "No additional details",
        },
      });
    } else {
      // Handle non-Error types (e.g., strings, objects)
      console.error("Unknown error during logout:", error);
      return res.status(500).json({
        success: false,
        error: {
          message: "An unknown error occurred during logout",
          code: "INTERNAL_SERVER_ERROR",
          details: String(error) || "No additional details",
        },
      });
    }
  }
}
