import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const NAV_ITEMS = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/students", icon: Users, label: "Students" },
  { to: "/admin/fees", icon: CreditCard, label: "Fee Collection" },
  { to: "/admin/payments", icon: BookOpen, label: "Payments" },
  { to: "/admin/notifications", icon: Bell, label: "Notifications" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-fast text-muted-foreground hover:text-foreground"
      data-ocid="admin.theme_toggle"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex flex-col bg-card border-r border-border/50 shadow-soft overflow-hidden shrink-0"
      >
        <div className="flex items-center gap-3 p-4 border-b border-border/30 min-h-[64px]">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl gradient-accent shadow-soft shrink-0">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="font-display font-bold text-sm text-foreground leading-tight">
                  Akshay Classes
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Fee Management
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const active =
              location.pathname === to ||
              location.pathname.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                data-ocid={`admin.nav.${label.toLowerCase().replace(/ /g, "_")}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-fast group relative ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="admin-nav-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ duration: 0.2 }}
                  />
                )}
                <Icon
                  className={`w-4 h-4 shrink-0 relative z-10 ${active ? "text-primary" : ""}`}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium relative z-10 whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {label === "Notifications" && unreadCount > 0 && !collapsed && (
                  <Badge className="ml-auto text-[10px] h-4 px-1.5 bg-primary text-primary-foreground relative z-10">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/30 space-y-1">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-fast"
            data-ocid="admin.sidebar.collapse_button"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 shrink-0" />
            ) : (
              <ChevronLeft className="w-4 h-4 shrink-0" />
            )}
            {!collapsed && <span className="text-sm">Collapse</span>}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            data-ocid="admin.logout_button"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-fast"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-card border-r border-border/50 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl gradient-accent flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm">
                      Akshay Classes
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Fee Management
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
                  const active = location.pathname === to;
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-fast ${
                        active
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-sm font-medium">{label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-3 border-t border-border/30">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-fast"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="glass-header sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 h-16 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              data-ocid="admin.mobile_menu_button"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <span className="font-display font-semibold text-foreground hidden sm:block">
              Fee Management Portal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/admin/notifications"
              data-ocid="admin.header.notifications_button"
              className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-fast"
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full text-[9px] text-primary-foreground flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-2 pl-2 border-l border-border/50">
              <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                {user?.name?.[0]?.toUpperCase() ?? "A"}
              </div>
              <span className="hidden sm:block text-sm font-medium text-foreground truncate max-w-[120px]">
                {user?.name ?? "Admin"}
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
