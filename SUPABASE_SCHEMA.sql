-- ============================================================
-- INSTITUTE FEE MANAGEMENT SYSTEM (UPDATED PREMIUM VERSION)
-- Supabase PostgreSQL Schema
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  role TEXT NOT NULL CHECK (
    role IN ('admin', 'student')
  ),

  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,

  avatar_url TEXT,

  provider TEXT NOT NULL DEFAULT 'email'
  CHECK (provider IN ('email', 'google')),

  must_change_password BOOLEAN NOT NULL DEFAULT FALSE,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INSTITUTES / ADMINS
-- ============================================================

CREATE TABLE IF NOT EXISTS institutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_profile_id UUID NOT NULL
  REFERENCES profiles(id)
  ON DELETE CASCADE,

  institute_name TEXT NOT NULL,
  institute_code TEXT UNIQUE NOT NULL,

  logo_url TEXT,

  phone TEXT,
  email TEXT,
  website TEXT,

  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  pincode TEXT,

  upi_id TEXT,
  qr_code_url TEXT,

  dark_mode BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CLASSES
-- ============================================================

CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  institute_id UUID NOT NULL
  REFERENCES institutes(id)
  ON DELETE CASCADE,

  class_name TEXT NOT NULL,
  description TEXT,

  monthly_fee NUMERIC(10,2) NOT NULL DEFAULT 0,

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  class_id UUID NOT NULL
  REFERENCES classes(id)
  ON DELETE CASCADE,

  section_name TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STUDENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  profile_id UUID
  REFERENCES profiles(id)
  ON DELETE SET NULL,

  institute_id UUID NOT NULL
  REFERENCES institutes(id)
  ON DELETE CASCADE,

  class_id UUID
  REFERENCES classes(id)
  ON DELETE SET NULL,

  section_id UUID
  REFERENCES sections(id)
  ON DELETE SET NULL,

  enrollment_number TEXT UNIQUE NOT NULL,

  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,

  phone TEXT NOT NULL,

  gender TEXT
  CHECK (gender IN ('male', 'female', 'other')),

  date_of_birth DATE,

  parent_name TEXT,
  parent_phone TEXT,

  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,

  admission_date DATE DEFAULT CURRENT_DATE,

  monthly_fee NUMERIC(10,2) NOT NULL DEFAULT 0,

  pending_amount NUMERIC(10,2) DEFAULT 0,

  profile_image_url TEXT,

  temp_password TEXT,

  must_change_password BOOLEAN DEFAULT TRUE,

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MONTHLY PAYMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS monthly_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  institute_id UUID NOT NULL
  REFERENCES institutes(id)
  ON DELETE CASCADE,

  student_id UUID NOT NULL
  REFERENCES students(id)
  ON DELETE CASCADE,

  payment_month TEXT NOT NULL,

  amount_paid NUMERIC(10,2) NOT NULL,

  payment_method TEXT NOT NULL
  CHECK (
    payment_method IN (
      'cash',
      'online',
      'upi',
      'bank_transfer',
      'card'
    )
  ),

  transaction_id TEXT,

  notes TEXT,

  payment_date DATE DEFAULT CURRENT_DATE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  institute_id UUID NOT NULL
  REFERENCES institutes(id)
  ON DELETE CASCADE,

  student_id UUID
  REFERENCES students(id)
  ON DELETE CASCADE,

  title TEXT NOT NULL,
  message TEXT NOT NULL,

  type TEXT NOT NULL
  CHECK (
    type IN (
      'alert',
      'reminder',
      'payment',
      'announcement',
      'update'
    )
  ),

  is_read BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PASSWORD RESET TOKENS
-- ============================================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  profile_id UUID NOT NULL
  REFERENCES profiles(id)
  ON DELETE CASCADE,

  token TEXT NOT NULL UNIQUE,

  expires_at TIMESTAMPTZ NOT NULL,

  used BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UPDATE TIMESTAMP FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institutes_updated_at
