# Acadence (AcadConnect)

Acadence (AcadConnect) is a premium, feature-rich campus academic management platform designed to centralize resources, student queries, peer discussion spaces, timetables, and department announcements. The platform supports structured role-based workflows for Students, Faculty, Academic Representatives, and Administrators, fostering seamless academic collaboration and institutional transparency.

---

## 🚀 Key Features & Role-Based Access

The application provides a comprehensive suite of academic tools tailored specifically to collegiate workflows. Roles control features and permissions dynamically across the platform:

| Feature | Description | Student | Academic Rep | Faculty | Admin |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Academic Resources Hub** | Upload, search, filter, and download course-specific lecture notes, tutorials, assignments, and reference documents. | Upload (Pending) | Upload (Auto-Approved) | Upload (Auto-Approved) | Full Control |
| **PYQ Papers Desk** | Search, filter, and view Previous Year Question papers categorized by branch, year, semester, and exam type (Mid-Sem, End-Sem, Quizzes). | Upload (Pending) | Upload (Auto-Approved) | Upload (Auto-Approved) | Full Control |
| **Query Desk (Ticketing)** | Submit academic queries with category tags, priority levels, and anonymity options. View official faculty answers and response threads. | Submit & View | Moderate & Respond | Respond | Moderate & Respond |
| **Faculty Connect** | Direct communication channels mapped to courses where faculty publish official materials and message enrolled students. | Enrolled View | Enrolled View | Channel Owner | Full Control |
| **Discussion Boards** | Rich peer-to-peer discussion groups organized by branch, year, and subject with threaded replies, pinned posts, and attachments. | Post & Reply | Pin & Moderate | Post & Reply | Pin & Moderate |
| **Study Groups** | Create public/private collaboration circles with custom maximum membership limits, goals lists, meeting schedules, and chat rooms. | Join & Create | Join & Create | Monitor | Monitor |
| **Interactive Timetable** | View scheduled lectures, labs, and tutorials by day of the week, with room allocations and active course links. | Read-Only | Read-Only | Read-Only | Edit & Update |
| **Academic Calendar** | Keep track of college events, exam schedules, registration deadlines, and holidays filtered by branch and semester. | Read-Only | Read-Only | Read-Only | Edit & Update |
| **System Analytics Hub** | Access real-time usage metrics, download volume charts, active query distribution, and recent action logs. | ❌ | Read-Only | ❌ | Full Access |

---

## 🛠️ Technology Stack

