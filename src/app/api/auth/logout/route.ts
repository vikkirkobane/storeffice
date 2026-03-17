import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * POST /api/auth/logout
 * Clears access token cookie and optionally revokes refresh token.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("access_token");
  return response;
}
