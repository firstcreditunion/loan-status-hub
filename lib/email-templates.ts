// Re-export email templates for easier importing
export { VerificationCodeEmail } from '../emails/verification-code-email'
export { WelcomeEmail } from '../emails/welcome-email'

// Re-export email utilities
export {
  sendVerificationCodeEmail,
  sendWelcomeEmail,
  testEmailConfiguration,
} from './email-sender'

// Re-export types
export type {
  VerificationCodeEmailProps,
  WelcomeEmailProps,
  EmailSendResult,
  EmailConfig,
} from './email-types'

// Re-export configuration
export {
  emailConfig,
  validateEmailConfig,
  generateDashboardUrl,
} from './email-config'