Acadence is built using a modern, performant, and type-safe stack designed for reliability and scalability:

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) for server-side rendering, streaming, layouts, and route handers.
- **Frontend Core**: [React 19](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/) for robust static type checking.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) for fluid responsive styling, integrated with [Lucide React](https://lucide.dev/) icons.
- **UI Components**: Primitives built using [Radix UI](https://www.radix-ui.com/) (Accordion, Dialog, Avatar, Tooltip, Dropdown Menu, Select, Toast).
- **Database ORM**: [Prisma Client & CLI](https://www.prisma.io/) mapping tables seamlessly to PostgreSQL.
- **Database**: PostgreSQL (compatible with Supabase, Neon, or local PostgreSQL instances).
- **Authentication**: [NextAuth.js v5 (Auth.js)](https://authjs.dev/) with Prisma Adapter, JWT-based sessions, Credentials (bcrypt) provider, and Google OAuth login.
- **File Uploads**: [UploadThing](https://uploadthing.com/) for secure AWS S3 / cloud storage handling.
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) for lightweight, reactive global client state.
- **Data Validation**: [Zod](https://zod.dev/) schemas for server-side and client-side form validation.

---

## 📁 Project Directory Structure

```filepath
acadence/
├── prisma/                  # Database schema configurations and seeding scripts
│   ├── schema.prisma        # Prisma models definition
│   └── seed-db.js           # Core database seeding script
├── src/
│   ├── app/                 # Next.js App Router folders
│   │   ├── api/             # Backend API endpoint handlers
│   │   ├── auth/            # Sign-in, registration, and error pages
│   │   ├── dashboard/       # Sidebar pages (Resources, PYQs, Query Desk, etc.)
│   │   ├── globals.css      # Core styling rules and Tailwind imports
│   │   ├── layout.tsx       # Root layout provider config
│   │   └── page.tsx         # Main landing page template
│   ├── components/          # Reusable React components
│   │   ├── layout/          # Dashboard Shell, Sidebar, and Header
│   │   ├── providers/       # Theme, Session, and Toast providers
│   │   └── ui/              # Base Shadcn/Radix atomic components
│   ├── hooks/               # Custom React hooks (e.g., use-toast)
│   ├── lib/                 # Core server & client configurations
│   │   ├── auth.ts          # NextAuth configuration and providers
│   │   ├── prisma.ts        # Prisma client singleton
│   │   ├── utils.ts         # Formatting and utility functions
│   │   └── validations.ts   # Zod validation schemas
│   └── types/               # Custom TypeScript interface declarations
│       ├── index.ts         # Shared models (User, Course, Query, etc.)
│       └── next-auth.d.ts   # NextAuth session overrides
├── package.json             # App scripts, dependencies, and devDependencies
├── next.config.ts           # Next.js configuration rules
└── tsconfig.json            # TypeScript engine rules
```

---

## 🗄️ Database Architecture & Schema

The PostgreSQL database mapped by Prisma consists of the following core data models:

- **`User` / `Account` / `Session` / `VerificationToken`**: Stores basic profile details (branch, year, semester, roll number, bio), login details, and session tokens.
- **`FacultyProfile`**: Contains specific details for faculty members, such as specialization, department, office hours, location, and teaching courses.
- **`Course` / `Enrollment`**: Core catalog of institute subjects. Enrollments track which student is registered in which course for a given year and semester.
- **`StudyMaterial` / `PYQ` / `MaterialDownload`**: Manages resources (lecture notes, tutorials, references) and Previous Year Exam Papers. Downloads track usage logs.
- **`DiscussionGroup` / `DiscussionPost` / `DiscussionComment` / `PostAttachment`**: Coordinates forums by branch and year, supporting rich attachments and nested comment replies.
- **`FacultyChannel` / `ChannelMessage`**: Bridges course-specific interactions allowing direct faculty announcements and queries.
- **`Query` / `QueryResponse`**: The Query Desk ticketing system tracks categories (`COURSE_STRUCTURE`, `EXAM_DIFFICULTY`, `FACULTY_FEEDBACK`, `TIMETABLE_ISSUES`, `ACADEMIC_POLICY`, `OTHER`), status (`PENDING`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), and threads.
- **`Timetable` / `TimetableEntry`**: Structures class schedules (lectures, labs, tutorials) by day of the week, timing, and classroom.
- **`AcademicRecord` / `CGPARecord`**: Student grade books storing grades, credits, SGPA, and cumulative GPA per semester.
- **`Announcement`**: System-wide notifications pinned or prioritized by category.
- **`Notification`**: Real-time user alert records for resource uploads, queries, or event changes.
- **`CourseFeedback`**: Anonymous 1-to-5 rating records assessing teaching quality, difficulty, and suggestions.
- **`StudyGroup` / `StudyGroupMember` / `GroupMessage`**: Connects study circles with schedules, targets, and live group chats.
- **`AcademicEvent`**: Stores calendar schedules for registrations, exams, deadlines, and holidays.
- **`AnalyticsEvent`**: Tracks application activity logs (downloads, searches, logins) for admin insights.

---

## 🔑 Pre-Seeded Development Credentials

For development and local testing, running the database seed script generates a complete collegiate profile. You can log in using any of the accounts below:

> [!NOTE]
> The default password for **all** pre-seeded accounts is **`password123`**.

### Student Accounts
| Name | Email | Roll Number | Branch | Year / Sem | Role |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Anup Thakre** | `student@college.edu` | CS23B1042 | CSE | Year 3 / Sem 6 | `STUDENT` |
| **Shivang Tonde** | `rep@college.edu` | CS23B1001 | CSE | Year 3 / Sem 6 | `ACADEMIC_REP` |
| **Dipesh Kumar** | `dipesh@college.edu` | CS23B1003 | CSE | Year 3 / Sem 6 | `STUDENT` |
| **Tanishk Deore** | `tanishk@college.edu` | CS23B1004 | CSE | Year 3 / Sem 6 | `STUDENT` |
| **Harshit Srivastava** | `harshit@college.edu` | CS23B1005 | CSE | Year 3 / Sem 6 | `STUDENT` |

### Faculty Accounts
| Name | Email | Specialization | Department | Role |
| :--- | :--- | :--- | :--- | :---: |
| **Dr. Madhuri Dubey** | `faculty@college.edu` | Distributed Systems & Cloud Computing | CSE | `FACULTY` |
| **Dr. Richa Makhijani** | `richa@college.edu` | Compiler Construction & Automata Theory | CSE | `FACULTY` |
| **Dr. Jitendra Tembhurne** | `jitendra@college.edu` | UI/UX Design, Human Computer Interaction | CSE | `FACULTY` |
| **Dr. Tausif Diwan** | `tausif@college.edu` | High Performance Computing & Networks | CSE | `FACULTY` |

### Admin Account
| Name | Email | Focus | Role |
| :--- | :--- | :--- | :---: |
| **Dr. Jitendra Tembhurne** | `admin@college.edu` | Institutional Administration | `ADMIN` |

---

## ⚙️ Environment Configuration

Create a `.env` or `.env.local` file in the root directory. Configure these variables before running the application:

```env
# 1. Database Connection
DATABASE_URL="postgresql://<username>:<password>@<host>:5432/<dbname>?schema=public"

# 2. NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-base64-secret"  # Generate using: openssl rand -base64 32

# 3. Google OAuth Login (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# 4. UploadThing Cloud Storage (For materials, PYQs, and post attachments)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# 5. AWS S3 Storage Config (Optional alternative)
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_REGION="your-aws-region"
AWS_BUCKET_NAME="your-s3-bucket-name"

# 6. Supabase Storage Config (Optional alternative)
SUPABASE_URL="your-supabase-project-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

---

## 💻 Local Setup & Development Guide

Follow these steps to run Acadence locally on your development machine:

### 1. Clone the repository and install dependencies
```bash
npm install
```

### 2. Configure Environment variables
Copy the template file to create your environment configuration:
```bash
cp .env.example .env
```
Update all values inside `.env` to match your local database and credentials.

### 3. Initialize the database
Generate the Prisma client and apply database migrations to setup the PostgreSQL schema:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Seed sample collegiate data
Run the seeding script to populate users, courses, resources, calendar events, discussion posts, query tickets, and timetables:
```bash
node seed-db.js
```

### 5. Start the development server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔌 API Routes Reference

All backend communication is handled through type-safe Next.js API endpoints under `/api`:

| Endpoint | HTTP Method | Description | Authenticated | Roles |
| :--- | :--- | :--- | :---: | :---: |
| `/api/auth/[...nextauth]` | `GET`, `POST` | NextAuth integration handlers (JWT, Sign In, Sign Out). | No | Any |
| `/api/materials` | `GET` | Fetches approved study materials with search and course filters. | Yes | Any |
| `/api/materials` | `POST` | Uploads a new study material. Auto-approved for Faculty/Admin. | Yes | Any |
| `/api/pyqs` | `GET`, `POST` | Fetches or uploads Previous Year Question papers. | Yes | Any |
| `/api/queries` | `GET` | Fetches submitted query tickets filtered by status, category, or author. | Yes | Any |
| `/api/queries` | `POST` | Creates a new academic query and fires notifications to admins/reps. | Yes | Any |
| `/api/study-groups` | `GET`, `POST` | Retrieves active study groups or handles new group registrations. | Yes | Any |
| `/api/announcements` | `GET`, `POST` | Handles platform announcements and pinning parameters. | Yes | Faculty / Admin / Rep |

---

## 📦 Deployment Instructions (Vercel)

1. Push your repository code to GitHub, GitLab, or Bitbucket.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import the repository.
4. Set the **Framework Preset** to **Next.js**.
5. Configure the Environment Variables in the project settings matching your production `.env` values (ensure your production PostgreSQL database is accessible).
6. Set the **Build Command** override to run database migrations during build:
   ```bash
   prisma generate && prisma migrate deploy && next build
   ```
7. Click **Deploy**. Vercel will build and launch your application.

---

## 📄 License

This project is licensed under the MIT License. Feel free to use and customize it for your institution.