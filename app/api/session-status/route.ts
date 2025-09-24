import { NextRequest, NextResponse } from 'next/server'
import {
  getVerifiedUser,
  updateUserSession,
  logUserAction,
  logSecurityEvent,
  getComprehensiveLoanData,
} from '@/lib/supabase-services'

// API route for checking session status
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
      return NextResponse.json(
        { error: 'Email and loan application number are required' },
        { status: 400 }
      )
    }

    // Convert loan application number to number and validate
    const loanNumberAsInt = parseInt(loanApplicationNumber, 10)
    if (isNaN(loanNumberAsInt) || loanNumberAsInt <= 0) {
      return NextResponse.json(
        { error: 'Invalid loan application number' },
        { status: 400 }
      )
    }

    // Get verified user
    const user = await getVerifiedUser(email, loanNumberAsInt)

    if (!user) {
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
    const now = new Date()
    const sessionExpires = new Date(user.session_expires_at || 0)

    if (now > sessionExpires) {
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
    const sessionResult = await updateUserSession(
      email,
      loanNumberAsInt,
      user.current_session_id || undefined
    )

    if (!sessionResult.success) {
      console.error('Failed to update user session:', sessionResult.error)
    }

    // Get comprehensive loan data for dashboard
    const comprehensiveLoanData =
      await getComprehensiveLoanData(loanNumberAsInt)

    if (!comprehensiveLoanData) {
      return NextResponse.json(
        { error: 'Loan application not found' },
        { status: 404 }
      )
    }

    // Log session check
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
    console.error('Session status check failed:', error)

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
