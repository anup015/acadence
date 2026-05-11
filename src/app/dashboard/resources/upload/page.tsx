import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import UploadMaterialForm from "./upload-form";

export default async function UploadMaterialPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const canUpload = ["FACULTY", "ACADEMIC_REP", "ADMIN"].includes(
    session.user.role || ""
  );

  if (!canUpload) {
    redirect("/dashboard/resources");
  }

  const courses = await prisma.course.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      branch: true,
      semester: true,
    },
    orderBy: [{ branch: "asc" }, { semester: "asc" }, { code: "asc" }],
  });

  return <UploadMaterialForm courses={courses} />;
}
