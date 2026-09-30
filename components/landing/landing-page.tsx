"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  Headset,
  MessageSquareText,
  Phone,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/brand/logo";
import { SiteHeader } from "@/components/landing/site-header";
import { HeroPreview } from "@/components/landing/hero-preview";
import { IndustryTaskbar } from "@/components/landing/industry-taskbar";
import { MarketPulse } from "@/components/dashboard/market-pulse";
import { MovingSquares } from "@/components/effects/moving-squares";
import { EchoCore3D } from "@/components/effects/echo-core-3d";

const features = [
  {
    title: "AI Call Handling",
    body: "Answer every inbound line, qualify the caller, and never let a lead hit voicemail.",
    icon: Phone,
    href: "/calls",
    cta: "Open live call log",
  },
  {
    title: "Smart Booking",
    body: "Pull live Google Calendar slots, prevent double-booking, and confirm by SMS instantly.",
    icon: CalendarDays,
    href: "/integrations?connect=google_calendar",
    cta: "Connect calendar",
  },
  {
    title: "CRM Write-back",
    body: "Push transcripts, summaries, tags, and notes into GoHighLevel the moment a call ends.",
    icon: Workflow,
    href: "/integrations?connect=ghl",
    cta: "Connect GoHighLevel",
  },
  {
    title: "Outbound Callbacks",
    body: "When a form is submitted, Echo dials the lead in seconds and continues the conversation.",
    icon: Headset,
    href: "/dashboard",
    cta: "Run a playbook",
  },
  {
    title: "SMS Follow-ups",
    body: "Automatic confirmations, reminders, and after-hours replies keep the pipeline moving.",
    icon: MessageSquareText,
    href: "/dashboard",
    cta: "Open Mission Control",
  },
  {
    title: "Live Analytics",
    body: "See sentiment, booked appointments, and sync health on one Mission Control screen.",
    icon: BarChart3,
    href: "/dashboard",
    cta: "Open Mission Control",
  },
];

const steps = [
  { n: "1", title: "Sign Up", body: "Create your free account." },
  { n: "2", title: "Setup", body: "Add hours, services, and knowledge." },
  { n: "3", title: "Get Number", body: "Connect Twilio or keep your DID." },
  { n: "4", title: "Go Live", body: "Echo answers in under a minute." },
];

