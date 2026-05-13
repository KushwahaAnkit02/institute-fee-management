import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Mail,
  Menu,
  QrCode,
  Shield,
  Smartphone,
  Star,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

// ─── Data ──────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

const FEATURES = [
  {
    icon: LayoutDashboard,
    color: "from-indigo-500/20 to-indigo-500/5",
    iconColor: "text-indigo-500",
    title: "Smart Dashboard",
    description:
      "Real-time analytics with revenue charts, collection summaries, and pending dues — all at a glance.",
  },
  {
    icon: Users,
    color: "from-purple-500/20 to-purple-500/5",
    iconColor: "text-purple-500",
    title: "Student Management",
    description:
      "Complete student profiles with course, class, enrollment details, and full payment history.",
  },
  {
    icon: CreditCard,
    color: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-500",
    title: "Fee Tracking",
    description:
      "Never miss a payment. Monthly due tracking, overdue alerts, and instant payment recording.",
  },
  {
    icon: QrCode,
    color: "from-fuchsia-500/20 to-fuchsia-500/5",
    iconColor: "text-fuchsia-500",
    title: "UPI Payments",
    description:
      "Students pay instantly via QR code scan or UPI ID. Payment status auto-updated in real time.",
  },
  {
    icon: Bell,
    color: "from-pink-500/20 to-pink-500/5",
    iconColor: "text-pink-500",
    title: "Notifications",
    description:
      "Automated fee reminders and payment confirmations delivered directly to students.",
  },
  {
    icon: BarChart3,
    color: "from-sky-500/20 to-sky-500/5",
    iconColor: "text-sky-500",
    title: "Reports & Analytics",
    description:
      "Detailed monthly reports, revenue trends, and student-wise payment analytics for smarter decisions.",
  },
];

const STATS = [
  { end: 10000, suffix: "+", label: "Students Managed", prefix: "" },
  { end: 500, suffix: "+", label: "Institutes", prefix: "" },
  { end: 5000000, suffix: "+", label: "Fees Collected", prefix: "₹" },
  { end: 99.9, suffix: "%", label: "Uptime", prefix: "", decimal: true },
];

const ADMIN_BENEFITS = [
  "Add & manage students with detailed profiles",
  "Record payments via cash, UPI, cheque, or card",
  "Auto-generate monthly fee dues for all students",
  "View revenue analytics and collection trends",
  "Send broadcast notifications to students",
  "Export reports and payment histories",
];

const STUDENT_BENEFITS = [
  "See all pending fee dues at a glance",
  "Pay instantly via UPI QR scan",
  "Download payment receipts anytime",
  "Get notified before every due date",
  "View complete payment history",
  "Update personal profile and contact info",
];

const TESTIMONIALS = [
  {
    name: "Ramesh Sharma",
    role: "Principal, Sunrise Coaching Centre",
    avatar: "RS",
    quote:
      "This portal completely transformed how we handle fee collections. What used to take hours of paperwork now happens in seconds. Our staff loves it.",
    stars: 5,
  },
  {
    name: "Priya Mehta",
    role: "Director, EduFirst Academy",
    avatar: "PM",
    quote:
      "The UPI payment feature is a game changer. Students pay directly from their phones and the dashboard updates instantly. No more chasing for fees!",
    stars: 5,
  },
  {
    name: "Ajay Kumar",
    role: "Admin, Bright Future Institute",
    avatar: "AK",
    quote:
      "We track 800+ students across 3 branches. The analytics dashboard gives us a real-time view of collections that we never had with spreadsheets.",
    stars: 5,
  },
];

