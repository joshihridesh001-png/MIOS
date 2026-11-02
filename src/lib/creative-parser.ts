import { CreativeRow, CreativeFormat, CreativeAngle, CreativeStatus, PlatformType } from './types/database'

export interface ParsedCreativeResult {
  data: Partial<CreativeRow>;
  extractedKeys: string[];
}

/**
 * Natural language and key-value parser for Ad Creatives & copy analysis.
 * Extracts headline, primary text, format, angle, spend, conversions, and reflection notes.
 */
export function parseCreativeText(text: string): ParsedCreativeResult {
  if (!text || !text.trim()) {
    return { data: {}, extractedKeys: [] }
  }

  const data: Partial<CreativeRow> = {}
  const extractedKeys: string[] = []

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

  // 1. Helper to parse numbers with Indian comma formatting and suffixes
  function extractNumber(keywords: string[]): number | undefined {
    for (const line of lines) {
      for (const kw of keywords) {
        const regex = new RegExp(
          `(?:^|\\b)${kw}[\\s:_=-]*(?:₹|Rs\\.?|INR|\\$)?\\s*([0-9]+(?:[.,][0-9]+)*(?:\\s*(?:k|lakhs?|l|m|million))?)`,
          'i'
        )
        const match = line.match(regex)
        if (match && match[1]) {
          return parseNumberWithSuffix(match[1].trim().toLowerCase())
        }
      }
    }

    for (const kw of keywords) {
      const regex = new RegExp(
        `${kw}[\\s:_=-]*(?:₹|Rs\\.?|INR|\\$)?\\s*([0-9]+(?:[.,][0-9]+)*(?:\\s*(?:k|lakhs?|l|m|million))?)`,
        'i'
      )
      const match = text.match(regex)
      if (match && match[1]) {
        return parseNumberWithSuffix(match[1].trim().toLowerCase())
      }
    }

    return undefined
  }

  function parseNumberWithSuffix(str: string): number {
    let clean = str.replace(/[,_]/g, '')
    let multiplier = 1

    if (clean.endsWith('k')) {
      multiplier = 1000
      clean = clean.slice(0, -1).trim()
    } else if (clean.endsWith('lakhs') || clean.endsWith('lakh')) {
      multiplier = 100000
      clean = clean.replace(/lakhs?/, '').trim()
    } else if (clean.endsWith('l')) {
      multiplier = 100000
      clean = clean.slice(0, -1).trim()
    } else if (clean.endsWith('million') || clean.endsWith('m')) {
      multiplier = 1000000
      clean = clean.replace(/million|m/, '').trim()
    }

    const val = parseFloat(clean)
    return isNaN(val) ? 0 : Math.round(val * multiplier * 100) / 100
  }

  // 2. Extract Numbers
  const spend = extractNumber(['spend', 'spent', 'cost', 'ad spend', 'budget'])
  if (spend !== undefined && spend > 0) { data.spend = spend; extractedKeys.push('Spend') }

  const revenue = extractNumber(['revenue', 'sales', 'total revenue', 'generated revenue'])
  if (revenue !== undefined && revenue > 0) { data.revenue = revenue; extractedKeys.push('Revenue') }

  const impressions = extractNumber(['impressions', 'impr', 'views', 'ad impressions'])
  if (impressions !== undefined && impressions > 0) { data.impressions = impressions; extractedKeys.push('Impressions') }

  const clicks = extractNumber(['clicks', 'link clicks', 'ad clicks'])
  if (clicks !== undefined && clicks > 0) { data.clicks = clicks; extractedKeys.push('Clicks') }

  const inquiries = extractNumber(['inquiries', 'enquiries', 'leads', 'total inquiries', 'messages', 'calls'])
  if (inquiries !== undefined && inquiries > 0) { data.inquiries = inquiries; extractedKeys.push('Inquiries') }

  const customers_won = extractNumber(['customers won', 'clients won', 'customers', 'clients', 'conversions', 'won'])
  if (customers_won !== undefined && customers_won > 0) { data.customers_won = customers_won; extractedKeys.push('Customers Won') }

  const fatigue_score = extractNumber(['fatigue score', 'fatigue', 'burnout score', 'burnout'])
  if (fatigue_score !== undefined && fatigue_score >= 0 && fatigue_score <= 100) {
    data.fatigue_score = fatigue_score
    extractedKeys.push('Fatigue Score')
  }

  // 3. Extract Format
  const lower = text.toLowerCase()
  if (lower.includes('carousel')) {
    data.format = 'carousel'
    extractedKeys.push('Format (Carousel)')
  } else if (lower.includes('video') || lower.includes('reel') || lower.includes('short')) {
    data.format = 'video'
    extractedKeys.push('Format (Video)')
  } else if (lower.includes('image') || lower.includes('static') || lower.includes('banner')) {
    data.format = 'image'
    extractedKeys.push('Format (Image)')
  } else if (lower.includes('text only') || lower.includes('copy only')) {
    data.format = 'text'
    extractedKeys.push('Format (Text)')
  }

  // 4. Extract Angle
  if (lower.includes('discount') || lower.includes('% off') || lower.includes('offer') || lower.includes('promo')) {
    data.angle = 'discount_offer'
    extractedKeys.push('Angle (Discount Offer)')
  } else if (lower.includes('fear') || lower.includes('urgency') || lower.includes('destroy') || lower.includes('damage') || lower.includes('now')) {
    data.angle = 'fear_urgency'
    extractedKeys.push('Angle (Fear & Urgency)')
  } else if (lower.includes('social proof') || lower.includes('review') || lower.includes('testimonial') || lower.includes('rating') || lower.includes('stars')) {
    data.angle = 'social_proof_reviews'
    extractedKeys.push('Angle (Social Proof)')
  } else if (lower.includes('educational') || lower.includes('how to') || lower.includes('guide') || lower.includes('tips')) {
    data.angle = 'educational'
    extractedKeys.push('Angle (Educational)')
  } else if (lower.includes('authority') || lower.includes('guarantee') || lower.includes('certified') || lower.includes('warranty') || lower.includes('government')) {
    data.angle = 'authority_guarantee'
    extractedKeys.push('Angle (Authority & Guarantee)')
  } else if (lower.includes('before') && lower.includes('after')) {
    data.angle = 'before_after'
    extractedKeys.push('Angle (Before & After)')
  }

  // 5. Extract Headline & Primary Text & CTA
  const headMatch = text.match(/(?:headline|hook|ad headline|title)[\s:_=-]+([^\r\n]+)/i)
  if (headMatch && headMatch[1]) {
    data.headline = headMatch[1].trim()
    extractedKeys.push('Headline')
  }

  const copyMatch = text.match(/(?:primary text|body|copy|ad text|description)[\s:_=-]+([^\r\n]+)/i)
  if (copyMatch && copyMatch[1]) {
    data.primary_text = copyMatch[1].trim()
    extractedKeys.push('Primary Text')
  }

  const ctaMatch = text.match(/(?:cta|button text|call to action)[\s:_=-]+([^\r\n]+)/i)
  if (ctaMatch && ctaMatch[1]) {
    data.cta_text = ctaMatch[1].trim()
    extractedKeys.push('CTA Text')
  }

  // 6. Extract Creative Name
  const nameMatch = text.match(/(?:creative name|ad name|creative|name)[\s:_=-]+([^\r\n,.]+)/i)
  if (nameMatch && nameMatch[1]) {
    data.name = nameMatch[1].trim()
    extractedKeys.push('Creative Name')
  } else if (data.headline && !data.name) {
    data.name = data.headline.slice(0, 40)
    extractedKeys.push('Creative Name')
  }

  // 7. Extract Reflection Notes
  const workedMatch = text.match(/(?:what worked|worked|positives|wins)[\s:_=-]+([^\r\n]+)/i)
  if (workedMatch && workedMatch[1]) {
    data.what_worked = workedMatch[1].trim()
    extractedKeys.push('What Worked')
  }

  const failedMatch = text.match(/(?:what failed|failed|negatives|issues)[\s:_=-]+([^\r\n]+)/i)
  if (failedMatch && failedMatch[1]) {
    data.what_failed = failedMatch[1].trim()
    extractedKeys.push('What Failed')
  }

  const hypMatch = text.match(/(?:hypothesis|goal|expected|hook hypothesis)[\s:_=-]+([^\r\n]+)/i)
  if (hypMatch && hypMatch[1]) {
    data.hook_hypothesis = hypMatch[1].trim()
    extractedKeys.push('Hook Hypothesis')
  }

  return { data, extractedKeys }
}

