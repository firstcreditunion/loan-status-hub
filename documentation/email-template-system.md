# FCU Loan Status Portal - Email Template System

## Overview

This document provides comprehensive documentation for the email template system built for the FCU Loan Status Portal. The system uses React Email with AWS SES integration to send professional, brand-consistent emails for loan application verification and welcome processes.

## Architecture

### Technology Stack

- **React Email** (v4.2.8) - Email template framework
- **AWS SES** - Email delivery service
- **TypeScript** - Type safety and development experience
- **Tailwind CSS** - Styling (with email-safe pixel-based preset)
- **Inter Font** - Typography with fallback to Arial

### File Structure

```
├── emails/
│   ├── verification-code-email.tsx    # 6-digit verification code template
│   └── welcome-email.tsx              # Welcome/success email template
├── lib/
│   ├── email-types.ts                 # TypeScript type definitions
│   ├── email-config.ts                # Email configuration and utilities
│   ├── email-sender.ts                # AWS SES integration and sending logic
│   └── email-templates.ts             # Unified exports
└── env.example                        # Environment variable template
```

## Brand Design System

### FCU Brand Colors

The email templates use your custom FCU brand colors extracted from `app/globals.css`:

#### Primary Blue Palette

- **Primary 50**: `#e0f2fe` (Light backgrounds)
- **Primary 500**: `#0369a1` (Main brand blue - headers, buttons)
- **Primary 600**: `#0284c7` (Interactive elements, links)
- **Primary 900**: `#0c4a6e` (Dark text accents)

#### Secondary Green Palette

- **Secondary 500**: `#22c55e` (Success states, welcome emails)
- **Secondary 600**: `#16a34a` (Success button hovers)

#### Neutral Palette

- **Neutral 50**: `#f9fafb` (Light backgrounds)
- **Neutral 100**: `#f3f4f6` (Borders, dividers)
- **Neutral 600**: `#4b5563` (Body text)
- **Neutral 800**: `#1f2937` (Headings)

### Typography

- **Font Family**: Inter (web font) with Arial fallback
- **Heading Sizes**: 28px (H1), 24px (H2), 20px (H3)
- **Body Text**: 16px primary, 14-15px secondary
- **Code Display**: 48px monospace for verification codes

### Layout Principles

- **Container Width**: 600px maximum (optimal for email clients)
- **Responsive Design**: Adapts to mobile and desktop clients
- **Padding**: Consistent 32px for sections, 20px for containers
- **Border Radius**: 12px for main sections, 8px for smaller elements

## Email Templates

### 1. Verification Code Email

**Purpose**: Send 6-digit verification codes for first-time portal access

**Template**: `emails/verification-code-email.tsx`

#### Features:

- ✅ **Prominent 6-digit code display** with monospace font
- ✅ **Expiration timer** (configurable, default 10 minutes)
- ✅ **Security warnings** and best practices
- ✅ **Step-by-step instructions** for users
- ✅ **Loan application number** reference
- ✅ **Support contact information**

#### Visual Design:

- **Header**: FCU Primary Blue background with white text
- **Code Section**: Highlighted box with primary blue border
- **Security Notice**: Yellow warning box with security icon
- **Footer**: Light gray background with contact information

#### Props Interface:

```typescript
interface VerificationCodeEmailProps {
  recipientEmail: string
  verificationCode: string // 6-digit code
  loanApplicationNumber: string
  applicantName: string
  expiresInMinutes: number // Default: 10
  supportEmail: string
}
```

### 2. Welcome Email

**Purpose**: Welcome users after successful verification and introduce dashboard features

**Template**: `emails/welcome-email.tsx`

#### Features:

- ✅ **Success confirmation** with checkmark icon
- ✅ **Dashboard access button** (primary CTA)
- ✅ **Feature overview** with icons and descriptions
- ✅ **Security information** about 15-minute sessions
- ✅ **Multiple CTA placements** for better conversion

#### Visual Design:

- **Header**: FCU Secondary Green background (success theme)
- **CTA Button**: Primary blue with prominent placement
- **Feature Grid**: Clean layout with icons and descriptions
- **Security Info**: Blue info box with security details

#### Props Interface:

