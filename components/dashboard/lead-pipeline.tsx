"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useIndustry } from "@/components/layout/industry-context";
import { filterByIndustry } from "@/lib/data/stats";
import { formatPhone } from "@/lib/utils";
import type { Lead, LeadStage } from "@/lib/types";

const columns: { id: LeadStage; title: string }[] = [
  { id: "new", title: "New" },
  { id: "contacted", title: "Contacted" },
  { id: "qualified", title: "Qualified" },
  { id: "booked", title: "Booked" },
  { id: "transferred", title: "Transferred" },
];

export function LeadPipeline({
  leads: initialLeads,
  controlled = false,
}: {
  leads: Lead[];
  controlled?: boolean;
}) {
  const { industry } = useIndustry();
  const [leads, setLeads] = useState(initialLeads);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<LeadStage | null>(null);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const dragged = useRef(false);

  useEffect(() => {
    if (controlled) setLeads(initialLeads);
  }, [controlled, initialLeads]);

  useEffect(() => {
    if (controlled) return;
    let cancelled = false;
    async function refresh() {
      const response = await fetch("/api/leads", { cache: "no-store" });
      if (!response.ok || cancelled) return;
      setLeads(await response.json());
    }
    refresh();
    const id = window.setInterval(refresh, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [controlled]);

  useEffect(() => {
    if (!selected) return;
    const next = leads.find((lead) => lead.id === selected.id);
    if (next) setSelected(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keep drawer in sync with board moves
  }, [leads]);

  const visible = useMemo(
    () => filterByIndustry(leads, industry),
    [leads, industry]
  );

  async function moveLead(id: string, stage: LeadStage, extra?: { notes?: string }) {
    setLeads((current) =>
      current.map((lead) =>
        lead.id === id
          ? { ...lead, stage, notes: extra?.notes ?? lead.notes, updated_at: new Date().toISOString() }
          : lead
      )
    );
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage, notes: extra?.notes }),
    });
  }

  async function saveNotes() {
    if (!selected) return;
    setSaving(true);
    await moveLead(selected.id, selected.stage, { notes });
    setSaving(false);
  }

  function openLead(lead: Lead) {
    if (dragged.current) return;
    setSelected(lead);
    setNotes(lead.notes ?? "");
  }

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-5">
        {columns.map((column, index) => {
          const items = visible.filter((lead) => lead.stage === column.id);
          return (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onDragOver={(event) => {
                event.preventDefault();
                setOver(column.id);
              }}
              onDragLeave={() => setOver((current) => (current === column.id ? null : current))}
              onDrop={(event) => {
                event.preventDefault();
                const id = event.dataTransfer.getData("text/lead-id");
                setOver(null);
                setDragging(null);
                if (id) void moveLead(id, column.id);
              }}
            >
              <Card
                className={`h-full bg-muted/50 transition-all ${
                  over === column.id ? "ring-2 ring-gold-500/60" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{column.title}</CardTitle>
                    <Badge variant="muted">{items.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="min-h-[140px] space-y-3">
                  {items.map((lead) => (
                    <button
                      key={lead.id}
                      type="button"
                      draggable
                      onClick={() => openLead(lead)}
                      onDragStart={(event) => {
                        dragged.current = true;
                        event.dataTransfer.setData("text/lead-id", lead.id);
                        event.dataTransfer.effectAllowed = "move";
                        setDragging(lead.id);
                      }}
                      onDragEnd={() => {
                        setDragging(null);
                        setOver(null);
                        window.setTimeout(() => {
                          dragged.current = false;
                        }, 50);
                      }}
                      className={`w-full cursor-pointer rounded-lg border bg-card p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-md ${
                        dragging === lead.id ? "opacity-50" : ""
                      } ${selected?.id === lead.id ? "border-gold-500 ring-1 ring-gold-400/50" : ""}`}
                    >
                      <p className="text-sm font-medium">{lead.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{lead.source}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{lead.notes}</p>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="font-medium text-gold-700">Score {lead.score}</span>
                        <span className="text-muted-foreground">{lead.phone.slice(-4)}</span>
                      </div>
                    </button>
                  ))}
                  {!items.length && (
                    <p className="text-xs text-muted-foreground">
                      {over === column.id ? "Drop lead here" : "No leads in this stage."}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex justify-end bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.aside
              initial={{ x: 360 }}
              animate={{ x: 0 }}
              exit={{ x: 360 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(event) => event.stopPropagation()}
              className="h-full w-full max-w-md overflow-y-auto border-l bg-card p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Lead detail</p>
                  <h3 className="mt-1 text-lg font-semibold">{selected.name}</h3>
                  <p className="text-sm text-muted-foreground">{formatPhone(selected.phone)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelected(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 grid gap-2 text-sm">
                <p><span className="text-muted-foreground">Source:</span> {selected.source}</p>
                <p><span className="text-muted-foreground">Email:</span> {selected.email ?? "—"}</p>
                <p><span className="text-muted-foreground">Score:</span> {selected.score}</p>
                <p><span className="text-muted-foreground">Industry:</span> {selected.industry ?? "—"}</p>
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Move stage</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {columns.map((column) => (
                  <Button
                    key={column.id}
                    type="button"
                    size="sm"
                    variant={selected.stage === column.id ? "default" : "outline"}
                    onClick={() => void moveLead(selected.id, column.id)}
                  >
                    {column.title}
                  </Button>
                ))}
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</p>
              <Textarea
                className="mt-2"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
              <Button className="mt-3 w-full" onClick={() => void saveNotes()} disabled={saving}>
                {saving ? "Saving…" : "Save notes"}
              </Button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
