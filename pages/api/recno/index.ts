import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { validateSession } from "../../../lib/auth"; // Make sure the path is correct

// API handler for /recno
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Validate session
  const session = await validateSession(req);

  if (!session) {
    // Return a 204 No Content if the session is invalid or not passed
    return res.status(401).end();
  }

  if (req.method === "GET") {
    // Handle GET request
    try {
      // Get the highest recno value
      const highestRecno = await prisma.recommendation.findFirst({
        orderBy: {
          recno: "desc", // Order by recno in descending order to get the highest one
        },
        select: {
          recno: true, // Only select the recno field
        },
      });

      // If no records found, return a default response
      if (!highestRecno) {
        return res.status(200).json({ recno: null });
      }

      // Return the highest recno value + 1
      res.status(200).json({ recno: highestRecno.recno + 1 });
    } catch (error) {
      console.error("Error fetching the highest recno:", error);
      res.status(500).json({ error: "Error fetching the highest recno" });
    }
  } else {
    // Handle unsupported methods
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
