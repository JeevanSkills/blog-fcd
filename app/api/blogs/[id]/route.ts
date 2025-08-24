import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import clientPromise from "../../db";
import { ObjectId } from "mongodb";

// Get a single blog post
export async function GET(
  req: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const params = await paramsPromise;
  try {
    const dbClient = await clientPromise;
    const db = dbClient.db("blog-faircode");
    const collection = db.collection("blogs");

    const blog = await collection.findOne({ _id: new ObjectId(params.id) });

    if (!blog) {
      return new NextResponse(JSON.stringify({ error: "Blog not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return NextResponse.json(blog);
  } catch (e: unknown) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch blog" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Update a blog post
export async function PUT(
  req: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const params = await paramsPromise;
  const session: Session | null = await getServerSession(authOptions);
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

    const blog = await collection.findOne({ _id: new ObjectId(params.id) });

    if (!blog) {
      return new NextResponse(JSON.stringify({ error: "Blog not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (blog.authorId.toString() !== session.user.id) {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { title, content, updatedAt: new Date() } }
    );

    return NextResponse.json(result);
  } catch (e: unknown) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to update blog" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Delete a blog post
export async function DELETE(
  req: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const params = await paramsPromise;
  const session: Session | null = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const dbClient = await clientPromise;
    const db = dbClient.db("blog-faircode");
    const collection = db.collection("blogs");

    const blog = await collection.findOne({ _id: new ObjectId(params.id) });

    if (!blog) {
      return new NextResponse(JSON.stringify({ error: "Blog not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (blog.authorId.toString() !== session.user.id) {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    await collection.deleteOne({ _id: new ObjectId(params.id) });

    return new NextResponse(null, { status: 204 });
  } catch (e: unknown) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to delete blog" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
