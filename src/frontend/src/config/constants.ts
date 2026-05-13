// Auth-related localStorage key (only used to persist Google OAuth intended role)
export const AUTH_ROLE_KEY = "auth_intended_role";

export const ITEMS_PER_PAGE = 10;

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "card", label: "Card" },
] as const;

export const NOTIFICATION_TYPES = [
  { value: "alert", label: "Alert" },
  { value: "reminder", label: "Reminder" },
  { value: "update", label: "Update" },
] as const;

export const CLASSES = [
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11 (Science)",
  "Class 11 (Commerce)",
  "Class 12 (Science)",
  "Class 12 (Commerce)",
  "Foundation",
  "Competitive Prep",
] as const;

export const COURSES = [
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Social Studies",
  "Computer Science",
  "Economics",
  "Accounts",
  "JEE Preparation",
  "NEET Preparation",
] as const;
