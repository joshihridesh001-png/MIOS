"use client"

import { CreativeRow } from '@/lib/types/database'
import {
  creativeFormatLabels,
  creativeFormatIcons,
  platformIcons,
  platformLabels,
} from '@/lib/constants'
import { isVideoAssetUrl } from '@/lib/creative-parser'
import { Globe, ThumbsUp, ChatCircle, ShareNetwork, ArrowSquareOut } from "@phosphor-icons/react"

interface CreativePreviewBoxProps {
  creative: Partial<CreativeRow>
}

export function CreativePreviewBox({ creative }: CreativePreviewBoxProps) {
  const platformName = creative.platform ? platformLabels[creative.platform] || creative.platform : 'Meta Ads'
  const platformIcon = creative.platform ? platformIcons[creative.platform] || '📱' : '📱'
  const isVideo = isVideoAssetUrl(creative.asset_url, creative.format)

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-muted/90 border border-border shadow-2xl overflow-hidden font-sans">
      {/* Social Feed Header */}
      <div className="p-4 flex items-center justify-between border-b border-border/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-foreground font-bold text-lg shadow-md">
            M
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-sm text-foreground">
              <span>Marketing Intelligence OS</span>
              <span className="text-emerald-400">✓</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Sponsored</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Globe weight="duotone" className="w-3 h-3" />
                {platformName} {platformIcon}
              </span>
            </div>
          </div>
        </div>

        <div className="text-muted-foreground font-bold text-lg tracking-widest px-2">•••</div>
      </div>

      {/* Primary Text (Body Copy) */}
      <div className="p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
        {creative.primary_text || 'Scale your enterprise growth with data-driven marketing intelligence and high-confidence consumer psychology insights.'}
      </div>

      {/* Visual Asset Area */}
      <div className="relative w-full aspect-[4/3] bg-card via-zinc-900 to-black flex flex-col items-center justify-center border-y border-border overflow-hidden">
        {creative.asset_url ? (
          isVideo ? (
            <video
              src={creative.asset_url}
              controls
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={creative.asset_url}
              alt={creative.name || 'Ad Preview'}
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div className="text-center space-y-3 p-6 max-w-sm">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/10">
              {creativeFormatIcons[creative.format || 'image'] || '🖼️'}
            </div>
            <div className="font-bold text-lg text-foreground">
              {creative.headline || creative.name || 'Scale Growth with Data-Driven Buyer Psychology'}
            </div>
            <div className="text-xs text-muted-foreground px-4">
              {creativeFormatLabels[creative.format || 'image']} • Live Visual Asset Preview
            </div>
          </div>
        )}

        {/* Overlay Angle Badge */}
        <div className="absolute top-3 right-3 bg-background/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
          Ad Preview Mode
        </div>
      </div>

      {/* Headline + CTA Bar (Facebook/Instagram Footer Style) */}
      <div className="p-3.5 bg-card/80 flex items-center justify-between gap-3 border-b border-border">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold truncate">
            MARKETING-INTELLIGENCE.COM
          </div>
          <div className="text-sm font-bold text-foreground truncate">
            {creative.headline || creative.name || 'Scale Growth with Data-Driven Buyer Psychology'}
          </div>
        </div>

        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-muted hover:bg-zinc-700 text-foreground text-xs font-semibold uppercase tracking-wider border border-border transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
        >
          <span>{creative.cta_text || 'Learn More'}</span>
          <ArrowSquareOut weight="duotone" className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Social Engagement Actions */}
      <div className="p-3 flex items-center justify-around text-xs text-muted-foreground bg-muted/60">
        <div className="flex items-center gap-1.5 hover:text-zinc-200 cursor-pointer transition-colors">
          <ThumbsUp weight="duotone" className="w-4 h-4" />
          <span>Like</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-zinc-200 cursor-pointer transition-colors">
          <ChatCircle weight="duotone" className="w-4 h-4" />
          <span>Comment</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-zinc-200 cursor-pointer transition-colors">
          <ShareNetwork weight="duotone" className="w-4 h-4" />
          <span>Share</span>
        </div>
      </div>
    </div>
  )
}
