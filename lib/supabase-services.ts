import { Database } from '@/database.types'
import { createClient } from '@/utils/supabase/server'
import crypto from 'crypto'

// Types for our services
type Tables = Database['api']['Tables']
type VerificationSession = Tables['user_verification_sessions']['Row']
type VerificationSessionInsert = Tables['user_verification_sessions']['Insert']
type AccessLog = Tables['user_access_logs']['Insert']
type VerifiedUser = Tables['verified_users']['Row']
type VerifiedUserInsert = Tables['verified_users']['Insert']
type LoanApplication = Tables['tblLoanApplication']['Row']

// Enhanced types for better type safety
type MetadataRecord = Record<string, string | number | boolean | null>
type EventDataRecord = Record<string, string | number | boolean | null>

// Rate limit response type (based on our database function)
interface RateLimitResponse {
  allowed: boolean
  remaining_requests: number
  reset_time: string
  current_requests: number
}

// Validation utilities
function validateEmail(email: string): boolean {
  if (!email || email.trim() === '') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

function validateLoanNumber(loanNumber: number): boolean {
  return (
    typeof loanNumber === 'number' &&
    loanNumber > 0 &&
    Number.isInteger(loanNumber)
  )
}

function validateVerificationCode(code: string): boolean {
  if (!code || code.trim() === '') return false
  return /^\d{6}$/.test(code.trim())
}

function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ')
}

// Utility functions
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function hashVerificationCode(code: string): string {
  if (!validateVerificationCode(code)) {
    throw new Error('Invalid verification code format')
  }
  return crypto
    .createHash('sha256')
    .update(code.trim() + 'loan_verification_salt_2024')
    .digest('hex')
}

export function verifyCodeHash(code: string, hash: string): boolean {
  if (!validateVerificationCode(code) || !hash || hash.trim() === '') {
    return false
  }
  try {
    return hashVerificationCode(code) === hash.trim()
  } catch {
    return false
  }
}

