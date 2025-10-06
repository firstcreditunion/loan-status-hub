import {
  SES,
  SendEmailCommand,
  type SendEmailCommandInput,
} from '@aws-sdk/client-ses'
import { render } from '@react-email/components'
import React from 'react'
import { VerificationCodeEmail } from '../emails/verification-code-email'
import { WelcomeEmail } from '../emails/welcome-email'
import {
  emailConfig,
  validateEmailConfig,
  generateDashboardUrl,
} from './email-config'
import { logUserAction } from './supabase-services'
import type {
  VerificationCodeEmailProps,
  WelcomeEmailProps,
  EmailSendResult,
} from './email-types'

// Initialize SES client
let sesClient: SES

function getSESClient(): SES {
  if (!sesClient) {
    validateEmailConfig()
    sesClient = new SES({
      region: emailConfig.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        // Optional: Add session token if using temporary credentials
        ...(process.env.AWS_SESSION_TOKEN && {
          sessionToken: process.env.AWS_SESSION_TOKEN,
        }),
      },
    })
  }
  return sesClient
}

/**
 * Send verification code email to user
 */
export async function sendVerificationCodeEmail(props: {
  recipientEmail: string
  verificationCode: string
  loanApplicationNumber: string
  applicantName: string
  expiresInMinutes?: number
  ipAddress?: string
  userAgent?: string
}): Promise<EmailSendResult> {
  // Validate required inputs
  if (!props.recipientEmail || props.recipientEmail.trim() === '') {
    return { success: false, error: 'Recipient email is required' }
  }

  if (!props.verificationCode || props.verificationCode.trim() === '') {
    return { success: false, error: 'Verification code is required' }
  }

  if (
    !props.loanApplicationNumber ||
    props.loanApplicationNumber.trim() === ''
  ) {
    return { success: false, error: 'Loan application number is required' }
  }

  // Validate loan number can be parsed as integer
  const loanNumberInt = parseInt(props.loanApplicationNumber, 10)
  if (isNaN(loanNumberInt) || loanNumberInt <= 0) {
    return { success: false, error: 'Invalid loan application number format' }
  }

  try {
    const emailProps: VerificationCodeEmailProps = {
      ...props,
      expiresInMinutes: props.expiresInMinutes || 10,
      supportEmail: emailConfig.supportEmail,
    }

    // Render the email to HTML
    const emailHtml = await render(
      React.createElement(VerificationCodeEmail, emailProps)
    )

    // Prepare SES email parameters
    const params: SendEmailCommandInput = {
      Source: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
      Destination: {
        ToAddresses: [props.recipientEmail],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: emailHtml,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: `Verification Code - Loan Status Hub`,
        },
      },
      // Optional: Add configuration set for tracking
      ConfigurationSetName: process.env.AWS_SES_CONFIGURATION_SET,
    }

    // Send the email
    const command = new SendEmailCommand(params)
    const result = await getSESClient().send(command)

    // Log the successful email send
    await logUserAction(
      props.recipientEmail,
      loanNumberInt,
      'verification_email_sent',
      true,
      props.ipAddress,
      props.userAgent,
      undefined,
      { messageId: result.MessageId || null }
    )

    return {
      success: true,
      messageId: result.MessageId,
    }
  } catch (error) {
    console.error('Failed to send verification code email:', error)

    // Log the failed email send
    await logUserAction(
      props.recipientEmail,
      loanNumberInt,
      'verification_email_sent',
      false,
      props.ipAddress,
      props.userAgent,
      error instanceof Error ? error.message : 'Unknown error occurred'
    )

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Send welcome email after successful verification
 */
export async function sendWelcomeEmail(props: {
  recipientEmail: string
  applicantName: string
  loanApplicationNumber: string
  dashboardToken?: string
  ipAddress?: string
  userAgent?: string
}): Promise<EmailSendResult> {
  // Validate required inputs
  if (!props.recipientEmail || props.recipientEmail.trim() === '') {
    return { success: false, error: 'Recipient email is required' }
  }

  if (
    !props.loanApplicationNumber ||
    props.loanApplicationNumber.trim() === ''
  ) {
    return { success: false, error: 'Loan application number is required' }
  }

  // Validate loan number can be parsed as integer
  const loanNumberInt = parseInt(props.loanApplicationNumber, 10)
  if (isNaN(loanNumberInt) || loanNumberInt <= 0) {
    return { success: false, error: 'Invalid loan application number format' }
  }

  try {
    const dashboardUrl = generateDashboardUrl(
      props.loanApplicationNumber,
      props.recipientEmail,
      props.dashboardToken
    )

    const emailProps: WelcomeEmailProps = {
      recipientEmail: props.recipientEmail,
      applicantName: props.applicantName,
      loanApplicationNumber: props.loanApplicationNumber,
      dashboardUrl,
      supportEmail: emailConfig.supportEmail,
    }

    // Render the email to HTML
    const emailHtml = await render(
      React.createElement(WelcomeEmail, emailProps)
    )

    // Prepare SES email parameters
    const params: SendEmailCommandInput = {
      Source: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
      Destination: {
        ToAddresses: [props.recipientEmail],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: emailHtml,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: `Loan Status Hub - Dashboard Access Granted`,
        },
      },
      ConfigurationSetName: process.env.AWS_SES_CONFIGURATION_SET,
    }

    // Send the email
    const command = new SendEmailCommand(params)
    const result = await getSESClient().send(command)

    // Log the successful email send
    await logUserAction(
      props.recipientEmail,
      loanNumberInt,
      'welcome_email_sent',
      true,
      props.ipAddress,
      props.userAgent,
      undefined,
      { messageId: result.MessageId || null }
    )

    return {
      success: true,
      messageId: result.MessageId,
    }
  } catch (error) {
    console.error('Failed to send welcome email:', error)

    // Log the failed email send
    await logUserAction(
      props.recipientEmail,
      loanNumberInt,
      'welcome_email_sent',
      false,
      props.ipAddress,
      props.userAgent,
      error instanceof Error ? error.message : 'Unknown error occurred'
    )

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Utility function to test email configuration
 */
export async function testEmailConfiguration(): Promise<{
  isValid: boolean
  errors: string[]
}> {
  const errors: string[] = []

  try {
    validateEmailConfig()
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : 'Configuration validation failed'
    )
  }

  // Test SES client initialization
  try {
    const client = getSESClient()
    // Test with a simple operation (this will fail if credentials are invalid)
    await client.send(
      new SendEmailCommand({
        Source: emailConfig.fromEmail,
        Destination: { ToAddresses: ['test@example.com'] },
        Message: {
          Subject: { Data: 'Test' },
          Body: { Text: { Data: 'Test' } },
        },
        // This will be caught by AWS and not actually sent
      })
    )
  } catch (error) {
    if (error instanceof Error) {
      // Only add to errors if it's not a validation error (which is expected for test email)
      if (!error.message.includes('MessageRejected')) {
        errors.push(`SES Client Error: ${error.message}`)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
