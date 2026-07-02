import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const setting = await prisma.globalSetting.findUnique({
      where: { key: "PAYMENT_QR_URL" }
    });

    return NextResponse.json({ url: setting?.value || "" });
  } catch (error) {
    console.error("Fetch Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSecret = req.headers.get("x-admin-secret")?.trim();
    if (adminSecret !== process.env.ADMIN_SECRET?.trim()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const updated = await prisma.globalSetting.upsert({
      where: { key: "PAYMENT_QR_URL" },
      update: { value: url },
      create: { key: "PAYMENT_QR_URL", value: url }
    });

    return NextResponse.json({ message: "QR URL saved successfully", url: updated.value });
  } catch (error) {
    console.error("Update Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
