"use client"

import { useState, useEffect } from 'react'
import {
  CreativeRow,
  CreativeFormat,
  CreativeAngle,
  CreativeStatus,
  PlatformType,
  CampaignWithMetrics,
} from '@/lib/types/database'
import {
  creativeFormatLabels,
  creativeFormatIcons,
  creativeAngleLabels,
  creativeStatusLabels,
  platformLabels,
  platformIcons,
} from '@/lib/constants'
import { useCampaigns } from '@/hooks/use-campaigns'
import { CreativeQuickPaste } from './creative-quick-paste'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkle, Fire, Warning, Stack, Target, CurrencyDollar, Lightbulb } from "@phosphor-icons/react"

interface CreativeFormProps {
  initialData?: Partial<CreativeRow>
  onSubmit: (data: Partial<CreativeRow>) => Promise<void>
  loading?: boolean
}

export function CreativeForm({ initialData = {}, onSubmit, loading = false }: CreativeFormProps) {
  const { campaigns } = useCampaigns()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* AI Quick-Paste Header */}
      <CreativeQuickPaste onApplyParsedData={handleApplyParsedData} />

      {/* SECTION 1: Creative Identity & Ad Copy */}
      <Card className="bg-card/80 backdrop-blur-xl border border-border/60 shadow-lg">
        <CardHeader className="pb-4 border-b border-border/40">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <Stack weight="duotone" className="w-4 h-4 text-emerald-400" />
            Creative Identity & Ad Copy
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Creative Asset Name *</Label>
              <Input
                required
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Summer Termite 15% OFF Carousel"
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
              <Label className="text-xs font-medium text-muted-foreground">Ad Headline (Hook) *</Label>
              <Input
                required
                value={formData.headline || ''}
                onChange={(e) => handleChange('headline', e.target.value)}
                placeholder="e.g. 15% OFF Annual Termite Protection — Odorless Treatment"
                className="mt-1 font-medium"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Primary Text / Body Copy</Label>
              <textarea
                rows={3}
                value={formData.primary_text || ''}
                onChange={(e) => handleChange('primary_text', e.target.value)}
                placeholder="Don't let termites destroy your Bangalore home..."
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
                  placeholder="https://..."
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
            Performance Metrics & Ad Fatigue Meter
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
            Hook Hypothesis & Creative Reflection
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Hook Hypothesis (Why should this angle convert?)</Label>
            <textarea
              rows={2}
              value={formData.hook_hypothesis || ''}
              onChange={(e) => handleChange('hook_hypothesis', e.target.value)}
              placeholder="e.g. Leading with a clear 15% financial discount will convert price-sensitive homeowners..."
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