```typescript
interface WelcomeEmailProps {
  recipientEmail: string
  applicantName: string
  loanApplicationNumber: string
  dashboardUrl: string // Generated with token
  supportEmail: string
}
```

## AWS SES Integration

### Configuration

#### Required Environment Variables:

```bash
# AWS SES Configuration
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Email Settings
FROM_EMAIL=noreply@fcu.com
FROM_NAME=FCU Loan Status Portal
SUPPORT_EMAIL=support@fcu.com

# Application URLs
NEXT_PUBLIC_DASHBOARD_URL=https://status.fcu.com

# Optional: Email tracking
AWS_SES_CONFIGURATION_SET=loan-portal-emails
```

#### SES Setup Requirements:

1. **Verify sender email** in AWS SES console
2. **Configure DKIM** for email authentication
3. **Set up bounce/complaint handling** (recommended)
4. **Configure sending limits** based on usage
5. **Move out of sandbox** for production use

### Email Sending Functions

#### Send Verification Code:

```typescript
import { sendVerificationCodeEmail } from '@/lib/email-templates'

const result = await sendVerificationCodeEmail({
  recipientEmail: 'user@example.com',
  verificationCode: '123456',
  loanApplicationNumber: 'LN2024001',
  applicantName: 'John Doe',
  expiresInMinutes: 10,
})

if (result.success) {
  console.log('Email sent:', result.messageId)
} else {
  console.error('Failed to send:', result.error)
}
```

#### Send Welcome Email:

```typescript
import { sendWelcomeEmail } from '@/lib/email-templates'

const result = await sendWelcomeEmail({
  recipientEmail: 'user@example.com',
  applicantName: 'John Doe',
  loanApplicationNumber: 'LN2024001',
  dashboardToken: 'secure-token-here',
})
```

## Security Features

### Email Security

- ✅ **Sender Authentication**: DKIM and SPF configured
- ✅ **Secure Token URLs**: Dashboard URLs include verification tokens
- ✅ **Expiration Handling**: Verification codes expire automatically
- ✅ **Rate Limiting**: Integrated with database rate limiting system
- ✅ **Input Validation**: All email inputs are validated and sanitized

### Content Security

- ✅ **No External Images**: Prevents tracking and loading issues
- ✅ **Inline Styles**: Avoids CSS injection vulnerabilities
- ✅ **Sanitized Content**: All dynamic content is properly escaped
- ✅ **Secure Links**: All links use HTTPS and include verification

## Email Client Compatibility

### Tested Clients

All React Email components are tested across:

- ✅ **Gmail** (Desktop & Mobile)
- ✅ **Apple Mail** (macOS & iOS)
- ✅ **Outlook** (Desktop, Web, Mobile)
- ✅ **Yahoo Mail**
- ✅ **HEY**
- ✅ **Superhuman**

### Compatibility Features

- ✅ **Pixel-based units** instead of rem for better support
- ✅ **Table-based layouts** for older email clients
- ✅ **Fallback fonts** for unsupported web fonts
- ✅ **Progressive enhancement** with graceful degradation

## Usage Examples

### Integration with Verification Flow

```typescript
// In your API route or server action
import { sendVerificationCodeEmail } from '@/lib/email-templates'
import { mcp_supabase_execute_sql } from '@/lib/supabase'

export async function requestVerificationCode(
  email: string,
  loanNumber: string
) {
  try {
    // Generate and store verification code in database
    const code = generateSixDigitCode()
    const hashedCode = await hashVerificationCode(code)

    await mcp_supabase_execute_sql({
      project_id: 'your-project-id',
      query: `
        INSERT INTO api.user_verification_sessions 
        (email, loan_application_number, verification_code_hash, code_expires_at)
        VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')
      `,
      params: [email, loanNumber, hashedCode],
    })

    // Get applicant name from loan application
    const applicant = await getLoanApplicant(loanNumber)

    // Send verification email
    const emailResult = await sendVerificationCodeEmail({
      recipientEmail: email,
      verificationCode: code,
      loanApplicationNumber: loanNumber,
      applicantName: applicant.name,
      expiresInMinutes: 10,
    })

    return { success: emailResult.success }
  } catch (error) {
    console.error('Verification request failed:', error)
    return { success: false, error: 'Failed to send verification code' }
  }
}
```

