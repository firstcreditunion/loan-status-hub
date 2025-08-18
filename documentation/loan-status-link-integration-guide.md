# Loan Status Link Integration Guide

## Overview

This guide provides step-by-step instructions for integrating the FCU Loan Status Portal link into your existing loan application Next.js project. The status portal is deployed at `https://loan-link-dev.vercel.app/` and requires specific URL parameters to function properly.

## 🎯 **Integration Goal**

Replace the current "Track my application" button in your `LoanApplyConfirmationEmail.tsx` with a dynamic link that points to the loan status portal with the correct parameters for email verification.

## 📋 **Prerequisites**

- Your existing loan application Next.js project
- The `LoanApplyConfirmationEmail.tsx` file (already created)
- Access to loan application data (email, loan number, applicant name)

## 🔗 **Required URL Parameters**

The loan status portal expects these URL parameters:

- `email`: User's email address (required)
- `loan`: Loan application number (required)
- `token`: Security token (optional but recommended)

## 📁 **Step-by-Step Implementation**

### **Step 1: Create Link Generator Utility**

Create a new file `lib/loan-status-link-generator.ts` in your loan application project:

```typescript
// lib/loan-status-link-generator.ts

/**
 * Configuration for loan status portal
 */
const LOAN_STATUS_CONFIG = {
  baseUrl: 'https://loan-link-dev.vercel.app',
  // Alternative for development/staging
  // baseUrl: process.env.LOAN_STATUS_BASE_URL || 'https://loan-link-dev.vercel.app'
}

/**
 * Interface for loan status link parameters
 */
interface LoanStatusLinkParams {
  email: string
  loanApplicationNumber: string | number
  applicantName: string
  token?: string // Optional security token
}

/**
 * Generate loan status portal link with required parameters
 * @param params - Link parameters
 * @returns Complete URL to loan status portal
 */
export function generateLoanStatusLink({
  email,
  loanApplicationNumber,
  applicantName,
  token,
}: LoanStatusLinkParams): string {
  const baseUrl = LOAN_STATUS_CONFIG.baseUrl

  // Create URL parameters
  const params = new URLSearchParams({
    email: email.trim(),
    loan: loanApplicationNumber.toString(),
  })

  // Add optional security token
  if (token) {
    params.set('token', token)
  }

  return `${baseUrl}?${params.toString()}`
}

/**
 * Generate a simple security token (recommended)
 * This creates a base64-encoded token with email, loan number, and timestamp
 * @param email - User email
 * @param loanNumber - Loan application number
 * @returns Base64 encoded security token
 */
export function generateSecureToken(email: string, loanNumber: string): string {
  const timestamp = Date.now().toString()
  const payload = `${email}:${loanNumber}:${timestamp}`

  // Create base64url encoded token
  return Buffer.from(payload).toString('base64url')
}

/**
 * Validate token format (optional - for debugging)
 * @param token - Token to validate
 * @param email - Expected email
 * @param loanNumber - Expected loan number
 * @returns Whether token is valid
 */
export function validateToken(
  token: string,
  email: string,
  loanNumber: string
): boolean {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const [tokenEmail, tokenLoan, timestamp] = decoded.split(':')

    // Validate email and loan number match
    if (tokenEmail !== email || tokenLoan !== loanNumber) {
      return false
    }

    // Check if token is not too old (e.g., 30 days)
    const tokenAge = Date.now() - parseInt(timestamp)
    const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days

    return tokenAge <= maxAge
  } catch {
    return false
  }
}

/**
 * Example usage function
 */
export function createExampleLink(): string {
  return generateLoanStatusLink({
    email: 'john.doe@example.com',
    loanApplicationNumber: '12345',
    applicantName: 'John Doe',
    token: generateSecureToken('john.doe@example.com', '12345'),
  })
}
```

### **Step 2: Update Your Email Template Interface**

Modify your existing `LoanApplyConfirmationEmail.tsx` to include the loan application number:

```typescript
// In LoanApplyConfirmationEmail.tsx - Update the interface
interface EmailProps {
  recipientEmail: string
  title?: string
  firstName?: string
  loanAmount?: string
  instalmentAmount?: string
  instalmentFrequencyHeader?: string
  loanTerm?: string
  interestRate?: string
  totalInterest?: string
  totalAmountPayable?: string
  insuranceAmount?: string
  needProvidentInsurance?: string
  insuranceType?: string
  coverType?: string
  coversIncluded?: string
  tempLoanApplicationNumber?: string // Make sure this exists
  submittedDateTime: string
  // Add these new fields for status link
  loanApplicationNumber: string // Required for status link
  applicantName?: string // Optional but recommended
}
```

### **Step 3: Update the Email Template Function**

Replace the existing function signature and add the link generation:

