import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import * as Yup from "yup";
import { Prisma } from "@prisma/client";
import { validateSession } from "../../../lib/auth"; // Make sure the path is correct

// Validation schema using Yup
const recommendationSchema = Yup.object().shape({
  day: Yup.number().integer().required("Day is required"),
  recno: Yup.number().integer().required("Rec No is required"),
  bundle_price: Yup.number().required("Bundle price is required"),
  data_volume: Yup.number().integer().required("Data volume is required"),
  data_validity: Yup.number().integer().required("Data validity is required"),
  data_price: Yup.number().required("Data price is required"),
  onnet_min: Yup.number().integer().required("On-net minutes are required"),
  onnet_validity: Yup.number()
    .integer()
    .required("On-net validity is required"),
  onnet_price: Yup.number().required("On-net price is required"),
  local_min: Yup.number().integer().required("Local minutes are required"),
  local_validity: Yup.number().integer().required("Local validity is required"),
  local_price: Yup.number().required("Local price is required"),
  sms: Yup.number().integer().required("SMS count is required"),
  sms_validity: Yup.number().integer().required("SMS validity is required"),
  sms_price: Yup.number().required("SMS price is required"),
  package_name: Yup.string().required("Package name is required"),
  package_Verbage: Yup.string().nullable(),
  Short_Desc: Yup.string().required("Short description is required"),
  Ribbon_text: Yup.string().nullable(),
  Giftpack: Yup.string().required("Giftpack is required"),
  mageypackid: Yup.string().required("Mageypack ID is required"),
});

// API handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Validate session
  const session = await validateSession(req);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  const { id } = req.query;
  const getVariants = req.query.getVariants === "true";

  if (req.method === "GET") {
    try {
      if (getVariants) {
        try {
          // Step 1: Fetch the mageypackid using the recid (id)
          const recommendation = await prisma.recommendation.findUnique({
            where: { recno: Number(id) }, // Assuming `recid` is `recno`
            select: { mageypackid: true }, // Only fetching the mageypackid
          });

          if (!recommendation || !recommendation.mageypackid) {
            return res
              .status(404)
              .json({ error: "No mageypackid found for the provided recid" });
          }

          // Step 2: Get all variants (recommendations) for the mageypackid and sort by day
          const variants = await prisma.recommendation.findMany({
            where: { mageypackid: recommendation.mageypackid },
            orderBy: { day: "asc" }, // Sorting by day
          });

          if (variants.length > 0) {
            return res.status(200).json(variants);
          } else {
            return res.status(404).json({ error: "No variants found" });
          }
        } catch (error) {
          console.error("Error fetching variants:", error);
          return res.status(500).json({ error: "Error fetching variants" });
        }
      } else {
        const recommendation = await prisma.recommendation.findUnique({
          where: { recno: Number(id) },
        });
        if (recommendation) {
          res.status(200).json(recommendation);
        } else {
          res.status(404).json({ error: "Recommendation not found" });
        }
      }
    } catch (error) {
      console.error("Error fetching recommendation:", error);
      res.status(500).json({ error: "Error fetching recommendation" });
    }
  } else if (req.method === "PUT") {
    try {
      const data = req.body;
      await recommendationSchema.validate(data, { abortEarly: false });

      const updatedRecommendation = await prisma.recommendation.update({
        where: { recno: Number(id) },
        data,
      });
      res.status(200).json(updatedRecommendation);
    } catch (error) {
      console.error("Error updating recommendation:", error);

      if (error instanceof Yup.ValidationError) {
        res.status(400).json({ errors: error.errors });
      } else if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        res.status(404).json({ error: "Recommendation not found" });
      } else {
        res.status(500).json({ error: "Error updating recommendation" });
      }
    }
  } else if (req.method === "DELETE") {
    try {
      await prisma.recommendation.delete({
        where: { recno: Number(id) },
      });
      res.status(200).json({ message: "Recommendation deleted" });
    } catch (error) {
      console.error("Error deleting recommendation:", error);

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        res.status(404).json({ error: "Recommendation not found" });
      } else {
        res.status(500).json({ error: "Error deleting recommendation" });
      }
    }
  } else {
    // Handle unsupported methods
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
