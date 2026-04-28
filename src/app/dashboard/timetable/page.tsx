import { Suspense } from "react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Download, Clock, MapPin, Book } from "lucide-react";
import { BRANCHES, SEMESTERS, DAYS_OF_WEEK, formatTime } from "@/lib/utils";

interface SearchParams {
  branch?: string;
  semester?: string;
}

async function getTimetable(branch: string, semester: number) {
  const timetable = await prisma.timetable.findFirst({
    where: {
      branch,
      semester,
      isActive: true,
    },
    include: {
      entries: {
        include: {
          course: { select: { name: true, code: true } },
        },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
    },
  });

  return timetable;
}

function TimetableGrid({ entries }: { entries: any[] }) {
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  const getEntryForSlot = (day: string, time: string) => {
    return entries.find(
      (entry) =>
        entry.dayOfWeek === day &&
        entry.startTime <= time &&
        entry.endTime > time
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "lecture":
        return "bg-blue-100 dark:bg-blue-900/30 border-blue-300";
      case "lab":
        return "bg-green-100 dark:bg-green-900/30 border-green-300";
      case "tutorial":
        return "bg-purple-100 dark:bg-purple-900/30 border-purple-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 border-gray-300";
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          <div className="p-2 text-center font-medium text-muted-foreground">
            Time
          </div>
          {days.map((day) => (
            <div
              key={day}
              className="p-2 text-center font-medium bg-muted rounded-lg"
            >
              {day.charAt(0) + day.slice(1).toLowerCase()}
            </div>
          ))}
        </div>

        {/* Time Slots */}
        {timeSlots.map((time) => (
          <div key={time} className="grid grid-cols-7 gap-2 mb-2">
            <div className="p-2 text-center text-sm text-muted-foreground flex items-center justify-center">
              {formatTime(time)}
            </div>
            {days.map((day) => {
              const entry = getEntryForSlot(day, time);
              if (entry && entry.startTime === time) {
                const duration =
                  parseInt(entry.endTime.split(":")[0]) -
                  parseInt(entry.startTime.split(":")[0]);
                return (
                  <div
                    key={`${day}-${time}`}
                    className={`p-2 rounded-lg border ${getTypeColor(entry.type)}`}
                    style={{
                      gridRow: `span ${duration}`,
                    }}
                  >
                    <div className="font-medium text-sm truncate">
                      {entry.course.code}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {entry.course.name}
                    </div>
                    {entry.room && (
                      <div className="flex items-center gap-1 text-xs mt-1">
                        <MapPin className="h-3 w-3" />
                        {entry.room}
                      </div>
                    )}
                    <Badge variant="outline" className="text-xs mt-1">
                      {entry.type}
                    </Badge>
                  </div>
                );
              }
              if (entry) {
                return <div key={`${day}-${time}`} />;
              }
              return (
                <div
                  key={`${day}-${time}`}
                  className="p-2 rounded-lg border border-dashed border-muted"
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

async function TimetableDisplay({ branch, semester }: { branch: string; semester: number }) {
  const timetable = await getTimetable(branch, semester);

  if (!timetable) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No timetable found</h3>
        <p className="text-muted-foreground">
          Timetable for {branch} Semester {semester} has not been uploaded yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{timetable.name}</h2>
          <p className="text-muted-foreground">
            {branch} - Semester {semester} - {timetable.year}
          </p>
        </div>
        {timetable.fileUrl && (
          <Button variant="outline" asChild>
            <a href={timetable.fileUrl} download>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </a>
          </Button>
        )}
      </div>

      <TimetableGrid entries={timetable.entries} />

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/30 border border-blue-300" />
          <span className="text-sm">Lecture</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border border-green-300" />
          <span className="text-sm">Lab</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-100 dark:bg-purple-900/30 border border-purple-300" />
          <span className="text-sm">Tutorial</span>
        </div>
      </div>
    </div>
  );
}

export default async function TimetablePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const params = await searchParams;
  const userBranch = session?.user?.role === "STUDENT" ? (session.user as any).branch : null;
  const userSemester = session?.user?.role === "STUDENT" ? (session.user as any).semester : null;

  const branch = params.branch || userBranch || "CSE";
  const semester = params.semester ? parseInt(params.semester) : userSemester || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Timetable</h1>
        <p className="text-muted-foreground">
          View your class schedule and download timetables
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form className="grid gap-4 md:grid-cols-3">
            <Select name="branch" defaultValue={branch}>
              <SelectTrigger>
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                {BRANCHES.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="semester" defaultValue={semester.toString()}>
              <SelectTrigger>
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                {SEMESTERS.map((s) => (
                  <SelectItem key={s} value={s.toString()}>
                    Semester {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">View Timetable</Button>
          </form>
        </CardContent>
      </Card>

      {/* Timetable Display */}
      <Card>
        <CardContent className="pt-6">
          <Suspense
            fallback={
              <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-[400px] w-full" />
              </div>
            }
          >
            <TimetableDisplay branch={branch} semester={semester} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
