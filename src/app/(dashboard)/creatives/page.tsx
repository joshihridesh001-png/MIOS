"use client"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useCreatives } from '@/hooks/use-creatives'
import { CreativeCard } from '@/components/creatives/creative-card'
import { CreativeTable } from '@/components/creatives/creative-table'
import {
  creativeFormatLabels,
  creativeFormatIcons,
  creativeAngleLabels,
  creativeStatusLabels,
} from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, SquaresFour, Table as Table, MagnifyingGlass, Faders, Sparkle } from "@phosphor-icons/react"
import { TextReveal, AnimatedList } from '@/components/ui/unlumen'

export default function CreativesPage() {
  const { creatives, loading, error, refetch } = useCreatives()

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [formatFilter, setFormatFilter] = useState<string>('all')
  const [angleFilter, setAngleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredCreatives = useMemo(() => {
    return creatives.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.headline && c.headline.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.primary_text && c.primary_text.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesFormat = formatFilter === 'all' || c.format === formatFilter
      const matchesAngle = angleFilter === 'all' || c.angle === angleFilter
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter

      return matchesSearch && matchesFormat && matchesAngle && matchesStatus
    })
  }, [creatives, searchQuery, formatFilter, angleFilter, statusFilter])

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-wider uppercase text-foreground font-sans font-bold flex items-center gap-2">
            <TextReveal text="CREATIVE PERFORMANCE & ASSET LIBRARY" />
            <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-xl bg-primary/10 text-primary border border-primary/30">
              SLICE 2
            </span>
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Track visual hooks, psychological angles, and ad fatigue across every marketing asset.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-lg bg-secondary/60 border border-border/60">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-2xl transition-all ${
                viewMode === 'grid'
                  ? 'bg-emerald-500 text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Gallery Grid View"
            >
              <SquaresFour weight="duotone" className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-2xl transition-all ${
                viewMode === 'table'
                  ? 'bg-emerald-500 text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Tabular Analytical View"
            >
              <Table weight="duotone" className="w-4 h-4" />
            </button>
          </div>

          <Link href="/creatives/new">
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-foreground font-semibold text-xs h-9 px-4 shadow-lg shadow-emerald-950/40">
              <Plus weight="duotone" className="w-4 h-4 mr-1.5" />
              New Creative
            </Button>
          </Link>
        </div>
      </div>

      {/* Faders & MagnifyingGlass Toolbar */}
      <div className="p-4 rounded-xl bg-card/80 backdrop-blur-xl border border-border/60 shadow-md flex flex-wrap items-center gap-3">
        {/* MagnifyingGlass Input */}
        <div className="relative flex-1 min-w-[220px]">
          <MagnifyingGlass weight="duotone" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="MagnifyingGlass headline, name, or copy..."
            className="pl-9 h-9 text-xs bg-background/60"
          />
        </div>

        {/* Format Faders */}
        <div className="flex items-center gap-1.5">
          <Faders weight="duotone" className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="h-9 rounded-2xl border border-input bg-background/60 px-3 text-xs text-foreground focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Formats</option>
            {Object.entries(creativeFormatLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {creativeFormatIcons[key] || '🖼️'} {label}
              </option>
            ))}
          </select>
        </div>

        {/* Angle Faders */}
        <div>
          <select
            value={angleFilter}
            onChange={(e) => setAngleFilter(e.target.value)}
            className="h-9 rounded-2xl border border-input bg-background/60 px-3 text-xs text-foreground focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Angles</option>
            {Object.entries(creativeAngleLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Faders */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-2xl border border-input bg-background/60 px-3 text-xs text-foreground focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            {Object.entries(creativeStatusLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Creatives Display Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-xl bg-card/60 border border-border/40" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl bg-red-950/20 border border-red-500/30 text-center">
          <p className="text-red-400 font-semibold text-sm">Failed to load creatives</p>
          <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
        </div>
      ) : filteredCreatives.length === 0 ? (
        <div className="text-center py-16 bg-card/40 rounded-xl border border-border/40 font-sans font-bold">
          <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs mb-3 border border-primary/30">
            [0]
          </div>
          <h3 className="text-base font-semibold text-foreground uppercase tracking-wider">NO CREATIVES LOGGED </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {searchQuery || formatFilter !== 'all' || angleFilter !== 'all' || statusFilter !== 'all'
              ? 'No creatives match your filter criteria. Try clearing filters.'
              : 'Add your first creative ad copy or visual asset to build your marketing ad library.'}
          </p>
          <Link href="/creatives/new" className="inline-block mt-4">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-foreground text-xs">
              <Plus weight="duotone" className="w-3.5 h-3.5 mr-1" />
              New Creative
            </Button>
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={50}>
          {filteredCreatives.map((creative) => (
            <CreativeCard key={creative.id} creative={creative} />
          ))}
        </AnimatedList>
      ) : (
        <CreativeTable creatives={filteredCreatives} />
      )}
    </div>
  )
}
