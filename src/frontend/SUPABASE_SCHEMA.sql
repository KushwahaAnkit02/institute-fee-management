-- ============================================================
-- Akshay Classes Fee Management Portal — Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. PROFILES (mirrors auth.users)
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  role        text not null check (role in ('admin', 'student')),
  name        text not null,
  email       text not null,
  avatar_url  text,
  phone       text,
  is_active   boolean not null default true,
  provider    text not null default 'email' check (provider in ('email', 'google')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Service role can insert profiles"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. ADMINS
create table if not exists public.admins (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid references public.profiles(id) on delete cascade not null,
  institute_name  text not null default 'Akshay Classes',
  institute_code  text not null,
  address         text,
  created_at      timestamptz not null default now()
);

alter table public.admins enable row level security;

create policy "Admins can read own record"
  on public.admins for select
  using (profile_id = auth.uid());

create policy "Admins can update own record"
  on public.admins for update
  using (profile_id = auth.uid());

create policy "Admins can insert own record"
  on public.admins for insert
  with check (profile_id = auth.uid());

-- 3. STUDENTS
create table if not exists public.students (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid references public.profiles(id) on delete set null,
  admin_id        uuid references public.admins(id) on delete cascade not null,
  name            text not null,
  email           text not null,
  class_          text not null,
  course          text not null,
  monthly_fee     numeric(10,2) not null default 0,
  joined_date     date not null,
  fee_start_date  date not null,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.students enable row level security;

create policy "Admin can manage own students"
  on public.students for all
  using (
    admin_id in (
      select id from public.admins where profile_id = auth.uid()
    )
  );

create policy "Students can read own record"
  on public.students for select
  using (profile_id = auth.uid());

-- Allow unauthenticated check by email during signup (needed to link student)
create policy "Allow signup email check"
  on public.students for select
  using (true);

-- 4. MONTHLY PAYMENTS
create table if not exists public.monthly_payments (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid references public.students(id) on delete cascade not null,
  admin_id        uuid references public.admins(id) on delete cascade not null,
  month           text not null,   -- 'YYYY-MM'
  amount_paid     numeric(10,2) not null,
  payment_method  text not null check (payment_method in ('cash','online','cheque','card')),
  notes           text,
  payment_date    date not null,
  created_at      timestamptz not null default now()
);

alter table public.monthly_payments enable row level security;

create policy "Admin can manage own payments"
  on public.monthly_payments for all
  using (
    admin_id in (
      select id from public.admins where profile_id = auth.uid()
    )
  );

create policy "Students can read own payments"
  on public.monthly_payments for select
  using (
    student_id in (
      select id from public.students where profile_id = auth.uid()
    )
  );

-- 5. NOTIFICATIONS
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid references public.admins(id) on delete cascade not null,
  student_id  uuid references public.students(id) on delete set null,
  title       text not null,
  message     text not null,
  type        text not null check (type in ('alert','reminder','update','payment')),
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Admin can manage own notifications"
  on public.notifications for all
  using (
    admin_id in (
      select id from public.admins where profile_id = auth.uid()
    )
  );

create policy "Students can read own notifications"
  on public.notifications for select
  using (
    student_id in (
      select id from public.students where profile_id = auth.uid()
    )
  );

-- ============================================================
-- HELPER: auto-update updated_at on row change
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger trg_students_updated_at
  before update on public.students
  for each row execute function public.handle_updated_at();

-- ============================================================
-- GOOGLE OAUTH SETUP (Dashboard → Authentication → Providers)
-- ============================================================
-- 1. Go to Supabase Dashboard → Authentication → Providers → Google
-- 2. Enable Google provider
-- 3. Add your Google OAuth Client ID and Client Secret
-- 4. Set Authorized redirect URI in Google Console:
--    https://<your-project>.supabase.co/auth/v1/callback
-- 5. Set Site URL in Supabase Dashboard → Authentication → URL Configuration:
--    http://localhost:5173  (for development)
--    https://yourdomain.com (for production)
-- 6. Add to Redirect URLs:
--    http://localhost:5173/auth/callback
--    https://yourdomain.com/auth/callback
