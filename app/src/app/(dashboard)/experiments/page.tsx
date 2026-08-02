"use client"

import { useState } from "react"
import Link from "next/link"
import { useExperiments } from "@/hooks/use-experiments"
import { 
  experimentStatusLabels, 
  experimentStatusColors, 
  experimentTypeLabels,
  experimentImpactColors 
} from "@/lib/constants"
import { cn } from "@/lib/utils"
import { 
  FlaskConical, 
  Plus, 
  Terminal, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  Cpu,
  Layers
} from "lucide-react"

export default function ExperimentsLabsPage() {
  const { experiments, loading, error } = useExperiments()
  const [filter, setFilter] = useState<string>("all")

  const filtered = (experiments || []).filter((exp) => {
    if (filter === "all") return true
    return exp.status === filter
  })

  const activeCount = (experiments || []).filter((e) => e.status === "running").length
  const totalCount = (experiments || []).length

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-mono text-zinc-100 pb-12 select-none">
      {/* Top Header Command Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">
            /// SYS.READ: /VAR/LOG/EXPERIMENTS
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-sans uppercase">
              LABS
            </h1>
            <span className="text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded-sm">
              [ ALPHA_PROTOCOLS ]
            </span>
          </div>
        </div>

        {/* Right Status & Init Button */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-sm text-xs">
            <span className="text-zinc-500">[ ACTIVE_TESTS:</span>
            <span className="text-emerald-400 font-bold">{activeCount.toString().padStart(2, "0")}</span>
            <span className="text-zinc-500">]</span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-500">MEM_USAGE:</span>
            <span className="text-zinc-300 font-bold">84%</span>
          </div>

          <Link
            href="/experiments/new"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-xs uppercase px-4 py-2.5 rounded-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          >
            <Plus className="w-4 h-4" />
            <span>INIT_PROTOCOL</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800/60 pb-3">
        {[
          { id: "all", label: "ALL_TESTS", count: totalCount },
          { id: "running", label: "RUNNING", count: activeCount },
          { id: "queued", label: "QUEUED", count: (experiments || []).filter(e => e.status === "queued").length },
          { id: "completed", label: "COMPLETED", count: (experiments || []).filter(e => e.status === "completed").length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm border transition-all flex items-center gap-2",
              filter === tab.id
                ? "bg-zinc-100 text-zinc-950 border-white shadow-sm"
                : "text-zinc-400 border-transparent hover:text-white hover:bg-zinc-900"
            )}
          >
            <span>{tab.label}</span>
            <span className={cn(
              "text-[10px] px-1.5 py-0.2 rounded-sm",
              filter === tab.id ? "bg-zinc-300 text-zinc-950 font-black" : "bg-zinc-900 text-zinc-500"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-72 bg-zinc-900/60 border border-zinc-800 rounded-sm" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-zinc-950 border border-zinc-800 rounded-sm">
          <FlaskConical className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <div className="text-sm font-bold text-zinc-300 uppercase tracking-widest">
            NO EXPERIMENTS FOUND IN STREAM
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Initialize an A/B or Multivariate protocol to begin structured hypothesis testing.
          </p>
          <Link
            href="/experiments/new"
            className="inline-flex items-center gap-2 mt-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold px-4 py-2 rounded-sm uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>INIT_PROTOCOL</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN (8 cols): Primary Protocols Stream */}
          <div className="lg:col-span-8 space-y-6">
            {filtered.map((exp) => {
              const isRunning = exp.status === "running"
              const isCompleted = exp.status === "completed"
              const conf = exp.confidence_score || 0

              return (
                <div
                  key={exp.id}
                  className={cn(
                    "bg-zinc-950/90 border rounded-sm transition-all shadow-xl overflow-hidden",
                    isRunning 
                      ? "border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.07)]" 
                      : "border-zinc-800 hover:border-zinc-700"
                  )}
                >
                  {/* Card Header Bar */}
                  <div className="p-4 bg-zinc-900/40 border-b border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-sm border uppercase tracking-wider",
                        experimentStatusColors[exp.status] || ""
                      )}>
                        {experimentStatusLabels[exp.status] || exp.status}
                      </span>
                      <span className="text-xs font-bold text-zinc-400">
                        {exp.test_code}
                      </span>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-sm bg-zinc-900 text-zinc-400 border border-zinc-800">
                        {experimentTypeLabels[exp.type] || exp.type}
                      </span>
                    </div>

                    <Link
                      href={`/experiments/${exp.id}`}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline"
                    >
                      <span>VIEW_PROTOCOL</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-6">
                    <div>
                      <Link
                        href={`/experiments/${exp.id}`}
                        className="text-xl sm:text-2xl font-black tracking-tight text-white hover:text-emerald-400 font-sans uppercase transition-colors"
                      >
                        {exp.name}
                      </Link>
                      <div className="text-xs text-zinc-500 mt-1">
                        ID: {exp.test_code} // PRIMARY VECTOR: <span className="text-zinc-300 uppercase">{exp.primary_metric}</span> // TARGET LIFT: <span className="text-emerald-400 font-bold">+{exp.target_lift}%</span>
                      </div>
                    </div>

                    {/* Query Hypothesis + Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 border-t border-zinc-800/60">
                      {/* Left: Terminal Query Box (7 cols) */}
                      <div className="md:col-span-7 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                          QUERY // HYPOTHESIS
                        </div>
                        <div className="p-3.5 rounded-sm bg-black border border-zinc-800 text-xs text-emerald-400/90 whitespace-pre-wrap leading-relaxed overflow-x-auto shadow-inner">
                          {exp.hypothesis_query}
                        </div>
                      </div>

                      {/* Right: Current State Telemetry (5 cols) */}
                      <div className="md:col-span-5 space-y-2.5 text-xs">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                          CURRENT_STATE
                        </div>
                        <div className="p-3.5 rounded-sm bg-zinc-900/50 border border-zinc-800/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500">TRAFFIC_SPLIT:</span>
                            <span className="font-bold text-zinc-200">{exp.traffic_split || "50/50"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500">SAMPLE_SIZE:</span>
                            <span className="font-bold text-zinc-200">{exp.sample_size?.toLocaleString() || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500">RUNTIME:</span>
                            <span className="font-bold text-zinc-200">{exp.runtime_hours || 0} hrs</span>
                          </div>
                          {exp.actual_lift ? (
                            <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                              <span className="text-zinc-500">LIFT_OBSERVED:</span>
                              <span className="font-bold text-emerald-400">+{exp.actual_lift}%</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Statistical Confidence Meter */}
                    <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-zinc-500 uppercase tracking-wider">CONFIDENCE_SCORE</span>
                        <span className="text-emerald-400">{conf}% [ ++ ]</span>
                      </div>
                      <div className="w-full h-3 bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden p-0.5">
                        <div
                          className={cn(
                            "h-full rounded-sm transition-all duration-700",
                            conf >= 95 
                              ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]" 
                              : conf >= 75 
                              ? "bg-gradient-to-r from-emerald-600 to-emerald-400" 
                              : "bg-gradient-to-r from-amber-600 to-amber-500"
                          )}
                          style={{ width: `${Math.min(conf, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Decision Protocol Log Telemetry Box */}
                    {exp.decision_protocol_notes && exp.decision_protocol_notes.length > 0 && (
                      <div className="p-3.5 rounded-sm bg-black/80 border border-zinc-800 text-xs space-y-1.5">
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                          /// DECISION_PROTOCOL_STREAM
                        </div>
                        {exp.decision_protocol_notes.map((note, idx) => {
                          const isAlert = note.startsWith("!") || note.includes("degradation") || note.includes("WARN")
                          const isSuccess = note.includes("[SUCCESS]")
                          return (
                            <div
                              key={idx}
                              className={cn(
                                "leading-relaxed flex items-start gap-2",
                                isAlert 
                                  ? "text-rose-400" 
                                  : isSuccess 
                                  ? "text-emerald-400 font-bold" 
                                  : "text-zinc-300"
                              )}
                            >
                              <span className="select-none font-bold shrink-0">{isAlert ? "!" : ">"}</span>
                              <span>{note.replace(/^([!>]\s*)/, "")}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* RIGHT COLUMN (4 cols): Secondary Specimen Feed & Telemetry Ticker */}
          <div className="lg:col-span-4 space-y-6">
            {/* Queued / Secondary Test Box */}
            <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  [ QUEUED_PROTOCOLS ]
                </span>
                <span className="text-xs bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-zinc-400">
                  01
                </span>
              </div>

              <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-sm space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-bold">[ QUEUED ]</span>
                  <span className="text-zinc-500">ID: MVT-0x92C</span>
                </div>
                <div className="text-base font-black text-white uppercase font-sans">
                  SUBJECT_LINE_SYNTAX
                </div>
                <div className="text-xs text-zinc-500 space-y-1 pt-2 border-t border-zinc-800/60">
                  <div className="flex justify-between">
                    <span>TEST_TYPE:</span>
                    <span className="text-zinc-300">MULTIVARIATE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VECTORS:</span>
                    <span className="text-zinc-300">4 VARIATIONS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>EST_IMPACT:</span>
                    <span className="text-emerald-400 font-bold">HIGH</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Telemetry System Ticker Card */}
            <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-sm space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    RECENT_TELEMETRY_LOG
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500">LIVE_TAIL...</span>
              </div>

              <div className="space-y-2 text-[11px] text-zinc-400 font-mono leading-relaxed">
                <div>
                  <span className="text-zinc-600">[10:42:01]</span>{" "}
                  <span className="text-zinc-300 font-bold">TEST_COMPLETE:</span> /UI/NAV_PLACEMENT -&gt; RESULT: <span className="text-amber-400">INCONCLUSIVE (NO_LIFT)</span>
                </div>
                <div>
                  <span className="text-zinc-600">[10:15:33]</span>{" "}
                  <span className="text-rose-400 font-bold">WARN:</span> DATA_LOSS DETECTED IN STREAM 0x9A <span className="text-zinc-500">(RETRYING...)</span>
                </div>
                <div>
                  <span className="text-zinc-600">[09:55:12]</span>{" "}
                  <span className="text-emerald-400 font-bold">SYSTEM:</span> NEW SPECIMEN BATCH INGESTED. N=5000
                </div>
                <div>
                  <span className="text-zinc-600">[08:30:00]</span>{" "}
                  <span className="text-zinc-300 font-bold">TEST_DEPLOYED:</span> /COPY/HERO_TAGLINE -&gt; <span className="text-emerald-400">10% ROLLOUT STARTED</span>
                </div>
                <div>
                  <span className="text-zinc-600">[08:29:55]</span>{" "}
                  <span className="text-zinc-500">SYS_INIT: DAEMON RESTARTED SUCCESSFULLY</span>
                </div>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="p-5 bg-gradient-to-br from-emerald-950/20 to-black border border-emerald-500/30 rounded-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                ⚡ STRUCTURED GROWTH PROTOCOL
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Every A/B and multivariate protocol in MIOS is automatically linked to your permanent compounding Learnings database.
              </p>
              <Link
                href="/experiments/new"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase px-4 py-2.5 rounded-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>INIT_NEW_PROTOCOL</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
