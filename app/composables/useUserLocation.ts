export interface UserLocation {
  country: string
  countryCode: string
  currency: string
  currencySymbol: string
}

const COUNTRY_CURRENCY_MAP: Record<string, { currency: string; symbol: string }> = {
  US: { currency: 'USD', symbol: '$' },
  GB: { currency: 'GBP', symbol: '£' },
  EU: { currency: 'EUR', symbol: '€' },
  DE: { currency: 'EUR', symbol: '€' },
  FR: { currency: 'EUR', symbol: '€' },
  IT: { currency: 'EUR', symbol: '€' },
  ES: { currency: 'EUR', symbol: '€' },
  NL: { currency: 'EUR', symbol: '€' },
  BE: { currency: 'EUR', symbol: '€' },
  AT: { currency: 'EUR', symbol: '€' },
  PT: { currency: 'EUR', symbol: '€' },
  JP: { currency: 'JPY', symbol: '¥' },
  CN: { currency: 'CNY', symbol: '¥' },
  HK: { currency: 'HKD', symbol: 'HK$' },
  SG: { currency: 'SGD', symbol: 'S$' },
  AU: { currency: 'AUD', symbol: 'A$' },
  NZ: { currency: 'NZD', symbol: 'NZ$' },
  CA: { currency: 'CAD', symbol: 'C$' },
  IN: { currency: 'INR', symbol: '₹' },
  BR: { currency: 'BRL', symbol: 'R$' },
  MX: { currency: 'MXN', symbol: 'MX$' },
  KR: { currency: 'KRW', symbol: '₩' },
  TH: { currency: 'THB', symbol: '฿' },
  VN: { currency: 'VND', symbol: '₫' },
  PH: { currency: 'PHP', symbol: '₱' },
  ID: { currency: 'IDR', symbol: 'Rp' },
  MY: { currency: 'MYR', symbol: 'RM' },
  ZA: { currency: 'ZAR', symbol: 'R' },
  NG: { currency: 'NGN', symbol: '₦' },
  GH: { currency: 'GHS', symbol: '₵' },
  KE: { currency: 'KES', symbol: 'KSh' },
  EG: { currency: 'EGP', symbol: 'E£' },
  AE: { currency: 'AED', symbol: 'د.إ' },
  SA: { currency: 'SAR', symbol: '﷼' },
  IL: { currency: 'ILS', symbol: '₪' },
  TR: { currency: 'TRY', symbol: '₺' },
  PL: { currency: 'PLN', symbol: 'zł' },
  CZ: { currency: 'CZK', symbol: 'Kč' },
  HU: { currency: 'HUF', symbol: 'Ft' },
  RO: { currency: 'RON', symbol: 'lei' },
  CH: { currency: 'CHF', symbol: 'CHF' },
  SE: { currency: 'SEK', symbol: 'kr' },
  NO: { currency: 'NOK', symbol: 'kr' },
  DK: { currency: 'DKK', symbol: 'kr' },
  FI: { currency: 'EUR', symbol: '€' },
  IE: { currency: 'EUR', symbol: '€' },
  RU: { currency: 'RUB', symbol: '₽' },
  UA: { currency: 'UAH', symbol: '₴' },
  PK: { currency: 'PKR', symbol: '₨' },
  BD: { currency: 'BDT', symbol: '৳' },
  AR: { currency: 'ARS', symbol: '$' },
  CL: { currency: 'CLP', symbol: '$' },
  CO: { currency: 'COP', symbol: '$' },
  PE: { currency: 'PEN', symbol: 'S/' },
}

export const useUserLocation = () => {
  const location = useState<UserLocation | null>('user-location', () => null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  const detectLocation = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch('https://ipapi.co/json/')
      if (!response.ok) {
        throw new Error('Failed to detect location')
      }
      
      const data = await response.json()
      const countryCode = data.country_code || data.country || 'US'
      const currencyInfo = COUNTRY_CURRENCY_MAP[countryCode] ?? COUNTRY_CURRENCY_MAP['US']!
      
      location.value = {
        country: data.country_name || data.country || 'United States',
        countryCode,
        currency: currencyInfo.currency,
        currencySymbol: currencyInfo.symbol,
      }
    } catch (err) {
      console.error('Location detection error:', err)
      error.value = 'Could not detect location'
      location.value = {
        country: 'United States',
        countryCode: 'US',
        currency: 'USD',
        currencySymbol: '$',
      }
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    if (!location.value) {
      detectLocation()
    } else {
      loading.value = false
    }
  })

  return {
    location,
    loading,
    error,
    detectLocation,
  }
}
