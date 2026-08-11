'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkle, Trash, FileText } from "@phosphor-icons/react"
import { parseCreativeText, ParsedCreativeResult } from '@/lib/creative-parser'
import { CreativeRow } from '@/lib/types/database'
import { toast } from 'sonner'

interface CreativeQuickPasteProps {
  onApplyParsedData: (data: Partial<CreativeRow>) => void
}

const EXAMPLE_CREATIVE_TEXT = `Creative Name: Termite 15% OFF Carousel
Format: Carousel
Angle: Discount Offer
Headline: 15% OFF Annual Termite Protection
Primary Text: Don't let termites destroy your Bangalore home this summer. Our certified experts offer 100% odorless drilling with a 5-year warranty. Book an inspection now!
CTA: Get Offer
Spend: Rs. 15,000
Impressions: 1,20,000
Clicks: 3,400
Inquiries: 180
Customers Won: 24
Revenue: Rs. 2,40,000
Fatigue Score: 30
What worked: High contrast pricing overlay in card 1 caught attention
What failed: Card 4 with technical diagram had low retention
Hypothesis: Leading with a clear 15% financial incentive will convert price-sensitive homeowners`

export function CreativeQuickPaste({ onApplyParsedData }: CreativeQuickPasteProps) {
  const [text, setText] = useState('')
  const [lastResult, setLastResult] = useState<ParsedCreativeResult | null>(null)

  const handleParseAndFill = () => {
    if (!text.trim()) {
      toast.error('Please paste some creative ad copy or report text first')
      return
    }

    const result = parseCreativeText(text)
    if (result.extractedKeys.length === 0) {
      toast.error('No matching creative metrics or fields found. Try using labels like "Headline: ...", "Spend: 15000", "Angle: Discount Offer", etc.')
      return
    }

    onApplyParsedData(result.data)
    setLastResult(result)
    toast.success(`✨ Extracted and filled ${result.extractedKeys.length} creative fields!`)
  }

  const handleLoadExample = () => {
    setText(EXAMPLE_CREATIVE_TEXT)
    const result = parseCreativeText(EXAMPLE_CREATIVE_TEXT)
    onApplyParsedData(result.data)
    setLastResult(result)
    toast.success('✨ Example creative ad copy & metrics loaded and applied!')
  }

  const handleClear = () => {
    setText('')
    setLastResult(null)
  }

  return (
    <Card className="mb-6 bg-gradient-to-br from-emerald-950/40 via-card/80 to-card/60 border-emerald-500/30 backdrop-blur-xl shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-emerald-400 flex items-center gap-2">
            <Sparkle weight="duotone" className="w-4 h-4 text-emerald-400 animate-pulse" />
            ⚡ AI Quick-Paste (Ad Copy & Creative Parser)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLoadExample}
              className="text-xs h-7 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-300"
            >
              <FileText weight="duotone" className="w-3 h-3 mr-1" />
              Load Example Ad
            </Button>
            {text && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs h-7 text-muted-foreground hover:text-foreground"
              >
                <Trash weight="duotone" className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Paste your Meta/Google ad copy, Slack notes, or campaign reports below. It automatically extracts your Headline, Primary Text, Angle, Format, and financial performance!
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste ad copy, spend, impressions, clicks, inquiries, conversions, or notes here..."
          className="w-full h-24 p-3 rounded-lg bg-background/60 border border-border/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 resize-y"
        />

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1 flex-1">
            {lastResult && lastResult.extractedKeys.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-medium text-emerald-400">Extracted:</span>
                {lastResult.extractedKeys.map((key) => (
                  <Badge
                    key={key}
                    variant="outline"
                    className="text-[10px] py-0 bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  >
                    ✓ {key}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={handleParseAndFill}
            className="bg-emerald-600 hover:bg-emerald-500 text-foreground font-medium text-xs px-4 h-8 shrink-0 shadow-md shadow-emerald-950/40"
          >
            <Sparkle weight="duotone" className="w-3.5 h-3.5 mr-1.5" />
            Parse & Auto-Fill Creative
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
