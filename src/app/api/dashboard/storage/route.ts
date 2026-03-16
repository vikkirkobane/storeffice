import { NextResponse } from "next/server";
import { getStorageSpaces } from "@/lib/actions/storage-spaces";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth.getSession();
    const spaces = await getStorageSpaces();
    return NextResponse.json(spaces);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch storage spaces" }, { status: 500 });
  }
}
