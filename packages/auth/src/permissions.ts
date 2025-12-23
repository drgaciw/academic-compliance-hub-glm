export enum Role {
  STUDENT = "STUDENT",
  ADVISOR = "ADVISOR",
  ADMIN = "ADMIN",
  COMPLIANCE_OFFICER = "COMPLIANCE_OFFICER",
}

export enum Permission {
  STUDENT_VIEW_PROFILE = "student:view_profile",
  STUDENT_EDIT_PROFILE = "student:edit_profile",
  STUDENT_VIEW_TRANSCRIPTS = "student:view_transcripts",
  STUDENT_VIEW_COMPLIANCE = "student:view_compliance",
  STUDENT_VIEW_ACADEMICS = "student:view_academics",

  ADVISOR_VIEW_STUDENTS = "advisor:view_students",
  ADVISOR_EDIT_STUDENT_PROFILES = "advisor:edit_student_profiles",
  ADVISOR_VIEW_COMPLIANCE = "advisor:view_compliance",
  ADVISOR_UPDATE_COMPLIANCE = "advisor:update_compliance",
  ADVISOR_SCHEDULE_TUTORING = "advisor:schedule_tutoring",

  COMPLIANCE_VIEW_ALL = "compliance:view_all",
  COMPLIANCE_EDIT_RULES = "compliance:edit_rules",
  COMPLIANCE_MANAGE_INSTITUTIONS = "compliance:manage_institutions",
  COMPLIANCE_APPROVE_TRANSFERS = "compliance:approve_transfers",
  COMPLIANCE_AUDIT_LOGS = "compliance:audit_logs",
  COMPLIANCE_EXPORT_REPORTS = "compliance:export_reports",
  COMPLIANCE_MANAGE_EXEMPTIONS = "compliance:manage_exemptions",

  ADMIN_MANAGE_USERS = "admin:manage_users",
  ADMIN_MANAGE_ROLES = "admin:manage_roles",
  ADMIN_VIEW_ALL_DATA = "admin:view_all_data",
  ADMIN_SYSTEM_CONFIG = "admin:system_config",
  ADMIN_VIEW_ANALYTICS = "admin:view_analytics",
  ADMIN_EXPORT_DATA = "admin:export_data",
  ADMIN_MANAGE_INTEGRATIONS = "admin:manage_integrations",
}

const STUDENT_PERMISSIONS: Permission[] = [
  Permission.STUDENT_VIEW_PROFILE,
  Permission.STUDENT_EDIT_PROFILE,
  Permission.STUDENT_VIEW_TRANSCRIPTS,
  Permission.STUDENT_VIEW_COMPLIANCE,
  Permission.STUDENT_VIEW_ACADEMICS,
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.STUDENT]: STUDENT_PERMISSIONS,

  [Role.ADVISOR]: [
    Permission.ADVISOR_VIEW_STUDENTS,
    Permission.ADVISOR_EDIT_STUDENT_PROFILES,
    Permission.ADVISOR_VIEW_COMPLIANCE,
    Permission.ADVISOR_UPDATE_COMPLIANCE,
    Permission.ADVISOR_SCHEDULE_TUTORING,
    ...STUDENT_PERMISSIONS,
  ],

  [Role.COMPLIANCE_OFFICER]: [
    Permission.COMPLIANCE_VIEW_ALL,
    Permission.COMPLIANCE_EDIT_RULES,
    Permission.COMPLIANCE_MANAGE_INSTITUTIONS,
    Permission.COMPLIANCE_APPROVE_TRANSFERS,
    Permission.COMPLIANCE_AUDIT_LOGS,
    Permission.COMPLIANCE_EXPORT_REPORTS,
    Permission.COMPLIANCE_MANAGE_EXEMPTIONS,
  ],

  [Role.ADMIN]: [
    Permission.ADMIN_MANAGE_USERS,
    Permission.ADMIN_MANAGE_ROLES,
    Permission.ADMIN_VIEW_ALL_DATA,
    Permission.ADMIN_SYSTEM_CONFIG,
    Permission.ADMIN_VIEW_ANALYTICS,
    Permission.ADMIN_EXPORT_DATA,
    Permission.ADMIN_MANAGE_INTEGRATIONS,
  ],
};

export function hasPermission(userRole: Role, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions.includes(permission);
}

export function hasAnyPermission(
  userRole: Role,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}

export function hasAllPermissions(
  userRole: Role,
  permissions: Permission[],
): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}

export function canAccessRoute(userRole: Role, route: string): boolean {
  const studentRoutes = ["/student", "/profile", "/transcripts"];
  const advisorRoutes = ["/advisor", "/students"];
  const complianceRoutes = [
    "/compliance",
    "/transfers",
    "/institutions",
    "/rules",
  ];

  if (userRole === Role.STUDENT) {
    return studentRoutes.some((r) => route.startsWith(r));
  }

  if (userRole === Role.ADVISOR) {
    return [...studentRoutes, ...advisorRoutes].some((r) =>
      route.startsWith(r),
    );
  }

  if (userRole === Role.COMPLIANCE_OFFICER) {
    return complianceRoutes.some((r) => route.startsWith(r));
  }

  if (userRole === Role.ADMIN) {
    return true;
  }

  return false;
}