### Integration with Welcome Flow

```typescript
// After successful verification
import { sendWelcomeEmail, generateDashboardUrl } from '@/lib/email-templates'

export async function completeVerification(
  email: string,
  loanNumber: string,
  verificationCode: string
) {
  try {
    // Verify the code
    const isValid = await verifyCode(email, loanNumber, verificationCode)

    if (!isValid) {
      return { success: false, error: 'Invalid verification code' }
    }

    // Create verified user record
    await createVerifiedUser(email, loanNumber)

    // Generate secure dashboard token
    const dashboardToken = await generateSecureToken(email, loanNumber)

    // Get applicant details
    const applicant = await getLoanApplicant(loanNumber)

    // Send welcome email
    const emailResult = await sendWelcomeEmail({
      recipientEmail: email,
      applicantName: applicant.name,
      loanApplicationNumber: loanNumber,
      dashboardToken: dashboardToken,
    })

    return {
      success: true,
      dashboardUrl: generateDashboardUrl(loanNumber, email, dashboardToken),
    }
  } catch (error) {
    console.error('Verification completion failed:', error)
    return { success: false, error: 'Verification failed' }
  }
}
```

## Testing

### Email Configuration Test

```typescript
import { testEmailConfiguration } from '@/lib/email-templates'

const testResult = await testEmailConfiguration()
if (!testResult.isValid) {
  console.error('Email configuration issues:', testResult.errors)
}
```

### Template Preview

For development and testing, you can preview templates using React Email's preview functionality:

```bash
# Install React Email CLI
npm install -g react-email

# Start preview server
npx react-email dev
```

Navigate to `http://localhost:3000` to preview your email templates.

## Monitoring and Analytics

### Email Tracking (Optional)

If using AWS SES Configuration Sets:

- **Open Tracking**: Monitor email open rates
- **Click Tracking**: Track link clicks in emails
- **Bounce Handling**: Automatic bounce processing
- **Complaint Handling**: Manage spam complaints

### Logging

All email sending attempts are logged with:

- ✅ **Success/failure status**
- ✅ **AWS SES message ID**
- ✅ **Error details** (if applicable)
- ✅ **Recipient information** (anonymized in logs)

## Maintenance

### Regular Tasks

1. **Monitor bounce rates** and update email lists
2. **Review AWS SES usage** and adjust limits as needed
3. **Update email templates** based on user feedback
4. **Test email rendering** across different clients periodically

### Template Updates

When updating email templates:

1. **Test thoroughly** across email clients
2. **Validate HTML** output using email testing tools
3. **Check mobile responsiveness**
4. **Verify all dynamic content** renders correctly
5. **Test with real data** before deployment

## Troubleshooting

### Common Issues

#### Email Not Sending

- ✅ Check AWS credentials and permissions
- ✅ Verify sender email is verified in SES
- ✅ Ensure not in SES sandbox (for production)
- ✅ Check AWS SES sending limits

#### Email Rendering Issues

- ✅ Test with React Email preview server
- ✅ Validate HTML output
- ✅ Check for unsupported CSS properties
- ✅ Verify image paths and external resources

#### Configuration Problems

- ✅ Run `testEmailConfiguration()` function
- ✅ Verify all environment variables are set
- ✅ Check AWS region configuration
- ✅ Validate email addresses format

## Performance Considerations

### Email Rendering

- ✅ **Server-side rendering** for faster email generation
- ✅ **Minimal external dependencies** for reliability
- ✅ **Optimized HTML output** for faster loading
- ✅ **Cached font loading** where supported

### AWS SES Optimization

- ✅ **Batch sending** for multiple recipients (if needed)
- ✅ **Proper error handling** with retry logic
- ✅ **Connection pooling** for high-volume sending
- ✅ **Rate limiting** to stay within SES limits

## Conclusion

The FCU Loan Status Portal email system provides a robust, secure, and professionally designed email experience for loan applicants. The system leverages modern web technologies while ensuring maximum compatibility across email clients and maintaining the highest security standards for financial communications.

The modular design allows for easy maintenance and future enhancements, while the comprehensive documentation ensures smooth operation and troubleshooting capabilities.
