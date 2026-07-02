import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, city, type, phone, tone, language, rules } = body;
    const userId = (session.user as any).id;

    // Check if user already has a business
    const existingBusiness = await prisma.business.findFirst({
      where: { userId }
    });

    let business;
    if (existingBusiness) {
      business = await prisma.business.update({
        where: { id: existingBusiness.id },
        data: { name, city: city || 'Unknown', type, phone, tone, language, rules }
      });
    } else {
      business = await prisma.business.create({
        data: {
          userId,
          name,
          city: city || 'Unknown',
          type,
          phone,
          tone,
          language,
          rules
        }
      });
    }

    return NextResponse.json({ message: "Profile saved successfully", business });

  } catch (error) {
    console.error("Business API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const business = await prisma.business.findFirst({
      where: { userId }
    });

    return NextResponse.json({ business });

  } catch (error) {
    console.error("Business API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
