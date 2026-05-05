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
  
  // Return 1 for USD or if rate is already in our fallback list
  if (normalized === 'USD') return 1
  if (FALLBACK_RATES[normalized]) return FALLBACK_RATES[normalized]
  
  try {
    // Use a free exchange rate API (no API key required)
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/USD`,
      { 
        headers: { 'User-Agent': 'CharaTech/1.0' },
        // Cache for 1 hour in production
        ...(process.env.NODE_ENV === 'production' ? { next: { revalidate: 3600 } } : {})
      }
    )
    
    if (!response.ok) throw new Error('Exchange rate API error')
    
    const data = await response.json()
    const rate = data.rates?.[normalized]
    
    if (rate && typeof rate === 'number' && rate > 0) {
      return rate
    }
    
    throw new Error(`Rate not found for ${normalized}`)
  } catch (error) {
    console.warn(`Failed to fetch exchange rate for ${normalized}, using fallback`)
    return FALLBACK_RATES[normalized] || 1
  }
}
