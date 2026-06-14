import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  UploadCloud,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Users,
  Check
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-warm-cream font-sans text-dark-text antialiased selection:bg-parchment-gold/40">
      {/* Subtle Noise Grain Overlay */}
      <div className="absolute inset-0 bg-noise-overlay opacity-[0.015] pointer-events-none mix-blend-overlay z-50 animate-fade-up" />

      {/* STICKY FROSTED NAVBAR */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-warm-cream/80 border-b border-paper-border/60 transition-all duration-200">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-campus-green text-warm-cream font-bold text-lg shadow-sm group-hover:scale-105 transition-transform duration-200">
              AC
            </span>
            <div>
              <p className="font-display text-xl font-bold tracking-tight text-dark-text">AcadConnect</p>
              <p className="text-[10px] font-sans tracking-wider text-campus-green/70 font-bold uppercase">Student Academic Desk</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-dark-text/75">
            <a href="#pulse" className="hover:text-campus-green transition-colors">Campus Pulse</a>
            <a href="#metrics" className="hover:text-campus-green transition-colors">Performance</a>
            <a href="#roles" className="hover:text-campus-green transition-colors">Role Desks</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="rounded-full border border-paper-border bg-white px-5 py-2 text-sm font-semibold text-dark-text shadow-sm hover:border-campus-green hover:text-campus-green transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="hidden sm:inline-block rounded-full bg-campus-green px-5 py-2 text-sm font-semibold text-warm-cream shadow-sm hover:bg-campus-green/95 hover:shadow-md transition-all"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH ASYMMETRIC LAYOUT */}
      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24 pt-12">
        <section className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] py-12">
          {/* Left Column: Headline, Subtitle, CTAs */}
          <div className="space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper-border bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-campus-green shadow-xs">
              <span className="h-2 w-2 rounded-full bg-parchment-gold animate-pulse" />
              <span>Campus Resource and Query Tracker</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="font-display text-4xl font-extrabold leading-[1.1] text-dark-text sm:text-5xl lg:text-6xl tracking-tight">
                Academic rhythm, <span className="italic font-normal text-campus-green">connected</span> for everyone.
              </h1>
              <p className="max-w-xl text-lg text-dark-text/80 leading-relaxed font-normal">
                A digital desk built by the Student Body. AcadConnect centralizes syllabus resources, exam papers, query tracking, and timetables to build accountability between cohorts and faculty.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/auth/register"
                className="flex items-center justify-center gap-2 rounded-xl bg-campus-green px-8 py-3.5 text-base font-bold text-warm-cream shadow-md hover:bg-campus-green/90 transition-all duration-200 hover:-translate-y-0.5"
              >
                Join the platform <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/login"
                className="flex items-center justify-center rounded-xl border border-paper-border bg-white px-8 py-3.5 text-base font-bold text-dark-text shadow-xs hover:border-campus-green hover:text-campus-green transition-all duration-200 hover:-translate-y-0.5"
              >
                Onboard Faculty
              </Link>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-4 text-[10px] font-bold tracking-wider text-dark-text/75 uppercase">
              <span className="flex items-center gap-1.5 rounded-full border border-paper-border bg-white px-3 py-1.5 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-campus-green" />
                Resources Hub
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-paper-border bg-white px-3 py-1.5 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-ink-navy" />
                Query tracking
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-paper-border bg-white px-3 py-1.5 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-parchment-gold" />
                Study Circles
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-paper-border bg-white px-3 py-1.5 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                Smart timetable
              </span>
            </div>
          </div>

          {/* Right Column: Campus Pulse Mockup Widget */}
          <div id="pulse" className="relative lg:pl-6">
            <div className="relative rounded-2xl border border-paper-border bg-white p-6 shadow-xl max-w-md mx-auto lg:mr-0">
              {/* Stacked paper layers */}
              <div className="absolute inset-0 -z-10 translate-x-2 translate-y-2 rounded-2xl border border-paper-border bg-white/60 shadow-lg" />
              <div className="absolute inset-0 -z-20 translate-x-4 translate-y-4 rounded-2xl border border-paper-border/50 bg-white/30 shadow-md" />

              {/* Widget Header */}
              <div className="flex items-center justify-between border-b border-paper-border/60 pb-4">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-campus-green uppercase">Campus Activity</span>
                  <h3 className="text-xl font-display font-bold text-dark-text">Campus Pulse</h3>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Live Feed
                </div>
              </div>

              {/* Widget Content List */}
              <div className="mt-5 space-y-4">
                {/* Row 1: Resource Upload */}
                <div className="flex items-start gap-3.5 p-3 rounded-xl border border-paper-border/40 hover:border-paper-border bg-warm-cream/30 hover:bg-warm-cream/50 transition-colors duration-200">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-campus-green/10 text-campus-green border border-campus-green/20">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-campus-green uppercase tracking-wide">Resource upload</span>
                      <span className="text-[10px] text-dark-text/40 font-mono">10m ago</span>
                    </div>
                    <h4 className="text-sm font-bold text-dark-text truncate mt-0.5">CSE 6th Sem: Distributed Systems PYQs</h4>
                    <p className="text-xs text-dark-text/60 mt-0.5 line-clamp-1">Uploaded by Academic Rep to CSE resources.</p>
                  </div>
                </div>

                {/* Row 2: Query Resolved */}
                <div className="flex items-start gap-3.5 p-3 rounded-xl border border-paper-border/40 hover:border-paper-border bg-warm-cream/30 hover:bg-warm-cream/50 transition-colors duration-200">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Query resolved</span>
                      <span className="text-[10px] text-dark-text/40 font-mono">1h ago</span>
                    </div>
                    <h4 className="text-sm font-bold text-dark-text truncate mt-0.5">Ticket #Q-8712: Mid-Sem Reschedule Query</h4>
                    <p className="text-xs text-dark-text/60 mt-0.5 line-clamp-1">Resolved by CSE Dept: &quot;Revised timetable has been synced.&quot;</p>
                  </div>
                </div>

                {/* Row 3: Timetable Sync */}
                <div className="flex items-start gap-3.5 p-3 rounded-xl border border-paper-border/40 hover:border-paper-border bg-warm-cream/30 hover:bg-warm-cream/50 transition-colors duration-200">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-navy/10 text-ink-navy border border-ink-navy/20">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-ink-navy uppercase tracking-wide">Timetable updated</span>
                      <span className="text-[10px] text-dark-text/40 font-mono">3h ago</span>
                    </div>
                    <h4 className="text-sm font-bold text-dark-text truncate mt-0.5">ECE & Biotech: Friday Lab Slots Sync</h4>
                    <p className="text-xs text-dark-text/60 mt-0.5 line-clamp-1">Sync complete for all 3rd and 5th semester students.</p>
                  </div>
                </div>
              </div>

              {/* Widget Footer */}
              <div className="mt-5 pt-4 border-t border-paper-border/60 flex items-center justify-between text-xs">
                <span className="text-dark-text/50 font-medium">98.4% query resolution rate</span>
                <Link href="/auth/login" className="flex items-center gap-1 font-bold text-campus-green hover:underline">
                  Access Desk <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION DIVIDER */}
        <div className="relative my-24">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-paper-border/60"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-warm-cream px-4 text-xs font-semibold text-campus-green/60 uppercase tracking-widest flex items-center gap-1.5 border border-paper-border/60 rounded-full py-1">
              <GraduationCap className="h-3.5 w-3.5 text-campus-green" />
              AcadConnect
            </span>
          </div>
        </div>

        {/* STATS SECTION - EDITORIAL DESIGN */}
        <section id="metrics" className="space-y-12 py-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold tracking-widest text-campus-green uppercase">Academic Efficiency</span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-dark-text">Campus outcomes in numbers</h2>
            <p className="text-dark-text/70 leading-relaxed">
              We design workflows that reduce administrative delays and keep resources readily accessible for all batches.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Stat 1 */}
            <div className="relative bg-white border border-paper-border p-6 shadow-xs rounded-[19px] transform rotate-[-0.5deg] hover:rotate-0 transition-transform duration-200">
              <span className="text-[10px] font-bold tracking-widest text-dark-text/50 uppercase block mb-1">Avg Response Time</span>
              <div className="relative inline-block">
                <span className="text-4xl sm:text-5xl font-display font-extrabold text-rose-700">-42%</span>
                <div className="h-2 w-full bg-rose-100 absolute -bottom-1 left-0 -z-10 transform -rotate-1 rounded-full" />
              </div>
              <p className="text-xs text-dark-text/60 mt-3 font-sans leading-relaxed">Faster feedback loops between department reps and course instructors.</p>
            </div>

            {/* Stat 2 */}
            <div className="relative bg-white border border-paper-border p-6 shadow-xs rounded-[23px] transform rotate-[0.7deg] hover:rotate-0 transition-transform duration-200">
              <span className="text-[10px] font-bold tracking-widest text-dark-text/50 uppercase block mb-1">Study Group Activity</span>
              <div className="relative inline-block">
                <span className="text-4xl sm:text-5xl font-display font-extrabold text-campus-green">+58%</span>
                <div className="h-2 w-full bg-emerald-100 absolute -bottom-1 left-0 -z-10 transform rotate-1 rounded-full" />
              </div>
              <p className="text-xs text-dark-text/60 mt-3 font-sans leading-relaxed">Peer collaboration across shared syllabus, project groups, and exam revisions.</p>
            </div>

            {/* Stat 3 */}
            <div className="relative bg-white border border-paper-border p-6 shadow-xs rounded-[17px] transform rotate-[-0.8deg] hover:rotate-0 transition-transform duration-200">
              <span className="text-[10px] font-bold tracking-widest text-dark-text/50 uppercase block mb-1">Files Downloaded Weekly</span>
              <div className="relative inline-block">
                <span className="text-4xl sm:text-5xl font-display font-extrabold text-ink-navy">24k</span>
                <div className="h-2 w-full bg-blue-100 absolute -bottom-1 left-0 -z-10 transform -rotate-2 rounded-full" />
              </div>
              <p className="text-xs text-dark-text/60 mt-3 font-sans leading-relaxed">Lecture notes, tutorial sheets, and previous years&apos; question papers accessed.</p>
            </div>

            {/* Stat 4 */}
            <div className="relative bg-white border border-paper-border p-6 shadow-xs rounded-[21px] transform rotate-[0.4deg] hover:rotate-0 transition-transform duration-200">
              <span className="text-[10px] font-bold tracking-widest text-dark-text/50 uppercase block mb-1">Active Departments</span>
              <div className="relative inline-block">
                <span className="text-4xl sm:text-5xl font-display font-extrabold text-parchment-gold">16 depts</span>
                <div className="h-2 w-full bg-amber-100/70 absolute -bottom-1 left-0 -z-10 transform rotate-1 rounded-full" />
              </div>
              <p className="text-xs text-dark-text/60 mt-3 font-sans leading-relaxed">Department sync for syllabus materials, notifications, and smart schedules.</p>
            </div>
          </div>
        </section>

        {/* SECTION DIVIDER */}
        <div className="relative my-24">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-paper-border/60"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-warm-cream px-4 text-xs font-semibold text-campus-green/60 uppercase tracking-widest flex items-center gap-1.5 border border-paper-border/60 rounded-full py-1">
              <GraduationCap className="h-3.5 w-3.5 text-campus-green" />
              AcadConnect
            </span>
          </div>
        </div>

        {/* ROLE CARDS SECTION */}
        <section id="roles" className="space-y-12 py-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold tracking-widest text-campus-green uppercase">Tailored Experiences</span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-dark-text">Role-based academic desks</h2>
            <p className="text-dark-text/70 leading-relaxed">
              AcadConnect partitions workflows logically to ensure clarity of expectations, actions, and logs.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Student Card */}
            <div className="flex flex-col rounded-2xl border border-paper-border bg-campus-green/[0.03] border-l-[4px] border-l-campus-green p-8 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-4 border-b border-paper-border/50 pb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-campus-green text-warm-cream shadow-sm">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-dark-text">For Students</h3>
                  <p className="text-xs text-campus-green font-bold uppercase tracking-wider mt-0.5">Centralized Hub</p>
                </div>
              </div>
              
              <p className="text-dark-text/80 my-6 font-sans leading-relaxed">
                Access your batch-specific files, timetables, peer discussion groups, and file a query straight to department heads with automated escalation tracking.
              </p>

              <ul className="space-y-4 flex-1">
                {[
                  "Personalized dashboards filtered by branch and semester",
                  "Material libraries containing previous year papers (PYQs) and lectures",
                  "Escalated academic query desks with direct notifications",
                  "Smart timetables with immediate lecture reschedule updates"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-dark-text/75">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-campus-green/15 text-campus-green mt-0.5">
                      <Check className="h-3 w-3" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Faculty Card */}
            <div className="flex flex-col rounded-2xl border border-paper-border bg-ink-navy/[0.03] border-l-[4px] border-l-ink-navy p-8 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-4 border-b border-paper-border/50 pb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-navy text-warm-cream shadow-sm">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-dark-text">For Faculty</h3>
                  <p className="text-xs text-ink-navy font-bold uppercase tracking-wider mt-0.5">Course Desk</p>
                </div>
              </div>
              
              <p className="text-dark-text/80 my-6 font-sans leading-relaxed">
                Directly communicate course adjustments, upload course guidelines and study materials, track student feedback, and resolve academic queries with institutional visibility.
              </p>

              <ul className="space-y-4 flex-1">
                {[
                  "Consolidated query queue with categorized ticket status tracking",
                  "Direct file distribution channels mapped to syllabus modules",
                  "One-click calendar and timetable reschedule syncs for your courses",
                  "Engagement insights on syllabus downloads and resource trends"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-dark-text/75">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-navy/15 text-ink-navy mt-0.5">
                      <Check className="h-3 w-3" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION DIVIDER */}
        <div className="relative my-24">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-paper-border/60"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-warm-cream px-4 text-xs font-semibold text-campus-green/60 uppercase tracking-widest flex items-center gap-1.5 border border-paper-border/60 rounded-full py-1">
              <GraduationCap className="h-3.5 w-3.5 text-campus-green" />
              AcadConnect
            </span>
          </div>
        </div>

        {/* BOTTOM CTA BANNER SECTION */}
        <section className="py-12">
          <div className="relative rounded-3xl border border-paper-border bg-ink-navy text-warm-cream overflow-hidden px-8 py-16 text-center shadow-xl">
            {/* Background elements */}
            <div className="absolute inset-0 bg-dot-grid opacity-[0.08] pointer-events-none" />
            <div className="absolute inset-0 bg-noise-overlay opacity-[0.04] pointer-events-none mix-blend-overlay" />
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Ready to connect your academic community?
              </h2>
              <p className="text-warm-cream/80 max-w-lg mx-auto text-sm leading-relaxed">
                Onboard students, faculty, and administrators with a secure platform built to facilitate collaboration and resolve classroom frictions.
              </p>

              <div className="flex flex-col gap-3.5 sm:flex-row justify-center pt-2">
                <Link
                  href="/auth/register"
                  className="rounded-lg bg-parchment-gold px-8 py-3.5 text-sm font-bold text-dark-text shadow-md hover:bg-parchment-gold/90 transition-all duration-200"
                >
                  Get started
                </Link>
                <Link
                  href="/auth/login"
                  className="rounded-lg border border-white/20 hover:border-white/50 bg-white/5 px-8 py-3.5 text-sm font-bold text-white transition-all duration-200"
                >
                  Sign in to Account
                </Link>
              </div>

              <div className="pt-6 border-t border-white/10 text-[11px] text-warm-cream/50 tracking-wide font-sans font-semibold uppercase">
                Used by 1,200+ students and faculty across 16 active academic departments.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
