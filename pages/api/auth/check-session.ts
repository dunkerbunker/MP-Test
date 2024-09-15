import { NextApiRequest, NextApiResponse } from "next";
import { validateSession } from "../../../lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const user = await validateSession(req);

    if (user) {
      return res.status(200).json({ isAuthenticated: true });
    } else {
      return res.status(401).json({ isAuthenticated: false });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
