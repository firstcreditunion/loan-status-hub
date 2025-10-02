'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Loader2,
  AlertTriangle,
  Mail,
  Lock,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { DotPattern } from '@/components/magic'
import Image from 'next/image'

type LandingState =
  | 'initial'
  | 'validating'
  | 'valid-token'
  | 'invalid-token'
  | 'existing-session'
  | 'error'

interface TokenValidation {
  isValid: boolean
  email?: string
  loanApplicationNumber?: string
  applicantName?: string
  hasExistingSession?: boolean
  sessionExpiresAt?: string
}

function LandingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [state, setState] = useState<LandingState>('initial')
  const [tokenData, setTokenData] = useState<TokenValidation | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    const loan = searchParams.get('loan')

    if (token || (email && loan)) {
      validateAccess(token, email, loan)
    }
  }, [searchParams])

  const validateAccess = async (
    token: string | null,
    email: string | null,
    loan: string | null
  ) => {
    setState('validating')
    setError('')

    try {
      // If we have email and loan directly, check for existing session first
      if (email && loan) {
        const sessionResponse = await fetch('/api/session-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            loanApplicationNumber: loan,
          }),
        })

        const sessionData = await sessionResponse.json()

        if (sessionResponse.ok && sessionData.user?.isActive) {
          // User has active session, redirect to dashboard
          setTokenData({
            isValid: true,
            email,
            loanApplicationNumber: loan,
            applicantName: sessionData.loanApplication?.applicant_name,
            hasExistingSession: true,
            sessionExpiresAt: sessionData.user.sessionExpiresAt,
          })
          setState('existing-session')

          return
        }
      }

      // Validate token or proceed with verification
      if (token && email && loan) {
        setTokenData({
          isValid: true,
          email,
          loanApplicationNumber: loan,
          hasExistingSession: false,
        })
        setState('valid-token')
      } else if (email && loan) {
        // Direct access with email and loan - allow verification
        setTokenData({
          isValid: true,
          email,
          loanApplicationNumber: loan,
          hasExistingSession: false,
        })
        setState('valid-token')
      } else {
        setState('invalid-token')
      }
    } catch (error) {
      console.error('Access validation error:', error)
      setError('Network error occurred while validating access.')
      setState('error')
    }
  }

  const proceedToVerification = () => {
    if (!tokenData) return

    const params = new URLSearchParams({
      email: tokenData.email!,
      loan: tokenData.loanApplicationNumber!,
    })

    if (searchParams.get('token')) {
      params.set('token', searchParams.get('token')!)
    }

    router.push(`/verify?${params.toString()}`)
  }

  const proceedToDashboard = () => {
    if (!tokenData) return

    const params = new URLSearchParams({
      email: tokenData.email!,
      loan: tokenData.loanApplicationNumber!,
    })

    router.push(`/dashboard?${params.toString()}`)
  }

  const getSessionTimeLeft = (): string => {
    if (!tokenData?.sessionExpiresAt) return ''

    const expiresAt = new Date(tokenData.sessionExpiresAt)
    const now = new Date()
    const timeLeft = Math.max(
      0,
      Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
    )

    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60

    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Initial state - no parameters
  if (state === 'initial') {
    return (
      <div className='h-full flex items-center justify-center relative pt-32 '>
        {/* Dot pattern background */}
        <DotPattern
          className='text-fcu-primary-500'
          opacity={0.08}
          width={20}
          height={20}
        />

        <div className='w-full max-w-lg'>
          <div className='w-full outline-2 outline-offset-4 outline-fcu-secondary-300/5 bg-gray-100 backdrop-blur-sm relative rounded-xl shadow-fcu-secondary-500/15 shadow-2xl p-8'>
            <CardHeader className='text-center pb-8'>
              <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full outline-3 outline-offset-2 outline-fcu-secondary-300/50 shadow-xl shadow-gray-300'>
                <Image
                  src='/logo/android-chrome-192x192.png'
                  alt='FCU Logo'
                  width={80}
                  height={80}
                />
              </div>
              <div className='text-3xl tracking-tight font-light text-fcu-primary-500 mb-2'>
                First Status Hub
              </div>
              <CardDescription className='text-lg text-fcu-secondary-300'>
                Secure access to your application status
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-4'>
                <div className='flex items-start space-x-3 p-4 bg-sky-50 rounded-xl'>
                  <Mail className='h-5 w-5 text-sky-700 mt-0.5 flex-shrink-0' />
                  <div>
                    <h3 className='font-medium text-gray-700'>
                      Check Your Email
                    </h3>
                    <p className='text-sm text-gray-700'>
                      Click the secure link in the email we sent you to access
                      your loan status.
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-3 p-4 bg-green-50 rounded-xl'>
                  <Lock className='h-5 w-5 text-green-700 mt-0.5 flex-shrink-0' />
                  <div>
                    <h3 className='font-medium text-gray-700'>
                      Secure Verification
                    </h3>
                    <p className='text-sm text-gray-700'>
                      We&apos;ll send a 6-digit code to verify your identity
                      before showing your loan status.
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-3 p-4 bg-gray-50 rounded-xl'>
                  <Clock className='h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0' />
                  <div>
                    <h3 className='font-medium text-gray-700'>
                      Session Security
                    </h3>
                    <p className='text-sm text-gray-700'>
                      Your session will automatically expire after 15 minutes
                      for security.
                    </p>
                  </div>
                </div>
              </div>

              <div className='text-center pt-4'>
                <p className='text-sm text-muted-foreground'>
                  Need help? Contact our support team for assistance.
                </p>
              </div>
            </CardContent>
          </div>
        </div>
      </div>
    )
  }

  // Validating state
  if (state === 'validating') {
    return (
      <div className='h-full flex items-center justify-center pt-32 relative'>
        <DotPattern
          className='text-fcu-primary-500'
          opacity={0.08}
          width={24}
          height={24}
        />

        <div className='w-full max-w-md outline-2 outline-offset-4 outline-fcu-secondary-300/5 bg-gray-100 backdrop-blur-sm relative rounded-xl shadow-fcu-secondary-500/15 shadow-2xl p-8'>
          <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full outline-3 outline-offset-2 outline-fcu-secondary-300/50 shadow-xl shadow-gray-300'>
            <Image
              src='/logo/android-chrome-192x192.png'
              alt='FCU Logo'
              width={80}
              height={80}
            />
          </div>
          <CardContent className='pt-6'>
            <div className='flex flex-col items-center space-y-4'>
              <Loader2 className='h-8 w-8 animate-spin text-fcu-primary-600' />
              <div className='space-y-2 text-center'>
                <Skeleton className='h-4 w-48 mx-auto' />
                <Skeleton className='h-4 w-32 mx-auto' />
              </div>
              <p className='text-sm text-muted-foreground'>
                Validating access...
              </p>
            </div>
          </CardContent>
        </div>
      </div>
    )
  }

  // Invalid token state
  if (state === 'invalid-token') {
    return (
      <div className='min-h-screen flex items-center justify-center pt-32 relative'>
        <DotPattern
          className='text-fcu-primary-500'
          opacity={0.08}
          width={24}
          height={24}
        />

        <div className='w-full outline-2 outline-offset-4 outline-fcu-secondary-300/5 bg-gray-100 backdrop-blur-sm relative rounded-xl shadow-fcu-secondary-500/15 shadow-2xl p-8'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
              <AlertTriangle className='h-6 w-6 text-red-600' />
            </div>
            <CardTitle className='text-red-900'>Invalid Access Link</CardTitle>
            <CardDescription>
              The link you used is invalid or has expired. Please check your
              email for the correct link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <Alert>
                <Mail className='h-4 w-4' />
                <AlertDescription>
                  Make sure you&apos;re using the most recent link from your
                  email.
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => window.location.reload()}
                className='w-full rounded-full '
                variant='outline'
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    )
  }

  // Error state
  if (state === 'error') {
    return (
      <div className='min-h-screen flex items-center justify-center pt-32 relative'>
        <DotPattern
          className='text-fcu-primary-500'
          opacity={0.08}
          width={24}
          height={24}
        />

        <div className='w-full outline-2 outline-offset-4 outline-fcu-secondary-300/5 bg-gray-100 backdrop-blur-sm relative rounded-xl shadow-fcu-secondary-500/15 shadow-2xl p-8'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
              <AlertTriangle className='h-6 w-6 text-red-600' />
            </div>
            <CardTitle className='text-red-900'>Connection Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => window.location.reload()}
              className='w-full rounded-full '
            >
              Try Again
            </Button>
          </CardContent>
        </div>
      </div>
    )
  }

  // Existing session state
  if (state === 'existing-session') {
    return (
      <div className='h-full flex items-center justify-center relative'>
        <DotPattern
          className='text-fcu-primary-500'
          opacity={0.08}
          width={24}
          height={24}
        />

        <div className='h-full flex items-center justify-center pt-32 w-full max-w-md'>
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
              <div className='text-2xl text-fcu-primary-500 mb-2 font-semibold tracking-tighter'>
                Welcome Back!
              </div>
              <CardDescription className='text-sm tracking-tight'>
                You have an active session for your loan application.
              </CardDescription>
            </CardHeader>
            <div className='space-y-4 pt-4'>
              <div className='space-y-3 p-4 bg-fcu-primary-500 text-white rounded-xl'>
                <div className='flex justify-between text-sm'>
                  <span>Email:</span>
                  <span className='font-medium'>{tokenData?.email}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Application Number:</span>
                  <span className='font-mono'>
                    {tokenData?.loanApplicationNumber}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Session expires:</span>
                  <Badge
                    variant='outline'
                    className='text-xs text-white border-none p-0 m-0'
                  >
                    {getSessionTimeLeft()}
                  </Badge>
                </div>
              </div>

              <Button
                onClick={proceedToDashboard}
                className='w-full mt-4 bg-fcu-secondary-300 hover:bg-fcu-secondary-400 rounded-full cursor-pointer shadow-lg shadow-fcu-secondary-300/20'
              >
                View Loan Status
                <ArrowRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Valid token state - ready for verification
  return (
    <div className='h-full flex items-center justify-center relative pt-32'>
      <DotPattern
        className='text-fcu-primary-500'
        opacity={0.08}
        width={18}
        height={18}
      />

      <div className='w-full max-w-lg'>
        <div className='w-full outline-2 outline-offset-4 outline-fcu-secondary-300/5 bg-gray-100 backdrop-blur-sm relative rounded-xl shadow-fcu-secondary-500/15 shadow-2xl p-8'>
          <div className='text-center mb-4'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full outline-3 outline-offset-2 outline-fcu-secondary-300/50 shadow-xl shadow-gray-300'>
              <Image
                src='/logo/android-chrome-192x192.png'
                alt='FCU Logo'
                width={80}
                height={80}
              />
            </div>
            <div className='text-xl font-light tracking-tight text-fcu-primary-500 mb-2'>
              Secure Access Verified
            </div>

            <CardDescription className='text-base text-fcu-secondary-300 tracking-tight'>
              We&apos;ll send a verification code to confirm your identity.
            </CardDescription>
          </div>
          <div className='space-y-4'>
            <div className='space-y-3 p-4 bg-gray-100 mt-4'>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-700'>Email:</span>
                <span className='font-medium text-gray-700'>
                  {tokenData?.email}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>
                  Application Number:
                </span>
                <span className='font-mono'>
                  {tokenData?.loanApplicationNumber}
                </span>
              </div>
            </div>

            <Alert className='bg-gray-100 rounded-xl border-none'>
              <Mail className='h-4 w-4' />
              <AlertDescription>
                We&apos;ll send a 6-digit verification code to your email
                address.
              </AlertDescription>
            </Alert>

            <Button
              onClick={proceedToVerification}
              className='w-full bg-fcu-primary-600 mt-4 hover:bg-fcu-primary-700 cursor-pointer rounded-full'
            >
              <Mail className='mr-2 h-4 w-4' />
              Send Verification Code
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading component for Suspense fallback
function LandingPageLoading() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <Card className='w-full max-w-lg'>
        <CardContent className='pt-6'>
          <div className='flex flex-col items-center space-y-4'>
            <Loader2 className='h-8 w-8 animate-spin text-fcu-primary-600' />
            <div className='space-y-2 text-center'>
              <Skeleton className='h-4 w-48 mx-auto' />
              <Skeleton className='h-4 w-32 mx-auto' />
            </div>
            <p className='text-sm text-muted-foreground'>Loading...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main component with Suspense boundary
export default function LandingPage() {
  return (
    <Suspense fallback={<LandingPageLoading />}>
      <LandingPageContent />
    </Suspense>
  )
}

// <Icon className='absolute h-6 w-6 -top-3 -left-3 dark:text-white text-fcu-secondary-300/50' />
// <Icon className='absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-fcu-secondary-300/50' />
// <Icon className='absolute h-6 w-6 -top-3 -right-3 dark:text-white text-fcu-secondary-300/50' />
// <Icon className='absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-fcu-secondary-300/50' />
