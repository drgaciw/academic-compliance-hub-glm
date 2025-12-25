import {
  PrismaClient,
  Role,
  InstitutionType,
  NCAADivision,
  AgentType,
  EnrollmentStatus,
  ComplianceStatus,
  TransferRequestStatus,
  TransferRequestPriority,
  TransferRequestType,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Seed Institutions
  console.log("Seeding institutions...");
  const institutions = [
    {
      name: "University of Southern California",
      code: "USC",
      type: "UNIVERSITY" as InstitutionType,
      ncaaDivision: "DIVISION_I" as NCAADivision,
      ncaaCertified: true,
      region: "West",
      country: "US",
      state: "CA",
      website: "https://www.usc.edu",
      email: "admissions@usc.edu",
      isActive: true,
    },
    {
      name: "University of California, Los Angeles",
      code: "UCLA",
      type: "UNIVERSITY" as InstitutionType,
      ncaaDivision: "DIVISION_I" as NCAADivision,
      ncaaCertified: true,
      region: "West",
      country: "US",
      state: "CA",
      website: "https://www.ucla.edu",
      email: "admissions@ucla.edu",
      isActive: true,
    },
    {
      name: "Duke University",
      code: "DUKE",
      type: "UNIVERSITY" as InstitutionType,
      ncaaDivision: "DIVISION_I" as NCAADivision,
      ncaaCertified: true,
      region: "South",
      country: "US",
      state: "NC",
      website: "https://www.duke.edu",
      email: "admissions@duke.edu",
      isActive: true,
    },
    {
      name: "Stanford University",
      code: "STANFORD",
      type: "UNIVERSITY" as InstitutionType,
      ncaaDivision: "DIVISION_I" as NCAADivision,
      ncaaCertified: true,
      region: "West",
      country: "US",
      state: "CA",
      website: "https://www.stanford.edu",
      email: "admissions@stanford.edu",
      isActive: true,
    },
    {
      name: "University of Michigan",
      code: "MICH",
      type: "UNIVERSITY" as InstitutionType,
      ncaaDivision: "DIVISION_I" as NCAADivision,
      ncaaCertified: true,
      region: "Midwest",
      country: "US",
      state: "MI",
      website: "https://www.umich.edu",
      email: "admissions@umich.edu",
      isActive: true,
    },
    {
      name: "University of Texas at Austin",
      code: "UTAUSTIN",
      type: "UNIVERSITY" as InstitutionType,
      ncaaDivision: "DIVISION_I" as NCAADivision,
      ncaaCertified: true,
      region: "Southwest",
      country: "US",
      state: "TX",
      website: "https://www.utexas.edu",
      email: "admissions@utexas.edu",
      isActive: true,
    },
    {
      name: "University of North Carolina at Chapel Hill",
      code: "UNC",
      type: "UNIVERSITY" as InstitutionType,
      ncaaDivision: "DIVISION_I" as NCAADivision,
      ncaaCertified: true,
      region: "South",
      country: "US",
      state: "NC",
      website: "https://www.unc.edu",
      email: "admissions@unc.edu",
      isActive: true,
    },
    {
      name: "University of Florida",
      code: "UFL",
      type: "UNIVERSITY" as InstitutionType,
      ncaaDivision: "DIVISION_I" as NCAADivision,
      ncaaCertified: true,
      region: "Southeast",
      country: "US",
      state: "FL",
      website: "https://www.ufl.edu",
      email: "admissions@ufl.edu",
      isActive: true,
    },
    {
      name: "Ohio State University",
      code: "OSU",
      type: "UNIVERSITY" as InstitutionType,
      ncaaDivision: "DIVISION_I" as NCAADivision,
      ncaaCertified: true,
      region: "Midwest",
      country: "US",
      state: "OH",
      website: "https://www.osu.edu",
      email: "admissions@osu.edu",
      isActive: true,
    },
    {
      name: "Arizona State University",
      code: "ASU",
      type: "UNIVERSITY" as InstitutionType,
      ncaaDivision: "DIVISION_I" as NCAADivision,
      ncaaCertified: true,
      region: "West",
      country: "US",
      state: "AZ",
      website: "https://www.asu.edu",
      email: "admissions@asu.edu",
      isActive: true,
    },
    {
      name: "University of Alabama",
      code: "ALABAMA",
      type: "UNIVERSITY" as InstitutionType,
      ncaaDivision: "DIVISION_I" as NCAADivision,
      ncaaCertified: true,
      region: "Southeast",
      country: "US",
      state: "AL",
      website: "https://www.ua.edu",
      email: "admissions@ua.edu",
      isActive: true,
    },
    {
      name: "Miami Dade College",
      code: "MDC",
      type: "COMMUNITY_COLLEGE" as InstitutionType,
      ncaaDivision: "NJCAA" as NCAADivision,
      ncaaCertified: false,
      region: "Southeast",
      country: "US",
      state: "FL",
      website: "https://www.mdc.edu",
      email: "admissions@mdc.edu",
      isActive: true,
    },
    {
      name: "Santa Monica College",
      code: "SMC",
      type: "COMMUNITY_COLLEGE" as InstitutionType,
      ncaaDivision: null,
      ncaaCertified: false,
      region: "West",
      country: "US",
      state: "CA",
      website: "https://www.smc.edu",
      email: "admissions@smc.edu",
      isActive: true,
    },
  ];

  for (const institution of institutions) {
    await prisma.institution.upsert({
      where: { code: institution.code },
      update: {},
      create: institution,
    });
  }

  console.log(`Seeded ${institutions.length} institutions.`);

  // Seed NCAA Bylaw 14.5 Rules (Transfer Credit)
  console.log("Seeding NCAA Bylaw 14.5 rules...");
  const ncaaRules = [
    {
      bylawNumber: "14.5.1",
      title: "General Regulations",
      description:
        "A student-athlete may receive transfer credit for course work completed at another institution only if the academic course work is acceptable under the general academic policies of the certifying institution.",
      division: "DIVISION_I" as NCAADivision,
      category: "Transfer Credit",
      subCategory: "General",
      agentType: "EVALUATION_AGENT" as AgentType,
      isActive: true,
    },
    {
      bylawNumber: "14.5.2",
      title: "Course Work Requirements",
      description:
        "The transfer student must satisfactorily complete a minimum of six semester hours or eight quarter hours of academic credit during each term of full-time attendance to meet satisfactory-progress requirements.",
      division: "DIVISION_I" as NCAADivision,
      category: "Transfer Credit",
      subCategory: "Course Work",
      agentType: "EVALUATION_AGENT" as AgentType,
      isActive: true,
    },
    {
      bylawNumber: "14.5.3",
      title: "Grade-Point Average",
      description:
        "For purposes of determining eligibility, the grade-point average of a transfer student shall be computed only on academic credit completed at the certifying institution.",
      division: "DIVISION_I" as NCAADivision,
      category: "Transfer Credit",
      subCategory: "GPA",
      agentType: "EVALUATION_AGENT" as AgentType,
      isActive: true,
    },
    {
      bylawNumber: "14.5.4",
      title: "Residential Requirement",
      description:
        "To be eligible for competition, a transfer student must have been in residence at the certifying institution for a minimum of one full academic year.",
      division: "DIVISION_I" as NCAADivision,
      category: "Transfer Credit",
      subCategory: "Residency",
      agentType: "COMPLIANCE_AGENT" as AgentType,
      isActive: true,
    },
    {
      bylawNumber: "14.5.5",
      title: "Two-Year College Transfers",
      description:
        "A student who has graduated from a two-year college and transfers to a four-year institution must satisfy all eligibility requirements for participation at the four-year institution.",
      division: "DIVISION_I" as NCAADivision,
      category: "Transfer Credit",
      subCategory: "Two-Year College",
      agentType: "EVALUATION_AGENT" as AgentType,
      isActive: true,
    },
    {
      bylawNumber: "14.5.6",
      title: "Four-Year College Transfers",
      description:
        "A student-athlete who transfers from a four-year institution shall be ineligible for competition for one full academic year unless the student meets an exception to the transfer rules.",
      division: "DIVISION_I" as NCAADivision,
      category: "Transfer Credit",
      subCategory: "Four-Year College",
      agentType: "COMPLIANCE_AGENT" as AgentType,
      isActive: true,
    },
    {
      bylawNumber: "14.5.7",
      title: "Academic Exceptions",
      description:
        "A transfer student may be eligible immediately if the student has earned a baccalaureate degree or is transferring as a graduate student.",
      division: "DIVISION_I" as NCAADivision,
      category: "Transfer Credit",
      subCategory: "Exceptions",
      agentType: "COMPLIANCE_AGENT" as AgentType,
      isActive: true,
    },
    {
      bylawNumber: "14.5.8",
      title: "Nondegree Credit",
      description:
        "Credit earned at nondegree-granting institutions generally may not be used to satisfy eligibility requirements.",
      division: "DIVISION_I" as NCAADivision,
      category: "Transfer Credit",
      subCategory: "Nondegree Credit",
      agentType: "EVALUATION_AGENT" as AgentType,
      isActive: true,
    },
    {
      bylawNumber: "14.5.9",
      title: "International Transfer",
      description:
        "International transfer credit must be evaluated on a course-by-course basis to determine equivalency with domestic course work.",
      division: "DIVISION_I" as NCAADivision,
      category: "Transfer Credit",
      subCategory: "International",
      agentType: "EVALUATION_AGENT" as AgentType,
      isActive: true,
    },
    {
      bylawNumber: "14.5.10",
      title: "Credit Conversion",
      description:
        "Credit from institutions on a different calendar system must be converted to the semester or quarter system of the certifying institution.",
      division: "DIVISION_I" as NCAADivision,
      category: "Transfer Credit",
      subCategory: "Conversion",
      agentType: "EVALUATION_AGENT" as AgentType,
      isActive: true,
    },
  ];

  for (const rule of ncaaRules) {
    await prisma.nCAARule.upsert({
      where: { bylawNumber: rule.bylawNumber },
      update: {},
      create: rule,
    });
  }

  console.log(`Seeded ${ncaaRules.length} NCAA Bylaw 14.5 rules.`);

  // Seed Subject Area Taxonomy (already in schema as enum, just display info)
  console.log("Subject area taxonomy available in schema (SubjectArea enum):");
  console.log("- ENGLISH, MATH, NATURAL_SCIENCE, SOCIAL_SCIENCE, HUMANITIES");
  console.log(
    "- FINE_ARTS, PHYSICAL_EDUCATION, FOREIGN_LANGUAGE, COMPOSITION, SPEECH",
  );
  console.log(
    "- PHILOSOPHY, PSYCHOLOGY, SOCIOLOGY, POLITICAL_SCIENCE, ECONOMICS",
  );
  console.log("- HISTORY, GEOGRAPHY, COMPUTER_SCIENCE, INFORMATION_TECHNOLOGY");
  console.log("- BUSINESS, ACCOUNTING, MARKETING, MANAGEMENT, FINANCE");

  // Seed Users and Student Profiles
  console.log("\nSeeding users and student profiles...");
  const students = [
    {
      clerkId: "student_001",
      email: "john.smith@university.edu",
      firstName: "John",
      lastName: "Smith",
      role: "STUDENT" as Role,
      studentId: "STU001",
      sport: "Football",
      year: 2,
      gpa: 3.25,
      credits: 42,
      eligibility: true,
    },
    {
      clerkId: "student_002",
      email: "emily.johnson@university.edu",
      firstName: "Emily",
      lastName: "Johnson",
      role: "STUDENT" as Role,
      studentId: "STU002",
      sport: "Basketball",
      year: 3,
      gpa: 3.75,
      credits: 78,
      eligibility: true,
    },
    {
      clerkId: "student_003",
      email: "michael.williams@university.edu",
      firstName: "Michael",
      lastName: "Williams",
      role: "STUDENT" as Role,
      studentId: "STU003",
      sport: "Soccer",
      year: 4,
      gpa: 3.45,
      credits: 102,
      eligibility: true,
    },
    {
      clerkId: "student_004",
      email: "sarah.brown@university.edu",
      firstName: "Sarah",
      lastName: "Brown",
      role: "STUDENT" as Role,
      studentId: "STU004",
      sport: "Volleyball",
      year: 1,
      gpa: 2.85,
      credits: 15,
      eligibility: true,
    },
    {
      clerkId: "student_005",
      email: "david.jones@university.edu",
      firstName: "David",
      lastName: "Jones",
      role: "STUDENT" as Role,
      studentId: "STU005",
      sport: "Swimming",
      year: 2,
      gpa: 3.9,
      credits: 54,
      eligibility: true,
    },
  ];

  const createdStudents: any[] = [];
  for (const student of students) {
    const { studentId, sport, year, gpa, credits, eligibility, ...userData } =
      student;
    const user = await prisma.user.upsert({
      where: { clerkId: student.clerkId },
      update: {},
      create: userData,
    });

    const studentProfile = await prisma.studentProfile.upsert({
      where: { studentId: student.studentId },
      update: {},
      create: {
        studentId,
        sport,
        year,
        gpa,
        credits,
        eligibility,
        userId: user.id,
      },
    });
    createdStudents.push(studentProfile);
  }

  console.log(`Seeded ${students.length} students.`);

  // Seed Courses
  console.log("\nSeeding courses...");
  const courses = [
    {
      code: "ENG101",
      name: "Composition I",
      credits: 3,
      department: "English",
      semester: "FALL",
      year: 2024,
    },
    {
      code: "MAT201",
      name: "Calculus I",
      credits: 4,
      department: "Mathematics",
      semester: "FALL",
      year: 2024,
    },
    {
      code: "BIO101",
      name: "General Biology",
      credits: 4,
      department: "Biology",
      semester: "FALL",
      year: 2024,
    },
    {
      code: "HIS201",
      name: "US History",
      credits: 3,
      department: "History",
      semester: "FALL",
      year: 2024,
    },
    {
      code: "PSY101",
      name: "Introduction to Psychology",
      credits: 3,
      department: "Psychology",
      semester: "FALL",
      year: 2024,
    },
    {
      code: "ENG102",
      name: "Composition II",
      credits: 3,
      department: "English",
      semester: "SPRING",
      year: 2025,
    },
    {
      code: "MAT202",
      name: "Calculus II",
      credits: 4,
      department: "Mathematics",
      semester: "SPRING",
      year: 2025,
    },
    {
      code: "PHY201",
      name: "General Physics",
      credits: 4,
      department: "Physics",
      semester: "SPRING",
      year: 2025,
    },
  ];

  const createdCourses: any[] = [];
  for (const course of courses) {
    const createdCourse = await prisma.course.upsert({
      where: {
        code_semester_year: {
          code: course.code,
          semester: course.semester,
          year: course.year,
        },
      },
      update: {},
      create: course,
    });
    createdCourses.push(createdCourse);
  }

  console.log(`Seeded ${courses.length} courses.`);

  // Seed Course Enrollments
  console.log("\nSeeding course enrollments...");
  const enrollments = [
    {
      studentId: "STU001",
      courseCode: "ENG101",
      semester: "FALL",
      year: 2024,
      grade: "A",
      status: "COMPLETED" as EnrollmentStatus,
    },
    {
      studentId: "STU001",
      courseCode: "MAT201",
      semester: "FALL",
      year: 2024,
      grade: "B+",
      status: "COMPLETED" as EnrollmentStatus,
    },
    {
      studentId: "STU002",
      courseCode: "ENG101",
      semester: "FALL",
      year: 2024,
      grade: "A-",
      status: "COMPLETED" as EnrollmentStatus,
    },
    {
      studentId: "STU002",
      courseCode: "BIO101",
      semester: "FALL",
      year: 2024,
      grade: "A",
      status: "COMPLETED" as EnrollmentStatus,
    },
    {
      studentId: "STU003",
      courseCode: "HIS201",
      semester: "FALL",
      year: 2024,
      grade: "B",
      status: "COMPLETED" as EnrollmentStatus,
    },
    {
      studentId: "STU003",
      courseCode: "PSY101",
      semester: "FALL",
      year: 2024,
      grade: "A",
      status: "COMPLETED" as EnrollmentStatus,
    },
    {
      studentId: "STU004",
      courseCode: "ENG101",
      semester: "FALL",
      year: 2024,
      grade: null,
      status: "IN_PROGRESS" as EnrollmentStatus,
    },
    {
      studentId: "STU005",
      courseCode: "MAT201",
      semester: "FALL",
      year: 2024,
      grade: "A+",
      status: "COMPLETED" as EnrollmentStatus,
    },
  ];

  for (const enrollment of enrollments) {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { studentId: enrollment.studentId },
    });

    const course = await prisma.course.findUnique({
      where: {
        code_semester_year: {
          code: enrollment.courseCode,
          semester: enrollment.semester,
          year: enrollment.year,
        },
      },
    });

    if (studentProfile && course) {
      await prisma.courseEnrollment.upsert({
        where: {
          studentId_courseId: {
            studentId: studentProfile.id,
            courseId: course.id,
          },
        },
        update: {
          grade: enrollment.grade,
          status: enrollment.status,
        },
        create: {
          studentId: studentProfile.id,
          courseId: course.id,
          grade: enrollment.grade,
          status: enrollment.status,
        },
      });
    }
  }

  console.log(`Seeded ${enrollments.length} course enrollments.`);

  // Seed Compliance Records
  console.log("\nSeeding compliance records...");
  const complianceRecords = [
    {
      studentId: "STU001",
      category: "Academic Progress",
      requirement: "Minimum 6 credit hours per term",
      status: "COMPLETED" as ComplianceStatus,
      notes: "Student completed 15 credit hours in Fall 2024",
    },
    {
      studentId: "STU002",
      category: "GPA Requirement",
      requirement: "Minimum 2.0 GPA",
      status: "COMPLETED" as ComplianceStatus,
      notes: "Current GPA: 3.75",
    },
    {
      studentId: "STU003",
      category: "Residential Requirement",
      requirement: "One year in residence",
      status: "IN_PROGRESS" as ComplianceStatus,
      notes: "3rd year student, currently meeting requirements",
      dueDate: new Date("2025-05-15"),
    },
    {
      studentId: "STU004",
      category: "Initial Eligibility",
      requirement: "Transcript submission",
      status: "PENDING" as ComplianceStatus,
      notes: "Freshman transcript pending review",
      dueDate: new Date("2025-01-15"),
    },
    {
      studentId: "STU005",
      category: "Progress Toward Degree",
      requirement: "24 credit hours per year",
      status: "COMPLETED" as ComplianceStatus,
      notes: "Completed 30 credit hours in first year",
    },
  ];

  for (const record of complianceRecords) {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { studentId: record.studentId },
    });

    if (studentProfile) {
      const { studentId, ...recordData } = record;
      await prisma.complianceRecord.create({
        data: {
          ...recordData,
          studentId: studentProfile.id,
        },
      });
    }
  }

  console.log(`Seeded ${complianceRecords.length} compliance records.`);

  // Seed Transfer Requests
  console.log("\nSeeding transfer requests...");
  const transferRequests = [
    {
      studentId: "STU001",
      type: "INITIAL_TRANSFER" as TransferRequestType,
      status: "UNDER_REVIEW" as TransferRequestStatus,
      priority: "NORMAL" as TransferRequestPriority,
      requestedCredits: 12,
      academicYear: "2024-2025",
      term: "SPRING",
      sport: "Football",
      notes:
        "Transfer student from community college seeking credit evaluation",
      submissionDate: new Date("2024-12-10"),
    },
    {
      studentId: "STU003",
      type: "PROGRESS_TOWARD_DEGREE" as TransferRequestType,
      status: "PENDING_DOCUMENTATION" as TransferRequestStatus,
      priority: "HIGH" as TransferRequestPriority,
      requestedCredits: 6,
      academicYear: "2024-2025",
      term: "SPRING",
      sport: "Soccer",
      notes: "Transfer from another 4-year institution, missing transcript",
      submissionDate: new Date("2024-12-15"),
    },
    {
      studentId: "STU002",
      type: "ELIGIBILITY_CERTIFICATION" as TransferRequestType,
      status: "APPROVED" as TransferRequestStatus,
      priority: "NORMAL" as TransferRequestPriority,
      requestedCredits: 3,
      approvedCredits: 3,
      academicYear: "2024-2025",
      term: "FALL",
      sport: "Basketball",
      notes: "Summer course transfer approved",
      submissionDate: new Date("2024-08-01"),
      decisionDate: new Date("2024-08-15"),
      effectiveDate: new Date("2024-08-20"),
    },
  ];

  for (const request of transferRequests) {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { studentId: request.studentId },
    });

    if (studentProfile) {
      const { studentId, ...requestData } = request;
      await prisma.transferRequest.create({
        data: {
          ...requestData,
          studentId: studentProfile.id,
        },
      });
    }
  }

  console.log(`Seeded ${transferRequests.length} transfer requests.`);

  console.log("\nDatabase seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
