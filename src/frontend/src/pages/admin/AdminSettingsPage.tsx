import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { PageTransition } from "@/components/shared/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import {
  AlertTriangle,
  Database,
  Moon,
  Save,
  Settings,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

function getStorageCount(key: string): number {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.length;
    if (typeof parsed === "object" && parsed !== null)
      return Object.keys(parsed).length;
    return 1;
  } catch {
    return 0;
  }
}

function getStorageSize(key: string): string {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return "0 B";
    const bytes = new Blob([raw]).size;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  } catch {
    return "0 B";
  }
}

export function AdminSettingsPage() {
  const { user, login } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const storageInfo = useMemo(
    () => [
      { key: "akshay_students", label: "Students", icon: "👨‍🎓" },
      { key: "akshay_payments", label: "Payments", icon: "💰" },
      {
        key: "akshay_notifications",
        label: "Notifications",
        icon: "🔔",
      },
      { key: "akshay_settings", label: "Settings", icon: "⚙️" },
    ],
    [],
  );

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    if (user) {
      const updatedUser = { ...user, name: name.trim() };
      login(updatedUser);
    }
    setSaving(false);
    toast.success("Profile saved!");
  }

  async function handleClearData() {
    setClearing(true);
    await new Promise((r) => setTimeout(r, 600));
    const keysToRemove = [
      "akshay_students",
      "akshay_payments",
      "akshay_notifications",
      "akshay_settings",
      "akshay_seeded",
    ];
    for (const key of keysToRemove) localStorage.removeItem(key);
    setClearing(false);
    setClearOpen(false);
    toast.success("All data cleared. Reloading...");
    setTimeout(() => window.location.reload(), 1200);
  }

  return (
    <PageTransition>
      <div
        className="px-4 sm:px-6 py-6 space-y-6 max-w-2xl"
        data-ocid="settings.page"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your preferences and application data
          </p>
        </div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="glass-card rounded-2xl p-6 shadow-soft space-y-5"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-foreground">
              Appearance
            </h2>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Theme</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Switch between dark and light mode
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
                aria-label="Toggle dark mode"
                data-ocid="settings.theme_toggle"
              />
              <Moon className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          {/* Theme Preview */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`rounded-xl border-2 p-3 text-left transition-fast ${
                theme === "light"
                  ? "border-primary bg-primary/5"
                  : "border-border/40 hover:border-border"
              }`}
              data-ocid="settings.light_theme_button"
            >
              <div className="w-full h-10 rounded-lg bg-white border border-border/30 flex items-center gap-2 px-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <div className="flex-1 h-1.5 bg-slate-200 rounded" />
              </div>
              <p
                className={`text-xs font-medium ${theme === "light" ? "text-primary" : "text-muted-foreground"}`}
              >
                Light {theme === "light" && "✓"}
              </p>
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`rounded-xl border-2 p-3 text-left transition-fast ${
                theme === "dark"
                  ? "border-primary bg-primary/5"
                  : "border-border/40 hover:border-border"
              }`}
              data-ocid="settings.dark_theme_button"
            >
              <div className="w-full h-10 rounded-lg bg-slate-900 border border-slate-700/40 flex items-center gap-2 px-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-slate-600" />
                <div className="flex-1 h-1.5 bg-slate-700 rounded" />
              </div>
              <p
                className={`text-xs font-medium ${theme === "dark" ? "text-primary" : "text-muted-foreground"}`}
              >
                Dark {theme === "dark" && "✓"}
              </p>
            </button>
          </div>
        </motion.div>

        {/* Admin Profile */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="glass-card rounded-2xl p-6 shadow-soft space-y-5"
        >
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-foreground">
              Admin Profile
            </h2>
          </div>
          <Separator />
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="settings-name">Display Name</Label>
              <Input
                id="settings-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                data-ocid="settings.name_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                value={user?.email ?? ""}
                disabled
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Input
                value="Administrator"
                disabled
                className="bg-muted/50 capitalize"
              />
            </div>
            <Button
              type="submit"
              className="gradient-accent text-primary-foreground"
              disabled={saving}
              data-ocid="settings.save_button"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </motion.div>

        {/* localStorage System Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="glass-card rounded-2xl p-6 shadow-soft space-y-5"
        >
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-foreground">
              Data Management
            </h2>
          </div>
          <Separator />
          <div className="space-y-2">
            {storageInfo.map(({ key, label, icon }) => {
              const count = getStorageCount(key);
              const size = getStorageSize(key);
              return (
                <div
                  key={key}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-fast"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{icon}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {label}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {key}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-display font-bold text-foreground">
                      {count}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{size}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            All data is stored in your browser’s localStorage. Clearing browser
            data will remove all records.
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive"
            onClick={() => setClearOpen(true)}
            data-ocid="settings.clear_data_button"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Clear All Data
          </Button>
        </motion.div>

        {/* Demo Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="glass-card rounded-2xl p-6 shadow-soft space-y-3"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="font-display font-semibold text-foreground">
              Demo Credentials
            </h2>
          </div>
          <Separator />
          <div className="space-y-2">
            {[
              ["Admin Email", "admin@akshayclasses.com"],
              ["Admin Password", "admin123"],
              ["Student Email", "student@akshayclasses.com"],
              ["Student Password", "student123"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-mono text-xs font-medium bg-muted/50 px-2 py-0.5 rounded">
                  {value}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            App version: 1.0.0 · Built with localStorage only · All data is
            browser-local.
          </p>
        </motion.div>
      </div>

      <ConfirmModal
        open={clearOpen}
        title="Clear All Data?"
        description="This will permanently delete all students, payments, notifications, and settings. This action cannot be undone."
        confirmLabel="Clear All Data"
        variant="danger"
        onConfirm={handleClearData}
        onCancel={() => setClearOpen(false)}
        isLoading={clearing}
      />
    </PageTransition>
  );
}