/**
 * Determines whether an asset URL or creative format represents a video asset.
 */
export function isVideoAssetUrl(
  url?: string | null,
  format?: string | null
): boolean {
  if (format === 'video') {
    return true
  }
  if (!url || typeof url !== 'string') {
    return false
  }
  const cleanUrl = url.split('?')[0].split('#')[0].trim().toLowerCase()
  return (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.mov')
  )
}

/**
 * Zero-effort creative metadata inference from an uploaded filename and MIME type.
 * Infers human-readable title, format, psychological angle, ad platform, and keyword tags.
 */
export function inferCreativeMetadataFromFilename(
  fileName: string,
  mimeType?: string
): Partial<CreativeRow> {
  if (!fileName || typeof fileName !== 'string') {
    return {}
  }

  const trimmed = fileName.trim()
  const lowerFile = trimmed.toLowerCase()

  // 1. Detect format from mimeType, extension, or filename keywords
  let format: CreativeFormat = 'image'
  if (
    mimeType?.toLowerCase().startsWith('video/') ||
    /\.(mp4|webm|mov)$/i.test(lowerFile)
  ) {
    format = 'video'
  } else if (lowerFile.includes('carousel')) {
    format = 'carousel'
  }

  // 2. Strip file extension and leading/trailing raw epoch timestamps
  const withoutExt = trimmed.replace(/\.[a-z0-9]{2,5}$/i, '')
  const withoutTimestamps = withoutExt
    .replace(/^(?:\d{8,14}[_-]+)+/, '')
    .replace(/(?:[_-]+\d{8,14})+$/, '')

  const rawTokens = withoutTimestamps
    .split(/[_-\s.]+/)
    .map((t) => t.trim())
    .filter(Boolean)

  const name = rawTokens
    .map((token) => {
      if (/^(?:q[1-4]|v\d+|b2b|b2c|roi|sla|cfo|ceo|smb|amc|fb|ig|yt)$/i.test(token)) {
        return token.toUpperCase()
      }
      return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase()
    })
    .join(' ')

  const lowerTokens = rawTokens.map((t) => t.toLowerCase())
  const hasAny = (keywords: string[]) =>
    keywords.some(
      (kw) =>
        lowerTokens.includes(kw) ||
        new RegExp(`(?:^|[_\\-\\s])${kw}(?:s|ed|ing)?(?:$|[_\\-\\s])`, 'i').test(
          withoutTimestamps
        )
    )

  // 3. Detect CreativeAngle
  let angle: CreativeAngle = 'authority_guarantee'
  if (hasAny(['fear', 'urgent', 'urgency', 'risk', 'penalty', 'warning', 'mistake'])) {
    angle = 'fear_urgency'
  } else if (hasAny(['proof', 'review', 'case', 'testimonial', 'client'])) {
    angle = 'social_proof_reviews'
  } else if (hasAny(['authority', 'guarantee', 'sla', 'certified', 'audit'])) {
    angle = 'authority_guarantee'
  } else if (hasAny(['before', 'after', 'transform'])) {
    angle = 'before_after'
  } else if (hasAny(['edu', 'guide', 'how', 'framework', 'tip'])) {
    angle = 'educational'
  } else if (hasAny(['discount', 'offer', 'free', 'promo', 'off'])) {
    angle = 'discount_offer'
  }

  // 4. Detect PlatformType
  let platform: PlatformType | null = null
  if (hasAny(['meta', 'fb', 'ig', 'insta', 'instagram', 'facebook'])) {
    platform = 'meta_ads'
  } else if (hasAny(['google', 'search', 'yt', 'youtube', 'ppc'])) {
    platform = 'google_ads'
  } else if (hasAny(['wa', 'whatsapp'])) {
    platform = 'whatsapp'
  } else if (hasAny(['linkedin', 'organic'])) {
    platform = 'organic_social'
  }

  // 5. Extract 2-4 clean lowercase keyword tags (excluding stop words & version markers)
  const stopWords = new Set([
    'the',
    'and',
    'for',
    'with',
    'from',
    'into',
    'final',
    'draft',
    'copy',
    'new',
    'edit',
    'file',
    'asset',
  ])
  const tags: string[] = []
  for (const tok of lowerTokens) {
    if (
      tok.length >= 3 &&
      !stopWords.has(tok) &&
      !/^v\d+$/i.test(tok) &&
      !/^\d+$/.test(tok) &&
      !tags.includes(tok)
    ) {
      tags.push(tok)
      if (tags.length === 4) break
    }
  }

  const inferred: Partial<CreativeRow> = {
    name: name || 'Untitled Creative Asset',
    format,
    angle,
    tags,
  }
  if (platform) {
    inferred.platform = platform
  }

  return inferred
}

