import { Suspense } from "react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  GraduationCap,
  BookOpen,
  PartyPopper,
  AlertCircle,
  Plus,
} from "lucide-react";
import { BRANCHES, formatDate } from "@/lib/utils";
import Link from "next/link";

interface SearchParams {
  month?: string;
  year?: string;
  type?: string;
}

const EVENT_TYPES = [
  { value: "exam", label: "Examinations", icon: BookOpen },
  { value: "holiday", label: "Holidays", icon: PartyPopper },
  { value: "registration", label: "Registration", icon: GraduationCap },
  { value: "workshop", label: "Workshops", icon: AlertCircle },
  { value: "other", label: "Other", icon: Calendar },
];

async function getEvents(month: number, year: number, type: string) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const where: any = {
    startDate: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (type && type !== "all") {
    where.type = type;
  }

  const events = await prisma.academicEvent.findMany({
    where,
    orderBy: { startDate: "asc" },
  });

  return events;
}

async function getUpcomingEvents() {
  const today = new Date();
  const events = await prisma.academicEvent.findMany({
    where: {
      startDate: { gte: today },
    },
    orderBy: { startDate: "asc" },
    take: 10,
  });

  return events;
}

function getEventTypeInfo(type: string) {
  const eventType = EVENT_TYPES.find((t) => t.value === type);
  return eventType || EVENT_TYPES[4];
}

function getEventTypeColor(type: string) {
  switch (type) {
    case "exam":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200";
    case "holiday":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200";
    case "registration":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200";
    case "workshop":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200";
  }
}

function EventCard({ event }: { event: any }) {
  const typeInfo = getEventTypeInfo(event.type);
  const Icon = typeInfo.icon;
  const isMultiDay =
    event.endDate &&
    new Date(event.endDate).toDateString() !==
      new Date(event.startDate).toDateString();

  return (
    <Card className={`border-l-4 ${getEventTypeColor(event.type)}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg ${getEventTypeColor(event.type)}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {formatDate(event.startDate)}
                {isMultiDay && ` - ${formatDate(event.endDate)}`}
              </CardDescription>
            </div>
          </div>
          <Badge className={getEventTypeColor(event.type)}>
            {typeInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {event.description && (
          <p className="text-sm text-muted-foreground">{event.description}</p>
        )}
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
          {event.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.location}
            </span>
          )}
          {event.startTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {event.startTime}
              {event.endTime && ` - ${event.endTime}`}
            </span>
          )}
          {event.targetBranch && (
            <Badge variant="outline">{event.targetBranch}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

async function MonthlyCalendar({
  month,
  year,
  type,
}: {
  month: number;
  year: number;
  type: string;
}) {
  const events = await getEvents(month, year, type);

  type EventData = { id: string; title: string; description: string | null; type: string; startDate: Date; endDate: Date | null; isAllDay: boolean; branch: string | null };

  // Group events by date
  const eventsByDate: Record<string, EventData[]> = {};
  events.forEach((event: EventData) => {
    const dateKey = new Date(event.startDate).toDateString();
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    eventsByDate[dateKey].push(event);
  });

  // Generate calendar grid
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startingDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const weeks: (number | null)[][] = [];
  let currentDay = 1;
  let week: (number | null)[] = [];

  // Fill in empty days at the start
  for (let i = 0; i < startingDayOfWeek; i++) {
    week.push(null);
  }

  // Fill in the days
  while (currentDay <= daysInMonth) {
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    week.push(currentDay);
    currentDay++;
  }

  // Fill in empty days at the end
  while (week.length < 7) {
    week.push(null);
  }
  weeks.push(week);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6">
      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle>{monthNames[month - 1]} {year}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {dayNames.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {weeks.map((week, weekIndex) =>
              week.map((day, dayIndex) => {
                if (day === null) {
                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="p-2 min-h-[80px]"
                    />
                  );
                }

                const dateKey = new Date(year, month - 1, day).toDateString();
                const dayEvents = eventsByDate[dateKey] || [];
                const isToday =
                  new Date().toDateString() ===
                  new Date(year, month - 1, day).toDateString();

                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`p-2 min-h-[80px] border rounded-lg ${
                      isToday ? "bg-primary/10 border-primary" : "border-muted"
                    }`}
                  >
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isToday ? "text-primary" : ""
                      }`}
                    >
                      {day}
                    </div>
                    {dayEvents.slice(0, 2).map((event, i) => (
                      <div
                        key={i}
                        className={`text-xs p-1 rounded truncate mb-1 ${getEventTypeColor(
                          event.type
                        )}`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      {events.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Events This Month</h3>
          {events.map((event: EventData) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No events this month</h3>
          <p className="text-muted-foreground">
            {type !== "all"
              ? "Try selecting a different event type"
              : "No academic events scheduled for this month"}
          </p>
        </div>
      )}
    </div>
  );
}

async function UpcomingEvents() {
  const events = await getUpcomingEvents();

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No upcoming events</h3>
        <p className="text-muted-foreground">
          Check back later for new academic events
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event: { id: string; title: string; description: string | null; type: string; startDate: Date; endDate: Date | null; isAllDay: boolean; branch: string | null }) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export default async function AcademicCalendarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const params = await searchParams;
  const canCreate = session?.user?.role === "ADMIN";

  const today = new Date();
  const month = params.month ? parseInt(params.month) : today.getMonth() + 1;
  const year = params.year ? parseInt(params.year) : today.getFullYear();
  const type = params.type || "all";

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Calendar</h1>
          <p className="text-muted-foreground">
            Important dates, exams, holidays, and events
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/dashboard/calendar/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar">
            <CalendarDays className="h-4 w-4 mr-2" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            <Clock className="h-4 w-4 mr-2" />
            Upcoming Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <form className="grid gap-4 md:grid-cols-4">
                <Select name="month" defaultValue={month.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select name="year" defaultValue={year.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select name="type" defaultValue={type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit">View</Button>
              </form>
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="flex flex-wrap gap-4">
            {EVENT_TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.value} className="flex items-center gap-2">
                  <div className={`p-1 rounded ${getEventTypeColor(t.value)}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <span className="text-sm">{t.label}</span>
                </div>
              );
            })}
          </div>

          {/* Calendar */}
          <Suspense
            fallback={
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <Skeleton className="h-[400px] w-full" />
                  </CardContent>
                </Card>
              </div>
            }
          >
            <MonthlyCalendar month={month} year={year} type={type} />
          </Suspense>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          <Suspense
            fallback={
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            }
          >
            <UpcomingEvents />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