```typescript
// In LoanApplyConfirmationEmail.tsx - Update the function
import { generateLoanStatusLink, generateSecureToken } from '../lib/loan-status-link-generator'

export default function LoanApplyConfirmationEmail({
  recipientEmail,
  firstName,
  loanAmount,
  totalInterest,
  totalAmountPayable,
  instalmentAmount,
  instalmentFrequencyHeader,
  insuranceAmount,
  needProvidentInsurance,
  insuranceType,
  coverType,
  coversIncluded,
  submittedDateTime,
  loanApplicationNumber, // Add this parameter
  applicantName, // Add this parameter
  // ... other existing parameters
}: EmailProps) {

  // Generate the loan status link with security token
  const securityToken = generateSecureToken(recipientEmail, loanApplicationNumber)
  const loanStatusLink = generateLoanStatusLink({
    email: recipientEmail,
    loanApplicationNumber: loanApplicationNumber,
    applicantName: applicantName || firstName || 'Valued Customer',
    token: securityToken
  })

  return (
    <Html>
      <Head />
      <Preview>First Credit Union - Loan Application Confirmation</Preview>
      <Tailwind>
        <Body className='bg-white font-sans'>
          <Container className='mx-auto w-full max-w-[600px] p-0'>
            {/* ... existing content ... */}

            {/* UPDATE THIS SECTION - Replace the existing Track button */}
            <Section className='pb-16 text-center'>
              <Link
                href={loanStatusLink} // Use the generated link instead of hardcoded URL
                className='inline-flex items-center rounded-full bg-[#bbbb14] px-12 py-4 text-center font-bold text-base text-white no-underline tracking-tight'
              >
                Track my application
              </Link>
            </Section>

            {/* ... rest of existing content remains the same ... */}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
```

### **Step 4: Update Your Email Sending Logic**

In the file where you send the loan confirmation email, update the function call to include the new parameters:

```typescript
// Example: In your API route or email service file
import { render } from '@react-email/render'
import LoanApplyConfirmationEmail from '../emails/LoanApplyConfirmationEmail'

interface SendLoanConfirmationParams {
  recipientEmail: string
  firstName: string
  loanAmount: string
  totalInterest: string
  totalAmountPayable: string
  instalmentAmount: string
  instalmentFrequencyHeader: string
  insuranceAmount?: string
  needProvidentInsurance?: string
  insuranceType?: string
  coverType?: string
  coversIncluded?: string
  submittedDateTime: string
  loanApplicationNumber: string // Add this
  applicantName?: string // Add this
  // ... other parameters
}

export async function sendLoanConfirmationEmail(
  params: SendLoanConfirmationParams
) {
  try {
    // Render the email with all parameters including the new ones
    const emailHtml = await render(
      LoanApplyConfirmationEmail({
        recipientEmail: params.recipientEmail,
        firstName: params.firstName,
        loanAmount: params.loanAmount,
        totalInterest: params.totalInterest,
        totalAmountPayable: params.totalAmountPayable,
        instalmentAmount: params.instalmentAmount,
        instalmentFrequencyHeader: params.instalmentFrequencyHeader,
        insuranceAmount: params.insuranceAmount,
        needProvidentInsurance: params.needProvidentInsurance,
        insuranceType: params.insuranceType,
        coverType: params.coverType,
        coversIncluded: params.coversIncluded,
        submittedDateTime: params.submittedDateTime,
        loanApplicationNumber: params.loanApplicationNumber, // Include this
        applicantName: params.applicantName, // Include this
        tempLoanApplicationNumber: params.loanApplicationNumber, // Keep existing if needed
      })
    )

    // Send email using your existing email service
    const result = await sendEmail({
      to: params.recipientEmail,
      subject: `Loan Application Confirmation - #${params.loanApplicationNumber}`,
      html: emailHtml,
    })

    console.log('Loan confirmation email sent successfully:', {
      email: params.recipientEmail,
      loanApplicationNumber: params.loanApplicationNumber,
    })

    return { success: true, result }
  } catch (error) {
    console.error('Failed to send loan confirmation email:', error)
    return { success: false, error }
  }
}
```

### **Step 5: Update Your API Route or Form Handler**

In your loan application API route, ensure you pass the loan application number:

```typescript
// Example: app/api/loan-application/route.ts or similar
export async function POST(request: Request) {
  try {
    const formData = await request.json()

    // Process loan application and generate loan application number
    const loanApplicationNumber = generateLoanApplicationNumber() // Your existing logic

    // Save loan application to database
    await saveLoanApplication({
      ...formData,
      loanApplicationNumber,
    })

    // Send confirmation email with status link
    const emailResult = await sendLoanConfirmationEmail({
      recipientEmail: formData.email,
      firstName: formData.firstName,
      loanAmount: formData.loanAmount,
      totalInterest: formData.totalInterest,
      totalAmountPayable: formData.totalAmountPayable,
      instalmentAmount: formData.instalmentAmount,
      instalmentFrequencyHeader: formData.instalmentFrequencyHeader,
      insuranceAmount: formData.insuranceAmount,
      needProvidentInsurance: formData.needProvidentInsurance,
      insuranceType: formData.insuranceType,
      coverType: formData.coverType,
      coversIncluded: formData.coversIncluded,
      submittedDateTime: new Date().toLocaleString(),
      loanApplicationNumber: loanApplicationNumber, // Pass the loan number
      applicantName:
        `${formData.title || ''} ${formData.firstName || ''}`.trim(), // Construct full name
    })

    return Response.json({
      success: true,
      loanApplicationNumber,
      emailSent: emailResult.success,
    })
  } catch (error) {
    console.error('Loan application error:', error)
    return Response.json(
      { error: 'Failed to process application' },
      { status: 500 }
    )
  }
}
```

### **Step 6: Environment Variables (Optional)**

Add environment variable support for different environments:

```env
# .env.local or .env
LOAN_STATUS_BASE_URL=https://loan-link-dev.vercel.app

