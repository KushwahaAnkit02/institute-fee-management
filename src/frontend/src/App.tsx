import { AdminLayout } from "@/layouts/AdminLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { StudentLayout } from "@/layouts/StudentLayout";
import { isSupabaseConfigured } from "@/lib/supabase";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { AdminClassesPage } from "@/pages/admin/AdminClassesPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminFeesPage } from "@/pages/admin/AdminFeesPage";
import { AdminNotificationsPage } from "@/pages/admin/AdminNotificationsPage";
import { AdminPaymentsPage } from "@/pages/admin/AdminPaymentsPage";
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage";
import { AdminStudentsPage } from "@/pages/admin/AdminStudentsPage";
import StudentDashboardPage from "@/pages/student/StudentDashboardPage";
import StudentFeesPage from "@/pages/student/StudentFeesPage";
import StudentPaymentsPage from "@/pages/student/StudentPaymentsPage";
import StudentProfilePage from "@/pages/student/StudentProfilePage";
import { useAuthStore } from "@/store/authStore";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
  beforeLoad: () => {
    // Only redirect if auth has fully resolved (isLoading === false)
    const { isAuthenticated, isLoading, user } = useAuthStore.getState();
    if (!isLoading && isAuthenticated && user) {
      throw redirect({
        to: user.role === "admin" ? "/admin/dashboard" : "/student/dashboard",
      });
    }
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});
const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/callback",
  component: AuthCallbackPage,
});

// Admin
const adminGuardRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "admin-guard",
  component: () => <AuthLayout requiredRole="admin" />,
});

const adminLayoutRoute = createRoute({
  getParentRoute: () => adminGuardRoute,
  id: "admin-layout",
  component: AdminLayout,
});

const adminRootRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin",
  beforeLoad: () => {
    throw redirect({ to: "/admin/dashboard" });
  },
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/dashboard",
  component: AdminDashboardPage,
});

const adminStudentsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/students",
  component: AdminStudentsPage,
});

const adminFeesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/fees",
  component: AdminFeesPage,
});

const adminPaymentsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/payments",
  component: AdminPaymentsPage,
});

const adminNotificationsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/notifications",
  component: AdminNotificationsPage,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/settings",
  component: AdminSettingsPage,
});

const adminClassesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/classes",
  component: AdminClassesPage,
});

// Student
const studentGuardRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "student-guard",
  component: () => <AuthLayout requiredRole="student" />,
});

const studentLayoutRoute = createRoute({
  getParentRoute: () => studentGuardRoute,
  id: "student-layout",
  component: StudentLayout,
});

const studentRootRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: "/student",
  beforeLoad: () => {
    throw redirect({ to: "/student/dashboard" });
  },
});

const studentDashboardRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: "/student/dashboard",
  component: StudentDashboardPage,
});

const studentFeesRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: "/student/fees",
  component: StudentFeesPage,
});

const studentPaymentsRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: "/student/payments",
  component: StudentPaymentsPage,
});

const studentProfileRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: "/student/profile",
  component: StudentProfilePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  authCallbackRoute,
  adminGuardRoute.addChildren([
    adminLayoutRoute.addChildren([
      adminRootRoute,
      adminDashboardRoute,
      adminStudentsRoute,
      adminFeesRoute,
      adminPaymentsRoute,
      adminNotificationsRoute,
      adminSettingsRoute,
      adminClassesRoute,
    ]),
  ]),
  studentGuardRoute.addChildren([
    studentLayoutRoute.addChildren([
      studentRootRoute,
      studentDashboardRoute,
      studentFeesRoute,
      studentPaymentsRoute,
      studentProfileRoute,
    ]),
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function SupabaseSetupScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <svg
            role="img"
            aria-label="Setup"
            className="w-8 h-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Supabase not configured
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            To get started, add your Supabase credentials to{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono text-foreground">
              src/frontend/.env
            </code>
            , then restart the dev server.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-4 text-left space-y-1">
          <p className="text-xs font-mono text-muted-foreground">
            # src/frontend/.env
          </p>
          <p className="text-sm font-mono text-foreground">
            VITE_SUPABASE_URL=https://your-project.supabase.co
          </p>
          <p className="text-sm font-mono text-foreground">
            VITE_SUPABASE_ANON_KEY=your-anon-key
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Find these values in your Supabase project under{" "}
          <strong>Settings → API</strong>.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  if (!isSupabaseConfigured) {
    return (
      <>
        <SupabaseSetupScreen />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          classNames: {
            toast: "glass-card border-border/50",
          },
        }}
      />
    </>
  );
}
