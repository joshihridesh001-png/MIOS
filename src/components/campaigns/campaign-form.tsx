'use client'

import { useState } from 'react'
import { CampaignRow, PlatformType, CampaignStatus, ConfidenceLevel } from '@/lib/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { platformLabels, statusLabels, confidenceLabels } from '@/lib/constants'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils'
import { QuickPasteCard } from './quick-paste-card'

interface CampaignFormProps {
  initialData?: Partial<CampaignRow>
  onSubmit: (data: Partial<CampaignRow>) => void
  loading?: boolean
}

export function CampaignForm({ initialData = {}, onSubmit, loading }: CampaignFormProps) {
  const [formData, setFormData] = useState<Partial<CampaignRow>>({
    name: initialData.name || '',
    platform: initialData.platform || 'meta_ads',
    objective: initialData.objective || '',
    status: initialData.status || 'draft',
    start_date: initialData.start_date || '',
    end_date: initialData.end_date || '',
    target_audience: initialData.target_audience || '',
    service: initialData.service || '',
    pest_type: initialData.pest_type || '',
    location: initialData.location || '',
    offer: initialData.offer || '',
    cta: initialData.cta || '',
    landing_destination: initialData.landing_destination || '',
    spend: initialData.spend || 0,
    reach: initialData.reach || 0,
    impressions: initialData.impressions || 0,
    clicks: initialData.clicks || 0,
    messages: initialData.messages || 0,
    calls: initialData.calls || 0,
    site_visits: initialData.site_visits || 0,
    inquiries: initialData.inquiries || 0,
    qualified_leads: initialData.qualified_leads || 0,
    quotes_sent: initialData.quotes_sent || 0,
    customers_won: initialData.customers_won || 0,
    revenue: initialData.revenue || 0,
    cogs: initialData.cogs || 0,
    hypothesis: initialData.hypothesis || '',
    result_summary: initialData.result_summary || '',
    what_worked: initialData.what_worked || '',
    what_failed: initialData.what_failed || '',
    next_experiment: initialData.next_experiment || '',
    confidence: initialData.confidence || 'medium',
  })

  const handleChange = (field: keyof CampaignRow, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleApplyParsedData = (parsed: Partial<CampaignRow>) => {
    setFormData((prev) => ({ ...prev, ...parsed }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {/* Quick-Paste AI Parser */}
      <QuickPasteCard onApplyParsedData={handleApplyParsedData} />

      {/* Identity */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle>Identity</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input 
              id="name" 
              required
              value={formData.name} 
              onChange={(e) => handleChange('name', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select 
              value={formData.platform || ''} 
              onValueChange={(val) => handleChange('platform', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(platformLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="objective">Objective</Label>
            <Input 
              id="objective" 
              value={formData.objective || ''} 
              onChange={(e) => handleChange('objective', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={formData.status || ''} 
              onValueChange={(val) => handleChange('status', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input 
              id="start_date" 
              type="date"
              value={formData.start_date || ''} 
              onChange={(e) => handleChange('start_date', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input 
              id="end_date" 
              type="date"
              value={formData.end_date || ''} 
              onChange={(e) => handleChange('end_date', e.target.value)} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Targeting & Offer */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle>Targeting & Offer</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="target_audience">Target Audience</Label>
            <Input 
              id="target_audience" 
              value={formData.target_audience || ''} 
              onChange={(e) => handleChange('target_audience', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="service">Service</Label>
            <Input 
              id="service" 
              value={formData.service || ''} 
              onChange={(e) => handleChange('service', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pest_type">Market Segment / Category</Label>
            <Input 
              id="pest_type" 
              placeholder="e.g. Enterprise B2B, SaaS, D2C Growth"
              value={formData.pest_type || ''} 
              onChange={(e) => handleChange('pest_type', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location" 
              value={formData.location || ''} 
              onChange={(e) => handleChange('location', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer">Offer</Label>
            <Input 
              id="offer" 
              value={formData.offer || ''} 
              onChange={(e) => handleChange('offer', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cta">CTA</Label>
            <Input 
              id="cta" 
              value={formData.cta || ''} 
              onChange={(e) => handleChange('cta', e.target.value)} 
            />
          </div>
          <div className="space-y-2 lg:col-span-3">
            <Label htmlFor="landing_destination">Landing Destination</Label>
            <Input 
              id="landing_destination" 
              value={formData.landing_destination || ''} 
              onChange={(e) => handleChange('landing_destination', e.target.value)} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { id: 'spend', label: 'Spend (₹)' },
            { id: 'revenue', label: 'Revenue (₹)' },
            { id: 'cogs', label: 'COGS (₹)' },
            { id: 'reach', label: 'Reach' },
            { id: 'impressions', label: 'Impressions' },
            { id: 'clicks', label: 'Clicks' },
            { id: 'messages', label: 'Messages' },
            { id: 'calls', label: 'Calls' },
            { id: 'site_visits', label: 'Site Visits' },
            { id: 'inquiries', label: 'Inquiries' },
            { id: 'qualified_leads', label: 'Qualified Leads' },
            { id: 'quotes_sent', label: 'Quotes Sent' },
            { id: 'customers_won', label: 'Customers Won' },
          ].map((metric) => (
            <div key={metric.id} className="space-y-2">
              <Label htmlFor={metric.id}>{metric.label}</Label>
              <Input 
                id={metric.id} 
                type="number"
                min="0"
                step="any"
                value={formData[metric.id as keyof CampaignRow] || 0} 
                onChange={(e) => handleChange(metric.id as keyof CampaignRow, Number(e.target.value))} 
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reflection */}
      <Card className="bg-emerald-500/5 backdrop-blur-xl border-border/50 border-l-4 border-l-emerald-500">
        <CardHeader>
          <CardTitle className="text-emerald-500">Reflection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="hypothesis">Hypothesis</Label>
            <Textarea 
              id="hypothesis" 
              placeholder="What did we expect to happen?"
              value={formData.hypothesis || ''} 
              onChange={(e) => handleChange('hypothesis', e.target.value)} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="what_worked">What Worked</Label>
              <Textarea 
                id="what_worked" 
                className="bg-emerald-500/5 border-emerald-500/20 focus-visible:ring-emerald-500"
                value={formData.what_worked || ''} 
                onChange={(e) => handleChange('what_worked', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="what_failed">What Failed</Label>
              <Textarea 
                id="what_failed" 
                className="bg-red-500/5 border-red-500/20 focus-visible:ring-red-500"
                value={formData.what_failed || ''} 
                onChange={(e) => handleChange('what_failed', e.target.value)} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="result_summary">Result Summary</Label>
            <Textarea 
              id="result_summary" 
              value={formData.result_summary || ''} 
              onChange={(e) => handleChange('result_summary', e.target.value)} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="next_experiment">Next Experiment</Label>
              <Textarea 
                id="next_experiment" 
                value={formData.next_experiment || ''} 
                onChange={(e) => handleChange('next_experiment', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Confidence</Label>
              <Select 
                value={formData.confidence || ''} 
                onValueChange={(val) => handleChange('confidence', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select confidence" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(confidenceLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Campaign'}
        </Button>
      </div>
    </form>
  )
}
