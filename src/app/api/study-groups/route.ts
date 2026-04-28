import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { studyGroupSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const my = searchParams.get("my") === "true";

    const session = await auth();

    const where: any = {
      isActive: true,
    };

    if (my && session?.user?.id) {
      where.members = {
        some: { userId: session.user.id },
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (subject && subject !== "all") {
      where.subject = subject;
    }

    if (type && type !== "all") {
      where.type = type;
    }

    const groups = await prisma.studyGroup.findMany({
      where,
      include: {
        course: {
          select: { name: true, code: true },
        },
        leader: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error("GET /api/study-groups error:", error);
    return NextResponse.json(
      { message: "Failed to fetch study groups" },
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

    const body = await request.json();
    const validatedData = studyGroupSchema.parse(body);

    // Create the study group
    const group = await prisma.studyGroup.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        subject: validatedData.subject,
        type: validatedData.type,
        maxMembers: validatedData.maxMembers || 10,
        meetingSchedule: validatedData.meetingSchedule || null,
        goals: validatedData.goals || [],
        leaderId: session.user.id,
        courseId: validatedData.courseId || null,
        isActive: true,
      },
      include: {
        leader: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Add creator as the first member
    await prisma.studyGroupMember.create({
      data: {
        groupId: group.id,
        userId: session.user.id,
        role: "leader",
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("POST /api/study-groups error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { message: "Invalid data", errors: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create study group" },
      { status: 500 }
    );
  }
}