BEFORE UPDATE ON institutes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
BEFORE UPDATE ON classes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role
ON profiles(role);

CREATE INDEX IF NOT EXISTS idx_students_institute
ON students(institute_id);

CREATE INDEX IF NOT EXISTS idx_students_class
ON students(class_id);

CREATE INDEX IF NOT EXISTS idx_students_section
ON students(section_id);

CREATE INDEX IF NOT EXISTS idx_students_phone
ON students(phone);

CREATE INDEX IF NOT EXISTS idx_payments_student
ON monthly_payments(student_id);

CREATE INDEX IF NOT EXISTS idx_notifications_student
ON notifications(student_id);

-- ============================================================
-- ENABLE RLS
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

CREATE POLICY "profiles_select_own"
ON profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- ============================================================
-- INSTITUTE POLICIES
-- ============================================================

CREATE POLICY "institutes_owner_access"
ON institutes
FOR ALL
USING (
  owner_profile_id = auth.uid()
);

-- ============================================================
-- CLASS POLICIES
-- ============================================================

CREATE POLICY "classes_admin_access"
ON classes
FOR ALL
USING (
  institute_id IN (
    SELECT id FROM institutes
    WHERE owner_profile_id = auth.uid()
  )
);

-- ============================================================
-- SECTION POLICIES
-- ============================================================

CREATE POLICY "sections_admin_access"
ON sections
FOR ALL
USING (
  class_id IN (
    SELECT c.id
    FROM classes c
    JOIN institutes i
    ON c.institute_id = i.id
    WHERE i.owner_profile_id = auth.uid()
  )
);

-- ============================================================
-- STUDENT POLICIES
-- ============================================================

CREATE POLICY "students_admin_access"
ON students
FOR ALL
USING (
  institute_id IN (
    SELECT id FROM institutes
    WHERE owner_profile_id = auth.uid()
  )
);

CREATE POLICY "students_self_read"
ON students
FOR SELECT
USING (
  profile_id = auth.uid()
);

-- ============================================================
-- PAYMENT POLICIES
-- ============================================================

CREATE POLICY "payments_admin_access"
ON monthly_payments
FOR ALL
USING (
  institute_id IN (
    SELECT id FROM institutes
    WHERE owner_profile_id = auth.uid()
  )
);

CREATE POLICY "payments_student_read"
ON monthly_payments
FOR SELECT
USING (
  student_id IN (
    SELECT id FROM students
    WHERE profile_id = auth.uid()
  )
);

-- ============================================================
-- NOTIFICATION POLICIES
-- ============================================================

CREATE POLICY "notifications_admin_access"
ON notifications
FOR ALL
USING (
  institute_id IN (
    SELECT id FROM institutes
    WHERE owner_profile_id = auth.uid()
  )
);

CREATE POLICY "notifications_student_read"
ON notifications
FOR SELECT
USING (
  student_id IN (
    SELECT id FROM students
    WHERE profile_id = auth.uid()
  )
  OR student_id IS NULL
);

-- ============================================================
-- PASSWORD TOKEN POLICIES
-- ============================================================

CREATE POLICY "password_reset_own"
ON password_reset_tokens
FOR ALL
USING (
  profile_id = auth.uid()
);

-- ============================================================
-- SAMPLE TEMP PASSWORD FORMAT
-- ============================================================
-- Example:
-- Rahul@1234
-- Aman@1234
-- Priya@1234

-- ============================================================
-- GOOGLE AUTH NOTES
-- ============================================================
-- Enable Google Provider in Supabase Auth
-- Add:
-- https://YOUR_PROJECT.supabase.co/auth/v1/callback
-- inside Google OAuth Redirect URLs

-- ============================================================
-- SITE URL
-- ============================================================
-- http://localhost:5173
-- OR production URL

-- ============================================================
-- REDIRECT URL
-- ============================================================
-- http://localhost:5173/auth/callback