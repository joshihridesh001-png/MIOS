"use client"

import { useState } from "react"
import Link from "next/link"
import { useExperiments } from "@/hooks/use-experiments"
import { 
  experimentStatusLabels, 
  experimentStatusColors, 
  experimentTypeLabels
} from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Flask, Plus, ArrowRight, Pulse, CheckCircle, Clock, WarningCircle } from "@phosphor-icons/react"

export default function ExperimentsPage() {
  const { experiments, loading, error } = useExperiments()
  const [filter, setFilter] = useState<string>("all")

  const filtered = (experiments || []).filter((exp) => {
    if (filter === "all") return true
    return exp.status === filter
  })

  const activeCount = (experiments || []).filter((e) => e.status === "running").length
  const totalCount = (experiments || []).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-foreground pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Experiments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Structured marketing growth and hypothesis testing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/experiments/new"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-foreground font-medium text-sm px-4 py-2 rounded-xl transition-colors"
          >
            <Plus weight="duotone" className="w-4 h-4" />
            <span>New Experiment</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {[
          { id: "all", label: "All Tests", count: totalCount },
          { id: "running", label: "Running", count: activeCount },
          { id: "queued", label: "Queued", count: (experiments || []).filter(e => e.status === "queued").length },
          { id: "completed", label: "Completed", count: (experiments || []).filter(e => e.status === "completed").length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-xl border transition-colors flex items-center gap-2",
              filter === tab.id
                ? "bg-zinc-100 text-zinc-950 border-white"
                : "text-muted-foreground border-transparent hover:text-white hover:bg-zinc-900"
            )}
          >
            <span>{tab.label}</span>
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-xl",
              filter === tab.id ? "bg-zinc-200 text-zinc-900" : "bg-muted text-muted-foreground"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted border border-border rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-xl">
          <Flask weight="duotone" className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <div className="text-base font-medium text-foreground">
            No experiments found
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Initialize an A/B or Multivariate test to begin structured hypothesis testing.
          </p>
          <Link
            href="/experiments/new"
            className="inline-flex items-center gap-2 mt-6 bg-muted hover:bg-zinc-700 text-foreground text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Plus weight="duotone" className="w-4 h-4" />
            <span>New Experiment</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List Column (Takes up 2/3) */}
          <div className="lg:col-span-2 space-y-4">
            {filtered.map((exp) => {
              const isRunning = exp.status === "running"
              
              return (
                <div
                  key={exp.id}
                  className={cn(
                    "bg-card border rounded-xl transition-colors overflow-hidden",
                    isRunning 
                      ? "border-emerald-500/50" 
                      : "border-border hover:border-zinc-700"
                  )}
                >
                  {/* Header */}
                  <div className="p-4 bg-muted/50 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-xl uppercase tracking-wider",
                        experimentStatusColors[exp.status] || "bg-muted text-muted-foreground"
                      )}>
                        {experimentStatusLabels[exp.status] || exp.status}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        {exp.test_code}
                      </span>
                      <span className="text-xs text-muted-foreground border border-border px-2 py-0.5 rounded-xl">
                        {experimentTypeLabels[exp.type] || exp.type}
                      </span>
                    </div>

                    <Link
                      href={`/experiments/${exp.id}`}
                      className="text-sm font-medium text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ArrowRight weight="duotone" className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-5">
                    <div>
                      <Link
                        href={`/experiments/${exp.id}`}
                        className="text-xl font-semibold text-foreground hover:text-emerald-400 transition-colors"
                      >
                        {exp.name}
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
                        <div>
                          Primary Metric: <span className="text-foreground font-medium uppercase">{exp.primary_metric}</span>
                        </div>
                        <div>
                          Target Lift: <span className="text-emerald-500 font-medium">+{exp.target_lift}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Hypothesis */}
                    <div className="pt-4 border-t border-border">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Hypothesis
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {exp.hypothesis_query}
                      </p>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Traffic Split</div>
                        <div className="text-sm font-medium text-foreground">{exp.traffic_split || "50/50"}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Sample Size</div>
                        <div className="text-sm font-medium text-foreground">{exp.sample_size?.toLocaleString() || 0}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Confidence</div>
                        <div className="text-sm font-medium text-emerald-500">{exp.confidence_score || 0}%</div>
                      </div>
                      {exp.actual_lift ? (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Lift Observed</div>
                          <div className="text-sm font-medium text-emerald-500">+{exp.actual_lift}%</div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column (Takes up 1/3) */}
          <div className="space-y-4">
            <div className="p-5 bg-card border border-border rounded-xl">
              <h3 className="text-sm font-semibold text-foreground mb-3">Experimental Velocity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Tests</span>
                  <span className="text-sm font-medium text-emerald-500">{activeCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Queued</span>
                  <span className="text-sm font-medium text-foreground">
                    {(experiments || []).filter(e => e.status === "queued").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed (30d)</span>
                  <span className="text-sm font-medium text-foreground">
                    {(experiments || []).filter(e => e.status === "completed").length}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-card border border-border rounded-xl">
              <h3 className="text-sm font-semibold text-foreground mb-2">Structured Growth</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Every A/B and multivariate test is automatically linked to your permanent compounding Knowledge Base.
              </p>
              <Link
                href="/experiments/new"
                className="w-full inline-flex items-center justify-center gap-2 bg-muted hover:bg-zinc-700 text-foreground font-medium text-sm px-4 py-2 rounded-xl transition-colors"
              >
                <Plus weight="duotone" className="w-4 h-4" />
                <span>Plan New Experiment</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
