"use client"

import { useState, useRef } from 'react'
import {
  CreativeRow,
  CreativeFormat,
  CreativeAngle,
  CreativeStatus,
  PlatformType,
} from '@/lib/types/database'
import {
  creativeFormatLabels,
  creativeFormatIcons,
  creativeAngleLabels,
  creativeStatusLabels,
  platformLabels,
  platformIcons,
} from '@/lib/constants'
import {
  inferCreativeMetadataFromFilename,
  generateSmartCreativeDraft,
  isVideoAssetUrl,
} from '@/lib/creative-parser'
import { useCampaigns } from '@/hooks/use-campaigns'
import { CreativeQuickPaste } from './creative-quick-paste'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Sparkle,
  Fire,
  Stack,
  CurrencyDollar,
  Lightbulb,
  UploadSimple,
  CheckCircle,
} from "@phosphor-icons/react"

interface CreativeFormProps {
  initialData?: Partial<CreativeRow>
  onSubmit: (data: Partial<CreativeRow>) => Promise<void>
  loading?: boolean
}

export function CreativeForm({ initialData = {}, onSubmit, loading = false }: CreativeFormProps) {
  const { campaigns } = useCampaigns()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const [formData, setFormData] = useState<Partial<CreativeRow>>({
    name: initialData.name || '',
    format: initialData.format || 'image',
    angle: initialData.angle || 'discount_offer',
    status: initialData.status || 'draft',
    platform: initialData.platform || 'meta_ads',
    campaign_id: initialData.campaign_id || '',
    headline: initialData.headline || '',
    primary_text: initialData.primary_text || '',
    cta_text: initialData.cta_text || 'Learn More',
    asset_url: initialData.asset_url || '',
    spend: initialData.spend || 0,
    impressions: initialData.impressions || 0,
    clicks: initialData.clicks || 0,
    inquiries: initialData.inquiries || 0,
    customers_won: initialData.customers_won || 0,
    revenue: initialData.revenue || 0,
    fatigue_score: initialData.fatigue_score || 0,
    hook_hypothesis: initialData.hook_hypothesis || '',
    what_worked: initialData.what_worked || '',
    what_failed: initialData.what_failed || '',
    tags: initialData.tags || [],
  })

  const selectedCampaign = campaigns.find((c) => c.id === formData.campaign_id)

  // Apply data from Quick-Paste
  const handleApplyParsedData = (parsed: Partial<CreativeRow>) => {
    setFormData((prev) => ({
      ...prev,
      ...parsed,
    }))
  }

  const handleChange = (field: keyof CreativeRow, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSmartAutoDraft = () => {
    const draft = generateSmartCreativeDraft(
      formData.angle || 'authority_guarantee',
      formData.name || undefined,
      selectedCampaign?.name
    )
    const draftData: Partial<CreativeRow> = (draft as any)?.data ? (draft as any).data : draft
    setFormData((prev) => ({
      ...prev,
      name: prev.name || draftData.name || 'Executive Growth Audit Creative',
      headline: draftData.headline || prev.headline,
      primary_text: draftData.primary_text || prev.primary_text,
      cta_text: draftData.cta_text || prev.cta_text || 'Learn More',
      hook_hypothesis: draftData.hook_hypothesis || prev.hook_hypothesis,
      tags: prev.tags && prev.tags.length > 0 ? prev.tags : draftData.tags || [],
    }))
    toast.success('Auto-drafted executive copy & hypothesis from psychological angle!')
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File exceeds 50MB limit.')
      return
    }

    setUploading(true)
    try {
      const uploadForm = new FormData()
      uploadForm.append('file', file)

      const res = await fetch('/api/upload-creative', {
        method: 'POST',
        body: uploadForm,
      })
      const json = await res.json()

      if (!res.ok || !json.url) {
        throw new Error(json.error || 'Upload failed')
      }

      const inferredRaw = inferCreativeMetadataFromFilename(file.name, file.type)
      const inferred: Partial<CreativeRow> = (inferredRaw as any)?.data
        ? (inferredRaw as any).data
        : inferredRaw

      setFormData((prev) => {
        const nextAngle =
          (!prev.angle || prev.angle === 'discount_offer') && inferred.angle
            ? inferred.angle
            : prev.angle || 'authority_guarantee'
        const nextName = prev.name ? prev.name : inferred.name || file.name.replace(/\.[^.]+$/, '')

        const needsAutoDraft = !prev.headline && !prev.primary_text && !prev.hook_hypothesis
        const draftRaw = needsAutoDraft
          ? generateSmartCreativeDraft(nextAngle, nextName, selectedCampaign?.name)
          : null
        const draft: Partial<CreativeRow> | null = draftRaw
          ? (draftRaw as any).data || draftRaw
          : null

        return {
          ...prev,
          asset_url: json.url,
          format: inferred.format || prev.format || 'image',
          name: nextName,
          angle: nextAngle,
          platform:
            (!prev.platform || prev.platform === 'meta_ads') && inferred.platform
              ? inferred.platform
              : prev.platform,
          tags:
            prev.tags && prev.tags.length > 0
              ? prev.tags
              : inferred.tags || draft?.tags || [],
          headline: prev.headline || draft?.headline || '',
          primary_text: prev.primary_text || draft?.primary_text || '',
          cta_text:
            prev.cta_text && prev.cta_text !== 'Learn More'
              ? prev.cta_text
              : draft?.cta_text || prev.cta_text || 'Learn More',
          hook_hypothesis: prev.hook_hypothesis || draft?.hook_hypothesis || '',
        }
      })

      toast.success('Creative asset uploaded & metadata auto-populated!')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload creative asset')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      void handleFileUpload(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const isVideoPreview = isVideoAssetUrl(formData.asset_url, formData.format)

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* AI Quick-Paste Header */}
      <CreativeQuickPaste onApplyParsedData={handleApplyParsedData} />

      {/* SECTION 1: Creative Identity & Ad Copy */}
      <Card className="bg-card/80 backdrop-blur-xl border border-border/60 shadow-lg">
        <CardHeader className="pb-4 border-b border-border/40">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <Stack weight="duotone" className="w-4 h-4 text-emerald-400" />
            Creative Identity &amp; Ad Copy
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {/* Drag & Drop Creative Asset Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragActive(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragActive(false)
            }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-5 transition-colors flex flex-col sm:flex-row items-center justify-between gap-4 ${
              dragActive
                ? 'border-emerald-400 bg-emerald-500/10'
                : 'border-border/70 bg-muted/25 hover:border-emerald-500/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.gif,.mp4,.webm,.mov,image/*,video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleFileUpload(file)
              }}
            />

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                {formData.asset_url ? (
                  <CheckCircle weight="duotone" className="w-5 h-5 text-emerald-400" />
                ) : (
                  <UploadSimple weight="duotone" className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {uploading
                    ? 'Uploading & Extracting Metadata...'
                    : formData.asset_url
                    ? 'Creative Asset Attached — Click or Drop to Replace'
                    : 'Zero-Effort Creative Dropzone (Image or Video up to 50MB)'}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Drop `.png`, `.jpg`, `.webp`, `.gif`, `.mp4`, `.webm`, or `.mov` — automatically detects format, angle, name &amp; drafts copy.
                </p>
              </div>
            </div>

            {formData.asset_url && (
              <div className="w-20 h-14 rounded-lg overflow-hidden border border-border shrink-0 bg-background">
                {isVideoPreview ? (
                  <video
                    src={formData.asset_url}
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={formData.asset_url}
                    alt="Uploaded preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Creative Asset Name *</Label>
              <Input
                required
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Q4 Tax & CFO Advisory Audit Carousel"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Ad Format *</Label>
              <select
                value={formData.format || 'image'}
                onChange={(e) => handleChange('format', e.target.value as CreativeFormat)}
                className="mt-1 w-full h-9 rounded-2xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {Object.entries(creativeFormatLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {creativeFormatIcons[key] || '🖼️'} {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Psychological Angle *</Label>
              <select
                value={formData.angle || 'discount_offer'}
                onChange={(e) => handleChange('angle', e.target.value as CreativeAngle)}
                className="mt-1 w-full h-9 rounded-2xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {Object.entries(creativeAngleLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Status</Label>
              <select
                value={formData.status || 'draft'}
                onChange={(e) => handleChange('status', e.target.value as CreativeStatus)}
                className="mt-1 w-full h-9 rounded-2xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {Object.entries(creativeStatusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Platform</Label>
              <select
                value={formData.platform || 'meta_ads'}
                onChange={(e) => handleChange('platform', e.target.value as PlatformType)}
                className="mt-1 w-full h-9 rounded-2xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {Object.entries(platformLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {platformIcons[key] || '📱'} {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Link to Campaign (Optional)</Label>
              <select
                value={formData.campaign_id || ''}
                onChange={(e) => handleChange('campaign_id', e.target.value || null)}
                className="mt-1 w-full h-9 rounded-2xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">-- Standalone / Unlinked --</option>
                {campaigns.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.name} ({camp.platform ? platformLabels[camp.platform] : 'Ad'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                <Label className="text-xs font-medium text-muted-foreground">Ad Headline (Hook) *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSmartAutoDraft}
                  className="h-7 rounded-xl border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-sans font-bold px-2.5 gap-1.5"
                >
                  <Sparkle weight="duotone" className="w-3.5 h-3.5" />
                  <span>[ 1-Click Auto-Draft Copy &amp; Hypothesis ]</span>
                </Button>
              </div>
              <Input
                required
                value={formData.headline || ''}
                onChange={(e) => handleChange('headline', e.target.value)}
                placeholder="e.g. Free 30-Minute Financial & Compliance Audit — Zero Obligation"
                className="mt-1 font-medium"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Primary Text / Body Copy</Label>
              <textarea
                rows={3}
                value={formData.primary_text || ''}
                onChange={(e) => handleChange('primary_text', e.target.value)}
                placeholder="Most growing service businesses lose 14% margin to unoptimized operations and compliance blindspots. Book a diagnostic review with our senior specialists."
                className="mt-1 w-full p-2.5 rounded-2xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Call To Action (CTA Button)</Label>
                <Input
                  value={formData.cta_text || ''}
                  onChange={(e) => handleChange('cta_text', e.target.value)}
                  placeholder="Learn More, Get Offer, Book Now"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">Asset URL (Optional Image/Video URL)</Label>
                <Input
                  value={formData.asset_url || ''}
                  onChange={(e) => handleChange('asset_url', e.target.value)}
                  placeholder="https://... or /uploads/creatives/..."
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: Performance Metrics & Ad Fatigue */}
      <Card className="bg-card/80 backdrop-blur-xl border border-border/60 shadow-lg">
        <CardHeader className="pb-4 border-b border-border/40">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <CurrencyDollar weight="duotone" className="w-4 h-4 text-emerald-400" />
            Performance Metrics &amp; Ad Fatigue Meter
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Spend (₹)</Label>
              <Input
                type="number"
                step="any"
                min="0"
                value={formData.spend || 0}
                onChange={(e) => handleChange('spend', parseFloat(e.target.value) || 0)}
                className="mt-1 font-sans font-bold"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Revenue (₹)</Label>
              <Input
                type="number"
                step="any"
                min="0"
                value={formData.revenue || 0}
                onChange={(e) => handleChange('revenue', parseFloat(e.target.value) || 0)}
                className="mt-1 font-sans font-bold text-emerald-400 font-semibold"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Impressions</Label>
              <Input
                type="number"
                min="0"
                value={formData.impressions || 0}
                onChange={(e) => handleChange('impressions', parseInt(e.target.value) || 0)}
                className="mt-1 font-sans font-bold"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Clicks</Label>
              <Input
                type="number"
                min="0"
                value={formData.clicks || 0}
                onChange={(e) => handleChange('clicks', parseInt(e.target.value) || 0)}
                className="mt-1 font-sans font-bold"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Inquiries / Leads</Label>
              <Input
                type="number"
                min="0"
                value={formData.inquiries || 0}
                onChange={(e) => handleChange('inquiries', parseInt(e.target.value) || 0)}
                className="mt-1 font-sans font-bold"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Customers Won</Label>
              <Input
                type="number"
                min="0"
                value={formData.customers_won || 0}
                onChange={(e) => handleChange('customers_won', parseInt(e.target.value) || 0)}
                className="mt-1 font-sans font-bold text-emerald-400 font-semibold"
              />
            </div>
          </div>

          {/* Fatigue Score Slider */}
          <div className="pt-3 border-t border-border/40">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Fire weight="duotone" className="w-4 h-4 text-amber-400" />
                Ad Fatigue Score (0% = Fresh, 100% = Burned Out)
              </Label>
              <span className="font-sans font-bold text-xs font-bold text-emerald-400">
                {formData.fatigue_score || 0}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.fatigue_score || 0}
              onChange={(e) => handleChange('fatigue_score', parseInt(e.target.value) || 0)}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      {/* SECTION 3: Hook Hypothesis & Reflection */}
      <Card className="bg-card/80 backdrop-blur-xl border border-border/60 shadow-lg border-l-4 border-l-emerald-500">
        <CardHeader className="pb-4 border-b border-border/40">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <Lightbulb weight="duotone" className="w-4 h-4 text-emerald-400" />
            Hook Hypothesis &amp; Creative Reflection
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Hook Hypothesis (Why should this angle convert?)</Label>
            <textarea
              rows={2}
              value={formData.hook_hypothesis || ''}
              onChange={(e) => handleChange('hook_hypothesis', e.target.value)}
              placeholder="e.g. Leading with a quantified 14% margin recovery audit will convert ROI-focused B2B founders..."
              className="mt-1 w-full p-2.5 rounded-2xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-emerald-400">What Worked</Label>
              <textarea
                rows={2}
                value={formData.what_worked || ''}
                onChange={(e) => handleChange('what_worked', e.target.value)}
                placeholder="High contrast pricing overlay in card 1 caught attention..."
                className="mt-1 w-full p-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-rose-400">What Failed</Label>
              <textarea
                rows={2}
                value={formData.what_failed || ''}
                onChange={(e) => handleChange('what_failed', e.target.value)}
                placeholder="Card 4 with technical diagram had low retention..."
                className="mt-1 w-full p-2.5 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          className="text-xs h-9 px-5"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 text-foreground font-semibold text-xs h-9 px-6 shadow-lg shadow-emerald-950/40"
        >
          {loading ? 'Saving Creative...' : 'Save Creative Asset'}
        </Button>
      </div>
    </form>
  )
}
