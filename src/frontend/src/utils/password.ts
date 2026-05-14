/**
 * Password utilities for the student temp-password flow.
 */

/**
 * Generates a temporary password from a student's full name.
 * Format: FirstName@NNNN  (e.g. "Rahul@4821" for "Rahul Sharma")
 */
export function generateTempPassword(fullName: string): string {
  const firstName = fullName.trim().split(/\s+/)[0] ?? "Student";
  const fourDigit = Math.floor(1000 + Math.random() * 9000);
  return `${firstName}@${fourDigit}`;
}

/**
 * Returns true when a password meets minimum strength requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one digit
 */
export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
  );
}
