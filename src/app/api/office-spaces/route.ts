import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createOfficeSpace } from "@/lib/actions/office-spaces";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    
    if (!accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const result = await createOfficeSpace(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Create office space error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