/**
 * Generates an industry-agnostic, high-converting 1-click creative draft
 * (headline, primary_text, cta_text, hook_hypothesis) tailored to the selected angle.
 */
export function generateSmartCreativeDraft(
  angle: CreativeAngle,
  assetName?: string,
  campaignName?: string
): Partial<CreativeRow> {
  const contextLabel = (campaignName || assetName || 'Core Service Engagement').trim()

  switch (angle) {
    case 'fear_urgency':
      return {
        angle,
        headline: `Eliminate Operational Risk Before It Costs You 3x in Rework`,
        primary_text: `Delayed execution and compliance blind spots silently erode margin. For ${contextLabel}, our SLA-backed specialists identify and resolve critical bottlenecks in the first 14 days—with zero workflow disruption.`,
        cta_text: 'Book Risk Audit',
        hook_hypothesis: `High-urgency loss-aversion hook addressing hidden cost of inaction for ${contextLabel} will lift qualified CTR above 1.8%.`,
      }

    case 'social_proof_reviews':
      return {
        angle,
        headline: `Why 200+ Growth Leaders Trust Our Proven Execution Framework`,
        primary_text: `See how organizations scaling ${contextLabel} cut turnaround times by 40% and achieved predictable ROI within a single cycle. Verified client outcomes with full reporting transparency.`,
        cta_text: 'See Case Studies',
        hook_hypothesis: `Peer validation and quantified outcome proof for ${contextLabel} will reduce buyer skepticism and increase landing page CVR.`,
      }

    case 'authority_guarantee':
      return {
        angle,
        headline: `100% SLA Performance Guarantee — Predictable Delivery or We Cover the Gap`,
        primary_text: `Stop gambling on unverified vendors. Our certified specialists execute ${contextLabel} under a strict contractual SLA, dedicated account roadmap, and milestone accountability.`,
        cta_text: 'Claim SLA Consultation',
        hook_hypothesis: `Explicit contractual risk-reversal and authority credentials for ${contextLabel} will overcome price objections among high-LTV buyers.`,
      }

    case 'before_after':
      return {
        angle,
        headline: `From Fragmented Bottlenecks to Predictable, Audit-Ready Execution`,
        primary_text: `Before: missed deadlines, unclear reporting, and costly firefighting. After implementing our ${contextLabel} system: automated milestone tracking, dedicated specialist execution, and measurable net margin lift.`,
        cta_text: 'See the Transformation',
        hook_hypothesis: `Contrasting chaotic status-quo state against structured post-onboarding outcomes for ${contextLabel} will drive higher thumb-stop engagement.`,
      }

    case 'educational':
      return {
        angle,
        headline: `The 3-Step Executive Checklist for High-ROI ${contextLabel}`,
        primary_text: `Most service engagements leak 30% of their value during onboarding. Here is the exact diagnostic framework our senior team uses to lock in unit-economic efficiency from Day 1.`,
        cta_text: 'Download Framework',
        hook_hypothesis: `Value-first educational framing for ${contextLabel} will capture mid-funnel evaluators at a 25% lower CPL.`,
      }

    case 'discount_offer':
      return {
        angle,
        headline: `Priority Onboarding + Complimentary Diagnostic Audit This Month`,
        primary_text: `Lock in preferred annual retainer economics for ${contextLabel} and receive a full baseline diagnostic audit at zero cost when you schedule your discovery call this week.`,
        cta_text: 'Claim Priority Offer',
        hook_hypothesis: `Time-bounded diagnostic bonus offer for ${contextLabel} will accelerate lead-to-proposal velocity inside the current sales cycle.`,
      }

    default:
      return {
        angle: 'other',
        headline: `Engineered for Predictable ROI: ${contextLabel}`,
        primary_text: `Partner with dedicated specialists delivering measurable outcomes, transparent reporting, and contractual SLA reliability for ${contextLabel}.`,
        cta_text: 'Schedule Consultation',
        hook_hypothesis: `Direct value proposition for ${contextLabel} establishes baseline CTR and conversion rate benchmark.`,
      }
  }
}
