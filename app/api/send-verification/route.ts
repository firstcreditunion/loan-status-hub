import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendVerificationCodeEmail } from '@/lib/email-templates'
import {
  getLoanApplication,
  createVerificationSession,
  generateVerificationCode,
  logUserAction,
  checkRateLimit,
  logSecurityEvent,
} from '@/lib/supabase-services'

// Import validation function for consistency
function validateEmail(email: string): boolean {
  if (!email || email.trim() === '') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

// API route for sending verification codes
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID().substring(0, 8)
  const startTime = Date.now()

  console.log(`[${requestId}] [Send-Verification] START`)

  const ipAddress =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  console.log(
    `[${requestId}] [Send-Verification] IP: ${ipAddress}, UA: ${userAgent.substring(0, 50)}...`
  )

  try {
    console.log(`[${requestId}] [Send-Verification] Parsing request body...`)
    const body = await request.json()
    const { email, loanApplicationNumber } = body

    console.log(
      `[${requestId}] [Send-Verification] Email: ${email}, Loan: ${loanApplicationNumber}`
    )

    // Validate required fields
    if (!email || !loanApplicationNumber) {
      console.log(
        `[${requestId}] [Send-Verification] ERROR: Missing required fields`
      )
      await logSecurityEvent(
        'invalid_request',
        'medium',
        'Missing required fields in verification request',
        ipAddress,
        email,
        undefined, // Don't pass unvalidated loan number
        userAgent
      )

      return NextResponse.json(
        { error: 'Email and loan application number are required' },
        { status: 400 }
      )
    }

    // Validate email format
    console.log(`[${requestId}] [Send-Verification] Validating email format...`)
    if (!validateEmail(email)) {
      console.log(
        `[${requestId}] [Send-Verification] ERROR: Invalid email format`
      )
      await logSecurityEvent(
        'invalid_email_format',
        'low',
        'Invalid email format provided',
        ipAddress,
        email,
        undefined, // Don't pass unvalidated loan number
        userAgent
      )

      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check rate limiting
    console.log(`[${requestId}] [Send-Verification] Checking rate limit...`)
    const rateLimitResult = await checkRateLimit(
      `${ipAddress}_${email}`,
      'ip_email',
      'verification_request',
      3 // Max 3 verification requests per hour per IP/email combo
    )

    console.log(
      `[${requestId}] [Send-Verification] Rate limit allowed: ${rateLimitResult.allowed}, Remaining: ${rateLimitResult.remainingRequests}`
    )

    if (!rateLimitResult.allowed) {
      console.log(
        `[${requestId}] [Send-Verification] ERROR: Rate limit exceeded`
      )
      // Convert loan application number to validate it first
      const loanNumberAsInt = parseInt(loanApplicationNumber, 10)
      const validLoanNumber =
        !isNaN(loanNumberAsInt) && loanNumberAsInt > 0
          ? loanNumberAsInt
          : undefined

      await logSecurityEvent(
        'rate_limit_exceeded',
        'high',
        'Rate limit exceeded for verification requests',
        ipAddress,
        email,
        validLoanNumber,
        userAgent,
        {
          currentRequests: rateLimitResult.currentRequests,
          resetTime: rateLimitResult.resetTime.toISOString(),
        }
      )

      return NextResponse.json(
        {
          error: 'Too many verification requests. Please try again later.',
          resetTime: rateLimitResult.resetTime,
        },
        { status: 429 }
      )
    }

    // Convert loan application number to number and validate
    console.log(`[${requestId}] [Send-Verification] Validating loan number...`)
    const loanNumberAsInt = parseInt(loanApplicationNumber, 10)
    if (isNaN(loanNumberAsInt) || loanNumberAsInt <= 0) {
      console.log(
        `[${requestId}] [Send-Verification] ERROR: Invalid loan number format`
      )
      await logSecurityEvent(
        'invalid_loan_number',
        'medium',
        'Invalid loan application number format',
        ipAddress,
        email,
        undefined,
        userAgent
      )

      return NextResponse.json(
        { error: 'Invalid loan application number' },
        { status: 400 }
      )
    }

    // Get loan application details
    console.log(
      `[${requestId}] [Send-Verification] Fetching loan application from database...`
    )
    const loanApplication = await getLoanApplication(loanNumberAsInt)
    console.log(
      `[${requestId}] [Send-Verification] Loan found: ${!!loanApplication}`
    )

    if (!loanApplication) {
      console.log(`[${requestId}] [Send-Verification] ERROR: Loan not found`)
      // Don't log with non-existent loan number - use security event instead
      await logSecurityEvent(
        'loan_not_found',
        'medium',
        'Verification requested for non-existent loan application',
        ipAddress,
        email,
        undefined, // Don't pass non-existent loan number
        userAgent,
        {
          requestedLoanNumber: loanNumberAsInt,
        }
      )

      return NextResponse.json(
        { error: 'Loan application not found' },
        { status: 404 }
      )
    }

    // Generate verification code
    console.log(
      `[${requestId}] [Send-Verification] Generating verification code...`
    )
    const verificationCode = generateVerificationCode()
    console.log(
      `[${requestId}] [Send-Verification] Code generated successfully`
    )

    // Create verification session in database
    console.log(
      `[${requestId}] [Send-Verification] Creating verification session in database...`
    )
    const sessionResult = await createVerificationSession(
      email,
      loanNumberAsInt,
      verificationCode,
      ipAddress,
      userAgent
    )
    console.log(
      `[${requestId}] [Send-Verification] Session created: ${sessionResult.success}`
    )

    if (!sessionResult.success) {
      console.log(
        `[${requestId}] [Send-Verification] ERROR: Failed to create session - ${sessionResult.error}`
      )
      await logUserAction(
        email,
        loanNumberAsInt,
        'verification_requested',
        false,
        ipAddress,
        userAgent,
        sessionResult.error
      )

      return NextResponse.json(
        { error: 'Failed to create verification session' },
        { status: 500 }
      )
    }

    // Send verification email
    console.log(
      `[${requestId}] [Send-Verification] Sending verification email...`
    )
    const emailResult = await sendVerificationCodeEmail({
      recipientEmail: email,
      verificationCode: verificationCode,
      loanApplicationNumber: loanNumberAsInt.toString(),
      applicantName: loanApplication.applicant_name || 'Applicant',
      expiresInMinutes: 10,
      ipAddress,
      userAgent,
    })

    // Debug logging removed for security - verification code should not be logged
    console.log(
      `[${requestId}] [Send-Verification] Email sent: ${emailResult.success}`
    )

    if (!emailResult.success) {
      console.log(
        `[${requestId}] [Send-Verification] ERROR: Failed to send email`
      )
      await logUserAction(
        email,
        loanNumberAsInt,
        'verification_requested',
        false,
        ipAddress,
        userAgent,
        'Failed to send verification email'
      )

      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    // Log successful verification request
    console.log(
      `[${requestId}] [Send-Verification] Logging successful action...`
    )
    await logUserAction(
      email,
      loanNumberAsInt,
      'verification_requested',
      true,
      ipAddress,
      userAgent,
      undefined,
      {
        messageId: emailResult.messageId || null,
        remainingAttempts: rateLimitResult.remainingRequests,
      }
    )

    const duration = Date.now() - startTime
    console.log(
      `[${requestId}] [Send-Verification] SUCCESS - Returning response (${duration}ms)`
    )

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      expiresIn: 10, // minutes
      remainingAttempts: rateLimitResult.remainingRequests,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(
      `[${requestId}] [Send-Verification] ERROR (${duration}ms):`,
      error
    )

    // Log the error
    await logSecurityEvent(
      'system_error',
      'high',
      'System error during verification request',
      ipAddress,
      undefined,
      undefined,
      userAgent,
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack || null : null,
      }
    )

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
