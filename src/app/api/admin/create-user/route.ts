import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password, limit, adminSecret } = await req.json();

    // 1. Verify Admin Secret
    const envSecret = process.env.ADMIN_SECRET?.trim();
    if (adminSecret.trim() !== envSecret) {
      console.log(`Auth failed. Received: '${adminSecret}', Expected: '${envSecret}'`);
      return NextResponse.json({ error: "Unauthorized. Invalid Admin Secret." }, { status: 401 });
    }

    if (!email || !password || limit === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Check if user exists
    const exists = await prisma.user.findUnique({
      where: { email }
    });

    if (exists) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // 3. Create User with Subscription Limit
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        subscription: {
          create: {
            status: "trial",
            repliesGeneratedThisMonth: 0,
            maxLimit: limit
          }
        }
      }
    });

    return NextResponse.json({ message: "Customer account created successfully!", userId: user.id });

  } catch (error) {
    console.error("Admin Create User Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
