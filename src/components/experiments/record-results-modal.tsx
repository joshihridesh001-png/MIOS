"use client"

import { useState, useEffect } from "react"
import { ExperimentRow, ExperimentVariantMetrics } from "@/lib/types/database"
import { updateExperiment } from "@/hooks/use-experiments"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { FileCsv, ArrowsClockwise, Check, WarningCircle } from "@phosphor-icons/react"

interface RecordResultsModalProps {
  experiment: ExperimentRow
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RecordResultsModal({
  experiment,
  open,
  onOpenChange,
  onSuccess,
}: RecordResultsModalProps) {
  const [loading, setLoading] = useState(false)

  // Control state
  const [controlName, setControlName] = useState(experiment.control_name || "Control")
  const [controlCtr, setControlCtr] = useState<string>(
    String(((experiment.control_clicks ?? 0) / (experiment.control_impressions || 1) * 100).toFixed(2) || 2.1)
  )
  const [controlCvr, setControlCvr] = useState<string>(
    String(((experiment.control_conversions ?? 0) / (experiment.control_clicks || 1) * 100).toFixed(2) || 8.4)
  )
  const [controlConversions, setControlConversions] = useState<string>(
    String(experiment.control_conversions ?? 120)
  )

  // Variant A state
  const [variantAName, setVariantAName] = useState(
    experiment.variant_a_name || "Variant A"
  )
  const [variantACtr, setVariantACtr] = useState<string>(
    String(((experiment.variant_a_clicks ?? 0) / (experiment.variant_a_impressions || 1) * 100).toFixed(2) || 2.4)
  )
  const [variantACvr, setVariantACvr] = useState<string>(
    String(((experiment.variant_a_conversions ?? 0) / (experiment.variant_a_clicks || 1) * 100).toFixed(2) || 9.6)
  )
  const [variantAConversions, setVariantAConversions] = useState<string>(
    String(experiment.variant_a_conversions ?? 142)
  )

  // Variant B state
  const [variantBName, setVariantBName] = useState(
    experiment.variant_b_name || "Variant B"
  )
  const [variantBCtr, setVariantBCtr] = useState<string>(
    String(((experiment.variant_b_clicks ?? 0) / (experiment.variant_b_impressions || 1) * 100).toFixed(2) || 2.8)
  )
  const [variantBCvr, setVariantBCvr] = useState<string>(
    String(((experiment.variant_b_conversions ?? 0) / (experiment.variant_b_clicks || 1) * 100).toFixed(2) || 11.2)
  )
  const [variantBConversions, setVariantBConversions] = useState<string>(
    String(experiment.variant_b_conversions ?? 168)
  )

  // Statistical confidence and lift
  const [confidenceScore, setConfidenceScore] = useState<string>(
    String(experiment.confidence_score ?? 85)
  )
  const [actualLift, setActualLift] = useState<string>(
    String(experiment.actual_lift ?? 18.4)
  )

  // Sync state when modal opens or experiment changes
  useEffect(() => {
    if (experiment && open) {
      setControlName(experiment.control_name || "Control")
      setControlCtr(String(((experiment.control_clicks ?? 0) / (experiment.control_impressions || 1) * 100).toFixed(2) || 2.1))
      setControlCvr(String(((experiment.control_conversions ?? 0) / (experiment.control_clicks || 1) * 100).toFixed(2) || 8.4))
      setControlConversions(String(experiment.control_conversions ?? 120))

      setVariantAName(experiment.variant_a_name || "Variant A")
      setVariantACtr(String(((experiment.variant_a_clicks ?? 0) / (experiment.variant_a_impressions || 1) * 100).toFixed(2) || 2.4))
      setVariantACvr(String(((experiment.variant_a_conversions ?? 0) / (experiment.variant_a_clicks || 1) * 100).toFixed(2) || 9.6))
      setVariantAConversions(String(experiment.variant_a_conversions ?? 142))

      setVariantBName(experiment.variant_b_name || "Variant B")
      setVariantBCtr(String(((experiment.variant_b_clicks ?? 0) / (experiment.variant_b_impressions || 1) * 100).toFixed(2) || 2.8))
      setVariantBCvr(String(((experiment.variant_b_conversions ?? 0) / (experiment.variant_b_clicks || 1) * 100).toFixed(2) || 11.2))
      setVariantBConversions(String(experiment.variant_b_conversions ?? 168))

      setConfidenceScore(String(experiment.confidence_score ?? 85))
      setActualLift(String(experiment.actual_lift ?? 18.4))
    }
  }, [experiment, open])

  // Live auto-calculation helper
  const handleAutoCalculate = () => {
    const cCvr = parseFloat(controlCvr) || 0
    const aCvr = parseFloat(variantACvr) || 0
    const bCvr = parseFloat(variantBCvr) || 0
    const cConv = parseInt(controlConversions, 10) || 0
    const aConv = parseInt(variantAConversions, 10) || 0
    const bConv = parseInt(variantBConversions, 10) || 0

    // Find best variant CVR against Control
    const maxVariantCvr = Math.max(aCvr, bCvr)
    let calculatedLift = 0
    if (cCvr > 0) {
      calculatedLift = ((maxVariantCvr - cCvr) / cCvr) * 100
    }

    // Auto-estimate confidence score based on total conversions and lift
    const totalConv = cConv + aConv + bConv
    let estimatedConfidence = 65
    if (calculatedLift > 0) {
      if (totalConv >= 300) {
        estimatedConfidence = Math.min(99, 88 + Math.floor(calculatedLift / 2))
      } else if (totalConv >= 150) {
        estimatedConfidence = Math.min(94, 80 + Math.floor(calculatedLift / 3))
      } else {
        estimatedConfidence = Math.min(85, 68 + Math.floor(calculatedLift / 4))
      }
    }

    setActualLift(calculatedLift.toFixed(1))
    setConfidenceScore(String(estimatedConfidence))
    toast.success("Statistical lift and confidence matrix re-calculated")
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const cMetrics: ExperimentVariantMetrics = {
        ctr: parseFloat(controlCtr) || 0,
        cvr: parseFloat(controlCvr) || 0,
        conversions: parseInt(controlConversions, 10) || 0,
      }

      const aMetrics: ExperimentVariantMetrics = {
        ctr: parseFloat(variantACtr) || 0,
        cvr: parseFloat(variantACvr) || 0,
        conversions: parseInt(variantAConversions, 10) || 0,
      }

      const bMetrics: ExperimentVariantMetrics = {
        ctr: parseFloat(variantBCtr) || 0,
        cvr: parseFloat(variantBCvr) || 0,
        conversions: parseInt(variantBConversions, 10) || 0,
      }

      const liftNum = parseFloat(actualLift) || 0
      const confNum = parseInt(confidenceScore, 10) || 0

      // Determine winner variant
      let winner = "Control"
      const maxCvr = Math.max(cMetrics.cvr, aMetrics.cvr, bMetrics.cvr)
      if (maxCvr === aMetrics.cvr && aMetrics.cvr > cMetrics.cvr) {
        winner = variantAName || "Variant A"
      } else if (maxCvr === bMetrics.cvr && bMetrics.cvr > cMetrics.cvr) {
        winner = variantBName || "Variant B"
      }

      // Append new DATA log to decision STRATEGY stream
      const timestamp = new Date().toISOString().slice(0, 16).replace("T", " ")
      const logEntry = `> [SYNC ${timestamp}] Recorded metrics — Control (${cMetrics.cvr}% CVR, ${cMetrics.conversions} conv) | Variant A (${aMetrics.cvr}% CVR, ${aMetrics.conversions} conv) | Variant B (${bMetrics.cvr}% CVR, ${bMetrics.conversions} conv). Lift: +${liftNum}% [Confidence: ${confNum}%]`
      const updatedNotes = [logEntry, ...(experiment.decision_STRATEGY_notes || [])]

      await updateExperiment(experiment.id, {
        control_name: controlName,
        control_conversions: cMetrics.conversions,
        variant_a_name: variantAName,
        variant_a_conversions: aMetrics.conversions,
        variant_b_name: variantBName,
        variant_b_conversions: bMetrics.conversions,
        actual_lift: liftNum,
        confidence_score: confNum,
        winner_variant: winner,
        decision_STRATEGY_notes: updatedNotes,
      })

      toast.success("STRATEGY data recorded and synchronized")
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(`Failed to record metrics: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-6xl sm:!max-w-6xl !w-[94vw] sm:!w-[94vw] max-h-[92vh] overflow-y-auto bg-background border border-border text-foreground rounded-xl shadow-2xl p-8 sm:p-10 font-sans font-bold select-none">
        <DialogHeader className="border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted border border-border text-primary">
              <FileCsv weight="duotone" className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black uppercase tracking-wider text-foreground">
                RECORD STRATEGY DATA // ID: {experiment.test_code}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Input real-time performance metrics for Control and Variants to update statistical lift and confidence.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-8 pt-6">
          {/* THREE COLUMN GRID: Control, Variant A, Variant B */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Control Column */}
            <div className="p-6 bg-card border border-border space-y-4 shadow-lg">
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider border-b border-border pb-3">
                CONTROL BASELINE
              </div>
              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Vector Name</Label>
                <Input
                  value={controlName}
                  onChange={(e) => setControlName(e.target.value)}
                  className="h-10 text-sm bg-muted border-border rounded-xl mt-1.5 font-sans font-bold text-foreground px-3"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">CTR (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={controlCtr}
                    onChange={(e) => setControlCtr(e.target.value)}
                    className="h-10 text-sm bg-muted border-border rounded-xl mt-1.5 font-sans font-bold tabular-nums text-foreground px-3"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">CVR (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={controlCvr}
                    onChange={(e) => setControlCvr(e.target.value)}
                    className="h-10 text-sm bg-muted border-border rounded-xl mt-1.5 font-sans font-bold tabular-nums text-foreground font-bold px-3"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Conversions</Label>
                <Input
                  type="number"
                  value={controlConversions}
                  onChange={(e) => setControlConversions(e.target.value)}
                  className="h-10 text-sm bg-muted border-border rounded-xl mt-1.5 font-sans font-bold tabular-nums text-foreground px-3"
                />
              </div>
            </div>

            {/* Variant A Column */}
            <div className="p-6 bg-card border border-border border-t-2 border-t-[#00dbe9] space-y-4 shadow-lg">
              <div className="text-sm font-bold text-primary uppercase tracking-wider border-b border-border pb-3">
                VARIANT A
              </div>
              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Vector Name</Label>
                <Input
                  value={variantAName}
                  onChange={(e) => setVariantAName(e.target.value)}
                  className="h-10 text-sm bg-muted border-border rounded-xl mt-1.5 font-sans font-bold text-foreground px-3"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">CTR (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={variantACtr}
                    onChange={(e) => setVariantACtr(e.target.value)}
                    className="h-10 text-sm bg-muted border-border rounded-xl mt-1.5 font-sans font-bold tabular-nums text-foreground px-3"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">CVR (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={variantACvr}
                    onChange={(e) => setVariantACvr(e.target.value)}
                    className="h-10 text-sm bg-muted border-border rounded-xl mt-1.5 font-sans font-bold tabular-nums text-foreground font-bold px-3"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Conversions</Label>
                <Input
                  type="number"
                  value={variantAConversions}
                  onChange={(e) => setVariantAConversions(e.target.value)}
                  className="h-10 text-sm bg-muted border-border rounded-xl mt-1.5 font-sans font-bold tabular-nums text-foreground px-3"
                />
              </div>
            </div>

            {/* Variant B Column */}
            <div className="p-6 bg-card border border-border space-y-4 shadow-lg">
              <div className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-3">
                VARIANT B
              </div>
              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Vector Name</Label>
                <Input
                  value={variantBName}
                  onChange={(e) => setVariantBName(e.target.value)}
                  className="h-10 text-sm bg-muted border-border rounded-xl mt-1.5 font-sans font-bold text-foreground px-3"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">CTR (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={variantBCtr}
                    onChange={(e) => setVariantBCtr(e.target.value)}
                    className="h-10 text-sm bg-muted border-border rounded-xl mt-1.5 font-sans font-bold tabular-nums text-foreground px-3"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">CVR (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={variantBCvr}
                    onChange={(e) => setVariantBCvr(e.target.value)}
                    className="h-10 text-sm bg-muted border-border rounded-xl mt-1.5 font-sans font-bold tabular-nums text-foreground font-bold px-3"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Conversions</Label>
                <Input
                  type="number"
                  value={variantBConversions}
                  onChange={(e) => setVariantBConversions(e.target.value)}
                  className="h-10 text-sm bg-muted border-border rounded-xl mt-1.5 font-sans font-bold tabular-nums text-foreground px-3"
                />
              </div>
            </div>
          </div>

          {/* STATISTICAL SUMMARY & LIFT OVERRIDE BAR */}
          <div className="p-6 bg-card border border-border flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
            <div className="flex flex-wrap items-center gap-8">
              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Calculated Lift (%)</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Input
                    type="number"
                    step="0.1"
                    value={actualLift}
                    onChange={(e) => setActualLift(e.target.value)}
                    className="h-10 w-28 text-sm bg-muted border-border rounded-xl font-sans font-bold tabular-nums text-primary font-bold px-3"
                  />
                  <span className="text-sm text-muted-foreground font-sans font-bold">%</span>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confidence Score (%)</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Input
                    type="number"
                    value={confidenceScore}
                    onChange={(e) => setConfidenceScore(e.target.value)}
                    className="h-10 w-28 text-sm bg-muted border-border rounded-xl font-sans font-bold tabular-nums text-foreground font-bold px-3"
                  />
                  <span className="text-sm text-muted-foreground font-sans font-bold">%</span>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoCalculate}
              className="h-10 px-6 text-xs bg-muted border-border hover:border-[#00dbe9] hover:bg-zinc-800 text-primary rounded-xl font-sans font-bold font-bold uppercase tracking-wider shrink-0 cursor-pointer"
            >
              <ArrowsClockwise weight="duotone" className="w-3.5 h-3.5 mr-2" />
              <span>RE-CALCULATE LIFT</span>
            </Button>
          </div>

          <DialogFooter className="border-t border-border pt-6 mt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 px-6 text-xs bg-muted border-border hover:bg-zinc-800 text-foreground rounded-xl font-sans font-bold font-bold uppercase tracking-wider cursor-pointer"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 px-8 text-xs !bg-[#00dbe9] hover:!bg-[#00c5d2] !text-black font-sans font-bold font-black uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(0,219,233,0.4)] border border-primary cursor-pointer"
            >
              <Check weight="duotone" className="w-4 h-4 mr-2 stroke-[2.5]" />
              <span>SAVE STRATEGY DATA</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
