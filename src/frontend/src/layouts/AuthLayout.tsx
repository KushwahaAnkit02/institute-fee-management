import { useAuthStore } from "@/store/authStore";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

interface AuthLayoutProps {
  requiredRole?: "admin" | "student";
}

export function AuthLayout({ requiredRole }: AuthLayoutProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const role = user?.role;
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    if (requiredRole && role && role !== requiredRole) {
      const dest = role === "admin" ? "/admin/dashboard" : "/student/dashboard";
      navigate({ to: dest });
    }
  }, [isAuthenticated, isLoading, role, requiredRole, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (requiredRole && role && role !== requiredRole) return null;

  return <Outlet />;
}
