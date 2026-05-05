/**
 * Fetches real-time exchange rate for a given currency against USD.
 * Falls back to a static rate if the API is unavailable.
 */
const FALLBACK_RATES: Record<string, number> = {
  'USD': 1,
  'GHS': 15.5,
  'EUR': 0.92,
  'GBP': 0.79,
  'NGN': 1500,
  'ZAR': 18.5,
  'KES': 150,
  'UGX': 3800,
  'TZS': 2500,
}

export async function getExchangeRate(currency: string): Promise<number> {
  const normalized = (currency || 'USD').toUpperCase()
  
  // Return 1 for USD
  if (normalized === 'USD') return 1
  
  // Check fallback rates first
  if (FALLBACK_RATES[normalized]) return FALLBACK_RATES[normalized]
  
  try {
    // Use a free exchange rate API (no API key required)
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/USD`,
      { 
        headers: { 'User-Agent': 'CharaTech/1.0' }
      }
    )
    
    if (!response.ok) throw new Error('Exchange rate API error')
    
    const data = await response.json()
    const rates = data.rates || {}
    const rate = rates[normalized] || rates[normalized.toLowerCase()]
    
    if (rate && typeof rate === 'number' && rate > 0) {
      return rate
    }
    
    throw new Error(`Rate not found for ${normalized}`)
  } catch (error) {
    return FALLBACK_RATES[normalized] || 1
  }
}
