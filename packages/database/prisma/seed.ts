import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Seed Institutions
  console.log("Seeding institutions...");
  const institutions = [
    {
      name: "University of Southern California",
      code: "USC",
      type: "UNIVERSITY",
      ncaaDivision: "DIVISION_I",
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
      type: "UNIVERSITY",
      ncaaDivision: "DIVISION_I",
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
      type: "UNIVERSITY",
      ncaaDivision: "DIVISION_I",
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
      type: "UNIVERSITY",
      ncaaDivision: "DIVISION_I",
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
      type: "UNIVERSITY",
      ncaaDivision: "DIVISION_I",
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
      type: "UNIVERSITY",
      ncaaDivision: "DIVISION_I",
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
      type: "UNIVERSITY",
      ncaaDivision: "DIVISION_I",
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
      type: "UNIVERSITY",
      ncaaDivision: "DIVISION_I",
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
      type: "UNIVERSITY",
      ncaaDivision: "DIVISION_I",
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
      type: "UNIVERSITY",
      ncaaDivision: "DIVISION_I",
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
      type: "UNIVERSITY",
      ncaaDivision: "DIVISION_I",
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
      type: "COMMUNITY_COLLEGE",
      ncaaDivision: "NJCAA",
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
      type: "COMMUNITY_COLLEGE",
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
      division: "DIVISION_I",
      category: "Transfer Credit",
      subCategory: "General",
      agentType: "EVALUATION_AGENT",
      isActive: true,
    },
    {
      bylawNumber: "14.5.2",
      title: "Course Work Requirements",
      description:
        "The transfer student must satisfactorily complete a minimum of six semester hours or eight quarter hours of academic credit during each term of full-time attendance to meet satisfactory-progress requirements.",
      division: "DIVISION_I",
      category: "Transfer Credit",
      subCategory: "Course Work",
      agentType: "EVALUATION_AGENT",
      isActive: true,
    },
    {
      bylawNumber: "14.5.3",
      title: "Grade-Point Average",
      description:
        "For purposes of determining eligibility, the grade-point average of a transfer student shall be computed only on academic credit completed at the certifying institution.",
      division: "DIVISION_I",
      category: "Transfer Credit",
      subCategory: "GPA",
      agentType: "EVALUATION_AGENT",
      isActive: true,
    },
    {
      bylawNumber: "14.5.4",
      title: "Residential Requirement",
      description:
        "To be eligible for competition, a transfer student must have been in residence at the certifying institution for a minimum of one full academic year.",
      division: "DIVISION_I",
      category: "Transfer Credit",
      subCategory: "Residency",
      agentType: "COMPLIANCE_AGENT",
      isActive: true,
    },
    {
      bylawNumber: "14.5.5",
      title: "Two-Year College Transfers",
      description:
        "A student who has graduated from a two-year college and transfers to a four-year institution must satisfy all eligibility requirements for participation at the four-year institution.",
      division: "DIVISION_I",
      category: "Transfer Credit",
      subCategory: "Two-Year College",
      agentType: "EVALUATION_AGENT",
      isActive: true,
    },
    {
      bylawNumber: "14.5.6",
      title: "Four-Year College Transfers",
      description:
        "A student-athlete who transfers from a four-year institution shall be ineligible for competition for one full academic year unless the student meets an exception to the transfer rules.",
      division: "DIVISION_I",
      category: "Transfer Credit",
      subCategory: "Four-Year College",
      agentType: "COMPLIANCE_AGENT",
      isActive: true,
    },
    {
      bylawNumber: "14.5.7",
      title: "Academic Exceptions",
      description:
        "A transfer student may be eligible immediately if the student has earned a baccalaureate degree or is transferring as a graduate student.",
      division: "DIVISION_I",
      category: "Transfer Credit",
      subCategory: "Exceptions",
      agentType: "COMPLIANCE_AGENT",
      isActive: true,
    },
    {
      bylawNumber: "14.5.8",
      title: "Nondegree Credit",
      description:
        "Credit earned at nondegree-granting institutions generally may not be used to satisfy eligibility requirements.",
      division: "DIVISION_I",
      category: "Transfer Credit",
      subCategory: "Nondegree Credit",
      agentType: "EVALUATION_AGENT",
      isActive: true,
    },
    {
      bylawNumber: "14.5.9",
      title: "International Transfer",
      description:
        "International transfer credit must be evaluated on a course-by-course basis to determine equivalency with domestic course work.",
      division: "DIVISION_I",
      category: "Transfer Credit",
      subCategory: "International",
      agentType: "EVALUATION_AGENT",
      isActive: true,
    },
    {
      bylawNumber: "14.5.10",
      title: "Credit Conversion",
      description:
        "Credit from institutions on a different calendar system must be converted to the semester or quarter system of the certifying institution.",
      division: "DIVISION_I",
      category: "Transfer Credit",
      subCategory: "Conversion",
      agentType: "EVALUATION_AGENT",
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
