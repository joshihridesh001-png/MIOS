'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Trash2, FileText } from 'lucide-react'
import { parseCampaignText, ParsedCampaignResult } from '@/lib/campaign-parser'
import { CampaignRow } from '@/lib/types/database'
import { toast } from 'sonner'

interface QuickPasteCardProps {
  onApplyParsedData: (data: Partial<CampaignRow>) => void
}

const EXAMPLE_META_ADS_TEXT = `Campaign Name: Q3 Enterprise Growth Special
Platform: Meta Ads
Location: Bangalore
Pest Type: Enterprise B2B
Spend: Rs. 45,000
Revenue: Rs. 3,50,000
COGS: Rs. 70,000
Impressions: 2,50,000
Clicks: 6,200
Inquiries: 310
Qualified Leads: 120
Customers Won: 35
What worked: Video carousel ads with performance guarantee overlay had 45% higher CTR
What failed: Single static image ad underperformed after day 4
Hypothesis: Offering an instant audit and 180-day retention warranty will drive high-intent executive inquiries`

export function QuickPasteCard({ onApplyParsedData }: QuickPasteCardProps) {
  const [text, setText] = useState('')
  const [lastResult, setLastResult] = useState<ParsedCampaignResult | null>(null)

  const handleParseAndFill = () => {
    if (!text.trim()) {
      toast.error('Please paste some campaign text or numbers first')
      return
    }

    const result = parseCampaignText(text)
    if (result.extractedKeys.length === 0) {
      toast.error('No matching metrics or fields found in the text. Try including labels like "Spend: 45000", "Inquiries: 100", etc.')
      return
    }

    onApplyParsedData(result.data)
    setLastResult(result)
    toast.success(`✨ Extracted and filled ${result.extractedKeys.length} fields from your text!`)
  }

  const handleLoadExample = () => {
    setText(EXAMPLE_META_ADS_TEXT)
    setLastResult(null)
    toast.info('Loaded example Meta Ads analysis text')
  }

  const handleClear = () => {
    setText('')
    setLastResult(null)
  }

  return (
    <Card className="bg-emerald-500/5 backdrop-blur-xl border-border/50 border-l-4 border-l-emerald-500 shadow-xl transition-all">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
            <CardTitle className="text-lg font-bold">⚡ AI Quick-Paste (Meta Ads & Report Parser)</CardTitle>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleLoadExample}
            className="text-xs h-7 border-emerald-500/30 hover:bg-emerald-500/10 gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            Load Example Meta Ads Report
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Paste any Meta Ads analysis, WhatsApp report, or raw text below. We automatically parse your spend, revenue, inquiries, conversions, platform, and reflection notes!
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setLastResult(null)
          }}
          placeholder={`Paste Meta Ads campaign details here...\ne.g.\nSpend: Rs 45,000, Revenue: Rs 3,50,000, COGS: Rs 70,000\nImpressions: 250k, Clicks: 6200, Inquiries: 310, Customers Won: 35\nWhat worked: Video ads had great CTR`}
          className="w-full h-32 p-3 text-sm bg-background/60 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono resize-y"
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleParseAndFill}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/20 gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Parse & Auto-Fill Fields
            </Button>
            {text && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {lastResult && lastResult.extractedKeys.length > 0 && (
          <div className="pt-2 border-t border-border/40">
            <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
              <span>✨ Successfully filled {lastResult.extractedKeys.length} fields:</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {lastResult.extractedKeys.map((key) => (
                <Badge 
                  key={key} 
                  variant="outline" 
                  className="bg-emerald-500/10 border-emerald-500/30 text-emerald-300 text-xs py-0.5 px-2"
                >
                  ✓ {key}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
