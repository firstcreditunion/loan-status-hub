import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import {
  getVerifiedUser,
  updateUserSession,
  logUserAction,
  logSecurityEvent,
  getComprehensiveLoanData,
} from '@/lib/supabase-services'

// API route for checking session status
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID().substring(0, 8)
  const startTime = Date.now()

  console.log(`[${requestId}] [Session-Status] START`)

  const ipAddress =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  console.log(
    `[${requestId}] [Session-Status] IP: ${ipAddress}, UA: ${userAgent.substring(0, 50)}...`
  )

  try {
    console.log(`[${requestId}] [Session-Status] Parsing request body...`)
    const body = await request.json()
    const { email, loanApplicationNumber } = body

    console.log(
      `[${requestId}] [Session-Status] Email: ${email}, Loan: ${loanApplicationNumber}`
    )

    // Validate required fields
    if (!email || !loanApplicationNumber) {
      console.log(
        `[${requestId}] [Session-Status] ERROR: Missing required fields`
      )
      return NextResponse.json(
        { error: 'Email and loan application number are required' },
        { status: 400 }
      )
    }

    // Convert loan application number to number and validate
    console.log(`[${requestId}] [Session-Status] Validating loan number...`)
    const loanNumberAsInt = parseInt(loanApplicationNumber, 10)
    if (isNaN(loanNumberAsInt) || loanNumberAsInt <= 0) {
      console.log(
        `[${requestId}] [Session-Status] ERROR: Invalid loan number format`
      )
      return NextResponse.json(
        { error: 'Invalid loan application number' },
        { status: 400 }
      )
    }

    // Get verified user
    console.log(
      `[${requestId}] [Session-Status] Fetching verified user from database...`
    )
    const user = await getVerifiedUser(email, loanNumberAsInt)
    console.log(`[${requestId}] [Session-Status] User found: ${!!user}`)

    if (!user) {
      console.log(`[${requestId}] [Session-Status] User not verified`)
      // Don't pass loan number if user doesn't exist - it might not be a valid loan
      await logSecurityEvent(
        'unauthorized_access_attempt',
        'medium',
        'Attempt to access session for unverified user',
        ipAddress,
        email,
        undefined, // Don't pass potentially invalid loan number
        userAgent,
        {
          requestedLoanNumber: loanNumberAsInt,
        }
      )

      return NextResponse.json({ error: 'User not verified' }, { status: 401 })
    }

    // Check if session is expired (15 minutes)
    console.log(
      `[${requestId}] [Session-Status] Checking session expiration...`
    )
    const now = new Date()
    const sessionExpires = new Date(user.session_expires_at || 0)
    console.log(
      `[${requestId}] [Session-Status] Session expires at: ${sessionExpires.toISOString()}, Now: ${now.toISOString()}`
    )

    if (now > sessionExpires) {
      console.log(`[${requestId}] [Session-Status] Session expired`)
      await logUserAction(
        email,
        loanNumberAsInt,
        'session_expired',
        true,
        ipAddress,
        userAgent
      )

      return NextResponse.json(
        {
          error: 'Session expired',
          expired: true,
          requiresReVerification: true,
        },
        { status: 401 }
      )
    }

    // Update session activity
    console.log(`[${requestId}] [Session-Status] Updating session activity...`)
    const sessionResult = await updateUserSession(
      email,
      loanNumberAsInt,
      user.current_session_id || undefined
    )

    if (!sessionResult.success) {
      console.error(
        `[${requestId}] [Session-Status] Failed to update user session:`,
        sessionResult.error
      )
    } else {
      console.log(
        `[${requestId}] [Session-Status] Session updated successfully`
      )
    }

    // Get comprehensive loan data for dashboard
    console.log(
      `[${requestId}] [Session-Status] Fetching comprehensive loan data...`
    )
    const comprehensiveLoanData =
      await getComprehensiveLoanData(loanNumberAsInt)

    if (!comprehensiveLoanData) {
      console.log(
        `[${requestId}] [Session-Status] ERROR: Loan application not found`
      )
      return NextResponse.json(
        { error: 'Loan application not found' },
        { status: 404 }
      )
    }

    console.log(
      `[${requestId}] [Session-Status] Loan data retrieved successfully`
    )

    // Log session check
    console.log(
      `[${requestId}] [Session-Status] Logging session check action...`
    )
    await logUserAction(
      email,
      loanNumberAsInt,
      'session_checked',
      true,
      ipAddress,
      userAgent,
      undefined,
      {
        sessionExpiresAt: sessionExpires.toISOString(),
        remainingMinutes: Math.round(
          (sessionExpires.getTime() - now.getTime()) / (1000 * 60)
        ),
      }
    )

    const duration = Date.now() - startTime
    console.log(
      `[${requestId}] [Session-Status] SUCCESS - Returning response (${duration}ms)`
    )

    return NextResponse.json({
      success: true,
      sessionValid: true,
      user: {
        email: user.email,
        loanApplicationNumber: user.loan_application_number,
        sessionExpiresAt: sessionExpires.toISOString(),
        totalLogins: user.total_logins,
        lastLoginAt: user.last_login_at,
        isActive: user.is_active,
      },
      comprehensiveLoanData: comprehensiveLoanData,
      expiresAt: sessionExpires.toISOString(),
      remainingMinutes: Math.round(
        (sessionExpires.getTime() - now.getTime()) / (1000 * 60)
      ),
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(
      `[${requestId}] [Session-Status] ERROR (${duration}ms):`,
      error
    )

    // Log the error
    await logSecurityEvent(
      'system_error',
      'medium',
      'System error during session status check',
      ipAddress,
      undefined,
      undefined,
      userAgent,
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    )

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET method for simple session checks
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email')
  const loanApplicationNumber = searchParams.get('loanApplicationNumber')

  if (!email || !loanApplicationNumber) {
    return NextResponse.json(
      { error: 'Email and loan application number are required' },
      { status: 400 }
    )
  }

  // Reuse POST logic
  const mockBody = { email, loanApplicationNumber }
  const mockRequest = {
    ...request,
    json: async () => mockBody,
  } as NextRequest

  return POST(mockRequest)
}
