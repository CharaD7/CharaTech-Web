/**
 * CharaTech Intelligent Pricing Engine
 * Evaluates a client's submission and generates detailed, itemised invoice line items.
 */
import { getExchangeRate } from './exchange-rate'

// ─── Base development costs per project type (USD) ──────────────────────────
const BASE_DEV_COSTS: Record<string, number> = {
  WEB_APPLICATION: 6_000,
  MOBILE_APPLICATION: 10_000,
  DESKTOP_APPLICATION: 8_000,
  API_BACKEND: 5_000,
  CMS: 4_500,
  ECOMMERCE_PLATFORM: 10_000,
  CRM: 12_000,
  ERP: 20_000,
  SAAS_PLATFORM: 16_000,
  DASHBOARD_ANALYTICS: 8_000,
  BOOKING_SYSTEM: 9_000,
  PAYMENT_GATEWAY: 7_000,
  SOCIAL_PLATFORM: 14_000,
  LEARNING_PLATFORM: 11_000,
  MARKETPLACE: 16_000,
  PORTFOLIO_WEBSITE: 3_000,
  BLOG: 2_500,
  OTHER: 6_000,
}

// ─── Complexity multipliers ──────────────────────────────────────────────────
const COMPLEXITY_MULTIPLIER: Record<string, number> = {
  BASIC: 1.0,
  INTERMEDIATE: 1.8,
  ADVANCED: 3.0,
  ENTERPRISE: 5.0,
}

