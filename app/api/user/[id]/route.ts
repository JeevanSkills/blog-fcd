import { NextResponse } from "next/server";
import clientPromise from "@/app/api/db";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next"; // Import for authentication
import { authOptions } from "../../auth/[...nextauth]/route"; // Import auth options
import { hash, compare } from "bcryptjs"; // Import for password hashing

export async function GET(
  req: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const params = await paramsPromise;
  try {
    const dbClient = await clientPromise;
    const db = dbClient.db("blog-faircode");
    const collection = db.collection("users");

    const user = await collection.findOne(
      { _id: new ObjectId(params.id) },
      { projection: { password: 0 } } // Exclude the password field
    );

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return NextResponse.json(user);
  } catch (e: unknown) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch user data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function PUT(
  req: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const params = await paramsPromise;
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.id !== params.id) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { username, email, currentPassword, newPassword } = await req.json();
    const dbClient = await clientPromise;
    const db = dbClient.db("blog-faircode");
    const collection = db.collection("users");

    const user = await collection.findOne({ _id: new ObjectId(params.id) });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updateFields: { [key: string]: any } = {};

    if (username && username !== user.username) {
      updateFields.username = username;
    }

    if (email && email !== user.email) {
      // Check for email uniqueness if changing email
      const existingUserWithEmail = await collection.findOne({ email: email });
      if (existingUserWithEmail && existingUserWithEmail._id.toString() !== params.id) {
        return new NextResponse(JSON.stringify({ error: "Email already in use" }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }
      updateFields.email = email;
    }

    if (newPassword) {
      if (!currentPassword) {
        return new NextResponse(JSON.stringify({ error: "Current password is required to change password" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const isPasswordCorrect = await compare(currentPassword, user.password);
      if (!isPasswordCorrect) {
        return new NextResponse(JSON.stringify({ error: "Incorrect current password" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      const hashedPassword = await hash(newPassword, 12);
      updateFields.password = hashedPassword;
    }

    if (Object.keys(updateFields).length === 0) {
      return new NextResponse(JSON.stringify({ message: "No changes provided" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateFields }
    );

    return new NextResponse(JSON.stringify({ message: "Profile updated successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    console.error("Failed to update user:", e);
    return new NextResponse(
      JSON.stringify({ error: "Failed to update profile" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
