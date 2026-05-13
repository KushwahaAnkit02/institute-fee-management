import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Shield,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

const FEATURES = [
  {
    icon: Users,
    title: "Student Management",
    description:
      "Manage all students, their courses, fees, and enrollment details in one unified view.",
  },
  {
    icon: CreditCard,
    title: "Fee Collection",
    description:
      "Record payments via cash, card, cheque, or online with instant confirmation.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description:
      "Visualize collection trends, pending dues, and monthly revenue at a glance.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Automated fee reminders and payment confirmations for students and admins.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Built on Internet Computer with Internet Identity — no passwords, no breaches.",
  },
  {
    icon: CheckCircle2,
    title: "Receipt Management",
    description:
      "Generate and download payment receipts for every transaction instantly.",
  },
];

const STATS = [
  { value: "2,150+", label: "Students Managed" },
  { value: "\u20b918.75L", label: "Fees Collected" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 1s", label: "Response Time" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-accent shadow-soft flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-display font-bold text-sm leading-tight">
                Akshay Classes
              </p>
              <p className="text-[10px] text-muted-foreground">
                Fee Management Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login">
              <Button
                size="sm"
                className="gradient-accent text-primary-foreground"
                data-ocid="landing.login_button"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center relative overflow-hidden bg-background py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-primary/8 blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <Badge
              className="mb-5 bg-primary/15 text-primary border-primary/30 hover:bg-primary/20"
              data-ocid="landing.badge"
            >
              ✦ Institute Fee Management
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-5">
              Manage Fees <span className="text-primary">Effortlessly</span>{" "}
              with Akshay Classes
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              A premium fee management portal for modern institutes. Track
              student payments, generate reports, and send reminders — all from
              one elegant dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/login">
                <Button
                  size="lg"
                  className="gradient-accent text-primary-foreground shadow-elevated"
                  data-ocid="landing.hero.admin_cta"
                >
                  Admin Portal
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  data-ocid="landing.hero.student_cta"
                >
                  Student Login
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="hidden lg:block"
          >
            <div className="glass-card rounded-3xl shadow-elevated overflow-hidden">
              <img
                src="/assets/generated/hero-dashboard.dim_1200x600.jpg"
                alt="Fee Management Dashboard Preview"
                className="w-full h-64 object-cover"
              />
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-bold text-xl text-foreground">
                      \u20b918,75,000
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total collected this year
                    </p>
                  </div>
                  <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30">
                    +12% MoM
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Students", value: "2,150" },
                    { label: "Pending", value: "\u20b95.2L" },
                    { label: "Collected", value: "97%" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-muted/50 rounded-xl p-3 text-center"
                    >
                      <p className="font-display font-bold text-sm text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-muted/30 border-y border-border/30 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-3xl font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Everything you need
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built for institutes that want a professional, reliable, and
              beautiful fee management system.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="glass-card rounded-2xl p-6 shadow-soft"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/30 border-t border-border/30 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
              Ready to streamline fee collection?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join hundreds of institutes already using Akshay Classes Fee
              Management Portal.
            </p>
            <Link to="/login">
              <Button
                size="lg"
                className="gradient-accent text-primary-foreground shadow-elevated"
                data-ocid="landing.bottom_cta"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border/50 py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span>Akshay Classes Fee Management Portal</span>
          </div>
          <span>
            \u00a9 {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
