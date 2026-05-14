import { AdminLayout } from "@/layouts/AdminLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { StudentLayout } from "@/layouts/StudentLayout";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { AdminClassesPage } from "@/pages/admin/AdminClassesPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminFeesPage } from "@/pages/admin/AdminFeesPage";
import { AdminNotificationsPage } from "@/pages/admin/AdminNotificationsPage";
import { AdminPaymentsPage } from "@/pages/admin/AdminPaymentsPage";
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage";
import AdminStudentsPage from "@/pages/admin/AdminStudentsPage";
import ChangePasswordPage from "@/pages/student/ChangePasswordPage";
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
    const { isAuthenticated, isLoading, profile } = useAuthStore.getState();
    if (!isLoading && isAuthenticated && profile) {
      throw redirect({
        to:
          profile.role === "admin" ? "/admin/dashboard" : "/student/dashboard",
      });
    }
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: ForgotPasswordPage,
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

const studentChangePasswordRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: "/student/change-password",
  component: ChangePasswordPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  forgotPasswordRoute,
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
      studentChangePasswordRoute,
    ]),
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// SupabaseSetupScreen removed — Supabase keys are now configured

export default function App() {
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
