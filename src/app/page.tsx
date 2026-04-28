import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f2ec] text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-20%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,#f2c185,transparent_70%)] opacity-70 blur-3xl animate-float" />
        <div className="absolute right-[-15%] top-[10%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,#78c6b4,transparent_70%)] opacity-60 blur-3xl animate-drift" />
        <div className="absolute bottom-[-30%] left-[20%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,#8aa8ff,transparent_70%)] opacity-50 blur-3xl animate-float" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
            AC
          </span>
          <div>
            <p className="font-[var(--font-display)] text-xl">AcadConnect</p>
            <p className="text-sm text-slate-600">Student Body for Academic Affairs</p>
          </div>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/auth/login"
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Register
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-10">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Centralize resources, schedules, and conversations
            </div>
            <div className="space-y-5">
              <h1 className="text-4xl font-[var(--font-display)] leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Academic flow, finally connected for every student and faculty.
              </h1>
              <p className="max-w-xl text-lg text-slate-700">
                AcadConnect keeps course resources, academic queries, study groups, and timetables in one place.
                Build faster resolution loops between students and faculty with secure, scalable workflows.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/auth/register"
                className="flex items-center justify-center rounded-full bg-slate-900 px-8 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
              >
                Join the platform
              </Link>
              <Link
                href="/auth/login"
                className="flex items-center justify-center rounded-full border border-slate-400 px-8 py-3 text-base font-semibold text-slate-800 transition hover:border-slate-900"
              >
                Sign in
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full bg-white/70 px-4 py-2">Resources hub</span>
              <span className="rounded-full bg-white/70 px-4 py-2">Query tracking</span>
              <span className="rounded-full bg-white/70 px-4 py-2">Study groups</span>
              <span className="rounded-full bg-white/70 px-4 py-2">Smart timetable</span>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/80 bg-white/80 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Campus Pulse</p>
                <p className="text-2xl font-[var(--font-display)] text-slate-900">Today in AcadConnect</p>
              </div>
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Live
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {[
                {
                  title: "Faculty hours confirmed",
                  description: "12 departments updated their weekly slots.",
                },
                {
                  title: "Queries resolved",
                  description: "98% answered within 24 hours this week.",
                },
                {
                  title: "Resources uploaded",
                  description: "New notes for CSE 3rd semester.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-slate-900 px-4 py-4 text-white">
              <p className="text-sm text-slate-300">Next up</p>
              <p className="text-lg font-semibold">Semester timetable sync at 4:00 PM</p>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Unified academic resources",
              description: "Notes, PYQs, announcements, and materials stay structured for every batch.",
            },
            {
              title: "Structured student-faculty loop",
              description: "Track questions, responses, and outcomes with accountability built in.",
            },
            {
              title: "Study group momentum",
              description: "Create groups, share agendas, and keep revision sessions aligned.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[22px] border border-white/70 bg-white/70 p-6 shadow-sm backdrop-blur"
            >
              <p className="text-xl font-[var(--font-display)] text-slate-900">{item.title}</p>
              <p className="mt-3 text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-20 rounded-[32px] bg-slate-900 px-8 py-12 text-white">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="text-3xl font-[var(--font-display)]">Build a calmer academic rhythm</h2>
              <p className="mt-4 text-slate-300">
                Designed for a college Student Body for Academic Affairs, AcadConnect reduces email chaos and
                keeps every cohort aligned through a secure, scalable hub.
              </p>
            </div>
            <div className="grid gap-4 rounded-[26px] bg-white/10 p-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Average response time</span>
                <span className="font-semibold text-emerald-300">-42%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Active study groups</span>
                <span className="font-semibold text-emerald-300">+58%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Resources accessed weekly</span>
                <span className="font-semibold text-emerald-300">24k</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Timetables synced</span>
                <span className="font-semibold text-emerald-300">16 depts</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-white/70 bg-white/80 p-8 shadow-sm backdrop-blur">
            <h3 className="text-2xl font-[var(--font-display)] text-slate-900">What students get</h3>
            <ul className="mt-6 space-y-4 text-sm text-slate-700">
              <li>Personalized dashboards for classes, queries, and notices.</li>
              <li>Material and PYQ libraries organized by subject and semester.</li>
              <li>Notification center for academic decisions and approvals.</li>
            </ul>
          </div>
          <div className="rounded-[28px] border border-white/70 bg-white/80 p-8 shadow-sm backdrop-blur">
            <h3 className="text-2xl font-[var(--font-display)] text-slate-900">What faculty get</h3>
            <ul className="mt-6 space-y-4 text-sm text-slate-700">
              <li>Clear queue of student questions with context and status.</li>
              <li>Scheduling tools for office hours and department updates.</li>
              <li>Analytics on engagement and resource usage trends.</li>
            </ul>
          </div>
        </section>

        <section className="mt-20 flex flex-col items-center gap-6 rounded-[30px] border border-slate-200/70 bg-white/80 px-8 py-12 text-center shadow-sm backdrop-blur">
          <h2 className="text-3xl font-[var(--font-display)] text-slate-900">
            Ready to connect your academic community?
          </h2>
          <p className="max-w-2xl text-sm text-slate-600">
            Start onboarding students, faculty, and administrators with one secure platform tailored to your campus.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              className="rounded-full bg-slate-900 px-7 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Get started
            </Link>
            <Link
              href="/auth/login"
              className="rounded-full border border-slate-400 px-7 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-900"
            >
              I already have an account
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
