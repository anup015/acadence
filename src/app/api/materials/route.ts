import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { materialSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branch = searchParams.get("branch");
    const semester = searchParams.get("semester");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const courseId = searchParams.get("courseId");

    const where: any = {
      status: "APPROVED",
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type && type !== "all") {
      where.type = type;
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

    const materials = await prisma.studyMaterial.findMany({
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
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error("GET /api/materials error:", error);
    return NextResponse.json(
      { message: "Failed to fetch materials" },
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
    const validatedData = materialSchema.parse(body);

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

    // Determine initial status based on user role
    const status =
      session.user.role === "FACULTY" || session.user.role === "ADMIN"
        ? "APPROVED"
        : "PENDING";

    const material = await prisma.studyMaterial.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        type: validatedData.type,
        fileUrl: validatedData.fileUrl,
        fileSize: validatedData.fileSize || null,
        courseId: validatedData.courseId,
        uploadedById: session.user.id,
        status,
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

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error("POST /api/materials error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { message: "Invalid data", errors: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create material" },
      { status: 500 }
    );
  }
}
