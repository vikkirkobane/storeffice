import { NextResponse } from "next/server";
import { getOfficeSpaces } from "@/lib/actions/office-spaces";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth.getSession();
    // If no session, still allow fetching public active spaces
    const spaces = await getOfficeSpaces();
    return NextResponse.json(spaces);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch spaces" }, { status: 500 });
  }
}
