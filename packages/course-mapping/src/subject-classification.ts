export enum NCAASubjectArea {
  ENGLISH = "ENGLISH",
  MATH = "MATH",
  NATURAL_SCIENCE = "NATURAL_SCIENCE",
  PHYSICAL_SCIENCE = "PHYSICAL_SCIENCE",
  SOCIAL_SCIENCE = "SOCIAL_SCIENCE",
  HUMANITIES = "HUMANITIES",
  FINE_ARTS = "FINE_ARTS",
  FOREIGN_LANGUAGE = "FOREIGN_LANGUAGE",
  PHILOSOPHY = "PHILOSOPHY",
  RELIGION = "RELIGION",
  HISTORY = "HISTORY",
  BUSINESS = "BUSINESS",
  EDUCATION = "EDUCATION",
  HEALTH_PHYSICAL_EDUCATION = "HEALTH_PHYSICAL_EDUCATION",
  UNCLASSIFIED = "UNCLASSIFIED",
}

export interface SubjectClassificationResult {
  subjectArea: NCAASubjectArea;
  confidence: number;
  keywords?: string[];
  departmentMatch?: boolean;
  flagged: boolean;
  notes?: string;
}

export interface DepartmentMapping {
  codes: string[];
  subjectArea: NCAASubjectArea;
  priority: number;
}

const DEPARTMENT_MAPPINGS: DepartmentMapping[] = [
  {
    codes: ["ENG", "ENGL", "EN", "WRIT", "COMP", "LIT"],
    subjectArea: NCAASubjectArea.ENGLISH,
    priority: 10,
  },
  {
    codes: ["MATH", "MAT", "CALC", "STAT"],
    subjectArea: NCAASubjectArea.MATH,
    priority: 10,
  },
  {
    codes: ["BIOL", "CHEM", "PHYS", "GEO", "ASTR", "MICR", "BOT", "ZOO", "BIO"],
    subjectArea: NCAASubjectArea.NATURAL_SCIENCE,
    priority: 10,
  },
  {
    codes: ["GEOL", "OCEA", "ENV", "MET", "SCI", "NSCI"],
    subjectArea: NCAASubjectArea.PHYSICAL_SCIENCE,
    priority: 10,
  },
  {
    codes: ["PSY", "SOC", "ANTH", "ECON", "POLI", "POLS", "GOVT", "GEOG"],
    subjectArea: NCAASubjectArea.SOCIAL_SCIENCE,
    priority: 9,
  },
  {
    codes: ["HIST", "HIS"],
    subjectArea: NCAASubjectArea.HISTORY,
    priority: 9,
  },
  {
    codes: ["ART", "MUS", "THEA", "DANC", "FA"],
    subjectArea: NCAASubjectArea.FINE_ARTS,
    priority: 8,
  },
  {
    codes: ["PHIL", "PHI"],
    subjectArea: NCAASubjectArea.PHILOSOPHY,
    priority: 8,
  },
  {
    codes: ["REL", "RELG", "THEO"],
    subjectArea: NCAASubjectArea.RELIGION,
    priority: 8,
  },
  {
    codes: [
      "SPAN",
      "FREN",
      "GERM",
      "ITAL",
      "CHIN",
      "JAPN",
      "KOR",
      "RUS",
      "ARAB",
    ],
    subjectArea: NCAASubjectArea.FOREIGN_LANGUAGE,
    priority: 9,
  },
  {
    codes: ["BUS", "MGMT", "MKTG", "ACC", "FIN", "MIS", "BA"],
    subjectArea: NCAASubjectArea.BUSINESS,
    priority: 7,
  },
  {
    codes: ["EDU", "ED", "TEACH"],
    subjectArea: NCAASubjectArea.EDUCATION,
    priority: 7,
  },
  {
    codes: ["PE", "KIN", "HEAL", "HPER"],
    subjectArea: NCAASubjectArea.HEALTH_PHYSICAL_EDUCATION,
    priority: 6,
  },
];