// ─── Requirement feature add-ons (USD each) ──────────────────────────────────
const FEATURE_COSTS: Record<string, { label: string; cost: number }> = {
  // Auth & Security
  'email-auth': { label: 'Email / Password Authentication', cost: 800 },
  'social-auth': { label: 'Social Login (Google, Facebook, etc.)', cost: 1_200 },
  'two-factor': { label: 'Two-Factor Authentication (2FA)', cost: 1_000 },
  'sso': { label: 'Single Sign-On (SSO)', cost: 2_400 },
  'role-based': { label: 'Role-Based Access Control (RBAC)', cost: 1_400 },
  'user-profiles': { label: 'User Profile Management', cost: 600 },

  // UI/UX
  'dark-mode': { label: 'Dark Mode Support', cost: 500 },
  'accessibility': { label: 'Accessibility (WCAG 2.1 AA)', cost: 1_200 },
  'multilingual': { label: 'Multi-language / i18n Support', cost: 1_800 },
  'custom-branding': { label: 'Custom Branding & Theming', cost: 1_400 },

  // Data Management
  'search': { label: 'Advanced Search & Filtering', cost: 1_000 },
  'import-export': { label: 'Data Import / Export (CSV, Excel, PDF)', cost: 1_200 },
  'file-upload': { label: 'File Upload & Cloud Storage', cost: 1_000 },

  // Notifications
  'email-notif': { label: 'Email Notification System', cost: 800 },
  'sms-notif': { label: 'SMS Notification Integration', cost: 1_000 },
  'push-notif': { label: 'Web / Mobile Push Notifications', cost: 1_200 },
  'in-app-notif': { label: 'In-App Notification Centre', cost: 700 },

  // Security & Compliance
  'encryption': { label: 'End-to-End Data Encryption', cost: 1_600 },
  'gdpr': { label: 'GDPR Compliance Module', cost: 1_800 },
  'audit-logs': { label: 'Audit Logs & Activity Tracking', cost: 1_000 },
  'backup': { label: 'Automated Backup & Disaster Recovery', cost: 1_200 },
  'ddos': { label: 'DDoS Protection & Rate Limiting', cost: 1_400 },

  // Third-Party Integrations
  'payment': { label: 'Payment Gateway Integration (Stripe / PayPal / MTN Momo)', cost: 1_800 },
  'analytics': { label: 'Analytics Integration (Google Analytics / Mixpanel)', cost: 800 },
  'crm-integration': { label: 'CRM Integration', cost: 1_600 },
  'email-marketing': { label: 'Email Marketing Integration (Mailchimp / SendGrid)', cost: 1_000 },
  'api-integrations': { label: 'Custom Third-Party API Integration', cost: 1_400 },

  // Admin
  'dashboard': { label: 'Admin Dashboard', cost: 2_400 },
  'user-management': { label: 'User Management Panel', cost: 1_200 },
  'content-management': { label: 'Content Management System (CMS)', cost: 2_000 },
  'reporting': { label: 'Reports & Analytics Dashboard', cost: 1_800 },

  // Healthcare-specific
  'hipaa': { label: 'HIPAA Compliance Implementation', cost: 5_000 },
  'ehr': { label: 'EHR / EMR System Integration', cost: 4_000 },
  'appointment': { label: 'Appointment Scheduling System', cost: 2_400 },
  'telemedicine': { label: 'Telemedicine / Video Consultation Module', cost: 3_600 },
  'prescription': { label: 'E-Prescription Management', cost: 2_000 },
  'patient-portal': { label: 'Patient Portal', cost: 3_000 },

  // Finance-specific
  'pci-dss': { label: 'PCI-DSS Compliance', cost: 4_000 },
  'kyc': { label: 'KYC / AML Verification Module', cost: 3_600 },
  'transactions': { label: 'Transaction Management System', cost: 2_400 },
  'multi-currency': { label: 'Multi-Currency Support', cost: 1_400 },
  'fraud-detection': { label: 'AI Fraud Detection & Prevention', cost: 5_000 },
  'financial-reporting': { label: 'Financial Reports & Statements', cost: 1_800 },

  // E-Commerce-specific
  'product-catalog': { label: 'Product Catalogue Management', cost: 1_600 },
  'shopping-cart': { label: 'Shopping Cart & Checkout', cost: 1_400 },
  'inventory': { label: 'Inventory Management System', cost: 1_800 },
  'order-tracking': { label: 'Order Tracking & Management', cost: 1_200 },
  'shipping': { label: 'Shipping & Courier Integration', cost: 1_600 },
  'discounts': { label: 'Discounts & Coupon Engine', cost: 1_000 },

  // Education-specific
  'lms': { label: 'Learning Management System (LMS)', cost: 4_000 },
  'course-management': { label: 'Course Creation & Management', cost: 2_400 },
  'video-lessons': { label: 'Video Streaming & Lessons', cost: 3_000 },
  'quizzes': { label: 'Quiz & Assessment Engine', cost: 1_600 },
  'certificates': { label: 'Certificate Generation & Verification', cost: 1_200 },
  'live-classes': { label: 'Live Virtual Classroom', cost: 3_600 },

  // Logistics-specific
  'shipment-tracking': { label: 'Real-Time Shipment Tracking', cost: 2_400 },
  'route-optimization': { label: 'AI Route Optimisation', cost: 4_000 },
  'fleet-management': { label: 'Fleet Management System', cost: 3_600 },
  'barcode': { label: 'Barcode / QR Code Scanning', cost: 1_200 },
}

