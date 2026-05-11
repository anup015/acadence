import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        phone: true,
        bio: true,
        branch: true,
        semester: true,
        rollNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json(
      { message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = profileSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        phone: validatedData.phone || null,
        bio: validatedData.bio || null,
        branch: validatedData.branch || null,
        semester: validatedData.semester || null,
        rollNumber: validatedData.rollNumber || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        phone: true,
        bio: true,
        rollNumber: true,
        semester: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PATCH /api/user/profile error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { message: "Invalid data", errors: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
