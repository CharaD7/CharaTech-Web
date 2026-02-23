export enum Industry {
  HEALTHCARE = 'HEALTHCARE',
  FINANCE = 'FINANCE',
  ECOMMERCE = 'ECOMMERCE',
  EDUCATION = 'EDUCATION',
  REAL_ESTATE = 'REAL_ESTATE',
  LOGISTICS = 'LOGISTICS',
  HOSPITALITY = 'HOSPITALITY',
  ENTERTAINMENT = 'ENTERTAINMENT',
  GOVERNMENT = 'GOVERNMENT',
  NONPROFIT = 'NONPROFIT',
  MANUFACTURING = 'MANUFACTURING',
  RETAIL = 'RETAIL',
  TECHNOLOGY = 'TECHNOLOGY',
  LEGAL = 'LEGAL',
  AGRICULTURE = 'AGRICULTURE',
  ENERGY = 'ENERGY',
  TRANSPORTATION = 'TRANSPORTATION',
  TELECOMMUNICATIONS = 'TELECOMMUNICATIONS',
  MEDIA = 'MEDIA',
  CONSULTING = 'CONSULTING',
  OTHER = 'OTHER'
}

export enum ProjectType {
  WEB_APPLICATION = 'WEB_APPLICATION',
  MOBILE_APPLICATION = 'MOBILE_APPLICATION',
  DESKTOP_APPLICATION = 'DESKTOP_APPLICATION',
  API_BACKEND = 'API_BACKEND',
  CMS = 'CMS',
  ECOMMERCE_PLATFORM = 'ECOMMERCE_PLATFORM',
  CRM = 'CRM',
  ERP = 'ERP',
  SAAS_PLATFORM = 'SAAS_PLATFORM',
  DASHBOARD_ANALYTICS = 'DASHBOARD_ANALYTICS',
  BOOKING_SYSTEM = 'BOOKING_SYSTEM',
  PAYMENT_GATEWAY = 'PAYMENT_GATEWAY',
  SOCIAL_PLATFORM = 'SOCIAL_PLATFORM',
  LEARNING_PLATFORM = 'LEARNING_PLATFORM',
  MARKETPLACE = 'MARKETPLACE',
  PORTFOLIO_WEBSITE = 'PORTFOLIO_WEBSITE',
  BLOG = 'BLOG',
  OTHER = 'OTHER'
}

export enum ComplexityLevel {
  BASIC = 'BASIC',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  ENTERPRISE = 'ENTERPRISE'
}

export enum BudgetRange {
  LESS_THAN_5K = 'LESS_THAN_5K',
  FROM_5K_TO_10K = 'FROM_5K_TO_10K',
  FROM_10K_TO_25K = 'FROM_10K_TO_25K',
  FROM_25K_TO_50K = 'FROM_25K_TO_50K',
  FROM_50K_TO_100K = 'FROM_50K_TO_100K',
  FROM_100K_TO_250K = 'FROM_100K_TO_250K',
  ABOVE_250K = 'ABOVE_250K',
  NOT_SURE = 'NOT_SURE'
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  QUOTED = 'QUOTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface RequirementCategory {
  id: string
  title: string
  description?: string
  items: RequirementItem[]
}

export interface RequirementItem {
  id: string
  label: string
  description?: string
  type: 'checkbox' | 'radio' | 'text' | 'textarea' | 'select' | 'number'
  options?: string[]
  required?: boolean
  value?: any
  dependsOn?: string
  showWhen?: any
}

export interface IndustryRequirements {
  [key: string]: RequirementCategory[]
}

export interface SubmissionData {
  projectName: string
  industry: Industry
  projectTypes: ProjectType[]
  complexity: ComplexityLevel
  budget?: BudgetRange
  timeline?: string
  requirements: Record<string, any>
  additionalNotes?: string
  dialogflowSessionId?: string
}

export interface User {
  id: string
  firebaseUid: string
  email: string
  fullName?: string
  phoneNumber?: string
  companyName?: string
  role: 'CLIENT' | 'ADMIN'
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Submission {
  id: string
  userId: string
  projectName: string
  industry: Industry
  projectType: ProjectType[]
  complexity: ComplexityLevel
  budget?: BudgetRange
  timeline?: string
  requirements: Record<string, any>
  additionalNotes?: string
  dialogflowSessionId?: string
  aiConversation?: any
  status: SubmissionStatus
  reviewedAt?: Date
  reviewedBy?: string
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
}
