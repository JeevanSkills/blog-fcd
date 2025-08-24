import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../db";
import { ObjectId } from "mongodb";
import { paginate } from "@/utils/pagination";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content } = await req.json();
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
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
  } catch (_error: unknown) {
    console.error("POST error:", _error);
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const dbClient = await clientPromise;
    const db = dbClient.db("blog-faircode");
    const blogsCollection = db.collection("blogs");

    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          as: "authorInfo",
        },
      },
      { $unwind: "$authorInfo" },
      {
        $project: {
          _id: 1,
          title: 1,
          content: 1,
          createdAt: 1,
          updatedAt: 1,
          "authorInfo.username": 1,
          "authorInfo.email": 1,
          "authorInfo.imageUrl": 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    const paginatedBlogs = await paginate(req, blogsCollection, pipeline);

    const blogs = paginatedBlogs.data.map((blog) => ({
      ...blog,
      _id: blog._id.toString(),
      authorId: blog.authorId?.toString(),
    }));

    return NextResponse.json({ ...paginatedBlogs, data: blogs });
  } catch (_error: unknown) {
    console.error("GET error:", _error);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}
