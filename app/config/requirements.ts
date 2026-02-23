import type { IndustryRequirements, RequirementCategory } from '~/types'

// Common requirements applicable to all industries
const commonRequirements: RequirementCategory[] = [
  {
    id: 'user-auth',
    title: 'User Authentication & Authorization',
    items: [
      { id: 'email-auth', label: 'Email/Password Authentication', type: 'checkbox' },
      { id: 'social-auth', label: 'Social Login (Google, Facebook, etc.)', type: 'checkbox' },
      { id: 'two-factor', label: 'Two-Factor Authentication (2FA)', type: 'checkbox' },
      { id: 'sso', label: 'Single Sign-On (SSO)', type: 'checkbox' },
      { id: 'role-based', label: 'Role-Based Access Control', type: 'checkbox' },
      { id: 'user-profiles', label: 'User Profile Management', type: 'checkbox' },
    ],
  },
  {
    id: 'ui-ux',
    title: 'User Interface & Experience',
    items: [
      { id: 'responsive', label: 'Responsive Design (Mobile, Tablet, Desktop)', type: 'checkbox', required: true },
      { id: 'dark-mode', label: 'Dark Mode Support', type: 'checkbox' },
      { id: 'accessibility', label: 'Accessibility Compliance (WCAG)', type: 'checkbox' },
      { id: 'multilingual', label: 'Multi-language Support', type: 'checkbox' },
      { id: 'custom-branding', label: 'Custom Branding & Theming', type: 'checkbox' },
    ],
  },
  {
    id: 'data-management',
    title: 'Data Management',
    items: [
      { id: 'crud', label: 'Create, Read, Update, Delete Operations', type: 'checkbox' },
      { id: 'search', label: 'Advanced Search & Filtering', type: 'checkbox' },
      { id: 'import-export', label: 'Data Import/Export (CSV, Excel, PDF)', type: 'checkbox' },
      { id: 'file-upload', label: 'File Upload & Management', type: 'checkbox' },
      { id: 'data-validation', label: 'Data Validation & Sanitization', type: 'checkbox' },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications & Communications',
    items: [
      { id: 'email-notif', label: 'Email Notifications', type: 'checkbox' },
      { id: 'sms-notif', label: 'SMS Notifications', type: 'checkbox' },
      { id: 'push-notif', label: 'Push Notifications', type: 'checkbox' },
      { id: 'in-app-notif', label: 'In-App Notifications', type: 'checkbox' },
    ],
  },
  {
    id: 'security',
    title: 'Security Features',
    items: [
      { id: 'encryption', label: 'Data Encryption (At Rest & In Transit)', type: 'checkbox' },
      { id: 'gdpr', label: 'GDPR Compliance', type: 'checkbox' },
      { id: 'audit-logs', label: 'Audit Logs & Activity Tracking', type: 'checkbox' },
      { id: 'backup', label: 'Automated Backup & Recovery', type: 'checkbox' },
      { id: 'ddos', label: 'DDoS Protection', type: 'checkbox' },
    ],
  },
  {
    id: 'integrations',
    title: 'Third-Party Integrations',
    items: [
      { id: 'payment', label: 'Payment Gateway (Stripe, PayPal, etc.)', type: 'checkbox' },
      { id: 'analytics', label: 'Analytics (Google Analytics, Mixpanel)', type: 'checkbox' },
      { id: 'crm-integration', label: 'CRM Integration', type: 'checkbox' },
      { id: 'email-marketing', label: 'Email Marketing (Mailchimp, SendGrid)', type: 'checkbox' },
      { id: 'api-integrations', label: 'Custom API Integrations', type: 'checkbox' },
    ],
  },
  {
    id: 'admin',
    title: 'Admin Features',
    items: [
      { id: 'dashboard', label: 'Admin Dashboard', type: 'checkbox' },
      { id: 'user-management', label: 'User Management', type: 'checkbox' },
      { id: 'content-management', label: 'Content Management System', type: 'checkbox' },
      { id: 'reporting', label: 'Reports & Analytics', type: 'checkbox' },
      { id: 'settings', label: 'System Settings & Configuration', type: 'checkbox' },
    ],
  },
]

// Industry-specific requirements
export const industryRequirements: IndustryRequirements = {
  HEALTHCARE: [
    ...commonRequirements,
    {
      id: 'healthcare-specific',
      title: 'Healthcare-Specific Features',
      items: [
        { id: 'hipaa', label: 'HIPAA Compliance', type: 'checkbox', required: true },
        { id: 'ehr', label: 'Electronic Health Records (EHR) Integration', type: 'checkbox' },
        { id: 'appointment', label: 'Appointment Scheduling System', type: 'checkbox' },
        { id: 'telemedicine', label: 'Telemedicine/Video Consultation', type: 'checkbox' },
        { id: 'prescription', label: 'E-Prescription Management', type: 'checkbox' },
        { id: 'patient-portal', label: 'Patient Portal', type: 'checkbox' },
        { id: 'lab-integration', label: 'Laboratory System Integration', type: 'checkbox' },
        { id: 'billing', label: 'Medical Billing & Insurance Claims', type: 'checkbox' },
      ],
    },
  ],
  
  FINANCE: [
    ...commonRequirements,
    {
      id: 'finance-specific',
      title: 'Finance-Specific Features',
      items: [
        { id: 'pci-dss', label: 'PCI-DSS Compliance', type: 'checkbox', required: true },
        { id: 'kyc', label: 'KYC/AML Verification', type: 'checkbox' },
        { id: 'transactions', label: 'Transaction Management', type: 'checkbox' },
        { id: 'multi-currency', label: 'Multi-Currency Support', type: 'checkbox' },
        { id: 'accounting', label: 'Accounting & Bookkeeping', type: 'checkbox' },
        { id: 'invoicing', label: 'Invoicing & Billing System', type: 'checkbox' },
        { id: 'financial-reporting', label: 'Financial Reports & Statements', type: 'checkbox' },
        { id: 'fraud-detection', label: 'Fraud Detection & Prevention', type: 'checkbox' },
      ],
    },
  ],
  
  ECOMMERCE: [
    ...commonRequirements,
    {
      id: 'ecommerce-specific',
      title: 'E-Commerce-Specific Features',
      items: [
        { id: 'product-catalog', label: 'Product Catalog Management', type: 'checkbox', required: true },
        { id: 'shopping-cart', label: 'Shopping Cart', type: 'checkbox', required: true },
        { id: 'checkout', label: 'Checkout Process', type: 'checkbox', required: true },
        { id: 'inventory', label: 'Inventory Management', type: 'checkbox' },
        { id: 'order-tracking', label: 'Order Tracking & Management', type: 'checkbox' },
        { id: 'reviews', label: 'Product Reviews & Ratings', type: 'checkbox' },
        { id: 'wishlist', label: 'Wishlist Functionality', type: 'checkbox' },
        { id: 'discounts', label: 'Discounts & Coupon Management', type: 'checkbox' },
        { id: 'shipping', label: 'Shipping Integration', type: 'checkbox' },
      ],
    },
  ],
  
  EDUCATION: [
    ...commonRequirements,
    {
      id: 'education-specific',
      title: 'Education-Specific Features',
      items: [
        { id: 'lms', label: 'Learning Management System (LMS)', type: 'checkbox' },
        { id: 'course-management', label: 'Course Creation & Management', type: 'checkbox' },
        { id: 'student-portal', label: 'Student Portal', type: 'checkbox' },
        { id: 'video-lessons', label: 'Video Lessons & Streaming', type: 'checkbox' },
        { id: 'assignments', label: 'Assignments & Submissions', type: 'checkbox' },
        { id: 'quizzes', label: 'Quizzes & Assessments', type: 'checkbox' },
        { id: 'grading', label: 'Grading System', type: 'checkbox' },
        { id: 'certificates', label: 'Certificate Generation', type: 'checkbox' },
        { id: 'live-classes', label: 'Live Virtual Classroom', type: 'checkbox' },
      ],
    },
  ],
  
  REAL_ESTATE: [
    ...commonRequirements,
    {
      id: 'realestate-specific',
      title: 'Real Estate-Specific Features',
      items: [
        { id: 'property-listings', label: 'Property Listings Management', type: 'checkbox', required: true },
        { id: 'map-integration', label: 'Map & Location Integration', type: 'checkbox' },
        { id: 'virtual-tours', label: 'Virtual Tours & 360° Views', type: 'checkbox' },
        { id: 'search-filters', label: 'Advanced Property Search Filters', type: 'checkbox' },
        { id: 'agent-portal', label: 'Agent Portal', type: 'checkbox' },
        { id: 'mortgage-calc', label: 'Mortgage Calculator', type: 'checkbox' },
        { id: 'scheduling', label: 'Property Viewing Scheduling', type: 'checkbox' },
        { id: 'crm', label: 'Lead Management CRM', type: 'checkbox' },
      ],
    },
  ],
  
  LOGISTICS: [
    ...commonRequirements,
    {
      id: 'logistics-specific',
      title: 'Logistics-Specific Features',
      items: [
        { id: 'shipment-tracking', label: 'Real-Time Shipment Tracking', type: 'checkbox', required: true },
        { id: 'route-optimization', label: 'Route Optimization', type: 'checkbox' },
        { id: 'fleet-management', label: 'Fleet Management', type: 'checkbox' },
        { id: 'warehouse', label: 'Warehouse Management System', type: 'checkbox' },
        { id: 'driver-app', label: 'Driver Mobile App', type: 'checkbox' },
        { id: 'barcode', label: 'Barcode/QR Code Scanning', type: 'checkbox' },
        { id: 'shipping-labels', label: 'Automated Shipping Labels', type: 'checkbox' },
        { id: 'delivery-proof', label: 'Proof of Delivery', type: 'checkbox' },
      ],
    },
  ],
}

// Default/fallback requirements for industries not specifically defined
export const getIndustryRequirements = (industry: string): RequirementCategory[] => {
  return industryRequirements[industry] || commonRequirements
}