const KEYWORD_MAPPINGS: Record<NCAASubjectArea, string[]> = {
  [NCAASubjectArea.ENGLISH]: [
    "writing",
    "composition",
    "literature",
    "rhetoric",
    "grammar",
    "essay",
    "creative writing",
    "technical writing",
    "english",
    "poetry",
    "fiction",
    "drama",
  ],
  [NCAASubjectArea.MATH]: [
    "mathematics",
    "algebra",
    "calculus",
    "statistics",
    "geometry",
    "trigonometry",
    "probability",
    "discrete",
    "linear algebra",
    "differential equations",
  ],
  [NCAASubjectArea.NATURAL_SCIENCE]: [
    "biology",
    "chemistry",
    "physics",
    "organic chemistry",
    "biochemistry",
    "microbiology",
    "botany",
    "zoology",
    "genetics",
    "ecology",
    "anatomy",
    "physiology",
  ],
  [NCAASubjectArea.PHYSICAL_SCIENCE]: [
    "geology",
    "oceanography",
    "meteorology",
    "astronomy",
    "earth science",
    "environmental science",
    "climate",
    "atmospheric",
    "seismology",
    "mineralogy",
  ],
  [NCAASubjectArea.SOCIAL_SCIENCE]: [
    "psychology",
    "sociology",
    "anthropology",
    "economics",
    "political science",
    "geography",
    "social",
    "behavioral",
    "cultural",
  ],
  [NCAASubjectArea.HUMANITIES]: [
    "humanities",
    "classics",
    "civilization",
    "ethics",
    "aesthetics",
    "cultural studies",
  ],
  [NCAASubjectArea.FINE_ARTS]: [
    "art",
    "music",
    "theater",
    "dance",
    "design",
    "studio",
    "performance",
    "visual arts",
    "music theory",
  ],
  [NCAASubjectArea.FOREIGN_LANGUAGE]: [
    "spanish",
    "french",
    "german",
    "italian",
    "chinese",
    "japanese",
    "korean",
    "russian",
    "arabic",
    "language",
    "linguistics",
  ],
  [NCAASubjectArea.PHILOSOPHY]: [
    "philosophy",
    "logic",
    "ethics",
    "metaphysics",
    "epistemology",
    "existentialism",
    "critical thinking",
  ],
  [NCAASubjectArea.RELIGION]: [
    "religion",
    "theology",
    "religious studies",
    "biblical",
    "scripture",
    "faith",
    "world religions",
  ],
  [NCAASubjectArea.HISTORY]: [
    "history",
    "historical",
    "world history",
    "american history",
    "european history",
    "ancient history",
    "medieval",
  ],
  [NCAASubjectArea.BUSINESS]: [
    "business",
    "management",
    "marketing",
    "accounting",
    "finance",
    "entrepreneurship",
    "organizational behavior",
  ],
  [NCAASubjectArea.EDUCATION]: [
    "education",
    "teaching",
    "pedagogy",
    "curriculum",
    "instruction",
    "educational psychology",
  ],
  [NCAASubjectArea.HEALTH_PHYSICAL_EDUCATION]: [
    "physical education",
    "health",
    "wellness",
    "fitness",
    "athletics",
    "sports",
    "kinesiology",
  ],
  [NCAASubjectArea.UNCLASSIFIED]: [],
};

const HIGH_CONFIDENCE_THRESHOLD = 0.85;
const FLAGGED_THRESHOLD = 0.5;

