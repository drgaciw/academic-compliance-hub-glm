export interface Institution {
  id: string;
  name: string;
  code: string;
  country: string;
  state?: string;
  creditSystem: string;
  isActive: boolean;
}

export interface CourseRecord {
  id: string;
  institutionId: string;
  code: string;
  name: string;
  description?: string;
  credits: number;
  subjectArea?: string;
  isActive: boolean;
}

export interface CourseMapping {
  id: string;
  sourceInstitutionId: string;
  sourceCourseId: string;
  sourceCourseCode: string;
  targetInstitutionId: string;
  targetCourseId: string;
  targetCourseCode: string;
  mappingType: MappingType;
  similarityScore?: number;
  confidence?: number;
  notes?: string;
  isActive: boolean;
  isManualOverride: boolean;
  overriddenBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MappingQuery {
  sourceInstitutionId?: string;
  targetInstitutionId?: string;
  sourceCourseCode?: string;
  targetCourseCode?: string;
  mappingType?: MappingType;
  isActive?: boolean;
  includeOverrides?: boolean;
}

export interface InstitutionLookupResult {
  institution: Institution;
  courses: CourseRecord[];
  mappings: CourseMapping[];
}

export interface CrossInstitutionQuery {
  courseCode?: string;
  courseName?: string;
  subjectArea?: string;
  credits?: number;
  similarityThreshold?: number;
  limit?: number;
}

export enum MappingType {
  EQUIVALENT = "EQUIVALENT",
  PARTIAL = "PARTIAL",
  ELECTIVE = "ELECTIVE",
  GENERAL = "GENERAL",
  NO_EQUIVALENCY = "NO_EQUIVALENCY",
}

const institutions: Map<string, Institution> = new Map();

const courseDatabase: Map<string, CourseRecord[]> = new Map();

const mappingDatabase: Map<string, CourseMapping[]> = new Map();

export function registerInstitution(institution: Institution): void {
  institutions.set(institution.id, institution);
  courseDatabase.set(institution.id, []);
  mappingDatabase.set(institution.id, []);
}

export function getInstitution(institutionId: string): Institution | undefined {
  return institutions.get(institutionId);
}

export function getAllInstitutions(): Institution[] {
  return Array.from(institutions.values());
}

export function registerCourse(
  institutionId: string,
  course: Omit<CourseRecord, "institutionId">,
): CourseRecord {
  const institution = institutions.get(institutionId);
  if (!institution) {
    throw new Error(`Institution not found: ${institutionId}`);
  }

  const fullCourse: CourseRecord = {
    ...course,
    institutionId,
  };

  const courses = courseDatabase.get(institutionId);
  if (!courses) {
    throw new Error(
      `Course database not found for institution: ${institutionId}`,
    );
  }

  courses.push(fullCourse);
  return fullCourse;
}

export function batchRegisterCourses(
  institutionId: string,
  courses: Array<Omit<CourseRecord, "institutionId">>,
): CourseRecord[] {
  return courses.map((course) => registerCourse(institutionId, course));
}

export function getCourse(
  institutionId: string,
  courseId: string,
): CourseRecord | undefined {
  const courses = courseDatabase.get(institutionId);
  if (!courses) {
    return undefined;
  }

  return courses.find((c) => c.id === courseId);
}

export function getCourseByCode(
  institutionId: string,
  courseCode: string,
): CourseRecord | undefined {
  const courses = courseDatabase.get(institutionId);
  if (!courses) {
    return undefined;
  }

  return courses.find((c) => c.code === courseCode);
}

export function getInstitutionCourses(
  institutionId: string,
  options: {
    subjectArea?: string;
    isActive?: boolean;
  } = {},
): CourseRecord[] {
  const courses = courseDatabase.get(institutionId);
  if (!courses) {
    return [];
  }

  let results = [...courses];

  if (options.subjectArea !== undefined) {
    results = results.filter((c) => c.subjectArea === options.subjectArea);
  }

  if (options.isActive !== undefined) {
    results = results.filter((c) => c.isActive === options.isActive);
  }

  return results;
}

export function searchCourses(
  institutionId: string,
  query: {
    codeContains?: string;
    nameContains?: string;
    subjectArea?: string;
    minCredits?: number;
    maxCredits?: number;
  } = {},
): CourseRecord[] {
  const courses = courseDatabase.get(institutionId);
  if (!courses) {
    return [];
  }

  let results = [...courses];

  if (query.codeContains) {
    const term = query.codeContains.toLowerCase();
    results = results.filter((c) => c.code.toLowerCase().includes(term));
  }

  if (query.nameContains) {
    const term = query.nameContains.toLowerCase();
    results = results.filter((c) => c.name.toLowerCase().includes(term));
  }

  if (query.subjectArea) {
    results = results.filter((c) => c.subjectArea === query.subjectArea);
  }

  if (query.minCredits !== undefined) {
    results = results.filter((c) => c.credits >= query.minCredits!);
  }

  if (query.maxCredits !== undefined) {
    results = results.filter((c) => c.credits <= query.maxCredits!);
  }

  return results;
}

export function createMapping(
  sourceInstitutionId: string,
  sourceCourseId: string,
  sourceCourseCode: string,
  targetInstitutionId: string,
  targetCourseId: string,
  targetCourseCode: string,
  mappingType: MappingType,
  options: {
    similarityScore?: number;
    confidence?: number;
    notes?: string;
    isManualOverride?: boolean;
  } = {},
): CourseMapping {
  const sourceInst = institutions.get(sourceInstitutionId);
  const targetInst = institutions.get(targetInstitutionId);

  if (!sourceInst) {
    throw new Error(`Source institution not found: ${sourceInstitutionId}`);
  }
  if (!targetInst) {
    throw new Error(`Target institution not found: ${targetInstitutionId}`);
  }

  const existingMapping = findMapping(
    sourceInstitutionId,
    sourceCourseId,
    targetInstitutionId,
    targetCourseId,
  );

  if (existingMapping) {
    throw new Error("Mapping already exists");
  }

  const mapping: CourseMapping = {
    id: generateId(),
    sourceInstitutionId,
    sourceCourseId,
    sourceCourseCode,
    targetInstitutionId,
    targetCourseId,
    targetCourseCode,
    mappingType,
    similarityScore: options.similarityScore,
    confidence: options.confidence,
    notes: options.notes,
    isActive: true,
    isManualOverride: options.isManualOverride ?? false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mappings = mappingDatabase.get(sourceInstitutionId);
  if (mappings) {
    mappings.push(mapping);
  }

  return mapping;
}

export function findMapping(
  sourceInstitutionId: string,
  sourceCourseId: string,
  targetInstitutionId: string,
  targetCourseId: string,
): CourseMapping | undefined {
  const mappings = mappingDatabase.get(sourceInstitutionId);
  if (!mappings) {
    return undefined;
  }

  return mappings.find(
    (m) =>
      m.sourceCourseId === sourceCourseId &&
      m.targetInstitutionId === targetInstitutionId &&
      m.targetCourseId === targetCourseId &&
      m.isActive,
  );
}

export function findMappings(query: MappingQuery): CourseMapping[] {
  const allMappings: CourseMapping[] = [];

  for (const [_, mappings] of mappingDatabase.entries()) {
    allMappings.push(...mappings);
  }

  let results = allMappings;

  if (query.sourceInstitutionId) {
    results = results.filter(
      (m) => m.sourceInstitutionId === query.sourceInstitutionId,
    );
  }

  if (query.targetInstitutionId) {
    results = results.filter(
      (m) => m.targetInstitutionId === query.targetInstitutionId,
    );
  }

  if (query.sourceCourseCode) {
    const term = query.sourceCourseCode.toLowerCase();
    results = results.filter((m) =>
      m.sourceCourseCode.toLowerCase().includes(term),
    );
  }

  if (query.targetCourseCode) {
    const term = query.targetCourseCode.toLowerCase();
    results = results.filter((m) =>
      m.targetCourseCode.toLowerCase().includes(term),
    );
  }

  if (query.mappingType) {
    results = results.filter((m) => m.mappingType === query.mappingType);
  }

  if (query.isActive !== undefined) {
    results = results.filter((m) => m.isActive === query.isActive);
  }

  if (query.includeOverrides === false) {
    results = results.filter((m) => !m.isManualOverride);
  }

  return results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export function getMappingsForCourse(
  institutionId: string,
  courseId: string,
  direction: "source" | "target" | "both" = "both",
): CourseMapping[] {
  const query: MappingQuery = {
    isActive: true,
  };

  if (direction === "source" || direction === "both") {
    query.sourceInstitutionId = institutionId;
  }

  if (direction === "target" || direction === "both") {
    query.targetInstitutionId = institutionId;
  }

  const allMappings = findMappings(query);

  return allMappings.filter(
    (m) => m.sourceCourseId === courseId || m.targetCourseId === courseId,
  );
}

export function overrideMapping(
  mappingId: string,
  overrideOptions: {
    mappingType?: MappingType;
    notes?: string;
    similarityScore?: number;
    confidence?: number;
  },
): CourseMapping {
  for (const [_, mappings] of mappingDatabase.entries()) {
    const mappingIndex = mappings.findIndex((m) => m.id === mappingId);

    if (mappingIndex !== -1) {
      const existing = mappings[mappingIndex];

      existing.isActive = false;
      existing.overriddenBy = mappingId + "_override";

      const override: CourseMapping = {
        ...existing,
        id: existing.overriddenBy,
        mappingType: overrideOptions.mappingType ?? existing.mappingType,
        notes: overrideOptions.notes ?? existing.notes,
        similarityScore:
          overrideOptions.similarityScore ?? existing.similarityScore,
        confidence: overrideOptions.confidence ?? existing.confidence,
        isManualOverride: true,
        updatedAt: new Date(),
      };

      mappings.push(override);

      return override;
    }
  }

  throw new Error(`Mapping not found: ${mappingId}`);
}

export function deactivateMapping(mappingId: string): void {
  for (const [_, mappings] of mappingDatabase.entries()) {
    const mapping = mappings.find((m) => m.id === mappingId);

    if (mapping) {
      mapping.isActive = false;
      mapping.updatedAt = new Date();
      return;
    }
  }

  throw new Error(`Mapping not found: ${mappingId}`);
}

export function getInstitutionLookup(
  institutionId: string,
): InstitutionLookupResult {
  const institution = institutions.get(institutionId);

  if (!institution) {
    throw new Error(`Institution not found: ${institutionId}`);
  }

  const courses = courseDatabase.get(institutionId) ?? [];

  const sourceMappings = findMappings({
    sourceInstitutionId: institutionId,
    isActive: true,
  });

  const targetMappings = findMappings({
    targetInstitutionId: institutionId,
    isActive: true,
  });

  const allMappings = [...sourceMappings, ...targetMappings];

  return {
    institution,
    courses,
    mappings: allMappings,
  };
}

export function queryCrossInstitution(query: CrossInstitutionQuery): Array<{
  institution: Institution;
  courses: CourseRecord[];
}> {
  const results: Array<{
    institution: Institution;
    courses: CourseRecord[];
  }> = [];

  for (const [institutionId, institution] of institutions.entries()) {
    if (!institution.isActive) {
      continue;
    }

    const courses = courseDatabase.get(institutionId) ?? [];
    let filteredCourses = [...courses];

    if (query.courseCode) {
      const term = query.courseCode.toLowerCase();
      filteredCourses = filteredCourses.filter((c) =>
        c.code.toLowerCase().includes(term),
      );
    }

    if (query.courseName) {
      const term = query.courseName.toLowerCase();
      filteredCourses = filteredCourses.filter((c) =>
        c.name.toLowerCase().includes(term),
      );
    }

    if (query.subjectArea) {
      filteredCourses = filteredCourses.filter(
        (c) => c.subjectArea === query.subjectArea,
      );
    }

    if (query.credits !== undefined) {
      filteredCourses = filteredCourses.filter(
        (c) => Math.abs(c.credits - query.credits!) <= 1,
      );
    }

    if (query.limit && filteredCourses.length > query.limit) {
      filteredCourses = filteredCourses.slice(0, query.limit);
    }

    if (filteredCourses.length > 0) {
      results.push({
        institution,
        courses: filteredCourses,
      });
    }
  }

  return results;
}

export function getAllManualOverrides(): CourseMapping[] {
  const allMappings: CourseMapping[] = [];

  for (const [_, mappings] of mappingDatabase.entries()) {
    allMappings.push(
      ...mappings.filter((m) => m.isManualOverride && m.isActive),
    );
  }

  return allMappings.sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );
}

export function getOverrideHistory(
  courseId: string,
): Array<{ mapping: CourseMapping; overridden?: CourseMapping }> {
  const allMappings: CourseMapping[] = [];

  for (const [_, mappings] of mappingDatabase.entries()) {
    allMappings.push(...mappings);
  }

  const courseMappings = allMappings.filter(
    (m) => m.sourceCourseId === courseId || m.targetCourseId === courseId,
  );

  const history: Array<{
    mapping: CourseMapping;
    overridden?: CourseMapping;
  }> = [];

  for (const mapping of courseMappings) {
    if (mapping.overriddenBy) {
      const override = courseMappings.find(
        (m) => m.id === mapping.overriddenBy,
      );
      if (override) {
        history.push({ mapping, overridden: override });
      }
    } else if (!mapping.isManualOverride) {
      history.push({ mapping });
    }
  }

  return history;
}

export function getStatistics(): {
  totalInstitutions: number;
  activeInstitutions: number;
  totalCourses: number;
  totalMappings: number;
  manualOverrides: number;
  mappingsByType: Record<MappingType, number>;
} {
  let totalCourses = 0;
  let totalMappings = 0;
  let manualOverrides = 0;
  const mappingsByType: Record<MappingType, number> = {
    [MappingType.EQUIVALENT]: 0,
    [MappingType.PARTIAL]: 0,
    [MappingType.ELECTIVE]: 0,
    [MappingType.GENERAL]: 0,
    [MappingType.NO_EQUIVALENCY]: 0,
  };

  for (const [_, institution] of institutions.entries()) {
    const courses = courseDatabase.get(institution.id);
    if (courses) {
      totalCourses += courses.length;
    }

    const mappings = mappingDatabase.get(institution.id);
    if (mappings) {
      const activeMappings = mappings.filter((m) => m.isActive);
      totalMappings += activeMappings.length;
      manualOverrides += activeMappings.filter(
        (m) => m.isManualOverride,
      ).length;

      for (const mapping of activeMappings) {
        mappingsByType[mapping.mappingType]++;
      }
    }
  }

  const activeInstitutions = Array.from(institutions.values()).filter(
    (i) => i.isActive,
  ).length;

  return {
    totalInstitutions: institutions.size,
    activeInstitutions,
    totalCourses,
    totalMappings,
    manualOverrides,
    mappingsByType,
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function clearAllData(): void {
  institutions.clear();
  courseDatabase.clear();
  mappingDatabase.clear();
}
