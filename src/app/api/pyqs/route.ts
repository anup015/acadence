import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pyqSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branch = searchParams.get("branch");
    const semester = searchParams.get("semester");
    const year = searchParams.get("year");
    const examType = searchParams.get("examType");
    const search = searchParams.get("search");
    const courseId = searchParams.get("courseId");

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
      ];
    }

    if (year && year !== "all") {
      where.year = parseInt(year);
    }

    if (examType && examType !== "all") {
      where.examType = examType;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    if (branch && branch !== "all") {
      where.course = {
        ...where.course,
        branch,
      };
    }

    if (semester && semester !== "all") {
      where.course = {
        ...where.course,
        semester: parseInt(semester),
      };
    }

    const pyqs = await prisma.pYQ.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            branch: true,
            semester: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      take: 50,
    });

    return NextResponse.json(pyqs);
  } catch (error) {
    console.error("GET /api/pyqs error:", error);
    return NextResponse.json(
      { message: "Failed to fetch PYQs" },
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
    const validatedData = pyqSchema.parse(body);

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: validatedData.courseId },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    const pyq = await prisma.pYQ.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        branch: validatedData.branch,
        semester: validatedData.semester,
        year: validatedData.year,
        examType: validatedData.examType,
        fileUrl: validatedData.fileUrl,
        fileType: "unknown",
        fileSize: 0,
        courseId: validatedData.courseId,
        uploadedById: session.user.id,
      },
      include: {
        course: {
          select: { name: true, code: true, branch: true },
        },
        uploadedBy: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(pyq, { status: 201 });
  } catch (error) {
    console.error("POST /api/pyqs error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { message: "Invalid data", errors: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create PYQ" },
      { status: 500 }
    );
  }
}