export function classifyCourse(
  courseCode: string,
  courseName: string,
  description?: string,
): SubjectClassificationResult {
  const codeResult = classifyByDepartmentCode(courseCode);

  const nameResult = classifyByKeywords(courseName);

  const combinedScore = {
    [NCAASubjectArea.ENGLISH]: 0,
    [NCAASubjectArea.MATH]: 0,
    [NCAASubjectArea.NATURAL_SCIENCE]: 0,
    [NCAASubjectArea.PHYSICAL_SCIENCE]: 0,
    [NCAASubjectArea.SOCIAL_SCIENCE]: 0,
    [NCAASubjectArea.HUMANITIES]: 0,
    [NCAASubjectArea.FINE_ARTS]: 0,
    [NCAASubjectArea.FOREIGN_LANGUAGE]: 0,
    [NCAASubjectArea.PHILOSOPHY]: 0,
    [NCAASubjectArea.RELIGION]: 0,
    [NCAASubjectArea.HISTORY]: 0,
    [NCAASubjectArea.BUSINESS]: 0,
    [NCAASubjectArea.EDUCATION]: 0,
    [NCAASubjectArea.HEALTH_PHYSICAL_EDUCATION]: 0,
    [NCAASubjectArea.UNCLASSIFIED]: 0,
  };

  if (codeResult.subjectArea !== NCAASubjectArea.UNCLASSIFIED) {
    combinedScore[codeResult.subjectArea] += codeResult.confidence * 0.6;
  }

  if (nameResult.subjectArea !== NCAASubjectArea.UNCLASSIFIED) {
    combinedScore[nameResult.subjectArea] += nameResult.confidence * 0.4;
  }

  const highestScore = Object.entries(combinedScore).reduce(
    (highest, [subject, score]) => {
      return score > highest.score
        ? { subject: subject as NCAASubjectArea, score }
        : highest;
    },
    { subject: NCAASubjectArea.UNCLASSIFIED, score: 0 },
  );

  const foundKeywords = findKeywords(courseName);

  const isFlagged = highestScore.score < FLAGGED_THRESHOLD;
  const notes = isFlagged
    ? "Course classification uncertain - may require manual review"
    : undefined;

  return {
    subjectArea: highestScore.subject,
    confidence: Math.min(1, highestScore.score),
    keywords: foundKeywords.length > 0 ? foundKeywords : undefined,
    departmentMatch: codeResult.subjectArea !== NCAASubjectArea.UNCLASSIFIED,
    flagged: isFlagged,
    notes,
  };
}

export function classifyByDepartmentCode(
  code: string,
): SubjectClassificationResult {
  if (!code) {
    return {
      subjectArea: NCAASubjectArea.UNCLASSIFIED,
      confidence: 0,
      flagged: true,
      notes: "No course code provided",
    };
  }

  const prefix = code.split(/\s|[-_]/)[0].toUpperCase();

  const mapping = DEPARTMENT_MAPPINGS.find((m) => m.codes.includes(prefix));

  if (!mapping) {
    return {
      subjectArea: NCAASubjectArea.UNCLASSIFIED,
      confidence: 0,
      flagged: true,
      notes: `No department mapping found for code: ${prefix}`,
    };
  }

  return {
    subjectArea: mapping.subjectArea,
    confidence: Math.min(1, mapping.priority / 10),
    departmentMatch: true,
    flagged: false,
  };
}

export function classifyByKeywords(text: string): SubjectClassificationResult {
  if (!text) {
    return {
      subjectArea: NCAASubjectArea.UNCLASSIFIED,
      confidence: 0,
      flagged: true,
      notes: "No text provided for keyword analysis",
    };
  }

  const lowerText = text.toLowerCase();

  const scores: Record<NCAASubjectArea, number> = {} as Record<
    NCAASubjectArea,
    number
  >;

  for (const [subjectArea, keywords] of Object.entries(KEYWORD_MAPPINGS)) {
    const score = calculateKeywordScore(lowerText, keywords);
    scores[subjectArea as NCAASubjectArea] = score;
  }

  const highestScore = Object.entries(scores).reduce(
    (highest, [subject, score]) => {
      return score > highest.score
        ? { subject: subject as NCAASubjectArea, score }
        : highest;
    },
    { subject: NCAASubjectArea.UNCLASSIFIED, score: 0 },
  );

  const foundKeywords = findKeywords(text);
  const isHighConfidence = highestScore.score >= HIGH_CONFIDENCE_THRESHOLD;

  return {
    subjectArea: highestScore.subject,
    confidence: highestScore.score,
    keywords: foundKeywords.length > 0 ? foundKeywords : undefined,
    departmentMatch: false,
    flagged: !isHighConfidence && highestScore.score < FLAGGED_THRESHOLD,
    notes:
      !isHighConfidence && highestScore.score >= FLAGGED_THRESHOLD
        ? "Medium confidence - may need verification"
        : undefined,
  };
}

