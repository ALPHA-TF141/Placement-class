import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// ===============================
// TYPE DEFINITIONS
// ===============================
interface Product {
  id: number;
  product_name: string;
  category: string;
  price: number;
  quantity: number;
}

interface Params {
  params: {
    id: string;
  };
}

// ===============================
// GET PRODUCT BY ID
// ===============================
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    const [rows]: any = await db.query("SELECT * FROM products WHERE id = ?", [id]);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Return the first row as a Product
    const product: Product = rows[0];

    return NextResponse.json(product);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// ===============================
// UPDATE PRODUCT
// ===============================
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Parse JSON body
    const body: Product = await req.json();
    const { product_name, category, price, quantity } = body;

    // Validate required fieldsS
    if (!product_name || !category || price === undefined || quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update product in DB
    await db.query(
      "UPDATE products SET product_name=?, category=?, price=?, quantity=? WHERE id=?",
      [product_name, category, Number(price), Number(quantity), id]
    );

    return NextResponse.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// ===============================
// DELETE PRODUCT
// ===============================
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    // Remove 'await' here
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    await db.query("DELETE FROM products WHERE id = ?", [id]);

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}