const plans = [
  {
    name: "Starter",
    price: "$79",
    note: "Solo offices",
    items: ["1 local number", "200 minutes", "Calendar booking", "Email summaries"],
  },
  {
    name: "Growth",
    price: "$199",
    note: "Most popular",
    featured: true,
    items: ["3 numbers", "1,000 minutes", "GHL + SMS sync", "Sentiment scoring", "Outbound forms"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    note: "Multi-location",
    items: ["Unlimited seats", "SIP / Twilio BYOC", "Custom voices", "Priority routing"],
  },
];

const quotes = [
  {
    quote: "We stopped losing Saturday leads. Echo books them before I even unlock the office.",
    name: "Dr. Lena Park",
    role: "Northline Dental",
  },
  {
    quote: "The CRM notes are better than my old receptionist. Tags, summary, next step — every call.",
    name: "Marcus Hale",
    role: "Hale HVAC",
  },
  {
    quote: "After-hours coverage used to cost us a service. Now it’s just Echo on the line.",
    name: "Sofia Alvarez",
    role: "Vista Medspa",
  },
];

const faqs = [
  {
    q: "Will callers know it’s AI?",
    a: "Echo introduces itself as your virtual receptionist. Most callers treat it like a sharp front-desk coordinator — and you can transfer to a person at any time.",
  },
  {
    q: "Can it use our existing phone number?",
    a: "Yes. Forward your current number to Echo, or provision a new Twilio DID from the dashboard.",
  },
  {
    q: "How does it avoid double-booking?",
    a: "It reads live Google Calendar availability during the call and only offers open slots. Confirmations go out by SMS immediately.",
  },
  {
    q: "What happens after each call?",
    a: "Transcript, AI summary, sentiment, and tags are written to your CRM. Booked calls also trigger a confirmation text.",
  },
];

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);
  const [industry, setIndustry] = useState("home");

  return (
    <div className="relative min-h-screen overflow-hidden bg-forest text-slate-100">
      <SiteHeader />

      <main>
        <section className="relative mx-auto max-w-6xl overflow-hidden px-6 pb-10 pt-12 sm:pt-16">
          <div className="absolute inset-0">
            <MovingSquares />
          </div>
          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-white/5 px-3 py-1 text-xs font-medium text-gold-400 shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Voice + CRM automation for local businesses
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl"
              >
                Your AI-Powered Receptionist
                <span className="shimmer-text mt-2 block">Available 24/7</span>
              </motion.h1>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg lg:mx-0">
                Never miss a customer call again. Echo answers, qualifies, books the
                calendar, and updates your CRM while you run the business.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Button asChild size="lg" className="h-11 min-w-[160px] bg-gradient-to-r from-gold-600 to-gold-400 px-6 text-forest-900 shadow-lg shadow-gold/25">
                  <Link href="/signup">Launch Console</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-11 min-w-[140px] border-white/30 bg-white/5 px-6 text-white hover:bg-white/10"
                >
                  <Link href="/demo">View Demo</Link>
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 lg:justify-start">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-success-500" /> Encrypted transcripts
                </span>
                <span>No hardware to install</span>
                <span>Go live in minutes</span>
              </div>
            </div>
            <EchoCore3D className="mx-auto h-[340px] w-full max-w-lg lg:h-[460px]" />
          </div>
          <div className="relative z-10">
            <HeroPreview />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <p className="mb-6 text-center text-xs uppercase tracking-[0.2em] text-slate-500">
            Built for teams already on
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { name: "Vapi", href: "/settings/vapi" },
              { name: "Twilio", href: "/integrations?connect=twilio" },
              { name: "GoHighLevel", href: "/integrations?connect=ghl" },
              { name: "Google Calendar", href: "/integrations?connect=google_calendar" },
            ].map((partner) => (
              <Link
                key={partner.name}
                href={partner.href}
                className="rounded-xl border border-white/15 bg-white/5 py-3 text-center text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-gold-400/50 hover:bg-white/10 hover:shadow-md"
              >
                {partner.name}
              </Link>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl scroll-mt-28 px-6 pb-24">
          <div className="mb-12 text-center">
            <p className="text-sm text-slate-400">Powerful features for modern businesses</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">
              Everything You Need
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={feature.href} className="block h-full">
                  <Card className="h-full border-white/10 bg-white/[0.06] shadow-sm transition-shadow hover:border-gold-400/40 hover:shadow-lg">
                    <CardContent className="px-7 py-8">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-400/15 text-gold-400">
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.body}</p>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gold-400">
                        {feature.cta} →
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="mb-10 text-center">
            <p className="text-sm text-slate-400">Get started in minutes</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-white">How It Works</h2>
          </div>
          <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="absolute left-[12%] right-[12%] top-6 hidden h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent lg:block" />
            {steps.map((step, index) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-gold-600 to-gold-400 text-lg font-semibold text-forest-900 shadow-lg shadow-gold/30">
                  {step.n}
                </div>
                <h3 className="mt-4 font-semibold text-white">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="automation" className="mx-auto max-w-6xl scroll-mt-28 px-6 pb-24">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-forest-800 via-forest to-forest-900 p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Automation</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-white">Calls, calendar, CRM — one loop</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
              Echo answers, qualifies, books an open slot, texts the customer, and writes the CRM.
              Open Mission Control to simulate a call or run the playbook live.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="bg-gradient-to-r from-gold-600 to-gold-400 text-forest-900">
                <Link href="/dashboard">Open Mission Control</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                <Link href="/demo">Watch the live demo</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="industries" className="relative z-10 mx-auto max-w-6xl scroll-mt-32 px-6 pb-24">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-sm text-slate-400">Industries</p>
              <h2 className="mt-1 font-display text-3xl font-bold text-white">What Echo handles in your industry</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Home Services, Dental, Medspa, Legal, and Real Estate — tap a
                rectangle to see the receptionist tasks Echo runs on every call.
              </p>
            </div>
            <IndustryTaskbar cinematic value={industry} onChange={setIndustry} />
            <div className="mt-6">
              <MarketPulse cinematic industry={industry} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <h2 className="mb-10 text-center font-display text-3xl font-bold text-white">
            Loved by front desks that never sleep
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {quotes.map((item, index) => (
              <motion.blockquote
                key={item.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <p className="text-sm leading-relaxed text-slate-300">“{item.quote}”</p>
                <footer className="mt-5 text-sm">
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-slate-400">{item.role}</p>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl scroll-mt-28 px-6 pb-24">
          <div className="mb-12 text-center">
            <p className="text-sm text-slate-400">Simple pricing</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-white">Plans that grow with call volume</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.featured
                    ? "relative border-gold-400/40 bg-white/[0.08] shadow-xl shadow-gold/10"
                    : "border-white/10 bg-white/[0.04]"
                }
              >
                {plan.featured && (
                  <Badge className="absolute -top-3 left-6" variant="info">
                    {plan.note}
                  </Badge>
                )}
                <CardContent className="px-6 py-8">
                  <p className="text-sm text-slate-400">{plan.name}</p>
                  <p className="mt-2 text-4xl font-bold text-white">
                    {plan.price}
                    {plan.price.startsWith("$") && (
                      <span className="text-base font-medium text-slate-500">/mo</span>
                    )}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {plan.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                        <Check className="h-4 w-4 text-success-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="mt-8 w-full" variant={plan.featured ? "default" : "outline"}>
                    <Link href="/signup" className={plan.featured ? "" : "border-white/20 text-white"}>
                      Start For Free
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-3xl px-6 pb-24">
          <h2 className="mb-8 text-center font-display text-3xl font-bold text-white">Questions teams ask first</h2>
          <div className="space-y-3">
            {faqs.map((item, index) => {
              const open = openFaq === index;
              return (
                <div key={item.q} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? -1 : index)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-white"
                  >
                    {item.q}
                    <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open && <p className="px-5 pb-4 text-sm leading-relaxed text-slate-400">{item.a}</p>}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="relative overflow-hidden rounded-3xl bg-forest-800 px-8 py-12 text-white md:px-12">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-500/40 blur-2xl animate-glow-shift" />
            <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="font-display text-3xl font-bold">Ready to never miss another lead?</h2>
                <p className="mt-3 text-sm text-slate-300">
                  Stand up Echo, connect your calendar, and let the receptionist go live tonight.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
                <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                  <Link href="/signup">Start For Free</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                  <Link href="/demo">Watch the live demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-6 py-10 text-sm text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <BrandLogo size="sm" inverted />
            <p>© 2024 EchoReceptionist. All rights reserved.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/demo" className="hover:text-white">Demo</Link>
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
