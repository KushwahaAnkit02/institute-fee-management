import { PageTransition } from "@/components/shared/PageTransition";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { StudentLayout } from "@/layouts/StudentLayout";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage";
import { LoginPage } from "@/pages/LoginPage";
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
  beforeLoad: () => {
    const { isAuthenticated, user } = useAuthStore.getState();
    if (isAuthenticated && user) {
      throw redirect({
        to: user.role === "admin" ? "/admin/dashboard" : "/student/dashboard",
      });
    }
    throw redirect({ to: "/login" });
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
