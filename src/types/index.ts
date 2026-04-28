// Type definitions for AcadConnect

// ==================== USER ====================
export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "STUDENT" | "CLASS_REP" | "FACULTY" | "ADMIN" | "ACADEMIC_REP";
  branch?: string | null;
  year?: number | null;
  semester?: number | null;
  rollNo?: string | null;
  phone?: string | null;
  bio?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ==================== COURSE ====================
export interface Course {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  branch: string;
  semester: number;
  credits: number;
  createdAt: Date | string;
  faculty?: User[];
}

// ==================== STUDY MATERIAL ====================
export interface StudyMaterial {
  id: string;
  title: string;
  description?: string | null;
  type: "lecture_notes" | "tutorial" | "assignment" | "reference";
  fileUrl: string;
  fileSize?: number | null;
  downloadCount: number;
  tags: string[];
  courseId: string;
  uploadedById: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  course?: Course;
  uploadedBy?: User;
}

// ==================== PYQ ====================
export interface PYQ {
  id: string;
  title: string;
  description?: string | null;
  branch: string;
  semester: number;
  year: number;
  examType: "mid-sem" | "end-sem" | "quiz" | "assignment";
  fileUrl: string;
  solutionUrl?: string | null;
  downloadCount: number;
  courseId: string;
  uploadedById: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  course?: Course;
  uploadedBy?: User;
}

// ==================== QUERY ====================
export interface Query {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  category: "COURSE_STRUCTURE" | "EXAM_DIFFICULTY" | "FACULTY_FEEDBACK" | "TIMETABLE_ISSUES" | "ACADEMIC_POLICY" | "OTHER";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: number;
  isAnonymous: boolean;
  votes: number;
  authorId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  author?: User;
  responses?: QueryResponse[];
}

export interface QueryResponse {
  id: string;
  content: string;
  isOfficial: boolean;
  queryId: string;
  authorId: string;
  createdAt: Date | string;
  author?: User;
}

// ==================== ANNOUNCEMENT ====================
export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: "exam" | "assignment" | "workshop" | "seminar" | "event" | "general";
  targetBranch?: string | null;
  attachmentUrl?: string | null;
  isPinned: boolean;
  authorId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  author?: User;
}

// ==================== DISCUSSION ====================
export interface DiscussionGroup {
  id: string;
  name: string;
  description?: string | null;
  type: "BRANCH" | "YEAR" | "COURSE" | "GENERAL";
  branch?: string | null;
  year?: number | null;
  courseId?: string | null;
  isPrivate: boolean;
  memberCount: number;
  createdAt: Date | string;
  members?: GroupMember[];
  posts?: DiscussionPost[];
  course?: Course;
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: "ADMIN" | "MODERATOR" | "MEMBER";
  joinedAt: Date | string;
  user?: User;
}

export interface DiscussionPost {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  likes: number;
  authorId: string;
  groupId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  author?: User;
  comments?: PostComment[];
  _count?: { comments: number };
}

export interface PostComment {
  id: string;
  content: string;
  likes: number;
  authorId: string;
  postId: string;
  parentId?: string | null;
  createdAt: Date | string;
  author?: User;
  replies?: PostComment[];
}

// ==================== STUDY GROUP ====================
export interface StudyGroup {
  id: string;
  name: string;
  description?: string | null;
  type: "subject_study" | "exam_prep" | "project" | "general";
  subject: string;
  isPublic: boolean;
  maxMembers: number;
  meetingSchedule?: string | null;
  goals: string[];
  courseId?: string | null;
  createdById: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: User;
  members?: StudyGroupMember[];
  _count?: { members: number };
}

export interface StudyGroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: "LEADER" | "MEMBER";
  progress: number;
  joinedAt: Date | string;
  user?: User;
}

// ==================== TIMETABLE ====================
export interface Timetable {
  id: string;
  name: string;
  branch: string;
  semester: number;
  year: number;
  isActive: boolean;
  createdAt: Date | string;
  entries?: TimetableEntry[];
}

export interface TimetableEntry {
  id: string;
  timetableId: string;
  courseId: string;
  dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
  startTime: string;
  endTime: string;
  room?: string | null;
  type: "lecture" | "lab" | "tutorial";
  course?: Course;
}

// ==================== ACADEMIC EVENT ====================
export interface AcademicEvent {
  id: string;
  title: string;
  description?: string | null;
  type: "exam" | "registration" | "holiday" | "deadline" | "event";
  startDate: Date | string;
  endDate?: Date | string | null;
  isAllDay: boolean;
  branch?: string | null;
  semester?: number | null;
  createdById: string;
  createdAt: Date | string;
  createdBy?: User;
}

// ==================== NOTIFICATION ====================
export interface Notification {
  id: string;
  type: "ANNOUNCEMENT" | "QUERY_RESPONSE" | "QUERY_STATUS" | "GROUP_INVITE" | "MATERIAL_UPLOAD" | "EVENT_REMINDER" | "GENERAL";
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  userId: string;
  createdAt: Date | string;
}

// ==================== FACULTY ====================
export interface Faculty extends User {
  department?: string;
  courses?: Course[];
}

// ==================== ANALYTICS ====================
export interface Analytics {
  totalUsers: number;
  totalMaterials: number;
  totalQueries: number;
  totalDownloads: number;
  usersByRole: { role: string; _count: number }[];
  queriesByStatus: { status: string; _count: number }[];
  topMaterials: StudyMaterial[];
  queryCategories: { category: string; _count: number }[];
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  createdAt: Date | string;
  user?: User;
}

// ==================== SEARCH RESULTS ====================
export interface SearchResults {
  materials: StudyMaterial[];
  pyqs: PYQ[];
  announcements: Announcement[];
  groups: StudyGroup[];
  events: AcademicEvent[];
}
