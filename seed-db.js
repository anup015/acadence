const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  console.log('Cleaning up existing database tables...');
  await prisma.academicEvent.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.timetableEntry.deleteMany({});
  await prisma.timetable.deleteMany({});
  await prisma.studyGroupMember.deleteMany({});
  await prisma.groupMessage.deleteMany({});
  await prisma.studyGroup.deleteMany({});
  await prisma.discussionComment.deleteMany({});
  await prisma.postAttachment.deleteMany({});
  await prisma.discussionPost.deleteMany({});
  await prisma.discussionGroup.deleteMany({});
  await prisma.queryResponse.deleteMany({});
  await prisma.query.deleteMany({});
  await prisma.materialDownload.deleteMany({});
  await prisma.pYQ.deleteMany({});
  await prisma.studyMaterial.deleteMany({});
  await prisma.facultyProfile.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Database cleanup completed.');

  // 1. Seed Users (Students, Faculty, Reps, Admin)
  console.log('Seeding users...');
  
  // Custom Student names
  const studentData = [
    { email: 'student@college.edu', name: 'Anup Thakre', role: 'STUDENT', rollNumber: 'CS23B1042', branch: 'CSE', year: 3, semester: 6 },
    { email: 'rep@college.edu', name: 'Shivang Tonde', role: 'ACADEMIC_REP', rollNumber: 'CS23B1001', branch: 'CSE', year: 3, semester: 6 },
    { email: 'dipesh@college.edu', name: 'Dipesh Kumar', role: 'STUDENT', rollNumber: 'CS23B1003', branch: 'CSE', year: 3, semester: 6 },
    { email: 'tanishk@college.edu', name: 'Tanishk Deore', role: 'STUDENT', rollNumber: 'CS23B1004', branch: 'CSE', year: 3, semester: 6 },
    { email: 'harshit@college.edu', name: 'Harshit Srivastava', role: 'STUDENT', rollNumber: 'CS23B1005', branch: 'CSE', year: 3, semester: 6 },
    { email: 'vyankatesh@college.edu', name: 'Vyankatesh Sabu', role: 'STUDENT', rollNumber: 'CS23B1006', branch: 'CSE', year: 3, semester: 6 },
    { email: 'jayant@college.edu', name: 'Jayant Dutta', role: 'STUDENT', rollNumber: 'CS23B1007', branch: 'CSE', year: 3, semester: 6 },
    { email: 'shubh@college.edu', name: 'Shubh Goel', role: 'STUDENT', rollNumber: 'CS23B1008', branch: 'CSE', year: 3, semester: 6 }
  ];

  // Custom Faculty names
  const facultyData = [
    { email: 'faculty@college.edu', name: 'Dr. Madhuri Dubey', role: 'FACULTY' },
    { email: 'richa@college.edu', name: 'Dr. Richa Makhijani', role: 'FACULTY' },
    { email: 'jitendra@college.edu', name: 'Dr. Jitendra Tembhurne', role: 'FACULTY' },
    { email: 'tausif@college.edu', name: 'Dr. Tausif Diwan', role: 'FACULTY' },
    { email: 'mangesh@college.edu', name: 'Dr. Mangesh Kose', role: 'FACULTY' },
    { email: 'milind@college.edu', name: 'Dr. Milind Penurkar', role: 'FACULTY' }
  ];

  // Admin account
  const adminData = {
    email: 'admin@college.edu',
    name: 'Dr. Jitendra Tembhurne',
    role: 'ADMIN'
  };

  const users = {};
  
  // Create students
  for (const item of studentData) {
    const user = await prisma.user.create({
      data: { ...item, password: passwordHash }
    });
    console.log(`Created student user: ${user.email} (${user.name})`);
    users[item.email] = user;
  }

  // Create faculty
  for (const item of facultyData) {
    const user = await prisma.user.create({
      data: { ...item, password: passwordHash }
    });
    console.log(`Created faculty user: ${user.email} (${user.name})`);
    users[item.email] = user;
  }

  // Create admin
  const adminUser = await prisma.user.create({
    data: { ...adminData, password: passwordHash }
  });
  console.log(`Created admin user: ${adminUser.email} (${adminUser.name})`);
  users[adminData.email] = adminUser;

  // 2. Seed Faculty Profiles
  console.log('Seeding Faculty profiles...');
  const facultySpecs = [
    { email: 'faculty@college.edu', dept: 'Computer Science & Engineering', desig: 'Professor & Head', hours: 'Mon & Wed, 2:00 PM - 4:00 PM', loc: 'Room 402, Block A', spec: 'Distributed Systems & Cloud Computing' },
    { email: 'richa@college.edu', dept: 'Computer Science & Engineering', desig: 'Associate Professor', hours: 'Tue & Thu, 10:00 AM - 12:00 PM', loc: 'Room 405, Block A', spec: 'Compiler Construction & Automata Theory' },
    { email: 'jitendra@college.edu', dept: 'Computer Science & Engineering', desig: 'Professor', hours: 'Friday, 1:00 PM - 3:00 PM', loc: 'Room 408, Block A', spec: 'UI/UX Design, Human Computer Interaction' },
    { email: 'tausif@college.edu', dept: 'Computer Science & Engineering', desig: 'Associate Professor', hours: 'Mon & Thu, 3:00 PM - 5:00 PM', loc: 'Room 411, Block A', spec: 'High Performance Computing & Computer Networks' },
    { email: 'mangesh@college.edu', dept: 'Computer Science & Engineering', desig: 'Assistant Professor', hours: 'Wed, 9:00 AM - 11:00 AM', loc: 'Room 302, Block B', spec: 'Computer Graphics & Game Development' },
    { email: 'milind@college.edu', dept: 'Computer Science & Engineering', desig: 'Assistant Professor', hours: 'Friday, 11:00 AM - 1:00 PM', loc: 'Room 304, Block B', spec: 'Computer Architecture & VLSI Design' }
  ];

  const facultyProfiles = {};
  for (const item of facultySpecs) {
    const profile = await prisma.facultyProfile.create({
      data: {
        userId: users[item.email].id,
        department: item.dept,
        designation: item.desig,
        officeHours: item.hours,
        officeLocation: item.loc,
        specialization: item.spec
      }
    });
    console.log(`Created profile for: ${item.email}`);
    facultyProfiles[item.email] = profile;
  }

  // 3. Seed Courses (Subjects requested by user)
  console.log('Seeding courses...');
  const coursesData = [
    { code: 'CS-301', name: 'Computer Networks', branch: 'CSE', semester: 6, credits: 4 },
    { code: 'CS-302', name: 'Compiler Design', branch: 'CSE', semester: 6, credits: 4 },
    { code: 'CS-303', name: 'UI/UX Design', branch: 'CSE', semester: 6, credits: 3 },
    { code: 'CS-304', name: 'Human Computer Interaction (HCI)', branch: 'CSE', semester: 6, credits: 3 },
    { code: 'CS-305', name: 'Data Structures & Algorithms (DSA)', branch: 'CSE', semester: 3, credits: 4 },
    { code: 'CS-306', name: 'Computer Graphics', branch: 'CSE', semester: 6, credits: 3 },
    { code: 'CS-307', name: 'Computer Architecture', branch: 'CSE', semester: 4, credits: 4 },
    { code: 'CS-308', name: 'Distributed Systems', branch: 'CSE', semester: 6, credits: 4 },
    { code: 'CS-309', name: 'Software Engineering', branch: 'CSE', semester: 6, credits: 3 }
  ];

  const courses = {};
  for (const item of coursesData) {
    const course = await prisma.course.create({ data: item });
    console.log(`Created course: ${course.code} (${course.name})`);
    courses[item.code] = course;
  }

  // Connect faculty profiles to courses
  await prisma.facultyProfile.update({
    where: { id: facultyProfiles['faculty@college.edu'].id },
    data: { courses: { connect: [{ id: courses['CS-308'].id }] } }
  });
  await prisma.facultyProfile.update({
    where: { id: facultyProfiles['richa@college.edu'].id },
    data: { courses: { connect: [{ id: courses['CS-302'].id }] } }
  });
  await prisma.facultyProfile.update({
    where: { id: facultyProfiles['jitendra@college.edu'].id },
    data: { courses: { connect: [{ id: courses['CS-303'].id }] } }
  });
  await prisma.facultyProfile.update({
    where: { id: facultyProfiles['tausif@college.edu'].id },
    data: { courses: { connect: [{ id: courses['CS-301'].id }] } }
  });
  await prisma.facultyProfile.update({
    where: { id: facultyProfiles['mangesh@college.edu'].id },
    data: { courses: { connect: [{ id: courses['CS-306'].id }] } }
  });
  await prisma.facultyProfile.update({
    where: { id: facultyProfiles['milind@college.edu'].id },
    data: { courses: { connect: [{ id: courses['CS-307'].id }] } }
  });

  // 4. Seed Study Materials (Resources)
  console.log('Seeding study materials...');
  const materialsData = [
    {
      title: 'Computer Networks Unit 1: Physical & Data Link Layer Notes',
      description: 'Handwritten lecture notes covering OSI models, line coding, error detection methods (CRC, checksum), and sliding window protocols.',
      type: 'lecture_notes',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'pdf',
      fileSize: 2048300,
      tags: ['networks', 'osi-layers', 'crc', 'data-link'],
      courseId: courses['CS-301'].id,
      uploadedById: users['tausif@college.edu'].id,
      status: 'APPROVED',
    },
    {
      title: 'Compiler Design Syntax Directed Translation Guide',
      description: 'Comprehensive guide sheet detailing S-attributed and L-attributed definitions, syntax trees, and intermediate code generation.',
      type: 'tutorial',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'docx',
      fileSize: 840200,
      tags: ['compiler', 'sdt', 'parsing', 'syntax-tree'],
      courseId: courses['CS-302'].id,
      uploadedById: users['richa@college.edu'].id,
      status: 'APPROVED',
    },
    {
      title: 'UI/UX Design Wireframing & Prototyping Checklist',
      description: 'Quick reference guide highlighting low-fidelity and high-fidelity layouts, grid alignments, accessibility rules, and component states.',
      type: 'reference',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'pdf',
      fileSize: 512000,
      tags: ['ui-ux', 'wireframe', 'figma', 'design-checklist'],
      courseId: courses['CS-303'].id,
      uploadedById: users['rep@college.edu'].id, // uploaded by Shivang Tonde (Rep)
      status: 'APPROVED',
    },
    {
      title: 'HCI Cognitive Models & Evaluation Methodologies Lecture Slides',
      description: 'Lecture slide notes covering GOMS model, KLM, heuristic evaluations, cognitive walkthroughs, and desktop usability testing metrics.',
      type: 'lecture_notes',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'pdf',
      fileSize: 3105000,
      tags: ['hci', 'usability', 'cognitive-models', 'heuristics'],
      courseId: courses['CS-304'].id,
      uploadedById: users['jitendra@college.edu'].id,
      status: 'APPROVED',
    },
    {
      title: 'Computer Graphics Rasterization Algorithms Reference',
      description: 'Step-by-step breakdown and code templates for DDA Line Drawing, Bresenhams Line, and Midpoint Circle Drawing algorithms.',
      type: 'reference',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'pdf',
      fileSize: 1104000,
      tags: ['graphics', 'dda', 'bresenham', 'rasterization'],
      courseId: courses['CS-306'].id,
      uploadedById: users['mangesh@college.edu'].id,
      status: 'APPROVED',
    },
    {
      title: 'Computer Architecture MIPS Instruction Pipeline Notes',
      description: 'Covers instruction staging, pipelining hazards (data, structural, control), pipeline stalls, and forward logic configurations.',
      type: 'lecture_notes',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'pdf',
      fileSize: 1540000,
      tags: ['architecture', 'mips', 'pipelining', 'hazards'],
      courseId: courses['CS-307'].id,
      uploadedById: users['milind@college.edu'].id,
      status: 'APPROVED',
    }
  ];

  for (const item of materialsData) {
    await prisma.studyMaterial.create({ data: item });
  }
  console.log('Seeded study materials.');

  // 5. Seed PYQ Papers
  console.log('Seeding PYQs...');
  const pyqsData = [
    {
      title: 'Computer Networks Mid-Semester 2025 Exam Paper',
      description: 'Mid-semester exam paper covering CIDR subnetting, packet headers, slide windows, and error control equations.',
      branch: 'CSE',
      semester: 6,
      year: 2025,
      examType: 'mid-sem',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'pdf',
      fileSize: 450000,
      courseId: courses['CS-301'].id,
      uploadedById: users['rep@college.edu'].id, // Shivang Tonde
      status: 'APPROVED',
    },
    {
      title: 'Compiler Design End-Semester 2024 Exam Paper',
      description: 'Final semester exam paper covering lexical parsing, SLR/LALR syntax parser tables, SDT, and basic block DAG optimization.',
      branch: 'CSE',
      semester: 6,
      year: 2024,
      examType: 'end-sem',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'pdf',
      fileSize: 620000,
      courseId: courses['CS-302'].id,
      uploadedById: users['richa@college.edu'].id,
      status: 'APPROVED',
    },
    {
      title: 'Computer Architecture Mid-Semester 2024 Paper',
      description: 'Includes pipeline stalls calculations, cache mapping models (direct, associative), and memory alignment problems.',
      branch: 'CSE',
      semester: 4,
      year: 2024,
      examType: 'mid-sem',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'pdf',
      fileSize: 390000,
      courseId: courses['CS-307'].id,
      uploadedById: users['student@college.edu'].id, // Anup Thakre
      status: 'APPROVED',
    }
  ];

  for (const item of pyqsData) {
    await prisma.pYQ.create({ data: item });
  }
  console.log('Seeded PYQs.');

  // 6. Seed Timetable
  console.log('Seeding Timetable...');
  const timetable = await prisma.timetable.create({
    data: {
      name: 'CSE 3rd Year Semester 6 Block Timetable',
      branch: 'CSE',
      semester: 6,
      year: 2026,
      isActive: true,
    },
  });

  const entriesData = [
    // Monday
    { timetableId: timetable.id, courseId: courses['CS-301'].id, dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:00', room: 'LH-101', type: 'lecture' },
    { timetableId: timetable.id, courseId: courses['CS-302'].id, dayOfWeek: 'MONDAY', startTime: '10:00', endTime: '11:00', room: 'LH-101', type: 'lecture' },
    { timetableId: timetable.id, courseId: courses['CS-303'].id, dayOfWeek: 'MONDAY', startTime: '14:00', endTime: '16:00', room: 'Systems Lab 2', type: 'lab' },
    
    // Tuesday
    { timetableId: timetable.id, courseId: courses['CS-308'].id, dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '10:00', room: 'LH-101', type: 'lecture' },
    { timetableId: timetable.id, courseId: courses['CS-301'].id, dayOfWeek: 'TUESDAY', startTime: '11:00', endTime: '13:00', room: 'Networks Lab 1', type: 'lab' },
    
    // Wednesday
    { timetableId: timetable.id, courseId: courses['CS-304'].id, dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '10:00', room: 'LH-102', type: 'lecture' },
    { timetableId: timetable.id, courseId: courses['CS-309'].id, dayOfWeek: 'WEDNESDAY', startTime: '10:00', endTime: '11:00', room: 'LH-102', type: 'lecture' },
    { timetableId: timetable.id, courseId: courses['CS-306'].id, dayOfWeek: 'WEDNESDAY', startTime: '14:00', endTime: '15:00', room: 'LH-101', type: 'lecture' },
    
    // Thursday
    { timetableId: timetable.id, courseId: courses['CS-302'].id, dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '10:00', room: 'LH-101', type: 'lecture' },
    { timetableId: timetable.id, courseId: courses['CS-308'].id, dayOfWeek: 'THURSDAY', startTime: '10:00', endTime: '11:00', room: 'LH-101', type: 'lecture' },
    
    // Friday
    { timetableId: timetable.id, courseId: courses['CS-309'].id, dayOfWeek: 'FRIDAY', startTime: '10:00', endTime: '11:00', room: 'LH-102', type: 'lecture' },
    { timetableId: timetable.id, courseId: courses['CS-304'].id, dayOfWeek: 'FRIDAY', startTime: '11:00', endTime: '12:00', room: 'LH-102', type: 'tutorial' }
  ];

  for (const item of entriesData) {
    await prisma.timetableEntry.create({ data: item });
  }
  console.log('Seeded Timetable entries.');

  // 7. Seed Queries (Query Desk)
  console.log('Seeding Queries...');
  const queriesData = [
    {
      title: 'Clarification on Compiler Design End-Sem Syllabus',
      description: 'Will LALR(1) and CLR(1) parsing table construction be tested, or is it restricted to SLR(1) parsing? The lecture notes do not show detailed parser tables for CLR.',
      category: 'COURSE_STRUCTURE',
      status: 'IN_PROGRESS',
      priority: 3,
      authorId: users['student@college.edu'].id, // Anup Thakre
    },
    {
      title: 'Grade mismatch in Computer Networks Quiz 1',
      description: 'My question 5 regarding CIDR subnet masks was marked incorrect despite matching the standard answer sheet. Requesting recheck of my script.',
      category: 'EXAM_DIFFICULTY',
      status: 'PENDING',
      priority: 2,
      authorId: users['dipesh@college.edu'].id, // Dipesh Kumar
    },
    {
      title: 'Lab slot shift request for UI/UX Design',
      description: 'The Friday afternoon lab slot conflicts with collegiate sports registrations. Can our batch shift it to Thursday morning?',
      category: 'TIMETABLE_ISSUES',
      status: 'RESOLVED',
      priority: 1,
      authorId: users['harshit@college.edu'].id, // Harshit Srivastava
      resolvedAt: new Date(),
    }
  ];

  for (const item of queriesData) {
    const createdQuery = await prisma.query.create({ data: item });
    if (item.status === 'RESOLVED') {
      await prisma.queryResponse.create({
        data: {
          content: 'The Friday lab slot has been shifted to Thursday 11:00 AM as requested, following discussions with HOD. The active timetable has been updated.',
          queryId: createdQuery.id,
          authorId: users['admin@college.edu'].id, // Admin
        }
      });
    }
  }
  console.log('Seeded Queries and responses.');

  // 8. Seed Discussion Groups
  console.log('Seeding Discussion groups...');
  const discGroup = await prisma.discussionGroup.create({
    data: {
      name: 'CSE 3rd Year General Discussions',
      description: 'Connect and coordinate regarding 6th semester core tracks, classes, and exams.',
      type: 'branch',
      branch: 'CSE',
      year: 3,
    },
  });

  const postsData = [
    {
      title: 'Socket Programming Assignment Tips',
      content: 'Make sure to handle concurrent clients using client threads or pools. Also, close socket descriptors inside the finally block to prevent file descriptor leaks!',
      groupId: discGroup.id,
      authorId: users['student@college.edu'].id, // Anup Thakre
    }
  ];

  for (const item of postsData) {
    const post = await prisma.discussionPost.create({ data: item });
    
    // Add replies
    await prisma.discussionComment.create({
      data: {
        content: 'Thanks Anup! Does the server need to handle client-side disconnection signals as well?',
        postId: post.id,
        authorId: users['rep@college.edu'].id // Shivang Tonde
      }
    });
    await prisma.discussionComment.create({
      data: {
        content: 'Yes, Shivang. Handle client EOF signals cleanly on the stream so the socket doesn\'t enter a busy wait loop.',
        postId: post.id,
        authorId: users['student@college.edu'].id // Anup Thakre
      }
    });
  }
  console.log('Seeded Discussion posts & replies.');

  // 9. Seed Study Groups
  console.log('Seeding Study groups...');
  const studyGroupsData = [
    {
      name: 'Computer Networks Study Circle',
      description: 'Preparing for subnetting, socket labs, and routing equations revision.',
      subject: 'Computer Networks',
      type: 'exam_prep',
      courseId: courses['CS-301'].id,
      isPublic: true,
      maxMembers: 15,
      meetingSchedule: 'Wednesdays at 5:00 PM',
      goals: ['Solve routing table worksheets', 'Complete socket bootcamps'],
      leaderId: users['student@college.edu'].id, // Anup Thakre
      createdById: users['student@college.edu'].id,
    },
    {
      name: 'Compiler Design Parsing Prep Group',
      description: 'Preparing SLR and CLR parsing action/goto state machine tables.',
      subject: 'Compiler Design',
      type: 'exam_prep',
      courseId: courses['CS-302'].id,
      isPublic: true,
      maxMembers: 10,
      meetingSchedule: 'Thursdays at 4:00 PM',
      goals: ['Draw parsing DFA graphs', 'Verify shift-reduce actions'],
      leaderId: users['rep@college.edu'].id, // Shivang Tonde
      createdById: users['rep@college.edu'].id,
    }
  ];

  for (const item of studyGroupsData) {
    const group = await prisma.studyGroup.create({ data: item });
    
    // Add creator as admin member
    await prisma.studyGroupMember.create({
      data: {
        groupId: group.id,
        userId: item.leaderId,
        role: 'admin'
      }
    });

    // Add other members to group
    if (item.name.includes('Networks')) {
      const peers = ['rep@college.edu', 'dipesh@college.edu', 'shubh@college.edu'];
      for (const email of peers) {
        await prisma.studyGroupMember.create({
          data: {
            groupId: group.id,
            userId: users[email].id,
            role: 'member'
          }
        });
      }
    } else {
      const peers = ['tanishk@college.edu', 'harshit@college.edu', 'vyankatesh@college.edu', 'jayant@college.edu'];
      for (const email of peers) {
        await prisma.studyGroupMember.create({
          data: {
            groupId: group.id,
            userId: users[email].id,
            role: 'member'
          }
        });
      }
    }
  }
  console.log('Seeded Study Groups.');

  // 10. Seed Announcements
  console.log('Seeding Announcements...');
  const announcementsData = [
    {
      title: 'End-Semester Examinations Schedule Released',
      content: 'The end-semester examinations for the academic session 2026 are officially scheduled from June 25th. Download schedules from the calendar.',
      category: 'exam',
      authorId: users['admin@college.edu'].id,
      isPublished: true,
      isPinned: true,
    },
    {
      title: 'UI/UX Assignment 2 Submission Deadline Extended',
      content: 'The deadline for high-fidelity interactive wireframes is extended to next Tuesday. Please submit through the portal.',
      category: 'assignment',
      authorId: users['jitendra@college.edu'].id,
      isPublished: true,
    },
    {
      title: 'Computer Networks Socket Programming Lab Evaluation',
      content: 'Concurrent client socket evaluation starts from Monday, LH-101. Carry printed code files and design architecture reports.',
      category: 'exam',
      authorId: users['tausif@college.edu'].id,
      isPublished: true,
    }
  ];

  for (const item of announcementsData) {
    await prisma.announcement.create({ data: item });
  }
  console.log('Seeded Announcements.');

  // 11. Seed Academic Calendar Events
  console.log('Seeding Academic Calendar events...');
  const eventsData = [
    {
      title: 'Course Registration & Elective Lockups',
      description: 'Last date to lock elective courses for next term.',
      type: 'registration',
      startDate: new Date('2026-06-20T00:00:00.000Z'),
      isAllDay: true,
    },
    {
      title: 'End-Sem Theory Exams CSE',
      description: 'End-semester examinations schedule block.',
      type: 'exam',
      startDate: new Date('2026-06-25T00:00:00.000Z'),
      endDate: new Date('2026-07-02T23:59:59.000Z'),
      isAllDay: true,
    },
    {
      title: 'Summer Internship Registrations Open',
      description: 'Submit industry intern details for approvals.',
      type: 'deadline',
      startDate: new Date('2026-07-15T00:00:00.000Z'),
      isAllDay: true,
    }
  ];

  for (const item of eventsData) {
    await prisma.academicEvent.create({ data: item });
  }
  console.log('Seeded Academic Calendar events.');

  console.log('All custom collegiate dummy data seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
