import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getStorageSpace, updateStorageSpace, deleteStorageSpace } from "@/lib/actions/storage-spaces";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const space = await getStorageSpace(id);
    if (!space) {
      return NextResponse.json({ error: "Storage space not found" }, { status: 404 });
    }
    return NextResponse.json(space);
  } catch (error) {
    console.error("Get storage space error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    
    if (!accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = await updateStorageSpace(id, body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Update storage space error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    
    if (!accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const result = await deleteStorageSpace(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Delete storage space error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
