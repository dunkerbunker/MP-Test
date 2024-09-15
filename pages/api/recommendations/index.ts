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
    // Return a 204 No Content if the session is invalid or not passed
    return res.status(401).end();
  }

  if (req.method === "GET") {
    // Handle GET request
    try {
      const recommendations = await prisma.recommendation.findMany();
      res.status(200).json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ error: "Error fetching recommendations" });
    }
  } else if (req.method === "POST") {
    // Handle POST request
    try {
      const data = req.body;

      // Validate data using Yup
      await recommendationSchema.validate(data, { abortEarly: false });

      const newRecommendation = await prisma.recommendation.create({ data });
      res.status(201).json(newRecommendation);
    } catch (error) {
      console.error("Error creating recommendation:", error);

      if (error instanceof Yup.ValidationError) {
        res.status(400).json({ errors: (error as Yup.ValidationError).errors });
      } else if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        // Unique constraint failed
        res.status(400).json({
          error: "A recommendation with this Rec No already exists.",
        });
      } else {
        res.status(500).json({ error: "Error creating recommendation" });
      }
    }
  } else {
    // Handle unsupported methods
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
