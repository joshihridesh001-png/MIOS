"use client"

import { CreativeRow } from '@/lib/types/database'
import {
  creativeFormatLabels,
  creativeFormatIcons,
  platformIcons,
  platformLabels,
} from '@/lib/constants'
import { Globe, ThumbsUp, MessageCircle, Share2, ExternalLink } from 'lucide-react'

interface CreativePreviewBoxProps {
  creative: Partial<CreativeRow>
}

export function CreativePreviewBox({ creative }: CreativePreviewBoxProps) {
  const platformName = creative.platform ? platformLabels[creative.platform] || creative.platform : 'Meta Ads'
  const platformIcon = creative.platform ? platformIcons[creative.platform] || '📱' : '📱'

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl overflow-hidden font-sans">
      {/* Social Feed Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            M
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-sm text-zinc-100">
              <span>MIOS Pest Control</span>
              <span className="text-emerald-400">✓</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span>Sponsored</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {platformName} {platformIcon}
              </span>
            </div>
          </div>
        </div>

        <div className="text-zinc-500 font-bold text-lg tracking-widest px-2">•••</div>
      </div>

      {/* Primary Text (Body Copy) */}
      <div className="p-4 text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
        {creative.primary_text || 'Protect your home with certified pest management solutions. Odorless treatments with long-term warranty.'}
      </div>

      {/* Visual Asset Area */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-zinc-800 via-zinc-900 to-black flex flex-col items-center justify-center p-6 border-y border-zinc-800">
        {creative.asset_url ? (
          <img
            src={creative.asset_url}
            alt={creative.name || 'Ad Preview'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center space-y-3 p-6 max-w-sm">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/10">
              {creativeFormatIcons[creative.format || 'image'] || '🖼️'}
            </div>
            <div className="font-bold text-lg text-zinc-100">
              {creative.headline || creative.name || '15% OFF Annual Termite Protection'}
            </div>
            <div className="text-xs text-zinc-400 px-4">
              {creativeFormatLabels[creative.format || 'image']} • Visual preview placeholder
            </div>
          </div>
        )}

        {/* Overlay Angle Badge */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
          Ad Preview Mode
        </div>
      </div>

      {/* Headline + CTA Bar (Facebook/Instagram Footer Style) */}
      <div className="p-3.5 bg-zinc-950/80 flex items-center justify-between gap-3 border-b border-zinc-800">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold truncate">
            MIOSPESTCONTROL.IN
          </div>
          <div className="text-sm font-bold text-zinc-100 truncate">
            {creative.headline || creative.name || '15% OFF Annual Termite Protection'}
          </div>
        </div>

        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold uppercase tracking-wider border border-zinc-700 transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
        >
          <span>{creative.cta_text || 'Learn More'}</span>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
        </button>
      </div>

      {/* Social Engagement Actions */}
      <div className="p-3 flex items-center justify-around text-xs text-zinc-400 bg-zinc-900/60">
        <div className="flex items-center gap-1.5 hover:text-zinc-200 cursor-pointer transition-colors">
          <ThumbsUp className="w-4 h-4" />
          <span>Like</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-zinc-200 cursor-pointer transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span>Comment</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-zinc-200 cursor-pointer transition-colors">
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </div>
      </div>
    </div>
  )
}
