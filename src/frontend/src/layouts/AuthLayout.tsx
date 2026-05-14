import { useAuthStore } from "@/store/authStore";
// Navigate is not a component in TanStack Router — we use the hook instead
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function GuestLayout() {
  const { isInitialized, isLoading, profile } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialized || isLoading) return;
    if (profile?.role === "admin") {
      navigate({ to: "/admin/dashboard", replace: true });
    } else if (profile?.role === "student") {
      navigate({ to: "/student/dashboard", replace: true });
    }
  }, [isInitialized, isLoading, profile, navigate]);

  if (!isInitialized || isLoading) return <FullPageSpinner />;
  if (profile) return null;
  return <Outlet />;
}

export function AdminProtectedLayout() {
  const { isInitialized, isLoading, profile } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialized || isLoading) return;
    if (!profile) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (profile.role !== "admin") {
      navigate({ to: "/student/dashboard", replace: true });
    }
  }, [isInitialized, isLoading, profile, navigate]);

  if (!isInitialized || isLoading) return <FullPageSpinner />;
  if (!profile || profile.role !== "admin") return null;
  return <Outlet />;
}

export function StudentProtectedLayout() {
  const { isInitialized, isLoading, profile } = useAuthStore();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    if (!isInitialized || isLoading) return;
    if (!profile) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (profile.role !== "student") {
      navigate({ to: "/admin/dashboard", replace: true });
      return;
    }
    // Redirect to change-password only if not already there (prevent loop)
    if (
      profile.must_change_password &&
      currentPath !== "/student/change-password"
    ) {
      navigate({ to: "/student/change-password", replace: true });
    }
  }, [isInitialized, isLoading, profile, navigate, currentPath]);

  if (!isInitialized || isLoading) return <FullPageSpinner />;
  if (!profile || profile.role !== "student") return null;
  return <Outlet />;
}

/** @deprecated Use AdminProtectedLayout / StudentProtectedLayout / GuestLayout instead */
export function AuthLayout({
  requiredRole,
}: {
  requiredRole?: "admin" | "student";
}) {
  const { isInitialized, isLoading, profile } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialized || isLoading) return;
    if (!profile) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (requiredRole && profile.role !== requiredRole) {
      const dest =
        profile.role === "admin" ? "/admin/dashboard" : "/student/dashboard";
      navigate({ to: dest, replace: true });
    }
  }, [isInitialized, isLoading, profile, requiredRole, navigate]);

  if (!isInitialized || isLoading) return <FullPageSpinner />;
  if (!profile) return null;
  if (requiredRole && profile.role !== requiredRole) return null;
  return <Outlet />;
}
