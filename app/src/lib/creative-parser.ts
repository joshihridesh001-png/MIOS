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
