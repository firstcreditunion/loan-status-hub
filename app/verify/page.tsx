'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Mail, AlertTriangle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

import { DotPattern } from '@/components/magic'

type VerificationStep =
  | 'loading'
  | 'email-sent'
  | 'enter-code'
  | 'success'
  | 'error'

interface VerificationState {
  step: VerificationStep
  sessionId: string
  maskedEmail: string
  error: string
  loading: boolean
  code: string
  resendCooldown: number
  attempts: number
  maxAttempts: number
}

function VerifyPageContent() {
  const searchParams = useSearchParams()

  const [state, setState] = useState<VerificationState>({
    step: 'loading',
    sessionId: '',
    maskedEmail: '',
    error: '',
    loading: false,
    code: '',
    resendCooldown: 0,
    attempts: 0,
    maxAttempts: 3,
  })

  const initiateVerification = useCallback(
    async ({
      token,
      email,
      loan,
    }: {
      token: string
      email: string
      loan: string
    }) => {
      try {
        setState((prev) => ({ ...prev, step: 'loading', error: '' }))

        const response = await fetch('/api/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            loanApplicationNumber: loan,
            token,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setState((prev) => ({
            ...prev,
            step: 'error',
            error: data.error || 'Failed to send verification code',
          }))
          return
        }

        setState((prev) => ({
          ...prev,
          step: 'email-sent',
          sessionId: data.sessionId || '',
          maskedEmail: maskEmail(email),
          resendCooldown: 60, // 1 minute cooldown
        }))

        // Auto-advance to code entry after 3 seconds
        setTimeout(() => {
          setState((prev) => ({ ...prev, step: 'enter-code' }))
        }, 3000)

        toast.success('Verification code sent to your email!')
      } catch {
        setState((prev) => ({
          ...prev,
          step: 'error',
          error: 'Network error. Please check your connection and try again.',
        }))
      }
    },
    []
  )

  // Auto-countdown for resend cooldown
  useEffect(() => {
    if (state.resendCooldown > 0) {
      const timer = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          resendCooldown: prev.resendCooldown - 1,
        }))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [state.resendCooldown])

  // Initialize verification on page load
  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    const loan = searchParams.get('loan')

    if (!token || !email || !loan) {
      setState((prev) => ({
        ...prev,
        step: 'error',
        error:
          'Invalid verification link. Please check your email for the correct link.',
      }))
      return
    }

    initiateVerification({ token, email, loan })
  }, [searchParams, initiateVerification])

  const handleCodeChange = (value: string) => {
    // OTP component already handles numeric validation and length
    setState((prev) => ({ ...prev, code: value, error: '' }))

    // Auto-submit when 6 digits entered
    if (value.length === 6) {
      // Use a small timeout to ensure state is updated and call verify with the actual value
      setTimeout(() => {
        verifyCodeWithValue(value)
      }, 50)
    }
  }

  const verifyCodeWithValue = useCallback(
    async (codeValue?: string) => {
      const currentCode = codeValue || state.code

      if (!currentCode || currentCode.length !== 6) {
        setState((prev) => ({ ...prev, error: 'Please enter a 6-digit code' }))
        return
      }

      if (state.attempts >= state.maxAttempts) {
        setState((prev) => ({
          ...prev,
          error:
            'Maximum attempts exceeded. Please request a new verification code.',
        }))
        return
      }

      setState((prev) => ({ ...prev, loading: true, error: '' }))

      try {
        const email = searchParams.get('email')
        const loan = searchParams.get('loan')

        // Validate that we have all required parameters
        if (!email || !loan || !currentCode) {
          setState((prev) => ({
            ...prev,
            error: `Missing required data: ${!email ? 'email ' : ''}${!loan ? 'loan number ' : ''}${!currentCode ? 'verification code' : ''}`,
            loading: false,
          }))
          return
        }

        const requestBody = {
          email,
          loanApplicationNumber: loan,
          verificationCode: currentCode,
        }

        // Debug logging removed for security

        const response = await fetch('/api/verify-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        })

        const data = await response.json()

        if (!response.ok) {
          setState((prev) => ({
            ...prev,
            error: data.error || 'Verification failed',
            attempts: prev.attempts + 1,
            loading: false,
          }))

          // Clear code on error for retry
          setTimeout(() => {
            setState((prev) => ({ ...prev, code: '' }))
          }, 2000)

          return
        }

        setState((prev) => ({ ...prev, step: 'success', loading: false }))
        toast.success('Email verified successfully!')
      } catch {
        setState((prev) => ({
          ...prev,
          error: 'Network error. Please try again.',
          loading: false,
        }))
      }
    },
    [state.code, state.attempts, state.maxAttempts, searchParams]
  )

  const resendCode = async () => {
    if (state.resendCooldown > 0) return

    const token = searchParams.get('token')
    const email = searchParams.get('email')
    const loan = searchParams.get('loan')

    if (token && email && loan) {
      setState((prev) => ({ ...prev, attempts: 0, code: '' }))
      await initiateVerification({ token, email, loan })
    }
  }

  const maskEmail = (email: string): string => {
    const [username, domain] = email.split('@')
    if (username.length <= 2) return email
    return `${username.slice(0, 2)}${'*'.repeat(username.length - 2)}@${domain}`
  }

  const getRemainingAttempts = (): number => {
    return Math.max(0, state.maxAttempts - state.attempts)
  }

  // Loading state
  if (state.step === 'loading') {
    return (
      <div className='h-full flex items-center justify-center pt-32 relative'>
        <DotPattern
          className='text-fcu-primary-500'
          opacity={0.08}
          width={20}
          height={20}
        />
        <div className='w-full outline-2 outline-offset-4 outline-fcu-secondary-300/5 bg-gray-100 backdrop-blur-sm relative rounded-xl shadow-fcu-secondary-500/15 shadow-2xl p-8'>
          {' '}
          <CardContent className='pt-6'>
            <div className='flex flex-col items-center space-y-4'>
              <Loader2 className='h-8 w-8 animate-spin text-fcu-primary-600' />
              <div className='space-y-2 text-center'>
                <Skeleton className='h-4 w-48 mx-auto' />
                <Skeleton className='h-4 w-32 mx-auto' />
              </div>
              <p className='text-sm text-muted-foreground'>
                Preparing verification...
              </p>
            </div>
          </CardContent>
        </div>
      </div>
    )
  }

  // Error state
  if (state.step === 'error') {
    return (
      <div className='h-full flex items-center justify-center pt-32 relative'>
        <DotPattern
          className='text-fcu-primary-500'
          opacity={0.08}
          width={20}
          height={20}
        />
        <div className='w-full outline-2 outline-offset-4 outline-fcu-secondary-300/5 bg-gray-100 backdrop-blur-sm relative rounded-xl shadow-fcu-secondary-500/15 shadow-2xl p-8'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
              <AlertTriangle className='h-6 w-6 text-red-600' />
            </div>
            <CardTitle className='text-red-700'>Verification Failed</CardTitle>
            <CardDescription>{state.error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => window.location.reload()}
              className='w-full rounded-full mt-4'
              variant='outline'
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              Try Again
            </Button>
          </CardContent>
        </div>
      </div>
    )
  }

  // Success state
  if (state.step === 'success') {
    return (
      <div className='h-full flex items-center justify-center pt-32 relative'>
        <DotPattern
          className='text-fcu-primary-500'
          opacity={0.08}
          width={20}
          height={20}
        />
        <div className='w-full outline-2 outline-offset-4 outline-fcu-secondary-300/5 bg-gray-100 backdrop-blur-sm relative rounded-xl shadow-fcu-secondary-500/15 shadow-2xl p-8'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full outline-3 outline-offset-2 outline-fcu-secondary-300/50 shadow-xl shadow-gray-300'>
              <Image
                src='/logo/android-chrome-192x192.png'
                alt='FCU Logo'
                width={80}
                height={80}
              />
            </div>
            <div className='text-base tracking-tight font-medium text-fcu-primary-500 mb-2'>
              Email Verified Successfully!
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-start space-x-3 p-4 bg-sky-50 rounded-none border mt-4'>
              <Mail className='h-5 w-5 text-gray-700 flex-shrink-0' />
              <div className='text-sm'>
                <p className='font-medium text-gray-700 mb-1'>
                  Check your inbox for access link
                </p>
                <p className='text-fcu-primary-700 text-xs'>
                  We&apos;ve sent you an email with a secure link to access your
                  loan tracker dashboard.
                </p>
              </div>
            </div>
            <div className='text-center space-y-2'>
              <p className='text-xs text-muted-foreground'>
                The email may take a few minutes to arrive. Check your spam
                folder if you don&apos;t see it.
              </p>
            </div>
          </CardContent>
        </div>
      </div>
    )
  }

  // Email sent state
  if (state.step === 'email-sent') {
    return (
      <div className='h-full flex items-center justify-center pt-32 relative'>
        <DotPattern
          className='text-fcu-primary-500'
          opacity={0.08}
          width={20}
          height={20}
        />
        <div className='w-full outline-2 outline-offset-4 outline-fcu-secondary-300/5 bg-gray-100 backdrop-blur-sm relative rounded-xl shadow-fcu-secondary-500/15 shadow-2xl p-8'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full outline-3 outline-offset-2 outline-fcu-secondary-300/50 shadow-xl shadow-gray-300'>
              <Image
                src='/logo/android-chrome-192x192.png'
                alt='FCU Logo'
                width={80}
                height={80}
              />
            </div>
            <div className='text-xl font-light tracking-tight text-fcu-primary-500 mb-2'>
              Check Your Email
            </div>
            <CardDescription className='mb-4'>
              We&apos;ve sent a 6-digit verification code to
              <br />
              <strong>{state.maskedEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='text-center space-y-2'>
              <Badge
                variant='outline'
                className='text-xs bg-gray-100 rounded-none'
              >
                Code expires in 10 minutes
              </Badge>
              <p className='text-sm text-gray-700 mt-4'>
                Please check your email and enter the code below when ready
              </p>
            </div>
            <Button
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  step: 'enter-code',
                }))
              }
              className='w-full bg-fcu-primary-600 hover:bg-fcu-primary-700 rounded-full cursor-pointer mt-4'
            >
              I&apos;ve received the code
            </Button>
          </CardContent>
        </div>
      </div>
    )
  }

  // Code entry state
  return (
    <div className='h-full flex items-center justify-center pt-32 relative'>
      <DotPattern
        className='text-fcu-primary-500'
        opacity={0.08}
        width={20}
        height={20}
      />
      <div className='w-full outline-2 outline-offset-4 outline-fcu-secondary-300/5 bg-gray-100 backdrop-blur-sm relative rounded-xl shadow-fcu-secondary-500/15 shadow-2xl p-8'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full outline-3 outline-offset-2 outline-fcu-secondary-300/50 shadow-xl shadow-gray-300'>
            <Image
              src='/logo/android-chrome-192x192.png'
              alt='FCU Logo'
              width={80}
              height={80}
            />
          </div>
          <div className='text-xl font-light tracking-tight text-fcu-primary-500 mb-2'>
            Enter Verification Code
          </div>
          <CardDescription className='mb-4'>
            Enter the 6-digit code sent to
            <br />
            <strong>{state.maskedEmail}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-6'>
          {state.error && (
            <Alert className='bg-red-100 rounded-none border-none'>
              <AlertTriangle className='h-4 w-4' />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-4 mb-4'>
            <div className='space-y-2'>
              <div className='flex justify-center'>
                <InputOTP
                  maxLength={6}
                  value={state.code}
                  onChange={handleCodeChange}
                  disabled={state.loading}
                  className='gap-2'
                >
                  <InputOTPGroup className='gap-2'>
                    <InputOTPSlot
                      index={0}
                      className='w-12 h-12 text-lg border-2 border-fcu-secondary-300/50 rounded-none'
                    />
                    <InputOTPSlot
                      index={1}
                      className='w-12 h-12 text-lg border-2 border-fcu-secondary-300/50 rounded-none'
                    />
                    <InputOTPSlot
                      index={2}
                      className='w-12 h-12 text-lg border-2 border-fcu-secondary-300/50 rounded-none'
                    />
                  </InputOTPGroup>
                  <InputOTPGroup className='gap-2'>
                    <InputOTPSlot
                      index={3}
                      className='w-12 h-12 text-lg border-2 border-fcu-secondary-300/50 rounded-none'
                    />
                    <InputOTPSlot
                      index={4}
                      className='w-12 h-12 text-lg border-2 border-fcu-secondary-300/50 rounded-none'
                    />
                    <InputOTPSlot
                      index={5}
                      className='w-12 h-12 text-lg border-2 border-fcu-secondary-300/50 rounded-none'
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className='text-center'>
                <p className='text-xs text-muted-foreground mb-2'>
                  Enter the 6-digit code from your email or paste it here
                </p>
              </div>
              <div className='flex justify-between items-center text-xs text-gray-400 mt-4'>
                <span>Code expires in 10 minutes</span>
                <span>
                  {getRemainingAttempts()} attempt
                  {getRemainingAttempts() !== 1 ? 's' : ''} remaining
                </span>
              </div>
            </div>

            <Button
              onClick={() => verifyCodeWithValue()}
              className='w-full mt-4 bg-fcu-secondary-300 hover:bg-fcu-secondary-400 rounded-full cursor-pointer'
              disabled={state.loading || !state.code || state.code.length !== 6}
            >
              {state.loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>
          </div>

          <div className='text-center space-y-2'>
            <p className='text-sm text-muted-foreground'>
              Didn&apos;t receive the code?
            </p>
            <Button
              variant='ghost'
              size='sm'
              onClick={resendCode}
              disabled={state.resendCooldown > 0}
              className='text-fcu-primary-600 hover:text-fcu-primary-700 rounded-full'
            >
              {state.resendCooldown > 0 ? (
                <>
                  <RefreshCw className='mr-2 h-3 w-3' />
                  Resend in {state.resendCooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className='mr-2 h-3 w-3' />
                  Resend Code
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </div>
    </div>
  )
}

// Loading component for Suspense fallback
function VerifyPageLoading() {
  return (
    <div className='h-full flex items-center justify-center pt-32 relative'>
      <DotPattern
        className='text-fcu-primary-500'
        opacity={0.08}
        width={20}
        height={20}
      />
      <div className='w-full outline-2 outline-offset-4 outline-fcu-secondary-300/5 bg-gray-100 backdrop-blur-sm relative rounded-xl shadow-fcu-secondary-500/15 shadow-2xl p-8'>
        <CardContent className='pt-6'>
          <div className='flex flex-col items-center space-y-4'>
            <Loader2 className='h-8 w-8 animate-spin text-fcu-primary-600' />
            <div className='space-y-2 text-center'>
              <Skeleton className='h-4 w-48 mx-auto' />
              <Skeleton className='h-4 w-32 mx-auto' />
            </div>
            <p className='text-sm text-muted-foreground'>
              Preparing verification...
            </p>
          </div>
        </CardContent>
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyPageLoading />}>
      <VerifyPageContent />
    </Suspense>
  )
}
