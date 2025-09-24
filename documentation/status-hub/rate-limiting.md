## Executive summary

- **What it is**: A safety feature that temporarily limits how many times a person can request or enter a verification code. This helps stop abuse and keeps your account secure.
- **What we limit**:
  - Sending a verification code email: up to 3 times per hour per person and location.
  - Entering a verification code: up to 5 attempts per hour per person and location.
- **What you’ll see if you hit a limit**: A friendly message telling you to wait, plus a time showing when you can try again. Nothing is blocked permanently.
- **Why we do this**: To prevent spamming and guessing of codes, protect personal data, and keep the system reliable for everyone.
- **What data is used**: Your email and network address are combined to apply fair limits. We also record basic device information to help our support team investigate issues.
- **Privacy and transparency**: When a limit is reached, we store a minimal security log so we can detect suspicious activity and assist you if needed.
- **If you need help**: Waiting until the shown time usually resolves the issue. If problems continue, contact support and share the time of the message—you won’t need any technical details.

## Rate limiting in Status Hub

### Overview

Rate limiting protects the verification flow against abuse and brute‑force attempts. This project implements centralized rate limiting in the server layer, backed by a Supabase Postgres RPC function. API routes consult a single helper (`checkRateLimit`) with consistent identifiers and action types, and return HTTP 429 with reset metadata when the limit is exceeded.

### Core helper

The entrypoint is `checkRateLimit` in `lib/supabase-services.ts`. It calls the Postgres function `api.check_rate_limit` and normalizes the response for callers.

```ts
// lib/supabase-services.ts
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
  const { data, error } = await supabase.schema('api').rpc('check_rate_limit', {
    identifier_val: identifier,
    identifier_type_val: identifierType,
    action_type_val: actionType,
    max_requests: maxRequests,
    window_duration_val: '1 hour',
  })

  if (error || !data) {
    // Conservative fallback: allow this request, surface a 1h reset hint
    return {
      allowed: true,
      remainingRequests: maxRequests - 1,
      resetTime: new Date(Date.now() + 60 * 60 * 1000),
      currentRequests: 1,
    }
  }

  return {
    allowed: data.allowed ?? true,
    remainingRequests: data.remaining_requests ?? 0,
    resetTime: new Date(data.reset_time || Date.now() + 60 * 60 * 1000),
    currentRequests: data.current_requests ?? 1,
  }
}
```

Notes:

- **Window**: Currently configured as a 1‑hour window via `window_duration_val: '1 hour'`.
- **Fallback policy**: If the RPC call fails, the helper allows the request (to avoid hard failures) and returns a conservative reset time. Consider tightening this behavior in high‑risk paths if needed.

### Identifiers and action types

- **identifierType**: One of `ip`, `email`, or `ip_email`.
  - The current routes use `ip_email` with the identifier value `${ipAddress}_${email}` to scope fairly to a specific user on a specific network.
- **actionType**: Enumerated string describing what’s being limited.
  - `verification_request`: sending a verification code
  - `code_attempt`: verifying an OTP code
  - `login_attempt`: reserved for future use

### Where it’s enforced

#### 1) Send Verification Code — `POST /api/send-verification`

Usage:

```ts
const rateLimitResult = await checkRateLimit(
  `${ipAddress}_${email}`,
  'ip_email',
  'verification_request',
  3 // 3 requests per hour per IP/email
)

if (!rateLimitResult.allowed) {
  await logSecurityEvent(
    'rate_limit_exceeded',
    'high',
    'Rate limit exceeded for verification requests',
    ipAddress,
    email,
    undefined,
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
```

Effective limit: **3 requests/hour per IP+email**.

On block, the route:

- logs a `rate_limit_exceeded` security event with `severity: 'high'` and metadata; and
- responds `429 Too Many Requests` with a JSON body including a `resetTime` ISO timestamp.

#### 2) Verify Code — `POST /api/verify-code`

Usage:

```ts
const rateLimitResult = await checkRateLimit(
  `${ipAddress}_${email}`,
  'ip_email',
  'code_attempt',
  5 // 5 attempts per hour per IP/email
)

if (!rateLimitResult.allowed) {
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
```

Effective limit: **5 attempts/hour per IP+email**.

This route also emits the same `rate_limit_exceeded` security event with `severity: 'high'` and returns `429` with `resetTime`.

### Client guidance (handling 429)

When an API returns `429` with a `resetTime` field:

- Disable the triggering action (e.g., resend or verify) until the reset time.
- Display a friendly message indicating when the user can try again.
- Optionally implement a countdown using the server‑provided `resetTime` to avoid clock skew.

Example client handling sketch:

```ts
if (!response.ok && response.status === 429) {
  const { error, resetTime } = await response.json()
  toast.error(error)
  const msUntilReset = Math.max(0, new Date(resetTime).getTime() - Date.now())
  // Start local cooldown timer using msUntilReset
}
```

### Security event logging

All rate‑limit blocks are recorded via `logSecurityEvent('rate_limit_exceeded', ...)` with contextual metadata (`currentRequests`, `resetTime`). These events are stored in the `api.security_events` table for monitoring and incident response.

Related events emitted elsewhere include:

- `invalid_request`, `invalid_email_format`, `invalid_loan_number`
- `brute_force_attempt` (for repeated failed OTPs)
- `unauthorized_access_attempt`

### Supabase RPC contract

The helper expects `api.check_rate_limit` to return the following fields:

```ts
interface RateLimitResponse {
  allowed: boolean
  remaining_requests: number
  reset_time: string // ISO timestamp
  current_requests: number
}
```

Input parameters passed by the helper:

- `identifier_val: string` — unique key (e.g., `${ip}_${email}`)
- `identifier_type_val: 'ip' | 'email' | 'ip_email'`
- `action_type_val: 'verification_request' | 'code_attempt' | 'login_attempt'`
- `max_requests: number`
- `window_duration_val: string` — e.g., `'1 hour'`

### Current limits summary

- **Send Verification (`verification_request`)**: 3/hour per IP+email
- **Verify Code (`code_attempt`)**: 5/hour per IP+email
- **Login (`login_attempt`)**: available in the helper; not yet enforced by routes

### Extension points

- Add enforcement to additional endpoints (e.g., session checks) if needed.
- Adjust per‑action windows by changing `max_requests` and/or `window_duration_val`.
- Consider a stricter fallback (deny on RPC failure) for sensitive actions.
