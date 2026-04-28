import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { announcementSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const branch = searchParams.get("branch");
    const search = searchParams.get("search");

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "all") {
      where.category = category;
    }

    if (branch && branch !== "all") {
      where.OR = [{ targetBranch: branch }, { targetBranch: null }];
    }

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 50,
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("GET /api/announcements error:", error);
    return NextResponse.json(
      { message: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only faculty, academic reps, and admins can create announcements
    if (
      !["FACULTY", "ACADEMIC_REP", "ADMIN"].includes(session.user.role || "")
    ) {
      return NextResponse.json(
        { message: "Unauthorized to create announcements" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = announcementSchema.parse(body);

    const announcement = await prisma.announcement.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        category: validatedData.category,
        targetBranch: validatedData.targetBranch || null,
        attachmentUrl: validatedData.attachmentUrl || null,
        isPinned: validatedData.isPinned || false,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
      },
    });

    // Create notifications for relevant users
    const targetUsers = await prisma.user.findMany({
      where: validatedData.targetBranch
        ? { branch: validatedData.targetBranch }
        : {},
      select: { id: true },
    });

    if (targetUsers.length > 0) {
      await prisma.notification.createMany({
        data: targetUsers.map((user: { id: string }) => ({
          userId: user.id,
          type: "announcement",
          title: "New Announcement",
          message: validatedData.title,
          link: `/dashboard/announcements`,
        })),
      });
    }

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("POST /api/announcements error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { message: "Invalid data", errors: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create announcement" },
      { status: 500 }
    );
  }
}
