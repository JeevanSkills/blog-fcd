import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/api/db";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const params = await paramsPromise;
  try {
    const dbClient = await clientPromise;
    const db = dbClient.db("blog-faircode");
    const collection = db.collection("blogs");

    const blogs = await collection
      .find({ authorId: await new ObjectId(params.id) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(blogs);
  } catch (e: unknown) {
    console.error("Error fetching user blogs:", e);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch user blogs" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
