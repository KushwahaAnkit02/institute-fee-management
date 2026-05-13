import { useAuthStore } from "@/store/authStore";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

interface AuthLayoutProps {
  requiredRole?: "admin" | "student";
}

/** @deprecated Use AdminProtectedLayout / StudentProtectedLayout / GuestLayout instead */
export function AuthLayout({ requiredRole }: AuthLayoutProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const role = user?.role;
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (requiredRole && role && role !== requiredRole) {
      const dest = role === "admin" ? "/admin/dashboard" : "/student/dashboard";
      navigate({ to: dest, replace: true });
    }
  }, [isAuthenticated, isLoading, role, requiredRole, navigate]);

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return null;
  if (requiredRole && role && role !== requiredRole) return null;

  return <Outlet />;
}

export function AdminProtectedLayout() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const role = user?.role;
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (role !== "admin") {
      navigate({ to: "/student/dashboard", replace: true });
    }
  }, [isAuthenticated, isLoading, role, navigate]);

  if (isLoading) return <Spinner />;
  if (!isAuthenticated || role !== "admin") return null;
  return <Outlet />;
}

export function StudentProtectedLayout() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const role = user?.role;
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (role !== "student") {
      navigate({ to: "/admin/dashboard", replace: true });
    }
  }, [isAuthenticated, isLoading, role, navigate]);

  if (isLoading) return <Spinner />;
  if (!isAuthenticated || role !== "student") return null;
  return <Outlet />;
}

export function GuestLayout() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const role = user?.role;
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && role === "admin") {
      navigate({ to: "/admin/dashboard", replace: true });
    } else if (isAuthenticated && role === "student") {
      navigate({ to: "/student/dashboard", replace: true });
    }
  }, [isAuthenticated, isLoading, role, navigate]);

  if (isLoading) return <Spinner />;
  if (isAuthenticated) return null;
  return <Outlet />;
}
