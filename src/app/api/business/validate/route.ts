import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { businessId } = await req.json();

    if (!businessId) {
      return NextResponse.json({ valid: false }, { 
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" } 
      });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return NextResponse.json({ valid: false }, { 
        status: 404,
        headers: { "Access-Control-Allow-Origin": "*" } 
      });
    }

    return NextResponse.json({ valid: true }, {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  } catch (error) {
    // If Prisma throws an error (e.g. invalid ObjectId format), it's invalid
    return NextResponse.json({ valid: false }, { 
      status: 400,
      headers: { "Access-Control-Allow-Origin": "*" } 
    });
  }
}
