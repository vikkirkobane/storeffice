import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken, getUserById } from "@/lib/auth-core";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  
  if (!accessToken) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 200 }
    );
  }
  
  const payload = await verifyAccessToken(accessToken);
  if (!payload) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 200 }
    );
  }
  
  const user = await getUserById(payload.userId);
  if (!user || user.length === 0) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 200 }
    );
  }
  
  const { passwordHash, ...safeUser } = user[0];
  return NextResponse.json(
    { authenticated: true, user: safeUser },
    { status: 200 }
  );
}