# For staging
# LOAN_STATUS_BASE_URL=https://loan-status-staging.vercel.app

# For development
# LOAN_STATUS_BASE_URL=http://localhost:3000
```

Update the link generator to use environment variables:

```typescript
// In lib/loan-status-link-generator.ts - Update the config
const LOAN_STATUS_CONFIG = {
  baseUrl:
    process.env.LOAN_STATUS_BASE_URL || 'https://loan-link-dev.vercel.app',
}
```

## 🧪 **Testing the Integration**

### **Step 7: Test Link Generation**

Create a test file to verify link generation works correctly:

```typescript
// test/loan-status-link.test.ts or just run in console
import {
  generateLoanStatusLink,
  generateSecureToken,
} from '../lib/loan-status-link-generator'

// Test basic link generation
const testLink = generateLoanStatusLink({
  email: 'test@example.com',
  loanApplicationNumber: '12345',
  applicantName: 'John Doe',
})

console.log('Generated link:', testLink)
// Should output: https://loan-link-dev.vercel.app/?email=test%40example.com&loan=12345

// Test with security token
const token = generateSecureToken('test@example.com', '12345')
const secureLink = generateLoanStatusLink({
  email: 'test@example.com',
  loanApplicationNumber: '12345',
  applicantName: 'John Doe',
  token: token,
})

console.log('Secure link:', secureLink)
// Should output: https://loan-link-dev.vercel.app/?email=test%40example.com&loan=12345&token=...
```

### **Step 8: Test Email Template**

Test the updated email template:

```typescript
// Test the email rendering
import { render } from '@react-email/render'
import LoanApplyConfirmationEmail from '../emails/LoanApplyConfirmationEmail'

const testEmailHtml = await render(
  LoanApplyConfirmationEmail({
    recipientEmail: 'test@example.com',
    firstName: 'John',
    loanAmount: '10000',
    totalInterest: '2500',
    totalAmountPayable: '12500',
    instalmentAmount: '208.33',
    instalmentFrequencyHeader: 'Monthly',
    submittedDateTime: new Date().toLocaleString(),
    loanApplicationNumber: '12345',
    applicantName: 'John Doe',
    // ... other required fields
  })
)

// Save to file to preview
import fs from 'fs'
fs.writeFileSync('test-email.html', testEmailHtml)
console.log('Test email saved to test-email.html')
```

## 🔄 **User Flow After Implementation**

1. **User submits loan application** in your project
2. **Loan application number generated** and saved to database
3. **Confirmation email sent** with dynamic status link
4. **User clicks "Track my application"** button in email
5. **Redirected to loan status portal** at `https://loan-link-dev.vercel.app/?email=...&loan=...&token=...`
6. **Landing page validates parameters** and checks for existing session
7. **If first time**: Verification flow starts (6-digit code sent)
8. **If returning**: Either shows existing session or requires re-verification
9. **After verification**: User sees loan status dashboard

## 🔒 **Security Features**

- **Security tokens** prevent unauthorized access with just email/loan number
- **Token expiration** (30 days by default) prevents old links from working indefinitely
- **Email verification** required on first access
- **Session timeout** (15 minutes) for subsequent visits
- **Rate limiting** prevents brute force attempts

## 🚨 **Important Notes**

1. **Loan Application Number**: Must be unique and consistent between both systems
2. **Email Address**: Must match exactly between loan application and status portal
3. **Token Security**: Tokens are base64-encoded but not encrypted - consider JWT for production
4. **Error Handling**: The status portal will show appropriate errors for invalid links
5. **Testing**: Always test with real email addresses and loan numbers before production

## 📋 **Checklist**

- [ ] Create `lib/loan-status-link-generator.ts`
- [ ] Update `EmailProps` interface in `LoanApplyConfirmationEmail.tsx`
- [ ] Update email template function to use generated link
- [ ] Update email sending logic to pass loan application number
- [ ] Update API route to include required parameters
- [ ] Add environment variables (optional)
- [ ] Test link generation
- [ ] Test email template rendering
- [ ] Test end-to-end flow with real data

## 🎯 **Expected Result**

After implementation, your "Track my application" button will generate URLs like:

```
https://loan-link-dev.vercel.app/?email=john.doe%40example.com&loan=12345&token=am9obi5kb2VAZXhhbXBsZS5jb206MTIzNDU6MTcwOTU1NjAwMDAwMA
```

This will seamlessly integrate with the loan status portal's verification system and provide a secure, user-friendly experience for checking loan application status.
