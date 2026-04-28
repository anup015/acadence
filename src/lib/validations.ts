import { z } from "zod";

// ==================== AUTH ====================

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["STUDENT", "FACULTY", "ACADEMIC_REP", "ADMIN"]),
  rollNumber: z.string().optional(),
  branch: z.string().optional(),
  year: z.coerce.number().min(1).max(4).optional(),
  semester: z.coerce.number().min(1).max(8).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ==================== USER ====================

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  branch: z.string().optional(),
  year: z.coerce.number().min(1).max(4).optional(),
  semester: z.coerce.number().min(1).max(8).optional(),
  rollNo: z.string().optional(),
});

// Alias for profileSchema
export const profileSchema = updateProfileSchema;

// ==================== COURSE ====================

export const courseSchema = z.object({
  code: z.string().min(2, "Course code is required"),
  name: z.string().min(2, "Course name is required"),
  description: z.string().optional(),
  branch: z.string().min(1, "Branch is required"),
  semester: z.coerce.number().min(1).max(8),
  credits: z.coerce.number().min(1).max(6).default(3),
});

// ==================== STUDY MATERIAL ====================

export const studyMaterialSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["lecture_notes", "tutorial", "assignment", "reference"]),
  tags: z.array(z.string()).optional(),
  courseId: z.string().min(1, "Course is required"),
  fileUrl: z.string().url("Valid URL required"),
  fileSize: z.number().optional(),
});

// Alias for materialSchema
export const materialSchema = studyMaterialSchema;

// ==================== PYQ ====================

export const pyqSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  branch: z.string().min(1, "Branch is required"),
  semester: z.coerce.number().min(1).max(8),
  year: z.coerce.number().min(2015).max(2030),
  examType: z.enum(["mid-sem", "end-sem", "quiz", "assignment"]),
  courseId: z.string().min(1, "Course is required"),
  fileUrl: z.string().url("Valid URL required"),
  solutionUrl: z.string().url().optional(),
});

// ==================== QUERY ====================

export const querySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.enum([
    "COURSE_STRUCTURE",
    "EXAM_DIFFICULTY",
    "FACULTY_FEEDBACK",
    "TIMETABLE_ISSUES",
    "ACADEMIC_POLICY",
    "OTHER",
  ]),
  priority: z.coerce.number().min(1).max(5),
  isAnonymous: z.boolean(),
});

export const queryResponseSchema = z.object({
  content: z.string().min(10, "Response must be at least 10 characters"),
  queryId: z.string().min(1, "Query ID is required"),
});

// ==================== DISCUSSION ====================

export const discussionPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  groupId: z.string().min(1, "Group is required"),
});

export const discussionCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
  postId: z.string().min(1, "Post ID is required"),
  parentId: z.string().optional(),
});

// ==================== ANNOUNCEMENT ====================

export const announcementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.enum(["exam", "assignment", "workshop", "seminar", "event", "general"]),
  targetBranch: z.string().optional(),
  attachmentUrl: z.string().url().optional(),
  isPinned: z.boolean(),
});

// ==================== TIMETABLE ====================

export const timetableSchema = z.object({
  name: z.string().min(2, "Name is required"),
  branch: z.string().min(1, "Branch is required"),
  semester: z.coerce.number().min(1).max(8),
  year: z.coerce.number().min(2020).max(2030),
});

export const timetableEntrySchema = z.object({
  timetableId: z.string().min(1, "Timetable is required"),
  courseId: z.string().min(1, "Course is required"),
  dayOfWeek: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  room: z.string().optional(),
  type: z.enum(["lecture", "lab", "tutorial"]),
});

// ==================== FEEDBACK ====================

export const courseFeedbackSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  isAnonymous: z.boolean().default(false),
  teachingQuality: z.coerce.number().min(1).max(5),
  courseDifficulty: z.coerce.number().min(1).max(5),
  courseContent: z.coerce.number().min(1).max(5),
  suggestions: z.string().optional(),
});

// ==================== STUDY GROUP ====================

export const studyGroupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  type: z.enum(["subject_study", "exam_prep", "project", "general"]),
  subject: z.string().min(1, "Subject is required"),
  courseId: z.string().optional(),
  isPublic: z.boolean(),
  maxMembers: z.coerce.number().min(2).max(100),
  meetingSchedule: z.string().optional(),
  goals: z.array(z.string()).optional(),
});

export const groupMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
  groupId: z.string().min(1, "Group is required"),
});

// ==================== ACADEMIC EVENT ====================

export const academicEventSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["exam", "registration", "holiday", "deadline", "event"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isAllDay: z.boolean().default(true),
  branch: z.string().optional(),
  semester: z.coerce.number().optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type StudyMaterialInput = z.infer<typeof studyMaterialSchema>;
export type MaterialFormData = z.infer<typeof materialSchema>;
export type PYQInput = z.infer<typeof pyqSchema>;
export type QueryInput = z.infer<typeof querySchema>;
export type QueryFormData = z.infer<typeof querySchema>;
export type QueryResponseInput = z.infer<typeof queryResponseSchema>;
export type DiscussionPostInput = z.infer<typeof discussionPostSchema>;
export type DiscussionCommentInput = z.infer<typeof discussionCommentSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type AnnouncementFormData = z.infer<typeof announcementSchema>;
export type TimetableInput = z.infer<typeof timetableSchema>;
export type TimetableEntryInput = z.infer<typeof timetableEntrySchema>;
export type CourseFeedbackInput = z.infer<typeof courseFeedbackSchema>;
export type StudyGroupInput = z.infer<typeof studyGroupSchema>;
export type StudyGroupFormData = z.infer<typeof studyGroupSchema>;
export type GroupMessageInput = z.infer<typeof groupMessageSchema>;
export type AcademicEventInput = z.infer<typeof academicEventSchema>;
