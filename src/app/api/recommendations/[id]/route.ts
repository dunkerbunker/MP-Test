import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
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

  export async function GET(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const recommendation = await prisma.recommendation.findUnique({
        where: { recno: Number(params.id) },
      });
      if (recommendation) {
        return NextResponse.json(recommendation);
      } else {
        return NextResponse.json(
          { error: 'Recommendation not found' },
          { status: 404 }
        );
      }
    } catch (error) {
      console.error('Error fetching recommendation:', error);
      return NextResponse.json(
        { error: 'Error fetching recommendation' },
        { status: 500 }
      );
    }
  }
  
  export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const data = await request.json();
      await recommendationSchema.validate(data, { abortEarly: false });
  
      const updatedRecommendation = await prisma.recommendation.update({
        where: { recno: Number(params.id) },
        data,
      });
      return NextResponse.json(updatedRecommendation);
    } catch (error) {
      console.error('Error updating recommendation:', error);
  
      if (error instanceof Yup.ValidationError) {
        return NextResponse.json(
          { errors: error.errors },
          { status: 400 }
        );
      } else if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        // Record not found
        return NextResponse.json(
          { error: 'Recommendation not found' },
          { status: 404 }
        );
      } else {
        return NextResponse.json(
          { error: 'Error updating recommendation' },
          { status: 500 }
        );
      }
    }
  }
  
  export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      await prisma.recommendation.delete({
        where: { recno: Number(params.id) },
      });
      return NextResponse.json({ message: 'Recommendation deleted' }, { status: 200 });
    } catch (error) {
      console.error('Error deleting recommendation:', error);
  
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        // Record not found
        return NextResponse.json(
          { error: 'Recommendation not found' },
          { status: 404 }
        );
      } else {
        return NextResponse.json(
          { error: 'Error deleting recommendation' },
          { status: 500 }
        );
      }
    }
  }