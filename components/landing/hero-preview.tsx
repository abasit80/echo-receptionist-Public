"use client";

import { motion } from "framer-motion";
import { PhoneIncoming } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CallWaveform } from "@/components/dashboard/call-waveform";

export function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="relative mx-auto mt-14 w-full max-w-3xl"
    >
      <div className="absolute -inset-4 rounded-3xl bg-gold-500/20 blur-2xl animate-glow-shift" />
      <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-panel backdrop-blur">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-success-500" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-success-500" />
            </span>
            <p className="text-sm font-semibold">Live receptionist</p>
          </div>
          <Badge variant="success">Call in progress</Badge>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <PhoneIncoming className="h-4 w-4 text-success-600" />
              Maya Chen · (415) 555-0182
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              “I need a same-day consult — my insurance was denied.”
            </p>
            <div className="mt-4">
              <CallWaveform />
            </div>
          </div>
          <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-left text-xs">
            <p className="font-semibold text-slate-700">AI is taking action</p>
            {[
              "Sentiment: Urgent",
              "Offer 3:30 with Dr. Patel",
              "Sync contact to GHL",
              "Send SMS confirmation",
            ].map((item, index) => (
              <motion.p
                key={item}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.18 }}
                className="rounded-md bg-white px-2 py-1.5 text-slate-600 shadow-sm"
              >
                {item}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
