import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationCodeEmail } from '@/lib/email-templates'
import {
  getLoanApplication,
  createVerificationSession,
  generateVerificationCode,
  logUserAction,
  checkRateLimit,
  logSecurityEvent,
} from '@/lib/supabase-services'

// API route for sending verification codes
export async function POST(request: NextRequest) {
  const ipAddress =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  try {
    const body = await request.json()
    const { email, loanApplicationNumber } = body

    // Validate required fields
    if (!email || !loanApplicationNumber) {
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
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
    const rateLimitResult = await checkRateLimit(
      `${ipAddress}_${email}`,
      'ip_email',
      'verification_request',
      3 // Max 3 verification requests per hour per IP/email combo
    )

    if (!rateLimitResult.allowed) {
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
    const loanNumberAsInt = parseInt(loanApplicationNumber, 10)
    if (isNaN(loanNumberAsInt) || loanNumberAsInt <= 0) {
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
    const loanApplication = await getLoanApplication(loanNumberAsInt)

    if (!loanApplication) {
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
    const verificationCode = generateVerificationCode()

    // Create verification session in database
    const sessionResult = await createVerificationSession(
      email,
      loanNumberAsInt,
      verificationCode,
      ipAddress,
      userAgent
    )

    if (!sessionResult.success) {
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
    const emailResult = await sendVerificationCodeEmail({
      recipientEmail: email,
      verificationCode: verificationCode,
      loanApplicationNumber: loanNumberAsInt.toString(),
      applicantName: loanApplication.applicant_name || 'Applicant',
      expiresInMinutes: 10,
      ipAddress,
      userAgent,
    })

    if (!emailResult.success) {
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

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      expiresIn: 10, // minutes
      remainingAttempts: rateLimitResult.remainingRequests,
    })
  } catch (error) {
    console.error('Verification code sending failed:', error)

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
