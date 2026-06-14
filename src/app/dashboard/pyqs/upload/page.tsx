import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import PYQUploadForm from "./upload-form";

export default async function PYQUploadPage() {
  const session = await auth();
  const canUpload = ["FACULTY", "ACADEMIC_REP", "ADMIN"].includes(
    session?.user?.role || ""
  );

  if (!canUpload) {
    redirect("/dashboard/pyqs");
  }

  const courses = await prisma.course.findMany({
    orderBy: [{ branch: "asc" }, { semester: "asc" }, { code: "asc" }],
  });

  return (
    <div className="max-w-4xl mx-auto py-6">
      <PYQUploadForm courses={courses} />
    </div>
  );
}
