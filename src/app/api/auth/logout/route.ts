import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token", { path: "/" });
  cookieStore.delete("refresh_token", { path: "/api/auth/refresh" });
  
  return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
}
