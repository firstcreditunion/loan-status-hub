import type { EmailConfig } from './email-types'

// Email configuration - these should be set via environment variables
export const emailConfig: EmailConfig = {
  region: process.env.AWS_SES_REGION || 'us-east-1',
  fromEmail: process.env.FROM_EMAIL || 'noreply@fcu.com',
  fromName: process.env.FROM_NAME || 'FCU Loan Status Portal',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@fcu.com',
  dashboardBaseUrl:
    process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://status.fcu.com',
}

// Validation function to ensure all required config is present
export function validateEmailConfig(): void {
  const requiredEnvVars = [
    'AWS_SES_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'FROM_EMAIL',
    'SUPPORT_EMAIL',
    'NEXT_PUBLIC_DASHBOARD_URL',
  ]

  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for email configuration: ${missing.join(', ')}`
    )
  }
}

// Helper function to generate dashboard URL with proper token
export function generateDashboardUrl(
  loanApplicationNumber: string,
  email: string,
  token?: string
): string {
  const baseUrl = emailConfig.dashboardBaseUrl
  const params = new URLSearchParams({
    loan: loanApplicationNumber,
    email: email,
  })

  if (token) {
    params.set('token', token)
  }

  return `${baseUrl}?${params.toString()}`
}

// Re-Commit 3