// ─── Service / Infrastructure add-ons ────────────────────────────────────────
export interface ServiceOption {
  id: string
  label: string
  description: string
  cost: number // USD
  category: 'infrastructure' | 'blockchain' | 'middleware' | 'support'
  optional: boolean
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  // Infrastructure
  {
    id: 'domain',
    label: 'Domain Name Registration (1 year)',
    description: 'Custom domain purchase & DNS configuration (e.g. yourcompany.com)',
    cost: 20,
    category: 'infrastructure',
    optional: true,
  },
  {
    id: 'ssl',
    label: 'SSL Certificate (1 year)',
    description: 'Wildcard SSL certificate for secure HTTPS',
    cost: 80,
    category: 'infrastructure',
    optional: true,
  },
  {
    id: 'shared-hosting',
    label: 'Shared Hosting (1 year)',
    description: 'Basic shared hosting for small/portfolio sites',
    cost: 150,
    category: 'infrastructure',
    optional: true,
  },
  {
    id: 'vps-hosting',
    label: 'VPS Cloud Hosting (1 year)',
    description: 'Virtual Private Server — recommended for most apps',
    cost: 600,
    category: 'infrastructure',
    optional: true,
  },
  {
    id: 'dedicated-hosting',
    label: 'Dedicated Server Hosting (1 year)',
    description: 'High-traffic, enterprise-grade dedicated server',
    cost: 2_400,
    category: 'infrastructure',
    optional: true,
  },
  {
    id: 'db-hosting',
    label: 'Managed Database Hosting (1 year)',
    description: 'Managed PostgreSQL / MySQL on cloud (AWS RDS / Supabase / PlanetScale)',
    cost: 600,
    category: 'infrastructure',
    optional: true,
  },
  {
    id: 'cdn',
    label: 'CDN & Performance Setup',
    description: 'CloudFlare CDN, caching, and global distribution',
    cost: 250,
    category: 'infrastructure',
    optional: true,
  },

  // Blockchain
  {
    id: 'blockchain-integration',
    label: 'Blockchain Integration',
    description: 'Connect app to Ethereum, Polygon, Solana, or other chains via Web3',
    cost: 3_500,
    category: 'blockchain',
    optional: true,
  },
  {
    id: 'smart-contracts',
    label: 'Smart Contract Development',
    description: 'Custom Solidity / Rust smart contract design, audit & deployment',
    cost: 5_000,
    category: 'blockchain',
    optional: true,
  },
  {
    id: 'nft',
    label: 'NFT / Token Minting Module',
    description: 'ERC-721 / ERC-1155 NFT minting and marketplace module',
    cost: 4_000,
    category: 'blockchain',
    optional: true,
  },
  {
    id: 'defi',
    label: 'DeFi Protocol Integration',
    description: 'DEX, staking, liquidity pool, or yield farming module',
    cost: 6_000,
    category: 'blockchain',
    optional: true,
  },
  {
    id: 'crypto-payments',
    label: 'Cryptocurrency Payment Gateway',
    description: 'Accept BTC, ETH, USDT, and other crypto payments',
    cost: 2_000,
    category: 'blockchain',
    optional: true,
  },

  // Middleware & APIs
  {
    id: 'api-gateway',
    label: 'API Gateway & Rate Limiting',
    description: 'Reverse-proxy API gateway with authentication & throttling',
    cost: 800,
    category: 'middleware',
    optional: true,
  },
  {
    id: 'microservices',
    label: 'Microservices Architecture',
    description: 'Decompose monolith into independently deployable microservices',
    cost: 3_000,
    category: 'middleware',
    optional: true,
  },
  {
    id: 'message-queue',
    label: 'Message Queue / Event Bus (RabbitMQ / Kafka)',
    description: 'Async event-driven communication between services',
    cost: 1_200,
    category: 'middleware',
    optional: true,
  },
  {
    id: 'websocket',
    label: 'Real-Time WebSocket Layer',
    description: 'Live chat, notifications, or dashboards via WebSocket / SSE',
    cost: 900,
    category: 'middleware',
    optional: true,
  },
  {
    id: 'graphql',
    label: 'GraphQL API Layer',
    description: 'Flexible GraphQL schema with subscriptions',
    cost: 1_200,
    category: 'middleware',
    optional: true,
  },

  // Support & Maintenance
  {
    id: 'maintenance-6mo',
    label: 'Maintenance & Support Package (6 months)',
    description: 'Bug fixes, minor updates, performance monitoring — 6 months',
    cost: 1_200,
    category: 'support',
    optional: true,
  },
  {
    id: 'maintenance-1yr',
    label: 'Maintenance & Support Package (1 year)',
    description: 'Bug fixes, minor updates, performance monitoring — 12 months',
    cost: 2_000,
    category: 'support',
    optional: true,
  },
  {
    id: 'training',
    label: 'Admin Training & Documentation',
    description: 'User guides, video walkthroughs, and 2 live training sessions',
    cost: 600,
    category: 'support',
    optional: true,
  },
]

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PricingLineItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
  category: 'development' | 'feature' | 'infrastructure' | 'blockchain' | 'middleware' | 'support'
  editable: boolean
}

