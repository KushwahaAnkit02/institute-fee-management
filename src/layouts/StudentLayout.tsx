import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useStudentNotifications,
} from "@/hooks/useNotifications";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserCircle,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const NAV_ITEMS = [
  { to: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/student/fees", icon: CreditCard, label: "My Fees" },
  { to: "/student/payments", icon: BookOpen, label: "Payments" },
  { to: "/student/profile", icon: UserCircle, label: "Profile" },
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-fast text-muted-foreground hover:text-foreground"
      data-ocid="student.theme_toggle"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}

export function StudentLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { data: notifications = [] } = useStudentNotifications(user?.id ?? "");
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="hidden md:flex flex-col w-60 bg-card border-r border-border/50 shadow-soft shrink-0">
        <div className="flex items-center gap-3 p-4 border-b border-border/30 min-h-[64px]">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl gradient-accent shadow-soft shrink-0">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display font-bold text-sm text-foreground leading-tight">
              Akshay Classes
            </p>
            <p className="text-[10px] text-muted-foreground">Student Portal</p>
          </div>
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
                data-ocid={`student.nav.${label.toLowerCase().replace(/ /g, "_")}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-fast relative ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="student-nav-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ duration: 0.2 }}
                  />
                )}
                <Icon
                  className={`w-4 h-4 shrink-0 relative z-10 ${active ? "text-primary" : ""}`}
                />
                <span className="text-sm font-medium relative z-10">
                  {label}
                </span>
                {label === "Dashboard" && unreadCount > 0 && (
                  <Badge className="ml-auto text-[10px] h-4 px-1.5 bg-primary text-primary-foreground relative z-10">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border/30">
          <button
            type="button"
            onClick={handleLogout}
            data-ocid="student.logout_button"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-fast"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

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
                      Student Portal
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
              <nav className="flex-1 p-3 space-y-1">
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

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="glass-header sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 h-16 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              data-ocid="student.mobile_menu_button"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <span className="font-display font-semibold text-foreground hidden sm:block">
              Student Portal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Notifications"
                data-ocid="student.header.notifications_button"
                className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-fast"
              >
                <Bell className="w-4 h-4 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full text-[9px] text-primary-foreground flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-card border border-border/50 rounded-2xl shadow-soft z-50 overflow-hidden"
                    data-ocid="student.notifications.popover"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                      <p className="font-display font-semibold text-sm text-foreground">
                        Notifications
                      </p>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => markAllAsRead()}
                          className="text-xs text-primary hover:text-primary/80 transition-fast"
                          data-ocid="student.notifications.mark_all_read"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div
                          className="flex flex-col items-center justify-center py-10 text-center px-4"
                          data-ocid="student.notifications.empty_state"
                        >
                          <Bell className="w-8 h-8 text-muted-foreground/40 mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No notifications yet
                          </p>
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => {
                              if (!n.is_read) markAsRead(n.id);
                            }}
                            className={`w-full text-left px-4 py-3 border-b border-border/20 last:border-0 hover:bg-muted/50 transition-fast ${
                              !n.is_read ? "bg-primary/5" : ""
                            }`}
                            data-ocid="student.notifications.item"
                          >
                            <div className="flex items-start gap-2">
                              {!n.is_read && (
                                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                              )}
                              <div className={!n.is_read ? "" : "pl-4"}>
                                <p className="text-xs font-semibold text-foreground leading-tight">
                                  {n.title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                  {n.message}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2 pl-2 border-l border-border/50">
              <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                {user?.name?.[0]?.toUpperCase() ?? "S"}
              </div>
              <span className="hidden sm:block text-sm font-medium text-foreground truncate max-w-[120px]">
                {user?.name ?? "Student"}
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
