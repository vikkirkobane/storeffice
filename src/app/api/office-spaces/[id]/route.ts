import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getOfficeSpace, updateOfficeSpace, deleteOfficeSpace } from "@/lib/actions/office-spaces";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const space = await getOfficeSpace(id);
    if (!space) {
      return NextResponse.json({ error: "Office space not found" }, { status: 404 });
    }
    return NextResponse.json(space);
  } catch (error) {
    console.error("Get office space error:", error);
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
    const result = await updateOfficeSpace(id, body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Update office space error:", error);
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
    const result = await deleteOfficeSpace(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Delete office space error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
