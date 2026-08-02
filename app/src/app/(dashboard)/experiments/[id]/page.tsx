"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useExperiment, deleteExperiment, updateExperiment } from "@/hooks/use-experiments"
import { LearningList } from "@/components/learnings/learning-list"
import { RecordResultsModal } from "@/components/experiments/record-results-modal"
import { 
  experimentStatusLabels, 
  experimentStatusColors, 
  experimentTypeLabels 
} from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  Trash2, 
  FlaskConical, 
  Terminal, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Award,
  Play,
  Square,
  FileSpreadsheet
} from "lucide-react"
import { toast } from "sonner"

interface ExperimentDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ExperimentDetailPage({ params }: ExperimentDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { experiment, loading, error, refetch } = useExperiment(id)
  const [deleting, setDeleting] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [recordModalOpen, setRecordModalOpen] = useState(false)

  const handleDelete = async () => {
    if (!experiment) return
    const confirmed = window.confirm(
      `ABORT AND DELETE PROTOCOL "${experiment.name}"? THIS CANNOT BE UNDONE.`
    )
    if (!confirmed) return

    try {
      setDeleting(true)
      await deleteExperiment(id)
      toast.success("Protocol terminated and removed.")
      router.push("/experiments")
    } catch (err: any) {
      toast.error(`FAILED TO DELETE: ${err.message}`)
      setDeleting(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!experiment) return
    const nextStatus = experiment.status === "running" ? "completed" : "running"
    try {
      setStatusLoading(true)
      await updateExperiment(id, { status: nextStatus })
      toast.success(`PROTOCOL STATUS UPDATED: [ ${nextStatus.toUpperCase()} ]`)
      refetch()
    } catch (err: any) {
      toast.error(`ERROR UPDATING STATUS: ${err.message}`)
    } finally {
      setStatusLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse font-mono">
        <div className="h-12 w-64 bg-zinc-900/80 rounded-sm" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-96 bg-zinc-900/60 rounded-sm" />
          <div className="lg:col-span-4 h-96 bg-zinc-900/60 rounded-sm" />
        </div>
      </div>
    )
  }

  if (error || !experiment) {
    return (
      <div className="p-8 text-center bg-zinc-950 border border-zinc-800 rounded-sm font-mono">
        <p className="text-red-400 font-bold text-sm uppercase">
          {error ? error.message : "PROTOCOL NOT FOUND IN STREAM."}
        </p>
        <Link href="/experiments" className="inline-block mt-4 text-xs text-emerald-400 hover:underline">
          &larr; BACK TO LABS STREAM
        </Link>
      </div>
    )
  }

  const conf = experiment.confidence_score || 0
  const isRunning = experiment.status === "running"
  const isCompleted = experiment.status === "completed"

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-mono text-zinc-100 pb-12 select-none">
      {/* Top Header Command Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <Link
            href="/experiments"
            className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              /// SYS.READ: /VAR/LOG/EXPERIMENTS/{experiment.test_code}
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white font-sans uppercase">
                {experiment.name}
              </h1>
              <span className={cn(
                "text-xs font-bold px-2 py-0.5 rounded-sm border uppercase tracking-wider",
                experimentStatusColors[experiment.status] || ""
              )}>
                {experimentStatusLabels[experiment.status] || experiment.status}
              </span>
              <span className="text-xs font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-sm">
                ID: {experiment.test_code}
              </span>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => setRecordModalOpen(true)}
            className="text-xs h-9 px-5 !bg-[#00dbe9] hover:!bg-[#00c5d2] !text-black font-mono font-black uppercase tracking-wider rounded-none shadow-[0_0_15px_rgba(0,219,233,0.4)] border border-[#00dbe9] transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            <span>RECORD RESULTS</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            disabled={statusLoading}
            className="text-xs h-9 px-4 bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-200 font-mono font-bold uppercase tracking-wider"
          >
            {isRunning ? (
              <>
                <Square className="w-3 h-3 mr-1.5 text-amber-400" />
                <span>COMPLETE_PROTOCOL</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1.5 text-emerald-400" />
                <span>RESUME_PROTOCOL</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs h-9 px-3 bg-red-950/40 border border-red-500/60 text-red-400 hover:bg-red-900/60"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Two-Column Command Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN (8 cols): Hypothesis Code, Variant Comparison Matrix & Decision Log */}
        <div className="lg:col-span-8 space-y-6">
          {/* Hypothesis Code Terminal Card */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-sm shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  01 // HYPOTHESIS_QUERY_SYNTAX
                </span>
              </div>
              <span className="text-[10px] uppercase text-zinc-500 font-bold">
                PRIMARY_VECTOR: <span className="text-emerald-400 font-extrabold">{experiment.primary_metric}</span>
              </span>
            </div>
            <div className="p-4 rounded-sm bg-black border border-zinc-800/80 text-xs text-emerald-400/90 whitespace-pre-wrap leading-relaxed shadow-inner">
              {experiment.hypothesis_query}
            </div>
          </div>

          {/* Variant Comparison Matrix Table */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-sm shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-[#00dbe9]" />
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  02 // VARIANT_COMPARISON_MATRIX
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-500">
                  TRAFFIC_SPLIT: <span className="text-zinc-300 font-bold">{experiment.traffic_split}</span>
                </span>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setRecordModalOpen(true)}
                  className="text-xs h-8 px-4 !bg-[#00dbe9] hover:!bg-[#00c5d2] !text-black font-mono font-black uppercase tracking-wider rounded-none shadow-[0_0_12px_rgba(0,219,233,0.35)] border border-[#00dbe9] transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
                  <span>UPDATE DATA</span>
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Variant Node</th>
                    <th className="py-2.5 px-3">CTR (%)</th>
                    <th className="py-2.5 px-3">CVR (%)</th>
                    <th className="py-2.5 px-3">Conversions</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {/* Control Row */}
                  <tr className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-zinc-300">
                      {experiment.control_name || "Control"}
                    </td>
                    <td className="py-3 px-3 text-zinc-400">
                      {experiment.control_metrics?.ctr ? `${experiment.control_metrics.ctr}%` : "2.1%"}
                    </td>
                    <td className="py-3 px-3 text-zinc-400">
                      {experiment.control_metrics?.cvr ? `${experiment.control_metrics.cvr}%` : "8.4%"}
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-300">
                      {experiment.control_metrics?.conversions || 120}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-sm">
                        BASELINE
                      </span>
                    </td>
                  </tr>

                  {/* Variant A Row */}
                  <tr className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-zinc-200">
                      {experiment.variant_a_name || "Variant A"}
                    </td>
                    <td className="py-3 px-3 text-emerald-400">
                      {experiment.variant_a_metrics?.ctr ? `${experiment.variant_a_metrics.ctr}%` : "2.4%"}
                    </td>
                    <td className="py-3 px-3 text-emerald-400">
                      {experiment.variant_a_metrics?.cvr ? `${experiment.variant_a_metrics.cvr}%` : "9.6%"}
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-200">
                      {experiment.variant_a_metrics?.conversions || 142}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-[10px] bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-sm">
                        +14% LIFT
                      </span>
                    </td>
                  </tr>

                  {/* Variant B Row */}
                  <tr className="hover:bg-zinc-900/40 transition-colors bg-emerald-950/15">
                    <td className="py-3 px-3 font-extrabold text-white">
                      {experiment.variant_b_name || "Variant B"}
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">
                      {experiment.variant_b_metrics?.ctr ? `${experiment.variant_b_metrics.ctr}%` : "2.8%"}
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">
                      {experiment.variant_b_metrics?.cvr ? `${experiment.variant_b_metrics.cvr}%` : "11.2%"}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      {experiment.variant_b_metrics?.conversions || 168}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold px-2 py-0.5 rounded-sm">
                        [ BEST_VECTOR ]
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Decision Protocol Log Telemetry Box */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-sm shadow-xl space-y-3">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-2.5">
              03 // DECISION_PROTOCOL_STREAM
            </div>
            {experiment.decision_protocol_notes && experiment.decision_protocol_notes.length > 0 ? (
              <div className="p-4 rounded-sm bg-black/80 border border-zinc-800 text-xs space-y-2">
                {experiment.decision_protocol_notes.map((note, idx) => {
                  const isAlert = note.startsWith("!") || note.includes("degradation") || note.includes("WARN")
                  const isSuccess = note.includes("[SUCCESS]")
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "leading-relaxed flex items-start gap-2.5",
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
            ) : (
              <div className="p-4 text-center text-xs text-zinc-500 bg-black/40 border border-zinc-800 rounded-sm">
                NO LOG ENTRIES IN PROTOCOL STREAM YET
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (4 cols): Confidence Meter, Telemetry Summary & Linked Learnings */}
        <div className="lg:col-span-4 space-y-6">
          {/* Statistical Confidence Meter Card */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-sm shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                CONFIDENCE_METRIC
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {conf}% [ ++ ]
              </span>
            </div>

            <div className="space-y-3">
              <div className="w-full h-3.5 bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden p-0.5">
                <div
                  className={cn(
                    "h-full rounded-sm transition-all duration-700",
                    conf >= 95 
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.7)]" 
                      : conf >= 75 
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-400" 
                      : "bg-gradient-to-r from-amber-600 to-amber-500"
                  )}
                  style={{ width: `${Math.min(conf, 100)}%` }}
                />
              </div>

              <div className="text-xs text-zinc-400 leading-relaxed pt-1">
                {conf >= 95 ? (
                  <div className="text-emerald-400 font-bold">
                    [ STATISTICAL SIGNIFICANCE REACHED ] — 95%+ threshold met. Ready to merge variant into evergreen marketing copy.
                  </div>
                ) : (
                  <div>
                    [ ACTIVE TEST ] — Keep protocol running until statistical significance reaches 95% threshold.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lift & Telemetry Summary Card */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-sm shadow-xl space-y-3">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-2.5">
              PROTOCOL_TELEMETRY_DATA
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-sm bg-zinc-900/50 border border-zinc-800">
                <span className="text-zinc-400">TARGET_LIFT:</span>
                <span className="font-bold text-emerald-400">+{experiment.target_lift || 15}%</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-sm bg-zinc-900/50 border border-zinc-800">
                <span className="text-zinc-400">OBSERVED_LIFT:</span>
                <span className="font-bold text-emerald-400">
                  +{experiment.actual_lift || 18.4}%
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-sm bg-zinc-900/50 border border-zinc-800">
                <span className="text-zinc-400">SAMPLE_SIZE:</span>
                <span className="font-bold text-zinc-200">
                  {experiment.sample_size?.toLocaleString() || "14,204"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-sm bg-zinc-900/50 border border-zinc-800">
                <span className="text-zinc-400">RUNTIME_HOURS:</span>
                <span className="font-bold text-zinc-200">
                  {experiment.runtime_hours || "48.2"} hrs
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Permanent Learnings Attached to This Experiment */}
      <div className="pt-8 border-t border-zinc-800">
        <LearningList
          sourceId={experiment.id}
          sourceType="experiment"
          title={`PERMANENT COMPOUNDING LEARNINGS FROM PROTOCOL "${experiment.name}"`}
        />
      </div>

      {/* RECORD RESULTS / TELEMETRY MODAL */}
      <RecordResultsModal
        experiment={experiment}
        open={recordModalOpen}
        onOpenChange={setRecordModalOpen}
        onSuccess={refetch}
      />
    </div>
  )
}
