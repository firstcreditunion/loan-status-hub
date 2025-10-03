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
  const requestId = crypto.randomUUID().substring(0, 8)
  const startTime = Date.now()

  console.log(`[${requestId}] [Verify-Code] START`)

  const ipAddress =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  console.log(
    `[${requestId}] [Verify-Code] IP: ${ipAddress}, UA: ${userAgent.substring(0, 50)}...`
  )

  try {
    console.log(`[${requestId}] [Verify-Code] Parsing request body...`)
    const body = await request.json()
    const { email, loanApplicationNumber, verificationCode } = body

    console.log(
      `[${requestId}] [Verify-Code] Email: ${email}, Loan: ${loanApplicationNumber}, Code: [REDACTED]`
    )

    // Debug logging removed for security - verification code should not be logged

    // Validate required fields
    if (!email || !loanApplicationNumber || !verificationCode) {
      console.log(`[${requestId}] [Verify-Code] ERROR: Missing required fields`)
      await logSecurityEvent(
        'invalid_request',
        'medium',
        'Missing required fields in code verification',
        ipAddress,
        email,
        undefined, // Don't pass unvalidated loan number
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
    console.log(`[${requestId}] [Verify-Code] Validating code format...`)
    if (!/^\d{6}$/.test(verificationCode)) {
      console.log(`[${requestId}] [Verify-Code] ERROR: Invalid code format`)
      await logSecurityEvent(
        'invalid_code_format',
        'medium',
        'Invalid verification code format',
        ipAddress,
        email,
        undefined, // Don't pass unvalidated loan number
        userAgent
      )

      return NextResponse.json(
        { error: 'Invalid verification code format' },
        { status: 400 }
      )
    }

    // Check rate limiting for code attempts
    console.log(`[${requestId}] [Verify-Code] Checking rate limit...`)
    const rateLimitResult = await checkRateLimit(
      `${ipAddress}_${email}`,
      'ip_email',
      'code_attempt',
      5 // Max 5 code attempts per hour per IP/email combo
    )

    console.log(
      `[${requestId}] [Verify-Code] Rate limit allowed: ${rateLimitResult.allowed}, Remaining: ${rateLimitResult.remainingRequests}`
    )

    if (!rateLimitResult.allowed) {
      console.log(`[${requestId}] [Verify-Code] ERROR: Rate limit exceeded`)
      // Convert loan application number to validate it first
      const loanNumberAsInt = parseInt(loanApplicationNumber, 10)
      const validLoanNumber =
        !isNaN(loanNumberAsInt) && loanNumberAsInt > 0
          ? loanNumberAsInt
          : undefined

      await logSecurityEvent(
        'rate_limit_exceeded',
        'high',
        'Rate limit exceeded for code verification attempts',
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
          error: 'Too many verification attempts. Please try again later.',
          resetTime: rateLimitResult.resetTime,
        },
        { status: 429 }
      )
    }

    // Convert loan application number to number and validate
    console.log(`[${requestId}] [Verify-Code] Validating loan number...`)
    const loanNumberAsInt = parseInt(loanApplicationNumber, 10)
    if (isNaN(loanNumberAsInt) || loanNumberAsInt <= 0) {
      console.log(
        `[${requestId}] [Verify-Code] ERROR: Invalid loan number format`
      )
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
    console.log(`[${requestId}] [Verify-Code] Verifying code...`)
    const verificationResult = await verifyCode(
      email,
      loanNumberAsInt,
      verificationCode
    )
    console.log(
      `[${requestId}] [Verify-Code] Verification result: ${verificationResult.success}`
    )

    if (!verificationResult.success) {
      console.log(
        `[${requestId}] [Verify-Code] ERROR: Verification failed - ${verificationResult.error}`
      )
      // Only log with loan number if we know it exists (check if verification session exists)
      if (verificationResult.session) {
        // Log failed verification attempt - we know loan exists if session exists
        await logUserAction(
          email,
          loanNumberAsInt,
          'code_verification_failed',
          false,
          ipAddress,
          userAgent,
          verificationResult.error
        )
      } else {
        // Log as security event instead if no session found
        await logSecurityEvent(
          'verification_attempt_no_session',
          'high',
          'Code verification attempted without valid session',
          ipAddress,
          email,
          undefined,
          userAgent,
          {
            requestedLoanNumber: loanNumberAsInt,
            error: verificationResult.error || 'Unknown verification error',
          }
        )
      }

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
    console.log(`[${requestId}] [Verify-Code] Fetching loan application...`)
    const loanApplication = await getLoanApplication(loanNumberAsInt)
    console.log(`[${requestId}] [Verify-Code] Loan found: ${!!loanApplication}`)

    if (!loanApplication) {
      console.log(
        `[${requestId}] [Verify-Code] ERROR: Loan application not found`
      )
      return NextResponse.json(
        { error: 'Loan application not found' },
        { status: 404 }
      )
    }

    // Create or update verified user
    console.log(
      `[${requestId}] [Verify-Code] Creating/updating verified user...`
    )
    const userResult = await createVerifiedUser(email, loanNumberAsInt)
    console.log(
      `[${requestId}] [Verify-Code] User created: ${userResult.success}`
    )

    if (!userResult.success) {
      console.log(
        `[${requestId}] [Verify-Code] ERROR: Failed to create user - ${userResult.error}`
      )
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
    console.log(`[${requestId}] [Verify-Code] Generating dashboard token...`)
    const dashboardToken = generateDashboardToken(
      email,
      loanNumberAsInt.toString()
    )
    const dashboardUrl = generateDashboardUrl(
      loanNumberAsInt.toString(),
      email,
      dashboardToken
    )
    console.log(`[${requestId}] [Verify-Code] Dashboard URL generated`)

    // Send welcome email
    console.log(`[${requestId}] [Verify-Code] Sending welcome email...`)
    const emailResult = await sendWelcomeEmail({
      recipientEmail: email,
      applicantName: loanApplication.applicant_name || 'Applicant',
      loanApplicationNumber: loanNumberAsInt.toString(),
      dashboardToken: dashboardToken,
      ipAddress,
      userAgent,
    })

    console.log(
      `[${requestId}] [Verify-Code] Welcome email sent: ${emailResult.success}`
    )

    // Log successful verification (even if welcome email fails)
    console.log(
      `[${requestId}] [Verify-Code] Logging successful verification...`
    )
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

    const duration = Date.now() - startTime
    console.log(
      `[${requestId}] [Verify-Code] SUCCESS - Returning response (${duration}ms)`
    )

    return NextResponse.json({
      success: true,
      message: 'Verification successful',
      dashboardUrl: dashboardUrl,
      welcomeEmailSent: emailResult.success,
      sessionExpiresIn: 15, // minutes
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[${requestId}] [Verify-Code] ERROR (${duration}ms):`, error)

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

// Commit Control
