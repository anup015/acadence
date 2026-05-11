import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { querySchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const myQueries = searchParams.get("my") === "true";

    const where: any = {};

    if (myQueries && session?.user?.id) {
      where.authorId = session.user.id;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (category && category !== "all") {
      where.category = category;
    }

    const queries = await prisma.query.findMany({
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
        _count: {
          select: {
            responses: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(queries);
  } catch (error) {
    console.error("GET /api/queries error:", error);
    return NextResponse.json(
      { message: "Failed to fetch queries" },
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
    const validatedData = querySchema.parse(body);

    const query = await prisma.query.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        isAnonymous: validatedData.isAnonymous || false,
        authorId: session.user.id,
        status: "PENDING",
        priority: validatedData.priority,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Create notification for admins/academic reps
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "ACADEMIC_REP"] },
      },
      select: { id: true },
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin: { id: string }) => ({
          userId: admin.id,
          type: "GENERAL",
          title: "New Query Submitted",
          message: `A new query "${validatedData.title}" has been submitted`,
          link: `/dashboard/queries/${query.id}`,
        })),
      });
    }

    return NextResponse.json(query, { status: 201 });
  } catch (error) {
    console.error("POST /api/queries error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { message: "Invalid data", errors: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create query" },
      { status: 500 }
    );
  }
}
