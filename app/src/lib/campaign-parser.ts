import { CampaignRow, PlatformType } from './types/database'

export interface ParsedCampaignResult {
  data: Partial<CampaignRow>;
  extractedKeys: string[];
}

/**
 * Robust natural language and key-value parser for Meta Ads / marketing reports.
 * Extracts campaign name, platform, location, pest type, metrics, and reflection notes.
 */
export function parseCampaignText(text: string): ParsedCampaignResult {
  if (!text || !text.trim()) {
    return { data: {}, extractedKeys: [] }
  }

  const data: Partial<CampaignRow> = {}
  const extractedKeys: string[] = []

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

  // 1. Helper to extract numbers with units (k, l, lakh, rs, ₹, commas)
  function extractMetric(keywords: string[]): number | undefined {
    for (const line of lines) {
      for (const kw of keywords) {
        // Match keyword followed by optional colons/words and a number
        const regex = new RegExp(
          `(?:^|\\b)${kw}[\\s:_=-]*(?:₹|Rs\\.?|INR|\\$)?\\s*([0-9]+(?:[.,][0-9]+)*(?:\\s*(?:k|lakhs?|l|m|million))?)`,
          'i'
        )
        const match = line.match(regex)
        if (match && match[1]) {
          const rawNumStr = match[1].trim().toLowerCase()
          return parseNumberWithSuffix(rawNumStr)
        }
      }
    }

    // Fallback: Check within single paragraph text
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
  const spend = extractMetric(['spend', 'spent', 'cost', 'ad spend', 'budget', 'amount spent'])
  if (spend !== undefined && spend > 0) { data.spend = spend; extractedKeys.push('Spend') }

  const revenue = extractMetric(['revenue', 'sales', 'total revenue', 'generated revenue', 'return'])
  if (revenue !== undefined && revenue > 0) { data.revenue = revenue; extractedKeys.push('Revenue') }

  const cogs = extractMetric(['cogs', 'cost of goods', 'service cost', 'delivery cost', 'direct cost'])
  if (cogs !== undefined && cogs > 0) { data.cogs = cogs; extractedKeys.push('COGS') }

  const impressions = extractMetric(['impressions', 'impr', 'views', 'ad impressions'])
  if (impressions !== undefined && impressions > 0) { data.impressions = impressions; extractedKeys.push('Impressions') }

  const reach = extractMetric(['reach', 'people reached', 'unique accounts'])
  if (reach !== undefined && reach > 0) { data.reach = reach; extractedKeys.push('Reach') }

  const clicks = extractMetric(['clicks', 'link clicks', 'ad clicks', 'outbound clicks'])
  if (clicks !== undefined && clicks > 0) { data.clicks = clicks; extractedKeys.push('Clicks') }

  const inquiries = extractMetric(['inquiries', 'enquiries', 'total inquiries', 'total enquiries', 'inbound inquiries', 'leads', 'total leads'])
  if (inquiries !== undefined && inquiries > 0) { data.inquiries = inquiries; extractedKeys.push('Inquiries') }

  const messages = extractMetric(['messages', 'msg', 'whatsapp messages', 'chats', 'dm', 'dms'])
  if (messages !== undefined && messages > 0) { data.messages = messages; extractedKeys.push('Messages') }

  const calls = extractMetric(['calls', 'phone calls', 'phone inquiries'])
  if (calls !== undefined && calls > 0) { data.calls = calls; extractedKeys.push('Calls') }

  const site_visits = extractMetric(['site visits', 'website visits', 'landing page views', 'page views', 'visits'])
  if (site_visits !== undefined && site_visits > 0) { data.site_visits = site_visits; extractedKeys.push('Site Visits') }

  const qualified_leads = extractMetric(['qualified leads', 'sql', 'qualified', 'hot leads', 'good leads'])
  if (qualified_leads !== undefined && qualified_leads > 0) { data.qualified_leads = qualified_leads; extractedKeys.push('Qualified Leads') }

  const quotes_sent = extractMetric(['quotes sent', 'quotes', 'estimates sent', 'proposals sent'])
  if (quotes_sent !== undefined && quotes_sent > 0) { data.quotes_sent = quotes_sent; extractedKeys.push('Quotes Sent') }

  const customers_won = extractMetric(['customers won', 'clients won', 'customers', 'clients', 'won', 'conversions', 'sales closed', 'closed'])
  if (customers_won !== undefined && customers_won > 0) { data.customers_won = customers_won; extractedKeys.push('Customers Won') }

  // 3. Extract Platform
  const lower = text.toLowerCase()
  if (lower.includes('meta') || lower.includes('facebook') || lower.includes('fb') || lower.includes('instagram') || lower.includes('ig') || lower.includes('ads manager')) {
    data.platform = 'meta_ads'
    extractedKeys.push('Platform (Meta Ads)')
  } else if (lower.includes('google') || lower.includes('adwords') || lower.includes('search ads') || lower.includes('ppc')) {
    data.platform = 'google_ads'
    extractedKeys.push('Platform (Google Ads)')
  } else if (lower.includes('whatsapp') || lower.includes('wa ads')) {
    data.platform = 'whatsapp'
    extractedKeys.push('Platform (WhatsApp)')
  } else if (lower.includes('organic')) {
    data.platform = 'organic_social'
    extractedKeys.push('Platform (Organic Social)')
  }

  // 4. Extract Campaign Name
  const nameMatch = text.match(/(?:campaign|name|campaign name)[\s:_=-]+([^\r\n,.]+)/i)
  if (nameMatch && nameMatch[1]) {
    data.name = nameMatch[1].trim()
    extractedKeys.push('Campaign Name')
  } else if (lines.length > 0 && lines[0].length < 60 && !lines[0].includes(':')) {
    data.name = lines[0].trim()
    extractedKeys.push('Campaign Name')
  }

  // 5. Extract Location
  const locMatch = text.match(/(?:location|city|region|area)[\s:_=-]+([^\r\n,.]+)/i)
  if (locMatch && locMatch[1]) {
    data.location = locMatch[1].trim()
    extractedKeys.push('Location')
  } else {
    const knownCities = ['Bangalore', 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Gurgaon', 'Noida']
    for (const city of knownCities) {
      if (new RegExp(`\\b${city}\\b`, 'i').test(text)) {
        data.location = city
        extractedKeys.push('Location')
        break
      }
    }
  }

  // 6. Extract Pest Type / Service
  const pestMatch = text.match(/(?:pest type|pest|service|treatment)[\s:_=-]+([^\r\n,.]+)/i)
  if (pestMatch && pestMatch[1]) {
    data.pest_type = pestMatch[1].trim()
    extractedKeys.push('Pest Type')
  } else {
    const knownPests = ['Termite', 'Cockroach', 'Bed bug', 'Mosquito', 'Rodent', 'Ant', 'Woodborer', 'General Pest']
    for (const pest of knownPests) {
      if (new RegExp(`\\b${pest}\\b`, 'i').test(text)) {
        data.pest_type = pest
        extractedKeys.push('Pest Type')
        break
      }
    }
  }

  // 7. Extract Reflection Notes (What worked / What failed / Hypothesis / Summary)
  const workedMatch = text.match(/(?:what worked|worked|positives|wins|strengths)[\s:_=-]+([^\r\n]+)/i)
  if (workedMatch && workedMatch[1]) {
    data.what_worked = workedMatch[1].trim()
    extractedKeys.push('What Worked')
  }

  const failedMatch = text.match(/(?:what failed|failed|negatives|issues|learnings|weaknesses)[\s:_=-]+([^\r\n]+)/i)
  if (failedMatch && failedMatch[1]) {
    data.what_failed = failedMatch[1].trim()
    extractedKeys.push('What Failed')
  }

  const hypMatch = text.match(/(?:hypothesis|goal|expected|strategy)[\s:_=-]+([^\r\n]+)/i)
  if (hypMatch && hypMatch[1]) {
    data.hypothesis = hypMatch[1].trim()
    extractedKeys.push('Hypothesis')
  }

  const sumMatch = text.match(/(?:result summary|summary|overall|verdict)[\s:_=-]+([^\r\n]+)/i)
  if (sumMatch && sumMatch[1]) {
    data.result_summary = sumMatch[1].trim()
    extractedKeys.push('Result Summary')
  }

  return { data, extractedKeys }
}
