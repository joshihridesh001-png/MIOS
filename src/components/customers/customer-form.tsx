// ==============================================================================
// MIOS Customer Acquisition & CX Form (@/components/customers/customer-form.tsx)
// Governed by ADR-001 (ISO/IEC 25010 Reliability, Explicit Input Validation)
// ==============================================================================

'use client';

import React, { useState } from 'react';
import { CustomerInsert, CustomerPropertyType, CustomerStatus } from '@/lib/types/database';
import { parseCustomerNotes } from '@/lib/customer-parser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface CustomerFormProps {
  initialData?: Partial<CustomerInsert>;
  onSubmit: (data: CustomerInsert) => Promise<void>;
  loading?: boolean;
}

export function CustomerForm({ initialData, onSubmit, loading }: CustomerFormProps) {
  const [pasteText, setPasteText] = useState('');
  const [formData, setFormData] = useState<CustomerInsert>({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    location: initialData?.location || '',
    property_type: initialData?.property_type || 'residential',
    lead_source: initialData?.lead_source || 'Meta Ads',
    campaign_id: initialData?.campaign_id || null,
    campaign_creative_id: initialData?.campaign_creative_id || null,
    revenue: initialData?.revenue || 0,
    profit: initialData?.profit || 0,
    ltv: initialData?.ltv || 0,
    why_contacted: initialData?.why_contacted || '',
    biggest_fear: initialData?.biggest_fear || '',
    biggest_objection: initialData?.biggest_objection || '',
    why_chose_us: initialData?.why_chose_us || '',
    what_built_trust: initialData?.what_built_trust || '',
    questions_asked: initialData?.questions_asked || '',
    cx_rating: initialData?.cx_rating || null,
    job_quality_feedback: initialData?.job_quality_feedback || '',
    improvement_opportunities: initialData?.improvement_opportunities || [],
    has_review: initialData?.has_review || false,
    has_referral: initialData?.has_referral || false,
    amc_opportunity: initialData?.amc_opportunity || false,
    status: initialData?.status || 'won',
  });

  const handleQuickPasteParse = () => {
    if (!pasteText.trim()) {
      toast.error('Please paste WhatsApp chat or call notes first.');
      return;
    }
    try {
      const parsed = parseCustomerNotes(pasteText);
      setFormData((prev) => ({
        ...prev,
        why_contacted: parsed.why_contacted || prev.why_contacted,
        biggest_fear: parsed.biggest_fear || prev.biggest_fear,
        biggest_objection: parsed.biggest_objection || prev.biggest_objection,
        what_built_trust: parsed.what_built_trust || prev.what_built_trust,
        cx_rating: parsed.cx_rating || prev.cx_rating,
        job_quality_feedback: parsed.job_quality_feedback || prev.job_quality_feedback,
        improvement_opportunities: parsed.improvement_opportunities?.length
          ? parsed.improvement_opportunities
          : prev.improvement_opportunities,
        amc_opportunity: parsed.amc_opportunity || prev.amc_opportunity,
        has_review: parsed.has_review || prev.has_review,
        has_referral: parsed.has_referral || prev.has_referral,
      }));
      toast.success('AI Quick-Paste Parsed Successfully!', {
        description: 'Pre-sale psychology and post-job CX telemetry auto-populated.',
      });
    } catch (err: unknown) {
      toast.error('Parser encountered an unexpected format.');
      console.error('[CustomerForm] Parser error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Customer name is required.');
      return;
    }
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-sans font-bold">
      {/* 1. AI Quick-Paste Box (Governed by Option C) */}
      <div className="border border-border/60 bg-card/90 backdrop-blur-xl p-6 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase text-primary tracking-wider">
              [ AI QUICK-PASTE: RAW WHATSAPP / CALL / CX SURVEY NOTE PARSER ]
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Paste customer WhatsApp chat logs, sales call transcripts, or technician survey notes to auto-extract psychology & CX metrics.
            </p>
          </div>
          <Button
            type="button"
            onClick={handleQuickPasteParse}
            className="rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-wider hover:bg-primary/80 text-xs px-4"
          >
            [ AI QUICK-PASTE PARSE ]
          </Button>
        </div>
        <Textarea
          rows={3}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="e.g., 'Client worried about chemical toxicity for pet dog. Overcame objection on quote pricing via 180-day botanical guarantee. Rating: 5/5. Technician was punctual, recommended offering AMC discount...'"
          className="rounded-xl bg-secondary-fixed/30 border-border/50 text-xs text-on-background font-sans font-bold"
        />
      </div>

      {/* 2. Identity & Attribution */}
      <div className="border border-border/50 bg-card/80 p-6 rounded-xl space-y-4">
        <h4 className="text-xs font-bold uppercase text-on-background tracking-wider border-b border-border/40 pb-2">
          1. Customer Identity & Attribution
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">Customer Name *</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Acme Warehouse Logistics"
              className="rounded-xl text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">Property Type</Label>
            <Select
              value={formData.property_type}
              onValueChange={(val) => setFormData({ ...formData, property_type: val as CustomerPropertyType })}
            >
              <SelectTrigger className="rounded-xl text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl font-sans font-bold">
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">Lead Source / Attribution</Label>
            <Input
              value={formData.lead_source || ''}
              onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
              placeholder="e.g. Meta Ads — Botanical Video Ad"
              className="rounded-xl text-xs"
            />
          </div>
        </div>
      </div>

      {/* 3. Financial Economics */}
      <div className="border border-border/50 bg-card/80 p-6 rounded-xl space-y-4">
        <h4 className="text-xs font-bold uppercase text-emerald-400 tracking-wider border-b border-border/40 pb-2">
          2. Lifetime Financial Economics (INR ₹)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">Total Revenue (₹)</Label>
            <Input
              type="number"
              value={formData.revenue}
              onChange={(e) => setFormData({ ...formData, revenue: Number(e.target.value) || 0 })}
              className="rounded-xl text-xs tabular-nums"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">Net Profit (₹)</Label>
            <Input
              type="number"
              value={formData.profit}
              onChange={(e) => setFormData({ ...formData, profit: Number(e.target.value) || 0 })}
              className="rounded-xl text-xs tabular-nums text-emerald-400 font-bold"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">Lifetime Value / LTV (₹)</Label>
            <Input
              type="number"
              value={formData.ltv}
              onChange={(e) => setFormData({ ...formData, ltv: Number(e.target.value) || 0 })}
              className="rounded-xl text-xs tabular-nums text-primary font-bold"
            />
          </div>
        </div>
      </div>

      {/* 4. Pre-Sale Psychology & Post-Job CX Matrix */}
      <div className="border border-border/50 bg-card/80 p-6 rounded-xl space-y-4">
        <h4 className="text-xs font-bold uppercase text-primary tracking-wider border-b border-border/40 pb-2">
          3. Pre-Sale Consumer Psychology & Post-Job CX Telemetry
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase text-rose-400">Biggest Buyer Fear</Label>
            <Input
              value={formData.biggest_fear || ''}
              onChange={(e) => setFormData({ ...formData, biggest_fear: e.target.value })}
              placeholder="e.g. Chemical toxicity for children and pets"
              className="rounded-xl text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase text-amber-400">Biggest Objection Overcome</Label>
            <Input
              value={formData.biggest_objection || ''}
              onChange={(e) => setFormData({ ...formData, biggest_objection: e.target.value })}
              placeholder="e.g. High pricing compared to local DIY sprays"
              className="rounded-xl text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase text-emerald-400">What Built Executive Trust</Label>
            <Input
              value={formData.what_built_trust || ''}
              onChange={(e) => setFormData({ ...formData, what_built_trust: e.target.value })}
              placeholder="e.g. 100% Botanical Certification & 180-Day Guarantee"
              className="rounded-xl text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase text-primary">CX Rating (1 to 5)</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={formData.cx_rating || ''}
              onChange={(e) => setFormData({ ...formData, cx_rating: parseInt(e.target.value, 10) || null })}
              placeholder="5"
              className="rounded-xl text-xs tabular-nums"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs uppercase text-muted-foreground">Job Quality & Operational Feedback</Label>
            <Textarea
              rows={2}
              value={formData.job_quality_feedback || ''}
              onChange={(e) => setFormData({ ...formData, job_quality_feedback: e.target.value })}
              placeholder="e.g. Technician arrived on time; client suggested better odor control instructions."
              className="rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 pt-4 border-t border-border/40">
          <label className="flex items-center gap-2 cursor-pointer text-xs uppercase text-on-background">
            <input
              type="checkbox"
              checked={formData.amc_opportunity}
              onChange={(e) => setFormData({ ...formData, amc_opportunity: e.target.checked })}
              className="rounded-xl accent-[#00dbe9]"
            />
            AMC Opportunity Flagged
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs uppercase text-on-background">
            <input
              type="checkbox"
              checked={formData.has_review}
              onChange={(e) => setFormData({ ...formData, has_review: e.target.checked })}
              className="rounded-xl accent-[#00dbe9]"
            />
            5-Star Google Review Verified
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs uppercase text-on-background">
            <input
              type="checkbox"
              checked={formData.has_referral}
              onChange={(e) => setFormData({ ...formData, has_referral: e.target.checked })}
              className="rounded-xl accent-[#00dbe9]"
            />
            Referral Generated
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-wider hover:bg-primary/80 px-8"
        >
          {loading ? '[ SAVING... ]' : '[ COMMIT CUSTOMER RECORD ]'}
        </Button>
      </div>
    </form>
  );
}
