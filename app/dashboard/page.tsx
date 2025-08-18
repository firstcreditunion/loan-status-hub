'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
// Removed unused Alert components
import { Badge } from '@/components/ui/badge'
// Removed unused Separator
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  // DialogTrigger unused
} from '@/components/ui/dialog'
import {
  // Loader2 unused in main component
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  LogOut,
  RefreshCw,
  User,
  Calendar,
  // DollarSign unused
  Shield,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'

interface LoanApplication {
  Lnd_application_number: number
  applicant_name: string
  applicant_email: string
  loan_amount: number
  loan_type: string
  application_date: string
  current_status: string
  status_updated_at: string
  estimated_completion_date?: string
  loan_officer_name?: string
  loan_officer_phone?: string
}

interface SessionInfo {
  email: string
  loanApplicationNumber: number
  sessionExpiresAt: string
  totalLogins: number
  lastLoginAt: string
  isActive: boolean
}

type DashboardState = 'loading' | 'active' | 'session-expired' | 'error'

function DashboardPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [state, setState] = useState<DashboardState>('loading')
  const [loanData, setLoanData] = useState<LoanApplication | null>(null)
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [error, setError] = useState('')
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number>(0)
  const [showSessionDialog, setShowSessionDialog] = useState(false)

  // Session countdown timer
  useEffect(() => {
    if (sessionTimeLeft > 0) {
      const timer = setTimeout(() => {
        setSessionTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (sessionTimeLeft === 0 && sessionInfo) {
      handleSessionExpired()
    }
  }, [sessionTimeLeft, sessionInfo])

  const loadDashboardData = useCallback(async () => {
    try {
      setState('loading')
      setError('')

      const email = searchParams.get('email')
      const loan = searchParams.get('loan')

      if (!email || !loan) {
        setError('Missing required parameters. Please verify your email first.')
        setState('error')
        return
      }

      // Check session status
      const sessionResponse = await fetch('/api/session-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          loanApplicationNumber: loan,
        }),
      })

      const sessionData = await sessionResponse.json()

      if (!sessionResponse.ok) {
        if (
          sessionData.error?.includes('expired') ||
          sessionData.error?.includes('not found')
        ) {
          setState('session-expired')
        } else {
          setError(sessionData.error || 'Failed to verify session')
          setState('error')
        }
        return
      }

      // Set session info and calculate time left
      setSessionInfo(sessionData.user)
      const expiresAt = new Date(sessionData.user.sessionExpiresAt)
      const now = new Date()
      const timeLeft = Math.max(
        0,
        Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
      )
      setSessionTimeLeft(timeLeft)

      // Set loan data
      setLoanData(sessionData.loanApplication)
      setState('active')

      toast.success('Dashboard loaded successfully')
    } catch {
      console.error('Dashboard load error')
      setError('Network error. Please check your connection.')
      setState('error')
    }
  }, [searchParams])

  // Session warning at 2 minutes
  useEffect(() => {
    if (sessionTimeLeft === 120 && !showSessionDialog) {
      // 2 minutes
      setShowSessionDialog(true)
      toast.warning('Your session will expire in 2 minutes')
    }
  }, [sessionTimeLeft, showSessionDialog])

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handleSessionExpired = () => {
    setState('session-expired')
    toast.error('Your session has expired for security reasons')
  }

  const extendSession = async () => {
    try {
      const email = searchParams.get('email')
      const loan = searchParams.get('loan')

      const response = await fetch('/api/session-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          loanApplicationNumber: loan,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const expiresAt = new Date(data.user.sessionExpiresAt)
        const now = new Date()
        const timeLeft = Math.max(
          0,
          Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
        )
        setSessionTimeLeft(timeLeft)
        setShowSessionDialog(false)
        toast.success('Session extended successfully')
      } else {
        handleSessionExpired()
      }
    } catch {
      handleSessionExpired()
    }
  }

  const handleLogout = () => {
    toast.success('Logged out successfully')
    router.push('/')
  }

  const formatTimeLeft = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'under review':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'on hold':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className='h-4 w-4' />
      case 'pending':
        return <Clock className='h-4 w-4' />
      case 'under review':
        return <FileText className='h-4 w-4' />
      case 'rejected':
        return <AlertTriangle className='h-4 w-4' />
      default:
        return <Info className='h-4 w-4' />
    }
  }

  // Loading state
  if (state === 'loading') {
    return (
      <div className='min-h-screen bg-white'>
        <div className='container mx-auto px-4 py-8'>
          <div className='max-w-4xl mx-auto space-y-6'>
            {/* Header skeleton */}
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div className='space-y-2'>
                    <Skeleton className='h-8 w-64' />
                    <Skeleton className='h-4 w-48' />
                  </div>
                  <Skeleton className='h-10 w-24' />
                </div>
              </CardHeader>
            </Card>

            {/* Content skeletons */}
            <div className='grid md:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <Skeleton className='h-6 w-32' />
                </CardHeader>
                <CardContent className='space-y-4'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-4 w-1/2' />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className='h-6 w-32' />
                </CardHeader>
                <CardContent className='space-y-4'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-4 w-1/2' />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Session expired state
  if (state === 'session-expired') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-fcu-primary-50 to-fcu-secondary-50'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100'>
              <Clock className='h-6 w-6 text-orange-600' />
            </div>
            <CardTitle className='text-orange-900'>Session Expired</CardTitle>
            <CardDescription>
              Your session has expired for security reasons. Please verify your
              email again to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className='w-full'>
              Return to Verification
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (state === 'error') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-fcu-primary-50 to-fcu-secondary-50'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
              <AlertTriangle className='h-6 w-6 text-red-600' />
            </div>
            <CardTitle className='text-red-900'>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <Button
              onClick={loadDashboardData}
              className='w-full'
              variant='outline'
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              Try Again
            </Button>
            <Button onClick={() => router.push('/')} className='w-full'>
              Return to Verification
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Active dashboard
  return (
    <div className='min-h-screen bg-gradient-to-br from-fcu-primary-50 to-fcu-secondary-50'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto space-y-6'>
          {/* Header */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-2xl text-fcu-primary-900'>
                    Loan Status Dashboard
                  </CardTitle>
                  <CardDescription>
                    Welcome back, {loanData?.applicant_name}
                  </CardDescription>
                </div>
                <div className='flex items-center space-x-3'>
                  <Badge variant='outline' className='text-xs'>
                    <Shield className='mr-1 h-3 w-3' />
                    Session: {formatTimeLeft(sessionTimeLeft)}
                  </Badge>
                  <Button variant='outline' size='sm' onClick={handleLogout}>
                    <LogOut className='mr-2 h-4 w-4' />
                    Logout
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Main content */}
          <div className='grid md:grid-cols-2 gap-6'>
            {/* Loan Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <FileText className='mr-2 h-5 w-5 text-fcu-primary-600' />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Status:</span>
                  <Badge
                    className={`${getStatusColor(loanData?.current_status || '')} flex items-center gap-1`}
                  >
                    {getStatusIcon(loanData?.current_status || '')}
                    {loanData?.current_status}
                  </Badge>
                </div>

                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Application #:
                    </span>
                    <span className='text-sm font-mono'>
                      {loanData?.Lnd_application_number}
                    </span>
                  </div>

                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Loan Amount:
                    </span>
                    <span className='text-sm font-semibold'>
                      ${loanData?.loan_amount?.toLocaleString()}
                    </span>
                  </div>

                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Loan Type:
                    </span>
                    <span className='text-sm'>{loanData?.loan_type}</span>
                  </div>

                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Last Updated:
                    </span>
                    <span className='text-sm'>
                      {loanData?.status_updated_at
                        ? new Date(
                            loanData.status_updated_at
                          ).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                {loanData?.estimated_completion_date && (
                  <div className='pt-3 border-t'>
                    <div className='flex items-center text-sm text-fcu-secondary-700'>
                      <Calendar className='mr-2 h-4 w-4' />
                      Estimated completion:{' '}
                      {new Date(
                        loanData.estimated_completion_date
                      ).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <User className='mr-2 h-5 w-5 text-fcu-primary-600' />
                  Loan Officer
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {loanData?.loan_officer_name ? (
                  <div className='space-y-3'>
                    <div>
                      <p className='text-sm font-medium'>
                        {loanData.loan_officer_name}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        Your assigned loan officer
                      </p>
                    </div>

                    {loanData.loan_officer_phone && (
                      <div className='flex items-center text-sm'>
                        <span className='text-muted-foreground mr-2'>
                          Phone:
                        </span>
                        <a
                          href={`tel:${loanData.loan_officer_phone}`}
                          className='text-fcu-primary-600 hover:underline'
                        >
                          {loanData.loan_officer_phone}
                        </a>
                      </div>
                    )}

                    <div className='pt-3 border-t'>
                      <p className='text-xs text-muted-foreground'>
                        Feel free to contact your loan officer if you have any
                        questions about your application.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='text-center py-6'>
                    <User className='mx-auto h-8 w-8 text-muted-foreground mb-2' />
                    <p className='text-sm text-muted-foreground'>
                      A loan officer will be assigned to your application soon.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Session Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center text-lg'>
                <Shield className='mr-2 h-5 w-5 text-fcu-primary-600' />
                Session Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid sm:grid-cols-3 gap-4 text-sm'>
                <div>
                  <span className='text-muted-foreground'>Email:</span>
                  <p className='font-medium'>{sessionInfo?.email}</p>
                </div>
                <div>
                  <span className='text-muted-foreground'>Total Logins:</span>
                  <p className='font-medium'>{sessionInfo?.totalLogins}</p>
                </div>
                <div>
                  <span className='text-muted-foreground'>Last Login:</span>
                  <p className='font-medium'>
                    {sessionInfo?.lastLoginAt
                      ? new Date(sessionInfo.lastLoginAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Refresh Button */}
          <div className='text-center'>
            <Button
              onClick={loadDashboardData}
              variant='outline'
              size='sm'
              className='text-fcu-primary-600 border-fcu-primary-200 hover:bg-fcu-primary-50'
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              Refresh Status
            </Button>
          </div>
        </div>
      </div>

      {/* Session Extension Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center'>
              <Clock className='mr-2 h-5 w-5 text-orange-600' />
              Session Expiring Soon
            </DialogTitle>
            <DialogDescription>
              Your session will expire in {formatTimeLeft(sessionTimeLeft)} for
              security reasons. Would you like to extend your session?
            </DialogDescription>
          </DialogHeader>
          <div className='flex space-x-3 pt-4'>
            <Button onClick={extendSession} className='flex-1'>
              Extend Session
            </Button>
            <Button onClick={handleLogout} variant='outline' className='flex-1'>
              Logout Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Loading component for Suspense fallback
function DashboardPageLoading() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-fcu-primary-50 to-fcu-secondary-50'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto space-y-6'>
          {/* Header skeleton */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div className='space-y-2'>
                  <Skeleton className='h-8 w-64' />
                  <Skeleton className='h-4 w-48' />
                </div>
                <div className='flex items-center space-x-3'>
                  <Skeleton className='h-6 w-20' />
                  <Skeleton className='h-8 w-20' />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Content skeletons */}
          <div className='grid md:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <Skeleton className='h-6 w-32' />
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex justify-between'>
                  <Skeleton className='h-4 w-16' />
                  <Skeleton className='h-6 w-20' />
                </div>
                <div className='space-y-3'>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className='flex justify-between'>
                      <Skeleton className='h-4 w-24' />
                      <Skeleton className='h-4 w-16' />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className='h-6 w-32' />
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-4 w-1/2' />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Session info skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-40' />
            </CardHeader>
            <CardContent>
              <div className='grid sm:grid-cols-3 gap-4'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className='space-y-2'>
                    <Skeleton className='h-3 w-16' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPageLoading />}>
      <DashboardPageContent />
    </Suspense>
  )
}
