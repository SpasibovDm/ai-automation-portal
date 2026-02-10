import React from "react";
import { Link } from "react-router-dom";

import {
  BotIcon,
  LineChartIcon,
  MailIcon,
  MoonIcon,
  SparklesIcon,
  SunIcon,
  UsersIcon,
} from "../components/Icons";
import { useTheme } from "../context/ThemeContext";

const features = [
  {
    title: "Inbox automation",
    description: "Route, tag, and prioritize every inbound message instantly.",
    icon: MailIcon,
  },
  {
    title: "Lead classification",
    description: "Score and segment leads with AI so the best ones surface fast.",
    icon: UsersIcon,
  },
  {
    title: "AI replies",
    description: "Draft responses that feel human, on brand, and consistent.",
    icon: SparklesIcon,
  },
  {
    title: "Analytics dashboard",
    description: "Track volume, coverage, and conversion in one view.",
    icon: LineChartIcon,
  },
];

const steps = [
  {
    title: "Connect your inbox",
    description: "Sync Gmail or Microsoft 365 and import existing threads.",
  },
  {
    title: "Automate your pipeline",
    description: "AI tags, routes, and drafts replies with your playbooks.",
  },
  {
    title: "Close more revenue",
    description: "Prioritize high-intent leads and measure every outcome.",
  },
];

const Landing = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-500/20" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/10" />
      <header className="relative z-10">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <BotIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                AI Automation Portal
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Revenue Automation</p>
            </div>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <Link className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300" to="/demo">
              Try demo
            </Link>
            <Link className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300" to="/login">
              Sign in
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
              to="/register"
            >
              Get started free
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
              AI Automation Portal
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 dark:text-white md:text-5xl">
              Automate inbox, manage leads, and reply with AI — in one dashboard.
            </h1>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
              AI Automation Portal unifies inbound lead capture, inbox workflows, and AI follow-ups so your revenue team never misses a high-intent opportunity.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                to="/demo"
              >
                Try demo
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                to="/register"
              >
                Get started free
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">Unified workspace</p>
                <p className="mt-1">One dashboard for leads, inbox, and AI follow-ups.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">Trusted automation</p>
                <p className="mt-1">AI drafts stay on-brand with your templates and rules.</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -right-8 top-6 h-64 w-64 rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-500/20" />
            <div className="relative rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Live automation pulse</p>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200">
                  99.9% uptime
                </span>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Inbox</p>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">42 new conversations triaged</p>
                  <p className="mt-1 text-xs">AI grouped high-intent buyers and support escalations.</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Leads</p>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">18 leads scored today</p>
                  <p className="mt-1 text-xs">Auto-assigning to the right rep and playbook.</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">AI Replies</p>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">96 responses ready</p>
                  <p className="mt-1 text-xs">Personalized drafts for sales, support, and partners.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-10">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white/90 p-5 text-sm text-slate-600 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/80">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
              Guided onboarding
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
              Understand the product in 30 seconds
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              The demo dashboard is preloaded with real-world lead flow so your team can see value immediately.
            </p>
            <div className="mt-6 space-y-4">
              {steps.map((step, index) => (
                <div key={step.title} className="flex items-start gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{step.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-lg dark:border-slate-800">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Trusted pipeline</p>
            <h3 className="mt-3 text-2xl font-semibold">Built for modern revenue teams</h3>
            <p className="mt-2 text-sm text-indigo-100">
              Security-forward infrastructure with audit-ready reporting. Stay aligned with leadership and keep every touchpoint accountable.
            </p>
            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm font-semibold">SOC2-ready controls</p>
                <p className="text-xs text-indigo-100">Role-based access and audit trails out of the box.</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm font-semibold">Instant visibility</p>
                <p className="text-xs text-indigo-100">Live dashboards for pipeline health and response times.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/80">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Ready to automate your revenue inbox?
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Start with a demo, then activate your workspace when you are ready.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                to="/demo"
              >
                Try demo
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                to="/register"
              >
                Get started free
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
