import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import * as Yup from 'yup';
import { Prisma } from '@prisma/client';

// Validation schema using Yup
const recommendationSchema = Yup.object().shape({
  day: Yup.number().integer().required('Day is required'),
  recno: Yup.number().integer().required('Rec No is required'),
  bundle_price: Yup.number().required('Bundle price is required'),
  data_volume: Yup.number().integer().required('Data volume is required'),
  data_validity: Yup.number().integer().required('Data validity is required'),
  data_price: Yup.number().required('Data price is required'),
  onnet_min: Yup.number().integer().required('On-net minutes are required'),
  onnet_validity: Yup.number().integer().required('On-net validity is required'),
  onnet_price: Yup.number().required('On-net price is required'),
  local_min: Yup.number().integer().required('Local minutes are required'),
  local_validity: Yup.number().integer().required('Local validity is required'),
  local_price: Yup.number().required('Local price is required'),
  sms: Yup.number().integer().required('SMS count is required'),
  sms_validity: Yup.number().integer().required('SMS validity is required'),
  sms_price: Yup.number().required('SMS price is required'),
  package_name: Yup.string().required('Package name is required'),
  package_Verbage: Yup.string().nullable(),
  Short_Desc: Yup.string().required('Short description is required'),
  Ribbon_text: Yup.string().nullable(),
  Giftpack: Yup.string().required('Giftpack is required'),
  mageypackid: Yup.string().required('Mageypack ID is required'),
});

export async function GET() {
  try {
    const recommendations = await prisma.recommendation.findMany();
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Error fetching recommendations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate data using Yup
    await recommendationSchema.validate(data, { abortEarly: false });

    const newRecommendation = await prisma.recommendation.create({ data });
    return NextResponse.json(newRecommendation, { status: 201 });
  } catch (error) {
    console.error('Error creating recommendation:', error);

    if (error instanceof Yup.ValidationError) {
      return NextResponse.json(
        { errors: error.errors },
        { status: 400 }
      );
    } else if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      // Unique constraint failed
      return NextResponse.json(
        { error: 'A recommendation with this Rec No already exists.' },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: 'Error creating recommendation' },
        { status: 500 }
      );
    }
  }
}
