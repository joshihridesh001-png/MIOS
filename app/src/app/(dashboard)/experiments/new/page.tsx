"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createExperiment } from "@/hooks/use-experiments"
import { experimentTypeLabels, experimentStatusLabels } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, FlaskConical, Terminal, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import type { ExperimentType, ExperimentImpact } from "@/lib/types/database"

function NewExperimentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialName = searchParams?.get("name") || ""
  const initialHypothesis = searchParams?.get("hypothesis") || '$ IF user_intent == "high" THEN inject(urgency_module) WILL increase(ctr) BY 15%'
  const initialVariant = searchParams?.get("variant") || "Variant B"

  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(initialName)
  const [testCode, setTestCode] = useState("A/B-0x" + Math.floor(Math.random() * 899 + 100).toString(16).toUpperCase())
  const [type, setType] = useState<ExperimentType>("a_b_test")
  const [impact, setImpact] = useState<ExperimentImpact>("high")
  const [hypothesisQuery, setHypothesisQuery] = useState(initialHypothesis)
  const [primaryMetric, setPrimaryMetric] = useState("ctr")
  const [targetLift, setTargetLift] = useState(15.0)
  const [trafficSplit, setTrafficSplit] = useState("50/50")
  const [controlName, setControlName] = useState("Control")
  const [variantAName, setVariantAName] = useState("Variant A")
  const [variantBName, setVariantBName] = useState(initialVariant)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("PROTOCOL NAME IS REQUIRED")
      return
    }

    try {
      setLoading(true)
      const newExp = await createExperiment({
        name: name.trim().toUpperCase(),
        test_code: testCode,
        type,
        status: "running",
        impact,
        hypothesis_query: hypothesisQuery,
        primary_metric: primaryMetric,
        target_lift: targetLift,
        actual_lift: 0.0,
        traffic_split: trafficSplit,
        sample_size: 0,
        runtime_hours: 0.0,
        confidence_score: 0,
        decision_protocol_notes: [
          "> Protocol initialized in active test stream.",
          "> Monitoring statistical divergence across primary vectors."
        ],
        control_name: controlName,
        control_metrics: { ctr: 0, cvr: 0, conversions: 0 },
        variant_a_name: variantAName,
        variant_a_metrics: { ctr: 0, cvr: 0, conversions: 0 },
        variant_b_name: variantBName,
        variant_b_metrics: { ctr: 0, cvr: 0, conversions: 0 },
        winner_variant: null,
        campaign_id: null,
        creative_id: null,
      })

      toast.success("🧪 PROTOCOL INITIALIZED AND DEPLOYED")
      router.push(`/experiments/${newExp.id}`)
    } catch (err: any) {
      toast.error(`ERROR INITIALIZING PROTOCOL: ${err.message}`)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono text-zinc-100 pb-12 select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Link
            href="/experiments"
            className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              /// SYS.INIT: /PROTOCOLS/NEW_EXPERIMENT
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-sans uppercase">
              INITIALIZE_NEW_PROTOCOL
            </h1>
            {initialName && (
              <p className="text-xs text-[#00dbe9] mt-1 font-mono">
                ⚡ HYDRATED FROM BUYER PERSONA PSYCHOLOGY RECOMMENDATION
              </p>
            )}
          </div>
        </div>
        <span className="text-xs bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 px-2.5 py-1 rounded-sm font-bold">
          [ STATUS: DRAFT_MODE ]
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Protocol Identity */}
        <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-sm space-y-6 shadow-xl">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest border-b border-zinc-800 pb-3 flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span>01 // PROTOCOL_IDENTIFICATION</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Protocol Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CONVERSION_OVERRIDE"
                className="bg-zinc-900/80 border-zinc-700 text-white font-mono uppercase font-bold"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Test Identifier Code</label>
              <Input
                value={testCode}
                onChange={(e) => setTestCode(e.target.value)}
                className="bg-zinc-900/80 border-zinc-700 text-emerald-400 font-mono font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Experiment Vector Type</label>
              <Select value={type} onValueChange={(val) => setType(val as ExperimentType)}>
                <SelectTrigger className="bg-zinc-900/80 border-zinc-700 font-mono text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-white font-mono">
                  {Object.entries(experimentTypeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Estimated Impact Tier</label>
              <Select value={impact} onValueChange={(val) => setImpact(val as ExperimentImpact)}>
                <SelectTrigger className="bg-zinc-900/80 border-zinc-700 font-mono text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-white font-mono">
                  <SelectItem value="low">LOW IMPACT</SelectItem>
                  <SelectItem value="medium">MEDIUM IMPACT</SelectItem>
                  <SelectItem value="high">HIGH IMPACT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Card 2: Hypothesis Query & Metric Configuration */}
        <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-sm space-y-6 shadow-xl">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest border-b border-zinc-800 pb-3 flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            <span>02 // HYPOTHESIS_QUERY_SYNTAX & METRICS</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase">Hypothesis Query Syntax (IF ... THEN ... BY %)</label>
            <Textarea
              rows={3}
              value={hypothesisQuery}
              onChange={(e) => setHypothesisQuery(e.target.value)}
              className="bg-black border-zinc-700 text-emerald-400 font-mono text-xs p-3 leading-relaxed"
            />
            <div className="text-[10px] text-zinc-500">
              Format using conditional syntax to document executive marketing logic.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Primary Vector Metric</label>
              <Input
                value={primaryMetric}
                onChange={(e) => setPrimaryMetric(e.target.value)}
                placeholder="ctr, cvr, roas, cac"
                className="bg-zinc-900/80 border-zinc-700 uppercase font-mono font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Target Lift (%)</label>
              <Input
                type="number"
                step="0.1"
                value={targetLift}
                onChange={(e) => setTargetLift(parseFloat(e.target.value) || 0)}
                className="bg-zinc-900/80 border-zinc-700 font-mono font-bold text-emerald-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Traffic Allocation Split</label>
              <Input
                value={trafficSplit}
                onChange={(e) => setTrafficSplit(e.target.value)}
                placeholder="50/50 or 33/33/33"
                className="bg-zinc-900/80 border-zinc-700 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Variant Configuration */}
        <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-sm space-y-6 shadow-xl">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest border-b border-zinc-800 pb-3">
            03 // VARIANT_NODE_NAMES
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Control Variant</label>
              <Input
                value={controlName}
                onChange={(e) => setControlName(e.target.value)}
                className="bg-zinc-900/80 border-zinc-700 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Variant A</label>
              <Input
                value={variantAName}
                onChange={(e) => setVariantAName(e.target.value)}
                className="bg-zinc-900/80 border-zinc-700 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Variant B</label>
              <Input
                value={variantBName}
                onChange={(e) => setVariantBName(e.target.value)}
                className="bg-zinc-900/80 border-zinc-700 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          <Link href="/experiments">
            <Button
              type="button"
              variant="outline"
              className="border-zinc-700 text-zinc-400 hover:text-white font-mono text-xs uppercase px-6"
            >
              ABORT
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-xs uppercase px-8 py-2.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            {loading ? "DEPLOYING PROTOCOL..." : "DEPLOY_PROTOCOL"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function NewExperimentPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-300 font-mono">[ INITIALIZING LAB PROTOCOL BUILDER... ]</div>}>
      <NewExperimentContent />
    </Suspense>
  )
}