// Loan Application Services
export async function getLoanApplication(
  loanNumber: number
): Promise<LoanApplication | null> {
  if (!validateLoanNumber(loanNumber)) {
    console.error('Invalid loan number provided:', loanNumber)
    return null
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .schema('api')
    .from('tblLoanApplication')
    .select('*')
    .eq('Lnd_application_number', loanNumber)
    .single()

  if (error) {
    console.error('Error fetching loan application:', error)
    return null
  }

  return data
}

// Verification Session Services
export async function createVerificationSession(
  email: string,
  loanApplicationNumber: number,
  verificationCode: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: boolean; error?: string }> {
  // Validate inputs
  if (!validateEmail(email)) {
    return { success: false, error: 'Invalid email address' }
  }

  if (!validateLoanNumber(loanApplicationNumber)) {
    return { success: false, error: 'Invalid loan application number' }
  }

  if (!validateVerificationCode(verificationCode)) {
    return { success: false, error: 'Invalid verification code format' }
  }

  const supabase = await createClient()

  try {
    const hashedCode = hashVerificationCode(verificationCode)

    // First, clean up any existing sessions for this email/loan combo
    await supabase
      .schema('api')
      .from('user_verification_sessions')
      .delete()
      .eq('email', sanitizeString(email))
      .eq('loan_application_number', loanApplicationNumber)

    const sessionData: VerificationSessionInsert = {
      email: sanitizeString(email),
      loan_application_number: loanApplicationNumber,
      verification_code_hash: hashedCode,
      code_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      ip_address:
        ipAddress && ipAddress.trim() !== ''
          ? sanitizeString(ipAddress)
          : 'unknown',
      user_agent:
        userAgent && userAgent.trim() !== ''
          ? sanitizeString(userAgent)
          : 'unknown',
      attempts_count: 0,
      is_verified: false,
    }

    const { error } = await supabase
      .schema('api')
      .from('user_verification_sessions')
      .insert(sessionData)

    if (error) {
      console.error('Error creating verification session:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in createVerificationSession:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

export async function getVerificationSession(
  email: string,
  loanApplicationNumber: number
): Promise<VerificationSession | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .schema('api')
    .from('user_verification_sessions')
    .select('*')
    .eq('email', email)
    .eq('loan_application_number', loanApplicationNumber)
    .eq('is_verified', false)
    .single()

  if (error) {
    console.error('Error fetching verification session:', error)
    return null
  }

  return data
}

export async function verifyCode(
  email: string,
  loanApplicationNumber: number,
  code: string
): Promise<{
  success: boolean
  error?: string
  session?: VerificationSession
}> {
  const supabase = await createClient()

  // Get the verification session
  const session = await getVerificationSession(email, loanApplicationNumber)

  if (!session) {
    return { success: false, error: 'No verification session found' }
  }

  // Check if code is expired
  if (new Date() > new Date(session.code_expires_at)) {
    return { success: false, error: 'Verification code has expired' }
  }

  // Check if too many attempts - handle null safely
  const currentAttempts = session.attempts_count ?? 0
  const maxAttempts = session.max_attempts ?? 3

  if (currentAttempts >= maxAttempts) {
    return { success: false, error: 'Too many verification attempts' }
  }

  // Verify the code
  const isValidCode = verifyCodeHash(code, session.verification_code_hash)

  // Update attempts count - safe null handling
  const { error: updateError } = await supabase
    .schema('api')
    .from('user_verification_sessions')
    .update({
      attempts_count: currentAttempts + 1,
      is_verified: isValidCode,
      verified_at: isValidCode ? new Date().toISOString() : null,
    })
    .eq('id', session.id)

  if (updateError) {
    console.error('Error updating verification session:', updateError)
    return { success: false, error: 'Failed to update verification session' }
  }

  if (!isValidCode) {
    return { success: false, error: 'Invalid verification code' }
  }

  return { success: true, session }
}

// Verified User Services
export async function createVerifiedUser(
  email: string,
  loanApplicationNumber: number,
  supabaseUserId?: string
): Promise<{ success: boolean; error?: string; user?: VerifiedUser }> {
  const supabase = await createClient()

  const userData: VerifiedUserInsert = {
    email,
    loan_application_number: loanApplicationNumber,
    supabase_user_id: supabaseUserId,
    first_verified_at: new Date().toISOString(),
    last_login_at: new Date().toISOString(),
    total_logins: 1,
    is_active: true,
    session_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
  }

  // Use upsert to handle existing users
  const { data, error } = await supabase
    .schema('api')
    .from('verified_users')
    .upsert(userData, {
      onConflict: 'email,loan_application_number',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating verified user:', error)
    return { success: false, error: error.message }
  }

  return { success: true, user: data }
}

export async function getVerifiedUser(
  email: string,
  loanApplicationNumber: number
): Promise<VerifiedUser | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .schema('api')
    .from('verified_users')
    .select('*')
    .eq('email', email)
    .eq('loan_application_number', loanApplicationNumber)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching verified user:', error)
    return null
  }

  return data
}

export async function updateUserSession(
  email: string,
  loanApplicationNumber: number,
  sessionId?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // First, get current user to increment login count properly
  const currentUser = await getVerifiedUser(email, loanApplicationNumber)
  if (!currentUser) {
    return { success: false, error: 'User not found' }
  }

  const { error } = await supabase
    .schema('api')
    .from('verified_users')
    .update({
      last_login_at: new Date().toISOString(),
      total_logins: (currentUser.total_logins ?? 0) + 1, // Safe increment
      current_session_id:
        sessionId && sessionId.trim() !== '' ? sessionId.trim() : null,
      session_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
    })
    .eq('email', email)
    .eq('loan_application_number', loanApplicationNumber)

  if (error) {
    console.error('Error updating user session:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Access Logging Services
export async function logUserAction(
  email: string,
  loanApplicationNumber: number,
  actionType: string,
  success: boolean = true,
  ipAddress?: string,
  userAgent?: string,
  errorMessage?: string,
  metadata?: MetadataRecord
): Promise<void> {
  const supabase = await createClient()

  const logData: AccessLog = {
    email,
    loan_application_number: loanApplicationNumber,
    action_type: actionType,
    success,
    ip_address: ipAddress || 'unknown',
    user_agent: userAgent || 'unknown',
    error_message: errorMessage || null,
    metadata: metadata ? JSON.stringify(metadata) : null,
  }

  const { error } = await supabase
    .schema('api')
    .from('user_access_logs')
    .insert(logData)

  if (error) {
    console.error('Error logging user action:', error)
  }
}

// Rate Limiting Services
export async function checkRateLimit(
  identifier: string,
  identifierType: 'ip' | 'email' | 'ip_email',
  actionType: 'verification_request' | 'code_attempt' | 'login_attempt',
  maxRequests: number = 5
): Promise<{
  allowed: boolean
  remainingRequests: number
  resetTime: Date
  currentRequests: number
}> {
  const supabase = await createClient()

  // Call the database function we created earlier
  const { data, error } = await supabase.schema('api').rpc('check_rate_limit', {
    identifier_val: identifier,
    identifier_type_val: identifierType,
    action_type_val: actionType,
    max_requests: maxRequests,
    window_duration_val: '1 hour',
  })

  if (error || !data) {
    console.error('Error checking rate limit:', error)
    // Default to allowing the request if rate limiting fails
    return {
      allowed: true,
      remainingRequests: maxRequests - 1,
      resetTime: new Date(Date.now() + 60 * 60 * 1000),
      currentRequests: 1,
    }
  }

  // Type-safe data access with proper validation
  const rateLimitData = data as unknown as RateLimitResponse

  return {
    allowed: rateLimitData.allowed ?? true,
    remainingRequests: rateLimitData.remaining_requests ?? 0,
    resetTime: new Date(
      rateLimitData.reset_time || Date.now() + 60 * 60 * 1000
    ),
    currentRequests: rateLimitData.current_requests ?? 1,
  }
}

// Security Event Logging
export async function logSecurityEvent(
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  description: string,
  ipAddress: string,
  email?: string,
  loanApplicationNumber?: number, // Changed to number to match schema
  userAgent?: string,
  eventData?: EventDataRecord
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .schema('api')
    .from('security_events')
    .insert({
      event_type: eventType,
      severity,
      description,
      ip_address: ipAddress,
      email: email || null,
      loan_application_number: loanApplicationNumber ?? null, // Now correctly typed as number
      user_agent: userAgent || null,
      event_data: eventData ? JSON.stringify(eventData) : null,
    })

  if (error) {
    console.error('Error logging security event:', error)
  }
}

// Cleanup Services
export async function cleanupExpiredSessions(): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .schema('api')
    .rpc('cleanup_expired_sessions')

  if (error) {
    console.error('Error cleaning up expired sessions:', error)
    return 0
  }

  return (data as number) ?? 0 // Type-safe conversion
}
