import { NextResponse } from "next/server";
import { getProducts } from "@/lib/actions/products";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth.getSession();
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
