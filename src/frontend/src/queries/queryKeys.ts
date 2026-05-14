/**
 * Centralized query key factory.
 * All React Query keys live here to avoid duplication and enable precise invalidation.
 */
export const QUERY_KEYS = {
  // Students
  students: (adminId: string) => ["students", adminId] as const,
  student: (id: string) => ["student", id] as const,

  // Classes
  classes: (adminId: string) => ["classes", adminId] as const,

  // Sections
  sections: (classId: string) => ["sections", classId] as const,

  // Subjects
  subjects: (adminId: string) => ["subjects", adminId] as const,

  // Payments
  payments: (adminId: string) => ["payments", adminId] as const,
  studentPayments: (studentId: string) =>
    ["payments", "student", studentId] as const,

  // Notifications
  notifications: (adminId: string) => ["notifications", adminId] as const,

  // Profiles
  adminProfile: (profileId: string) => ["adminProfile", profileId] as const,
  profile: (id: string) => ["profile", id] as const,
} as const;