const FAQS = [
  {
    q: "How do students get their login credentials?",
    a: "When you add a student to the portal, you can share their enrollment details. Students use the enrollment code provided by the admin to link their account on first login.",
  },
  {
    q: "Can students pay fees directly from the portal?",
    a: "Yes! Students can see their pending dues and pay via UPI QR code scan. The admin's QR code and UPI ID are displayed directly in the student's fee page.",
  },
  {
    q: "Is there a limit on the number of students?",
    a: "The Free plan supports up to 50 students. Pro plan supports unlimited students, and Enterprise offers dedicated infrastructure for large institutes.",
  },
  {
    q: "Can I manage multiple classes and courses?",
    a: "Absolutely. Admins can create custom classes, sections, and courses. Students are assigned to these at enrollment and can be moved between classes later.",
  },
  {
    q: "How secure is the student and payment data?",
    a: "All data is stored securely with role-based access control. Students can only see their own data; admins can only access their own institute's records.",
  },
  {
    q: "Is there a mobile-friendly version?",
    a: "Yes. The portal is fully responsive and works beautifully on mobile, tablet, and desktop. Students commonly pay fees directly from their smartphones.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    description: "Perfect for small coaching centres just getting started.",
    features: [
      "Up to 50 students",
      "Basic fee tracking",
      "UPI payment QR",
      "Email notifications",
      "Standard reports",
    ],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹999",
    period: "/month",
    description: "For growing institutes that need full power and automation.",
    features: [
      "Unlimited students",
      "Advanced analytics",
      "Multi-class management",
      "Bulk SMS notifications",
      "Priority support",
      "Custom branding",
      "Receipt PDF exports",
    ],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large institutes with multiple branches and staff.",
    features: [
      "Everything in Pro",
      "Multi-branch support",
      "Staff role management",
      "API access",
      "Dedicated support",
      "SLA guarantee",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

// ─── AnimatedCounter ────────────────────────────────────────────────────────

function AnimatedCounter({
  end,
  prefix = "",
  suffix = "",
  decimal = false,
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  decimal?: boolean;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, end]);

  const display = decimal
    ? count.toFixed(1)
    : end >= 100000
      ? `${(count / 100000).toFixed(1)}L`
      : Math.floor(count).toLocaleString("en-IN");

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

// ─── FAQItem ─────────────────────────────────────────────────────────────────

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/20 transition-fast"
        data-ocid={`faq.item.${index + 1}`}
      >
        <span className="font-display font-semibold text-foreground pr-4">
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Sticky Navbar ── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass-header shadow-soft"
            : "bg-background/80 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 flex-shrink-0"
            data-ocid="navbar.logo"
          >
            <div className="w-9 h-9 rounded-xl gradient-accent shadow-soft flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="font-display font-bold text-sm leading-tight text-foreground">
                Akshay Classes
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Fee Management Portal
              </p>
            </div>
          </button>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => scrollTo(link.href.slice(1))}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-ocid={`navbar.${link.label.toLowerCase()}_link`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login" search={{ role: "admin" }}>
              <Button
                variant="outline"
                size="sm"
                data-ocid="navbar.admin_login_button"
              >
                <Shield className="w-3.5 h-3.5 mr-1.5" />
                Admin Login
              </Button>
            </Link>
            <Link to="/login" search={{ role: "student" }}>
              <Button
                variant="outline"
                size="sm"
                data-ocid="navbar.student_login_button"
              >
                <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                Student Login
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="sm"
                className="gradient-accent text-white"
                data-ocid="navbar.get_started_button"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9"
              onClick={() => setMenuOpen(!menuOpen)}
              data-ocid="navbar.mobile_menu_toggle"
            >
              <AnimatePresence mode="wait">
                {menuOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden md:hidden glass-header border-t border-border/30"
              data-ocid="navbar.mobile_menu"
            >
              <div className="px-4 py-4 flex flex-col gap-3">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => scrollTo(link.href.slice(1))}
                    className="text-sm font-medium text-foreground py-2 text-left"
                  >
                    {link.label}
                  </button>
                ))}
                <Separator />
                <Link
                  to="/login"
                  search={{ role: "admin" }}
                  onClick={() => setMenuOpen(false)}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    data-ocid="navbar.mobile.admin_login"
                  >
                    <Shield className="w-4 h-4 mr-2" /> Admin Login
                  </Button>
                </Link>
                <Link
                  to="/login"
                  search={{ role: "student" }}
                  onClick={() => setMenuOpen(false)}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    data-ocid="navbar.mobile.student_login"
                  >
                    <GraduationCap className="w-4 h-4 mr-2" /> Student Login
                  </Button>
                </Link>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  <Button
                    size="sm"
                    className="w-full gradient-accent text-white"
                    data-ocid="navbar.mobile.get_started"
                  >
                    Get Started <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-background pt-20 pb-28 px-4">
        {/* Animated gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, 15, 0] }}
            transition={{
              duration: 18,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute -top-48 -right-32 w-[600px] h-[600px] rounded-full opacity-30 dark:opacity-20"
            style={{
              background: "radial-gradient(circle, #7C3AED55, transparent 70%)",
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, -15, 0] }}
            transition={{
              duration: 22,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 3,
            }}
            className="absolute -bottom-32 -left-24 w-[500px] h-[500px] rounded-full opacity-25 dark:opacity-15"
            style={{
              background: "radial-gradient(circle, #4F46E555, transparent 70%)",
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 14,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 7,
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-10 dark:opacity-8"
            style={{
              background:
                "radial-gradient(ellipse, #6366F130, transparent 60%)",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center mb-6"
            >
              <Badge
                className="bg-primary/10 text-primary border-primary/25 px-4 py-1.5 text-sm font-medium gap-2"
                data-ocid="hero.badge"
              >
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="inline-block w-1.5 h-1.5 rounded-full bg-primary"
                />
                Trusted by 500+ institutes across India
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
            >
              <span className="text-foreground">Manage Student Fees</span>
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #A855F7 100%)",
                }}
              >
                with Confidence
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
            >
              The premium fee management portal built for modern coaching
              institutes. Automate collections, track dues, accept UPI payments,
              and send smart reminders — all from one beautiful dashboard.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-14"
            >
              <Link to="/login">
                <Button
                  size="lg"
                  className="gradient-accent text-white shadow-elevated hover:opacity-90 transition-fast px-8 h-12 text-base"
                  data-ocid="hero.get_started_button"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => scrollTo("features")}
                data-ocid="hero.view_demo_button"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 text-base px-8 border-border/60 hover:border-primary/50 transition-fast"
                >
                  View Features
                  <ChevronDown className="ml-2 w-4 h-4" />
                </Button>
              </button>
            </motion.div>

            {/* Hero stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mb-16"
            >
              {[
                { value: "10,000+", label: "Students managed" },
                { value: "₹50L+", label: "Fees collected" },
                { value: "99.9%", label: "Uptime" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="font-display font-bold text-foreground">
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Dashboard preview card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative max-w-5xl mx-auto"
              data-ocid="hero.dashboard_preview"
            >
              {/* Glow behind card */}
              <div
                className="absolute inset-0 rounded-3xl blur-2xl opacity-20"
                style={{
                  background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                }}
              />
              <div className="relative glass-card rounded-3xl overflow-hidden shadow-elevated border border-border/40">
                {/* Browser chrome bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/40 border-b border-border/30">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                    <div className="w-3 h-3 rounded-full bg-green-400/70" />
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="bg-muted/60 rounded-md px-4 py-1 text-xs text-muted-foreground font-mono">
                      app.akshayclasses.com/admin/dashboard
                    </div>
                  </div>
                </div>
                <img
                  src="/assets/generated/hero-dashboard-preview.dim_1200x700.jpg"
                  alt="Akshay Classes Dashboard Preview"
                  className="w-full object-cover"
                  loading="eager"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Statistics Section ── */}
      <section
        className="bg-muted/30 border-y border-border/30 py-16 px-4"
        id="about"
      >
        <div className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest mb-10"
          >
            Trusted by institutes across India
          </motion.p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <p
                  className="font-display text-4xl font-extrabold bg-clip-text text-transparent mb-2"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #4F46E5, #7C3AED)",
                  }}
                >
                  <AnimatedCounter
                    end={stat.end}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimal={stat.decimal}
                  />
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="py-24 px-4 bg-background" id="features">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/25 px-4 py-1">
              Everything you need
            </Badge>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
              One portal, complete control
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From student onboarding to fee collection and analytics — Akshay
              Classes has every tool a modern institute needs.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(
              ({ icon: Icon, color, iconColor, title, description }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="glass-card rounded-2xl p-6 shadow-soft cursor-default group transition-fast"
                  data-ocid={`features.card.${i + 1}`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-soft`}
                  >
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </motion.div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── Benefits Section ── */}
      <section className="py-24 px-4 bg-muted/20 border-y border-border/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Built for everyone
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Whether you're an institute admin or a student, the portal
              delivers a premium experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Admins */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card rounded-3xl p-8 shadow-soft"
              data-ocid="benefits.admin_card"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-foreground">
                    For Admins
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Institute management made simple
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                {ADMIN_BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-indigo-500" />
                    </div>
                    <span className="text-sm text-foreground">{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/login" search={{ role: "admin" }}>
                  <Button
                    className="gradient-accent text-white w-full"
                    data-ocid="benefits.admin_cta"
                  >
                    Start as Admin
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* For Students */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-card rounded-3xl p-8 shadow-soft"
              data-ocid="benefits.student_card"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-foreground">
                    For Students
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Transparent and hassle-free fees
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                {STUDENT_BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-purple-500" />
                    </div>
                    <span className="text-sm text-foreground">{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/login" search={{ role: "student" }}>
                  <Button
                    variant="outline"
                    className="w-full border-border/60 hover:border-purple-500/50 transition-fast"
                    data-ocid="benefits.student_cta"
                  >
                    Student Portal
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Testimonials Section ── */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/25 px-4 py-1">
              Testimonials
            </Badge>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Loved by institute admins
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Hundreds of coaching centres have streamlined their fee operations
              with Akshay Classes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="glass-card rounded-2xl p-6 shadow-soft flex flex-col"
                data-ocid={`testimonials.card.${i + 1}`}
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, idx) => (
                    <Star
                      key={`star-${t.name}-${idx}`}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm text-white flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                    }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="py-24 px-4 bg-muted/20 border-y border-border/30">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/25 px-4 py-1">
              FAQ
            </Badge>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Common questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about the portal.
            </p>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section className="py-24 px-4 bg-background" id="pricing">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/25 px-4 py-1">
              Pricing
            </Badge>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Start free, scale as your institute grows. No hidden charges.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className={`rounded-3xl p-7 relative ${
                  plan.highlight ? "shadow-elevated" : "glass-card shadow-soft"
                }`}
                style={
                  plan.highlight
                    ? {
                        background:
                          "linear-gradient(135deg, oklch(var(--card) / 0.95), oklch(var(--card) / 0.85))",
                        border: "2px solid transparent",
                        backgroundClip: "padding-box",
                        boxShadow:
                          "0 0 0 2px #7C3AED60, 0 20px 40px rgba(124, 58, 237, 0.15)",
                      }
                    : {}
                }
                data-ocid={`pricing.card.${i + 1}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 px-4 py-1 shadow-lg">
                      <Zap className="w-3 h-3 mr-1" /> Most Popular
                    </Badge>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-display font-bold text-xl text-foreground mb-1">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span
                      className="font-display text-4xl font-extrabold"
                      style={
                        plan.highlight
                          ? {
                              backgroundImage:
                                "linear-gradient(135deg, #4F46E5, #7C3AED)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                            }
                          : {}
                      }
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm text-muted-foreground">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/login">
                  <Button
                    className={`w-full ${
                      plan.highlight
                        ? "gradient-accent text-white shadow-soft hover:opacity-90"
                        : ""
                    }`}
                    variant={plan.highlight ? "default" : "outline"}
                    data-ocid={`pricing.cta.${i + 1}`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact / CTA Section ── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl p-12 text-center relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #A855F7 100%)",
            }}
          >
            {/* Decorative blobs */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />

            <div className="relative">
              <Badge className="mb-6 bg-white/20 text-white border-white/30 px-4 py-1">
                <Smartphone className="w-3.5 h-3.5 mr-1.5" />
                Ready to get started?
              </Badge>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
                Streamline your fee collection today
              </h2>
              <p className="text-white/80 text-lg max-w-xl mx-auto mb-10">
                Join 500+ institutes already managing fees effortlessly with
                Akshay Classes portal.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <div className="relative flex-1 w-full">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/15 border border-white/25 text-white placeholder:text-white/50 text-sm focus:outline-none focus:border-white/50 focus:bg-white/20 transition-fast"
                    data-ocid="cta.email_input"
                  />
                </div>
                <Button
                  onClick={() => navigate({ to: "/login" })}
                  className="bg-white text-purple-700 hover:bg-white/90 font-semibold px-6 h-11 flex-shrink-0 shadow-elevated"
                  data-ocid="cta.submit_button"
                >
                  Get Started Free
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-card border-t border-border/50 pt-12 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl gradient-accent shadow-soft flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-foreground">
                    Akshay Classes
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Fee Management Portal
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The modern fee management portal for coaching institutes across
                India.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-display font-semibold text-sm text-foreground mb-4">
                Product
              </h4>
              <ul className="space-y-2.5">
                {["Features", "Pricing", "Dashboard Preview", "Changelog"].map(
                  (item) => (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() =>
                          scrollTo(item === "Features" ? "features" : "pricing")
                        }
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item}
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-display font-semibold text-sm text-foreground mb-4">
                Company
              </h4>
              <ul className="space-y-2.5">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-display font-semibold text-sm text-foreground mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5">
                {[
                  "Privacy Policy",
                  "Terms of Service",
                  "Cookie Policy",
                  "GDPR",
                ].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator className="mb-6 opacity-40" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span>
                &copy; {new Date().getFullYear()} Akshay Classes. All rights
                reserved.
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Built with love using</span>
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
