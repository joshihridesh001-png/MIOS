"use client"

import { useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useExperiment, deleteExperiment, updateExperiment } from "@/hooks/use-experiments"
import { useCurrentBest } from "@/hooks/use-current-best"
import { LearningList } from "@/components/learnings/learning-list"
import { RecordResultsModal } from "@/components/experiments/record-results-modal"
import { 
  experimentStatusLabels, 
  experimentStatusColors, 
  experimentTypeLabels 
} from "@/lib/constants"
import { checkSampleSizeSufficiency, PrimaryMetric } from "@/lib/utils/sample-size-calculator"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash, CheckCircle, Warning, Play, Square, FileCsv, WarningCircle } from "@phosphor-icons/react"
import { toast } from "sonner"

interface ExperimentDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ExperimentDetailPage({ params }: ExperimentDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { experiment, loading, error, refetch } = useExperiment(id)
  
  // Safe extraction of primary metric for the hook to prevent breaking on load
  const primaryMetric = experiment?.primary_metric || ''
  const { baseline, loading: baselineLoading } = useCurrentBest(primaryMetric)
  
  const [deleting, setDeleting] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [recordModalOpen, setRecordModalOpen] = useState(false)

  const handleDelete = async () => {
    if (!experiment) return
    const confirmed = window.confirm(
      `Delete experiment "${experiment.name}"? This cannot be undone.`
    )
    if (!confirmed) return

    try {
      setDeleting(true)
      await deleteExperiment(id)
      toast.success("Experiment deleted.")
      router.push("/experiments")
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`)
      setDeleting(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!experiment) return
    const nextStatus = experiment.status === "running" ? "completed" : "running"
    try {
      setStatusLoading(true)
      await updateExperiment(id, { status: nextStatus })
      toast.success(`Experiment status updated to ${nextStatus}`)
      refetch()
    } catch (err: any) {
      toast.error(`Error updating status: ${err.message}`)
    } finally {
      setStatusLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-12 w-64 neo-flat rounded-xl" />
        <div className="h-96 neo-flat/60 rounded-xl" />
      </div>
    )
  }

  if (error || !experiment) {
    return (
      <div className="p-8 text-center neo-flat border-none rounded-xl">
        <p className="text-red-400 font-medium text-sm">
          {error ? error.message : "Experiment not found."}
        </p>
        <Link href="/experiments" className="inline-block mt-4 text-sm text-emerald-500 hover:underline">
          &larr; Back to Experiments
        </Link>
      </div>
    )
  }

  const conf = experiment.confidence_score || 0
  const isRunning = experiment.status === "running"

  // Aggregate metrics to check sample size sufficiency across all variants
  const totalImpressions = (experiment.control_impressions || 0) + (experiment.variant_a_impressions || 0) + (experiment.variant_b_impressions || 0)
  const totalConversions = (experiment.control_conversions || 0) + (experiment.variant_a_conversions || 0) + (experiment.variant_b_conversions || 0)
  const totalCustomers = (experiment.control_customers || 0) + (experiment.variant_a_customers || 0) + (experiment.variant_b_customers || 0)
  
  const sampleCheck = checkSampleSizeSufficiency(
    (experiment.primary_metric as PrimaryMetric) || 'ctr',
    totalImpressions,
    totalConversions,
    totalCustomers
  )

  const hasVariants = !!experiment.variant_a_name || !!experiment.variant_b_name;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-foreground pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/experiments"
            className="p-2 neo-flat border-none hover:bg-zinc-800 text-muted-foreground hover:text-foreground rounded-xl transition-colors"
          >
            <ArrowLeft weight="duotone" className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold text-foreground">
                {experiment.name}
              </h1>
              <span className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-xl uppercase tracking-wider",
                experimentStatusColors[experiment.status] || "bg-muted text-muted-foreground"
              )}>
                {experimentStatusLabels[experiment.status] || experiment.status}
              </span>
              <span className="text-xs font-medium text-muted-foreground border-none px-2 py-0.5 rounded-xl">
                ID: {experiment.test_code}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => setRecordModalOpen(true)}
            className="text-xs h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-foreground font-medium rounded-xl transition-colors"
          >
            <FileCsv weight="duotone" className="w-4 h-4 mr-2" />
            Update Data
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            disabled={statusLoading}
            className="text-xs h-9 px-4 neo-flat border-border hover:bg-zinc-800 text-foreground font-medium rounded-xl"
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4 mr-2 text-muted-foreground" />
                End Experiment
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2 text-emerald-500" />
                Resume
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs h-9 px-3 bg-red-950/50 border border-red-900 text-red-400 hover:bg-red-900 hover:text-foreground rounded-xl"
          >
            <Trash weight="duotone" className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Sample Size Warning */}
          {!sampleCheck.isSufficient && isRunning && (
            <div className="p-4 bg-amber-950/30 border border-amber-900 rounded-xl flex items-start gap-3">
              <Warning weight="duotone" className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-500">Insufficient Sample Size</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  This experiment has {sampleCheck.current.toLocaleString()} {sampleCheck.metricType.toLowerCase()}, which is below the minimum threshold of {sampleCheck.required.toLocaleString()} required for statistical significance on this metric. Wait before drawing conclusions.
                </p>
              </div>
            </div>
          )}

          {/* Hypothesis */}
          <div className="p-5 neo-flat border-none rounded-xl">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <span className="text-sm font-semibold text-foreground">Hypothesis & Configuration</span>
              <span className="text-xs font-medium text-muted-foreground">Primary Metric: <span className="text-emerald-500 font-bold uppercase">{experiment.primary_metric}</span></span>
            </div>
            <div className="text-sm text-foreground leading-relaxed mb-4">
              {experiment.hypothesis_query}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Traffic Split</div>
                <div className="text-sm font-medium text-foreground">{experiment.traffic_split || "50/50"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Target Confidence</div>
                <div className="text-sm font-medium text-foreground">{experiment.target_confidence || 80}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Minimum Lift Required</div>
                <div className="text-sm font-medium text-foreground">+{experiment.minimum_lift || 15}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Impact Level</div>
                <div className="text-sm font-medium text-foreground capitalize">{experiment.impact || "High"}</div>
              </div>
            </div>
          </div>

          {/* Side-by-side Metrics Comparison */}
          <div className="p-5 neo-flat border-none rounded-xl">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <span className="text-sm font-semibold text-foreground">Variant Performance</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 font-medium">Metric</th>
                    <th className="py-3 px-4 font-medium bg-emerald-950/20 text-emerald-500 border-r border-border">
                      90-Day Best
                      {baselineLoading && <span className="ml-2 animate-pulse">...</span>}
                    </th>
                    <th className="py-3 px-4 font-medium neo-flat/30">Control</th>
                    <th className="py-3 px-4 font-medium border-l border-border">Variant A</th>
                    {experiment.variant_b_name && (
                      <th className="py-3 px-4 font-medium border-l border-border">Variant B</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  <tr className="hover:neo-flat/30">
                    <td className="py-3 px-4 font-medium text-muted-foreground">Name</td>
                    <td className="py-3 px-4 text-emerald-400/70 bg-emerald-950/10 border-r border-border text-xs">Historical Baseline</td>
                    <td className="py-3 px-4 text-foreground neo-flat/30">{experiment.control_name || "Control"}</td>
                    <td className="py-3 px-4 text-foreground border-l border-border">{experiment.variant_a_name || "Variant A"}</td>
                    {experiment.variant_b_name && (
                      <td className="py-3 px-4 text-foreground border-l border-border">{experiment.variant_b_name}</td>
                    )}
                  </tr>
                  
                  {/* Base Metrics */}
                  <tr className="hover:neo-flat/30">
                    <td className="py-3 px-4 font-medium text-muted-foreground">Spend</td>
                    <td className="py-3 px-4 text-emerald-400 bg-emerald-950/10 border-r border-border font-sans font-bold">
                      {baseline ? `$${baseline.spend.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-foreground neo-flat/30 font-sans font-bold">${experiment.control_spend?.toLocaleString() || 0}</td>
                    <td className="py-3 px-4 text-foreground border-l border-border font-sans font-bold">${experiment.variant_a_spend?.toLocaleString() || 0}</td>
                    {experiment.variant_b_name && (
                      <td className="py-3 px-4 text-foreground border-l border-border font-sans font-bold">${experiment.variant_b_spend?.toLocaleString() || 0}</td>
                    )}
                  </tr>
                  <tr className="hover:neo-flat/30">
                    <td className="py-3 px-4 font-medium text-muted-foreground">Impressions</td>
                    <td className="py-3 px-4 text-emerald-400 bg-emerald-950/10 border-r border-border font-sans font-bold">
                      {baseline ? baseline.impressions.toLocaleString() : '-'}
                    </td>
                    <td className="py-3 px-4 text-foreground neo-flat/30 font-sans font-bold">{experiment.control_impressions?.toLocaleString() || 0}</td>
                    <td className="py-3 px-4 text-foreground border-l border-border font-sans font-bold">{experiment.variant_a_impressions?.toLocaleString() || 0}</td>
                    {experiment.variant_b_name && (
                      <td className="py-3 px-4 text-foreground border-l border-border font-sans font-bold">{experiment.variant_b_impressions?.toLocaleString() || 0}</td>
                    )}
                  </tr>
                  <tr className="hover:neo-flat/30">
                    <td className="py-3 px-4 font-medium text-muted-foreground">Conversions</td>
                    <td className="py-3 px-4 text-emerald-400 bg-emerald-950/10 border-r border-border font-sans font-bold">
                      {baseline ? Math.round((baseline.cvr / 100) * (baseline.impressions * (baseline.ctr / 100))).toLocaleString() || '-' : '-'}
                    </td>
                    <td className="py-3 px-4 text-foreground neo-flat/30 font-sans font-bold">{experiment.control_conversions?.toLocaleString() || 0}</td>
                    <td className="py-3 px-4 text-foreground border-l border-border font-sans font-bold">{experiment.variant_a_conversions?.toLocaleString() || 0}</td>
                    {experiment.variant_b_name && (
                      <td className="py-3 px-4 text-foreground border-l border-border font-sans font-bold">{experiment.variant_b_conversions?.toLocaleString() || 0}</td>
                    )}
                  </tr>

                  {/* Calculated Rates */}
                  <tr className="border-t border-border neo-flat/50">
                    <td colSpan={5} className="py-1 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Calculated Rates
                    </td>
                  </tr>
                  <tr className="hover:neo-flat/30">
                    <td className="py-3 px-4 font-medium text-foreground">CTR</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold bg-emerald-950/20 border-r border-border">
                      {baseline ? `${baseline.ctr}%` : '-'}
                    </td>
                    <td className="py-3 px-4 text-foreground neo-flat/30">
                      {experiment.control_impressions ? ((experiment.control_clicks / experiment.control_impressions) * 100).toFixed(2) : 0}%
                    </td>
                    <td className="py-3 px-4 text-foreground border-l border-border">
                      {experiment.variant_a_impressions ? ((experiment.variant_a_clicks / experiment.variant_a_impressions) * 100).toFixed(2) : 0}%
                    </td>
                    {experiment.variant_b_name && (
                      <td className="py-3 px-4 text-foreground border-l border-border">
                        {experiment.variant_b_impressions ? ((experiment.variant_b_clicks / experiment.variant_b_impressions) * 100).toFixed(2) : 0}%
                      </td>
                    )}
                  </tr>
                  <tr className="hover:neo-flat/30">
                    <td className="py-3 px-4 font-medium text-foreground">CVR</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold bg-emerald-950/20 border-r border-border">
                      {baseline ? `${baseline.cvr}%` : '-'}
                    </td>
                    <td className="py-3 px-4 text-foreground neo-flat/30">
                      {experiment.control_clicks ? ((experiment.control_conversions / experiment.control_clicks) * 100).toFixed(2) : 0}%
                    </td>
                    <td className="py-3 px-4 text-foreground border-l border-border">
                      {experiment.variant_a_clicks ? ((experiment.variant_a_conversions / experiment.variant_a_clicks) * 100).toFixed(2) : 0}%
                    </td>
                    {experiment.variant_b_name && (
                      <td className="py-3 px-4 text-foreground border-l border-border">
                        {experiment.variant_b_clicks ? ((experiment.variant_b_conversions / experiment.variant_b_clicks) * 100).toFixed(2) : 0}%
                      </td>
                    )}
                  </tr>
                  <tr className="hover:neo-flat/30">
                    <td className="py-3 px-4 font-medium text-foreground">CPA</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold bg-emerald-950/20 border-r border-border">
                      {baseline ? `$${baseline.cpa}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-foreground neo-flat/30">
                      ${experiment.control_conversions ? (experiment.control_spend / experiment.control_conversions).toFixed(2) : 0}
                    </td>
                    <td className="py-3 px-4 text-foreground border-l border-border">
                      ${experiment.variant_a_conversions ? (experiment.variant_a_spend / experiment.variant_a_conversions).toFixed(2) : 0}
                    </td>
                    {experiment.variant_b_name && (
                      <td className="py-3 px-4 text-foreground border-l border-border">
                        ${experiment.variant_b_conversions ? (experiment.variant_b_spend / experiment.variant_b_conversions).toFixed(2) : 0}
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
            {!hasVariants && (
              <div className="mt-4 p-3 neo-flat border-none rounded-xl text-sm text-muted-foreground text-center">
                Add results using the Update Data button to see variant comparisons.
              </div>
            )}
          </div>

          {/* Decision Notes */}
          <div className="p-5 neo-flat border-none rounded-xl">
            <div className="text-sm font-semibold text-foreground border-b border-border pb-3 mb-4">
              Decision Log
            </div>
            {experiment.decision_STRATEGY_notes && experiment.decision_STRATEGY_notes.length > 0 ? (
              <div className="space-y-3">
                {experiment.decision_STRATEGY_notes.map((note, idx) => {
                  const isAlert = note.startsWith("!") || note.includes("degradation") || note.includes("WARN")
                  const isSuccess = note.includes("[SUCCESS]") || note.includes("WIN")
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "text-sm p-3 rounded-xl border",
                        isAlert ? "bg-red-950/20 border-red-900/50 text-red-400" 
                        : isSuccess ? "bg-emerald-950/20 border-emerald-900/50 text-emerald-400" 
                        : "neo-flat/50 border-border text-foreground"
                      )}
                    >
                      {note.replace(/^([!>]\s*)/, "")}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground neo-flat/30 border-none rounded-xl">
                No decision notes recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* Confidence Meter Card */}
          <div className="p-5 neo-flat border-none rounded-xl">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <span className="text-sm font-semibold text-foreground">Confidence Metric</span>
              <span className={cn(
                "text-sm font-bold",
                conf >= (experiment.target_confidence || 80) ? "text-emerald-500" : "text-amber-500"
              )}>
                {conf}%
              </span>
            </div>

            <div className="space-y-4">
              <div className="w-full h-2 neo-flat rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    conf >= (experiment.target_confidence || 80) ? "bg-emerald-500" : "bg-amber-500"
                  )}
                  style={{ width: `${Math.min(conf, 100)}%` }}
                />
              </div>

              <div className="text-sm text-muted-foreground leading-relaxed">
                {conf >= (experiment.target_confidence || 80) ? (
                  <div className="text-emerald-500 font-medium">
                    Statistical significance reached. Ready to extract learning and deploy winner.
                  </div>
                ) : (
                  <div>
                    Keep experiment running. Target confidence of {experiment.target_confidence || 80}% not yet reached.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DATA Summary Card */}
          <div className="p-5 neo-flat border-none rounded-xl">
            <div className="text-sm font-semibold text-foreground border-b border-border pb-3 mb-4">
              Experiment Data
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Target Lift</span>
                <span className="font-medium text-emerald-500">+{experiment.target_lift || 15}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Observed Lift</span>
                <span className="font-medium text-emerald-500">
                  +{experiment.actual_lift || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Runtime</span>
                <span className="font-medium text-foreground">
                  {experiment.runtime_hours || 0} hrs
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learnings Section */}
      <div className="pt-8 mt-8 border-t border-border">
        <LearningList
          sourceId={experiment.id}
          sourceType="experiment"
          title={`Permanent Learnings from "${experiment.name}"`}
        />
      </div>

      <RecordResultsModal
        experiment={experiment}
        open={recordModalOpen}
        onOpenChange={setRecordModalOpen}
        onSuccess={refetch}
      />
    </div>
  )
}
