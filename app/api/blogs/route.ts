import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../db";
import { ObjectId } from "mongodb";
import { paginate } from "@/utils/pagination";
import { Document } from "mongodb";

// Create a new blog post
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { title, content } = await req.json();
    if (!title || !content) {
      return new NextResponse(
        JSON.stringify({ error: "Title and content are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const dbClient = await clientPromise;
    const db = dbClient.db("blog-faircode");
    const collection = db.collection("blogs");

    const newBlog = {
      title,
      content,
      authorId: new ObjectId(session.user.id),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newBlog);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Failed to create blog" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


export async function GET(req: NextRequest) {
  try {
    const dbClient = await clientPromise;
    const db = dbClient.db("blog-faircode");
    const collection = db.collection("blogs");
    const paginatedBlogs = await paginate(req, collection as import("mongodb").Collection<Document>);
    return NextResponse.json(paginatedBlogs);
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Failed to fetch blogs" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
