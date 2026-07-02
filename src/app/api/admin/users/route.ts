import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminSecret = req.headers.get("x-admin-secret");
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      include: {
        subscription: true,
        businesses: true,
      }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const adminSecret = req.headers.get("x-admin-secret")?.trim();
    if (adminSecret !== process.env.ADMIN_SECRET?.trim()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, maxLimit, email, password } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (maxLimit !== undefined) {
      await prisma.subscription.update({
        where: { userId },
        data: { maxLimit }
      });
    }

    if (email || password) {
      const dataToUpdate: any = {};
      if (email) dataToUpdate.email = email;
      if (password) dataToUpdate.password = await bcrypt.hash(password, 10);
      
      await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate
      });
    }

    return NextResponse.json({ message: "Customer updated successfully" });
  } catch (error) {
    console.error("Update Limit Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminSecret = req.headers.get("x-admin-secret")?.trim();
    if (adminSecret !== process.env.ADMIN_SECRET?.trim()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Delete the user (Prisma cascade will handle deleting Subscription and Business if configured,
    // otherwise we just delete the user directly if cascade is on, or delete dependencies first)
    // Looking at the schema, we should probably delete the dependencies first or just rely on cascade.
    // To be safe, let's delete subscription and businesses manually first.
    
    await prisma.subscription.deleteMany({ where: { userId } });
    await prisma.business.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