export function findKeywords(text: string): string[] {
  if (!text) {
    return [];
  }

  const lowerText = text.toLowerCase();
  const found: string[] = [];

  for (const keywords of Object.values(KEYWORD_MAPPINGS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword) && !found.includes(keyword)) {
        found.push(keyword);
      }
    }
  }

  return found;
}

function calculateKeywordScore(text: string, keywords: string[]): number {
  let matches = 0;
  let totalWeight = 0;

  for (const keyword of keywords) {
    totalWeight += keyword.split(" ").length;

    if (text.includes(keyword)) {
      matches += keyword.split(" ").length;
    }
  }

  if (totalWeight === 0) {
    return 0;
  }

  return matches / totalWeight;
}

export function batchClassifyCourses(
  courses: Array<{ code: string; name: string; description?: string }>,
): SubjectClassificationResult[] {
  return courses.map((course) =>
    classifyCourse(course.code, course.name, course.description),
  );
}

export function getFlaggedCourses(
  classifications: SubjectClassificationResult[],
): Array<{ index: number; result: SubjectClassificationResult }> {
  return classifications
    .map((result, index) => ({ index, result }))
    .filter(({ result }) => result.flagged);
}

export function getDepartmentMappings(): DepartmentMapping[] {
  return [...DEPARTMENT_MAPPINGS];
}

export function addDepartmentMapping(mapping: DepartmentMapping): void {
  DEPARTMENT_MAPPINGS.push(mapping);
}

export function getKeywordMappings(): Record<NCAASubjectArea, string[]> {
  return { ...KEYWORD_MAPPINGS };
}

export function validateSubjectArea(subjectArea: string): {
  valid: boolean;
  normalized?: NCAASubjectArea;
} {
  const normalized = subjectArea.toUpperCase().trim();
  const validAreas = Object.values(NCAASubjectArea);

  if (validAreas.includes(normalized as NCAASubjectArea)) {
    return {
      valid: true,
      normalized: normalized as NCAASubjectArea,
    };
  }

  return { valid: false };
}

export function getSubjectAreaDescription(
  subjectArea: NCAASubjectArea,
): string {
  const descriptions: Record<NCAASubjectArea, string> = {
    [NCAASubjectArea.ENGLISH]: "English composition, literature, and writing",
    [NCAASubjectArea.MATH]:
      "Mathematics, statistics, and quantitative reasoning",
    [NCAASubjectArea.NATURAL_SCIENCE]:
      "Biological sciences including biology, chemistry, and physics",
    [NCAASubjectArea.PHYSICAL_SCIENCE]:
      "Earth and physical sciences including geology and astronomy",
    [NCAASubjectArea.SOCIAL_SCIENCE]:
      "Social sciences including psychology, sociology, and economics",
    [NCAASubjectArea.HUMANITIES]:
      "Humanities including classics and cultural studies",
    [NCAASubjectArea.FINE_ARTS]:
      "Fine arts including visual arts, music, and theater",
    [NCAASubjectArea.FOREIGN_LANGUAGE]: "Foreign languages and linguistics",
    [NCAASubjectArea.PHILOSOPHY]: "Philosophy and logic",
    [NCAASubjectArea.RELIGION]: "Religious studies and theology",
    [NCAASubjectArea.HISTORY]: "Historical studies",
    [NCAASubjectArea.BUSINESS]: "Business, management, and related fields",
    [NCAASubjectArea.EDUCATION]: "Education and teaching",
    [NCAASubjectArea.HEALTH_PHYSICAL_EDUCATION]:
      "Health and physical education",
    [NCAASubjectArea.UNCLASSIFIED]: "Unable to classify subject area",
  };

  return descriptions[subjectArea];
}
