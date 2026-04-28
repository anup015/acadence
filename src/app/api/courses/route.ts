import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branch = searchParams.get("branch");
    const semester = searchParams.get("semester");

    const where: any = {};

    if (branch && branch !== "all") {
      where.branch = branch;
    }

    if (semester && semester !== "all") {
      where.semester = parseInt(semester);
    }

    const courses = await prisma.course.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        branch: true,
        semester: true,
        credits: true,
      },
      orderBy: [{ branch: "asc" }, { semester: "asc" }, { code: "asc" }],
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("GET /api/courses error:", error);
    return NextResponse.json(
      { message: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
