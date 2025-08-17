// Email template types for loan status verification system

export interface VerificationCodeEmailProps {
  recipientEmail: string
  verificationCode: string
  loanApplicationNumber: string
  applicantName: string
  expiresInMinutes: number
  supportEmail: string
}

export interface WelcomeEmailProps {
  recipientEmail: string
  applicantName: string
  loanApplicationNumber: string
  dashboardUrl: string
  supportEmail: string
}

export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface EmailConfig {
  region: string
  fromEmail: string
  fromName: string
  supportEmail: string
  dashboardBaseUrl: string
}
