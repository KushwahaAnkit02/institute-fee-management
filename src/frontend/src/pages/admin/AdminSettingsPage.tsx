import { PageTransition } from "@/components/shared/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/useTheme";
import type { TablesUpdate } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { AlertTriangle, Moon, Save, Settings, Sun, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export function AdminSettingsPage() {
  const profile = useAuthStore((s) => s.profile);
  const admin = useAuthStore((s) => s.admin);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(profile?.name ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (!profile?.id) {
      toast.error("No profile found");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name: name.trim() } as TablesUpdate<"profiles">)
        .eq("id", profile.id);
      if (error) throw error;
      await refreshUser();
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
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
                className={`text-xs font-medium ${
                  theme === "light" ? "text-primary" : "text-muted-foreground"
                }`}
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
                className={`text-xs font-medium ${
                  theme === "dark" ? "text-primary" : "text-muted-foreground"
                }`}
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
                value={profile?.email ?? ""}
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

        {/* Institute Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="glass-card rounded-2xl p-6 shadow-soft space-y-3"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="font-display font-semibold text-foreground">
              Institute Information
            </h2>
          </div>
          <Separator />
          <div className="space-y-2">
            {[
              ["Institute Name", admin?.institute_name ?? "—"],
              ["Institute Code", admin?.institute_code ?? "—"],
              ["Address", admin?.address ?? "—"],
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
            Institute details are set during signup. Contact support to update
            them.
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}