export interface PricingResult {
  items: PricingLineItem[]
  subtotalUSD: number
  /** Suggested tax rate (0–1) */
  suggestedTaxRate: number
  currency: string
  exchangeRate: number
  notes: string
}

// ─── Main Pricing Function ────────────────────────────────────────────────────
export async function generatePricing(submission: {
  projectName: string
  projectType: string[]
  complexity: string
  industry: string
  requirements: Record<string, any>
  budget?: string | null
  currency?: string
}): Promise<PricingResult> {
  const currency = submission.currency || 'USD'
  const exchangeRate = await getExchangeRate(currency)
  const items: PricingLineItem[] = []

  // ── 1. Base development cost per project type ──────────────────────────────
  const types = submission.projectType?.length ? submission.projectType : ['OTHER']
  for (const pt of types) {
    const baseCost = BASE_DEV_COSTS[pt] ?? 3_000
    const multiplier = COMPLEXITY_MULTIPLIER[submission.complexity] ?? 1
    const rawCost = baseCost * multiplier
    const unitPrice = Math.round(rawCost * exchangeRate)
    items.push({
      description: `${pt.replace(/_/g, ' ')} Development (${submission.complexity} complexity)`,
      quantity: 1,
      unitPrice,
      total: unitPrice,
      category: 'development',
      editable: true,
    })
  }

  // ── 2. Design (always included for web/mobile) ─────────────────────────────
  const needsDesign = types.some((t) =>
    ['WEB_APPLICATION', 'MOBILE_APPLICATION', 'ECOMMERCE_PLATFORM', 'SAAS_PLATFORM',
     'SOCIAL_PLATFORM', 'MARKETPLACE', 'LEARNING_PLATFORM', 'BOOKING_SYSTEM',
     'PORTFOLIO_WEBSITE', 'BLOG'].includes(t)
  )
  if (needsDesign) {
    const designBase = types.length > 1 ? 3_000 : 1_600
    const unitPrice = Math.round(designBase * exchangeRate)
    items.push({
      description: 'UI/UX Design (Wireframes, Prototype & Final Design)',
      quantity: 1,
      unitPrice,
      total: unitPrice,
      category: 'development',
      editable: true,
    })
  }

  // ── 3. Mobile responsiveness (if not mobile-native) ────────────────────────
  if (submission.requirements?.['responsive'] && !types.includes('MOBILE_APPLICATION')) {
    const unitPrice = Math.round(1_200 * exchangeRate)
    items.push({
      description: 'Mobile-Responsive Design & Cross-Browser Testing',
      quantity: 1,
      unitPrice,
      total: unitPrice,
      category: 'feature',
      editable: true,
    })
  }

  // ── 4. Feature requirements from checkboxes ────────────────────────────────
  const reqs = submission.requirements ?? {}
  const SKIP_IN_FEATURES = ['responsive'] // handled separately above
  for (const [key, val] of Object.entries(reqs)) {
    if (!val || SKIP_IN_FEATURES.includes(key)) continue
    if (typeof val !== 'boolean' && typeof val !== 'string') continue
    const feature = FEATURE_COSTS[key]
    if (!feature) continue
    const unitPrice = Math.round(feature.cost * exchangeRate)
    items.push({
      description: feature.label,
      quantity: 1,
      unitPrice,
      total: unitPrice,
      category: 'feature',
      editable: true,
    })
  }

  // ── 5. Default recommended infrastructure (VPS + DB + CDN for non-trivial) ─
  const isSmall = types.every((t) => ['PORTFOLIO_WEBSITE', 'BLOG'].includes(t))
  if (!isSmall) {
    const hostingCost = Math.round(1_200 * exchangeRate)
    items.push({
      description: 'VPS Cloud Hosting Setup & Configuration (1 year)',
      quantity: 1,
      unitPrice: hostingCost,
      total: hostingCost,
      category: 'infrastructure',
      editable: true,
    })
    const dbCost = Math.round(1_200 * exchangeRate)
    items.push({
      description: 'Managed Database Hosting (1 year)',
      quantity: 1,
      unitPrice: dbCost,
      total: dbCost,
      category: 'infrastructure',
      editable: true,
    })
  } else {
    const hostingCost = Math.round(300 * exchangeRate)
    items.push({
      description: 'Shared Hosting Setup (1 year)',
      quantity: 1,
      unitPrice: hostingCost,
      total: hostingCost,
      category: 'infrastructure',
      editable: true,
    })
  }

  // Domain is always suggested
  const domainCost = Math.round(40 * exchangeRate)
  items.push({
    description: 'Domain Name Registration (1 year)',
    quantity: 1,
    unitPrice: domainCost,
    total: domainCost,
    category: 'infrastructure',
    editable: true,
  })

  // SSL
  const sslCost = Math.round(160 * exchangeRate)
  items.push({
    description: 'SSL Certificate (1 year)',
    quantity: 1,
    unitPrice: sslCost,
    total: sslCost,
    category: 'infrastructure',
    editable: true,
  })

  // QA & Testing
  const devSubtotal = items
    .filter((i) => i.category === 'development')
    .reduce((s, i) => s + i.unitPrice, 0)
  const qaCost = Math.round(devSubtotal * 0.18) // 18% of dev cost
  items.push({
    description: 'QA Testing & Bug Fixes (18% of development cost)',
    quantity: 1,
    unitPrice: qaCost,
    total: qaCost,
    category: 'development',
    editable: true,
  })

  // Project management / deployment
  const pmCost = Math.round(devSubtotal * 0.12) // 12% of dev cost
  items.push({
    description: 'Project Management & Deployment Setup (12% of development cost)',
    quantity: 1,
    unitPrice: pmCost,
    total: pmCost,
    category: 'development',
    editable: true,
  })

  // ── 6. Industry-specific compliance notes ─────────────────────────────────
  const complianceMap: Record<string, string> = {
    HEALTHCARE: 'HIPAA & health-data compliance consultancy',
    FINANCE: 'PCI-DSS & financial regulation compliance consultancy',
    GOVERNMENT: 'Government security & data sovereignty compliance',
    LEGAL: 'Legal-sector data privacy & confidentiality controls',
  }
  if (complianceMap[submission.industry]) {
    const complianceCost = Math.round(3_000 * exchangeRate)
    items.push({
      description: `Industry Compliance: ${complianceMap[submission.industry]}`,
      quantity: 1,
      unitPrice: complianceCost,
      total: complianceCost,
      category: 'feature',
      editable: true,
    })
  }

  const subtotalUSD = items.reduce((s, i) => s + i.unitPrice, 0)

  // Complexity-based tax/overhead suggestion
  const taxRateMap: Record<string, number> = {
    BASIC: 0,
    INTERMEDIATE: 0.05,
    ADVANCED: 0.08,
    ENTERPRISE: 0.1,
  }
  const suggestedTaxRate = taxRateMap[submission.complexity] ?? 0.05

  const budgetNote = submission.budget && submission.budget !== 'NOT_SURE'
    ? ` Client indicated budget: ${submission.budget.replace(/_/g, ' ')}.`
    : ''

    return {
      items,
      subtotalUSD,
      suggestedTaxRate,
      currency,
      exchangeRate,
      notes:
        `Auto-generated estimate for "${submission.projectName}" (${submission.industry}).` +
        budgetNote +
        ` All line items are editable. Exchange rate for ${currency}: ` +
        exchangeRate.toFixed(4) + ` ${currency}/USD.`,
    }
}
