import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail, generateDashboardUrl } from '@/lib/email-templates'
import {
  verifyCode,
  createVerifiedUser,
  logUserAction,
  checkRateLimit,
  logSecurityEvent,
  getLoanApplication,
} from '@/lib/supabase-services'
// import { createClient } from '@/utils/supabase/server'
import crypto from 'crypto'

// Generate secure dashboard token
function generateDashboardToken(email: string, loanNumber: string): string {
  const timestamp = Date.now().toString()
  const data = `${email}:${loanNumber}:${timestamp}`
  const token = crypto.createHash('sha256').update(data).digest('hex')
  return `${token}.${timestamp}`
}

// API route for verifying codes
export async function POST(request: NextRequest) {
  const ipAddress =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  try {
    const body = await request.json()
    const { email, loanApplicationNumber, code } = body

    // Validate required fields
    if (!email || !loanApplicationNumber || !code) {
      await logSecurityEvent(
        'invalid_request',
        'medium',
        'Missing required fields in code verification',
        ipAddress,
        email,
        loanApplicationNumber,
        userAgent
      )

      return NextResponse.json(
        {
          error:
            'Email, loan application number, and verification code are required',
        },
        { status: 400 }
      )
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      await logSecurityEvent(
        'invalid_code_format',
        'medium',
        'Invalid verification code format',
        ipAddress,
        email,
        loanApplicationNumber,
        userAgent
      )

      return NextResponse.json(
        { error: 'Invalid verification code format' },
        { status: 400 }
      )
    }

    // Check rate limiting for code attempts
    const rateLimitResult = await checkRateLimit(
      `${ipAddress}_${email}`,
      'ip_email',
      'code_attempt',
      5 // Max 5 code attempts per hour per IP/email combo
    )

    if (!rateLimitResult.allowed) {
      await logSecurityEvent(
        'rate_limit_exceeded',
        'high',
        'Rate limit exceeded for code verification attempts',
        ipAddress,
        email,
        loanApplicationNumber,
        userAgent,
        {
          currentRequests: rateLimitResult.currentRequests,
          resetTime: rateLimitResult.resetTime.toISOString(),
        }
      )

      return NextResponse.json(
        {
          error: 'Too many verification attempts. Please try again later.',
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
        'Invalid loan application number format in verification',
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

    // Verify the code
    const verificationResult = await verifyCode(email, loanNumberAsInt, code)

    if (!verificationResult.success) {
      // Log failed verification attempt
      await logUserAction(
        email,
        loanNumberAsInt,
        'code_verification_failed',
        false,
        ipAddress,
        userAgent,
        verificationResult.error
      )

      // Log security event for suspicious activity
      if (verificationResult.error?.includes('Too many')) {
        await logSecurityEvent(
          'brute_force_attempt',
          'high',
          'Multiple failed verification attempts detected',
          ipAddress,
          email,
          loanNumberAsInt,
          userAgent
        )
      }

      return NextResponse.json(
        { error: verificationResult.error || 'Verification failed' },
        { status: 400 }
      )
    }

    // Get loan application details for user creation
    const loanApplication = await getLoanApplication(loanNumberAsInt)
    if (!loanApplication) {
      return NextResponse.json(
        { error: 'Loan application not found' },
        { status: 404 }
      )
    }

    // Create or update verified user
    const userResult = await createVerifiedUser(email, loanNumberAsInt)

    if (!userResult.success) {
      await logUserAction(
        email,
        loanNumberAsInt,
        'user_creation_failed',
        false,
        ipAddress,
        userAgent,
        userResult.error
      )

      return NextResponse.json(
        { error: 'Failed to create verified user' },
        { status: 500 }
      )
    }

    // Generate dashboard token
    const dashboardToken = generateDashboardToken(
      email,
      loanNumberAsInt.toString()
    )
    const dashboardUrl = generateDashboardUrl(
      loanNumberAsInt.toString(),
      email,
      dashboardToken
    )

    // Send welcome email
    const emailResult = await sendWelcomeEmail({
      recipientEmail: email,
      applicantName: loanApplication.applicant_name || 'Applicant',
      loanApplicationNumber: loanNumberAsInt.toString(),
      dashboardToken: dashboardToken,
      ipAddress,
      userAgent,
    })

    // Log successful verification (even if welcome email fails)
    await logUserAction(
      email,
      loanNumberAsInt,
      'verification_completed',
      true,
      ipAddress,
      userAgent,
      undefined,
      {
        dashboardToken: dashboardToken.substring(0, 16) + '...', // Log partial token for debugging
        welcomeEmailSent: emailResult.success,
        welcomeEmailId: emailResult.messageId || null,
      }
    )

    // Create Supabase auth session (optional - for additional security)
    // const supabase = await createClient()

    return NextResponse.json({
      success: true,
      message: 'Verification successful',
      dashboardUrl: dashboardUrl,
      welcomeEmailSent: emailResult.success,
      sessionExpiresIn: 15, // minutes
    })
  } catch (error) {
    console.error('Code verification failed:', error)

    // Log the error
    await logSecurityEvent(
      'system_error',
      'high',
      'System error during code verification',
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
