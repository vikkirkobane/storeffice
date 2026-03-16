import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const result = await auth.handler(req);
    return result;
  } catch (error) {
    console.error("Auth GET error:", error);
    return NextResponse.json({ error: "Authentication error" }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const result = await auth.handler(req);
    return result;
  } catch (error) {
    console.error("Auth POST error:", error);
    return NextResponse.json({ error: "Authentication error" }, { status: 500 });
  }
};
