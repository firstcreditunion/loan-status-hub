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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FileText,
  Clock,
  AlertTriangle,
  LogOut,
  RefreshCw,
  User,
  Calendar,
  Shield,
  Info,
  Building2,
  Percent,
  CreditCard,
  Mail,
  MapPin,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Timer,
  CircleDollarSignIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

// Enhanced interfaces for comprehensive loan data
interface LoanApplication {
  Lnd_application_number: number
  applicant_name: string | null
  email_address: string | null
  app_status: string
  app_owner: string | null
  app_currently_with: string | null
  trading_branch: string | null
  app_conditional_approval_date: string | null
  app_withdrawal_date: string | null
  app_originator: string | null
  app_declined_date: string | null
  app_last_amend_date: string | null
  app_sales_channel: string | null
  created_at: string
  product_type: string | null
  is_draft: boolean | null
  delegated_user: string | null
  application_completed_by_member: boolean | null
  application_completed_by_member_timestamp: string | null
  privacy_declaration: boolean | null
  is_joint_application: boolean | null
  is_existing_member: boolean | null
}

interface LoanApplicationFinancialDetails {
  id: number
  Lnd_application_number: number | null
  product: string | null
  costOfGoods: number | null
  defaultFees: number | null
  need_insurance: boolean | null
  component: string | null
  cover_type: string | null
  loan_cost_recovery_fees: string[]
  loan_term_1: number | null
  loan_term_2: string | null
  payment_frequency: string | null
  start_date: string | null
  interest_rate: number | null
  created_at: string | null
}

interface LoanApplicationStatusMaster {
  application_status_code: string
  application_status_desc: string
  is_application_maintainable: boolean | null
  order_by: number
  has_checklists: boolean
  has_standalone_checklist: boolean
  is_portal_status: boolean
}

interface TradingBranch {
  Organisation_Unit_id: string
  Organisation_Unit_Name: string
  Organisation_Unit_Type_id: string | null
  Org_Unit_Client_Number: string | null
  Hidden: boolean
}

interface SovereignUser {
  title: string | null
  first_name: string
  middle_name: string | null
  last_name: string
  work_email: string
  effective_date: string | null
  termination_date: string | null
  client_number: string
  clerk_user: string | null
  key_person_initials: string | null
  job_title: string | null
  date_of_birth: string | null
  wished_birthday_for_the_day: boolean | null
  default_org_unit_id: string | null
}

interface ComprehensiveLoanData {
  loanApplication: LoanApplication
  financialDetails: LoanApplicationFinancialDetails | null
  statusInfo: LoanApplicationStatusMaster | null
  branchInfo: TradingBranch | null
  loanOfficer: SovereignUser | null
  delegatedUser: SovereignUser | null
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
  const [loanData, setLoanData] = useState<ComprehensiveLoanData | null>(null)
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

      // Set comprehensive loan data
      setLoanData(sessionData.comprehensiveLoanData)
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
    switch (status?.toUpperCase()) {
      case 'CBPAA': // Application Approved
        return 'bg-green-100 text-green-800 border-green-200'
      case 'INIT': // Application Started
      case 'DRAFT': // Draft Application
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'RCVD': // Application Received
      case 'ASGN': // Application Assigned
      case 'SOVSUB': // Application Submitted to G3
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CBPMCA': // Manual Credit Assessment
      case 'CBPACA': // Automatic Credit Assessment
      case 'CBPCCF': // Application Progressed
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'CBPAD': // Application Declined
      case 'CBPAW': // Application Withdrawn
        return 'bg-red-100 text-red-800 border-red-200'
      case 'CBPAC': // Application Complete
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CBPAA': // Application Approved
      case 'CBPAC': // Application Complete
        return <CheckCircle2 className='h-4 w-4' />
      case 'INIT': // Application Started
      case 'DRAFT': // Draft Application
        return <FileText className='h-4 w-4' />
      case 'RCVD': // Application Received
      case 'ASGN': // Application Assigned
      case 'SOVSUB': // Application Submitted to G3
        return <Clock className='h-4 w-4' />
      case 'CBPMCA': // Manual Credit Assessment
      case 'CBPACA': // Automatic Credit Assessment
      case 'CBPCCF': // Application Progressed
        return <TrendingUp className='h-4 w-4' />
      case 'CBPAD': // Application Declined
      case 'CBPAW': // Application Withdrawn
        return <AlertTriangle className='h-4 w-4' />
      default:
        return <Info className='h-4 w-4' />
    }
  }

  const getProgressPercentage = (orderBy: number): number => {
    // Convert order_by (0-14) to percentage (0-100)
    return Math.round((orderBy / 14) * 100)
  }

  const formatCurrency = (amount: number | null): string => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
    }).format(amount)
  }

  const formatPaymentFrequency = (freq: string | null): string => {
    switch (freq?.toUpperCase()) {
      case 'W':
        return 'Weekly'
      case 'F':
        return 'Fortnightly'
      case 'M':
        return 'Monthly'
      case 'Q':
        return 'Quarterly'
      default:
        return freq || 'N/A'
    }
  }

  const getUserInitials = (user: SovereignUser | null): string => {
    if (!user) return '?'
    const first = user.first_name?.charAt(0) || ''
    const last = user.last_name?.charAt(0) || ''
    return `${first}${last}`.toUpperCase()
  }

  const getUserFullName = (user: SovereignUser | null): string => {
    if (!user) return 'Not assigned'
    const title = user.title ? `${user.title} ` : ''
    const first = user.first_name || ''
    const last = user.last_name || ''
    return `${title}${first} ${last}`.trim()
  }

  // Loading state
  if (state === 'loading') {
    return (
      <div className='min-h-screen bg-white'>
        <div className='container mx-auto px-4 py-8'>
          <div className='max-w-7xl mx-auto space-y-8'>
            {/* Header skeleton */}
            <Card className='shadow-md'>
              <CardHeader>
                <div className='flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
                  <div className='space-y-3'>
                    <Skeleton className='h-10 w-80' />
                    <Skeleton className='h-6 w-64' />
                  </div>
                  <div className='flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3'>
                    <Skeleton className='h-8 w-32' />
                    <Skeleton className='h-10 w-24' />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Progress skeleton */}
            <Card className='shadow-md'>
              <CardHeader>
                <Skeleton className='h-6 w-48' />
                <Skeleton className='h-4 w-full' />
              </CardHeader>
            </Card>

            {/* Content grid skeleton */}
            <div className='grid lg:grid-cols-3 md:grid-cols-2 gap-8'>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className='shadow-md'>
                  <CardHeader>
                    <Skeleton className='h-6 w-32' />
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-3/4' />
                    <Skeleton className='h-4 w-1/2' />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Session expired state
  if (state === 'session-expired') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-white'>
        <Card className='w-full max-w-md shadow-lg'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100'>
              <Timer className='h-8 w-8 text-orange-600' />
            </div>
            <CardTitle className='text-2xl text-fcu-primary-500'>
              Session Expired
            </CardTitle>
            <CardDescription className='text-base'>
              Your session has expired for security reasons. Please verify your
              email again to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/')}
              className='w-full h-12 text-base bg-fcu-primary-500 hover:bg-fcu-primary-600 text-white'
            >
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
      <div className='min-h-screen flex items-center justify-center bg-white'>
        <Card className='w-full max-w-md shadow-lg'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
              <AlertCircle className='h-8 w-8 text-red-600' />
            </div>
            <CardTitle className='text-2xl text-fcu-primary-500'>
              Error
            </CardTitle>
            <CardDescription className='text-base'>{error}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Button
              onClick={loadDashboardData}
              className='w-full h-12 border-fcu-primary-500 text-fcu-primary-500 hover:bg-fcu-primary-50'
              variant='outline'
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              Try Again
            </Button>
            <Button
              onClick={() => router.push('/')}
              className='w-full h-12 bg-fcu-primary-500 hover:bg-fcu-primary-600 text-white'
            >
              Return to Verification
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Active dashboard
  return (
    <TooltipProvider>
      <div className='min-h-screen bg-white tracking-tight'>
        <div className='container mx-auto px-4 py-8'>
          <div className='max-w-7xl mx-auto space-y-8'>
            {/* Header */}
            <Card className='shadow-none rounded-xl'>
              <CardHeader>
                <div className='flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
                  <div className='flex-1'>
                    <div className='flex flex-row justify-start items-start gap-4'>
                      <Image
                        src='/logo/android-chrome-192x192.png'
                        alt='FCU Logo'
                        width={52}
                        height={52}
                        className='mt-1'
                      />
                      <div className='flex flex-col justify-start items-start'>
                        <CardTitle className='text-2xl tracking-tight text-fcu-primary-500'>
                          Loan Status Dashboard
                        </CardTitle>
                        <CardDescription className='text-base md:text-lg text-fcu-secondary-300 tracking-tight'>
                          Welcome back,{' '}
                          {loanData?.loanApplication.applicant_name ||
                            'Valued Customer'}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className='flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4'>
                    <Button
                      variant='outline'
                      size='lg'
                      onClick={handleLogout}
                      className='border-fcu-primary-500 text-white bg-fcu-primary-500 hover:bg-fcu-primary-600 rounded-full cursor-pointer hover:text-white'
                    >
                      Logout
                      <LogOut className='mr-2 h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Main Content Grid */}
            <div className='grid lg:grid-cols-3 md:grid-cols-2 gap-6 md:gap-8'>
              {/* Loan Overview Card */}
              <Card className='shadow-none border rounded-xl  lg:col-span-1'>
                <CardHeader>
                  <CardTitle className='flex items-center text-xl text-fcu-primary-500 font-light'>
                    <FileText className='mr-3 h-4 w-4 text-fcu-secondary-300' />
                    Loan Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='flex items-center justify-between p-4 bg-sky-50 rounded-xl'>
                    <span className='text-sm font-medium text-fcu-primary-500'>
                      Current Status
                    </span>
                    <Badge
                      className={`${getStatusColor(loanData?.loanApplication.app_status || '')} flex items-center gap-2 px-3 py-1`}
                    >
                      {getStatusIcon(
                        loanData?.loanApplication.app_status || ''
                      )}
                      {loanData?.statusInfo?.application_status_desc ||
                        loanData?.loanApplication.app_status}
                    </Badge>
                  </div>

                  <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-muted-foreground'>
                        Application Number:
                      </span>
                      <span className='text-sm font-mono font-bold text-fcu-primary-500'>
                        {loanData?.loanApplication.Lnd_application_number}
                      </span>
                    </div>

                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-muted-foreground'>
                        Product Type:
                      </span>
                      <span className='text-sm font-medium'>
                        {loanData?.financialDetails?.product ||
                          loanData?.loanApplication.product_type ||
                          'N/A'}
                      </span>
                    </div>

                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-muted-foreground'>
                        Application Date:
                      </span>
                      <span className='text-sm'>
                        {loanData?.loanApplication.created_at
                          ? new Date(
                              loanData.loanApplication.created_at
                            ).toLocaleDateString('en-NZ')
                          : 'N/A'}
                      </span>
                    </div>

                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-muted-foreground'>
                        Last Updated:
                      </span>
                      <span className='text-sm'>
                        {loanData?.loanApplication.app_last_amend_date
                          ? new Date(
                              loanData.loanApplication.app_last_amend_date
                            ).toLocaleDateString('en-NZ')
                          : 'N/A'}
                      </span>
                    </div>

                    {loanData?.loanApplication.is_joint_application && (
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-muted-foreground'>
                          Application Type:
                        </span>
                        <Badge variant='secondary'>Joint Application</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Details Card */}
              <Card className='shadow-none border rounded-xl lg:col-span-1'>
                <CardHeader>
                  <CardTitle className='flex items-center text-xl text-fcu-primary-500 font-light'>
                    <CircleDollarSignIcon className='mr-3 h-4 w-4 text-fcu-secondary-300' />
                    Financial Details
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {loanData?.financialDetails ? (
                    <>
                      <div className='p-4 bg-green-50 rounded-lg'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium text-green-700'>
                            Loan Amount
                          </span>
                          <span className='text-2xl font-bold text-green-800'>
                            {formatCurrency(
                              loanData.financialDetails.costOfGoods
                            )}
                          </span>
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <div className='text-center p-3 bg-blue-50 rounded-lg'>
                          <Percent className='h-5 w-5 text-blue-600 mx-auto mb-1' />
                          <div className='text-lg font-bold text-blue-800'>
                            {loanData.financialDetails.interest_rate || 'N/A'}%
                          </div>
                          <div className='text-xs text-blue-600'>
                            Interest Rate
                          </div>
                        </div>
                        <div className='text-center p-3 bg-purple-50 rounded-lg'>
                          <Calendar className='h-5 w-5 text-purple-600 mx-auto mb-1' />
                          <div className='text-lg font-bold text-purple-800'>
                            {loanData.financialDetails.loan_term_1 || 'N/A'}
                          </div>
                          <div className='text-xs text-purple-600'>
                            {loanData.financialDetails.loan_term_2 === 'M'
                              ? 'Months'
                              : 'Period'}
                          </div>
                        </div>
                      </div>

                      <div className='space-y-3'>
                        <div className='flex justify-between items-center'>
                          <span className='text-sm text-muted-foreground'>
                            Payment Frequency:
                          </span>
                          <span className='text-sm font-medium'>
                            {formatPaymentFrequency(
                              loanData.financialDetails.payment_frequency
                            )}
                          </span>
                        </div>

                        <div className='flex justify-between items-center'>
                          <span className='text-sm text-muted-foreground'>
                            Default Fees:
                          </span>
                          <span className='text-sm font-medium'>
                            {formatCurrency(
                              loanData.financialDetails.defaultFees
                            )}
                          </span>
                        </div>

                        {loanData.financialDetails.need_insurance && (
                          <div className='flex justify-between items-center'>
                            <span className='text-sm text-muted-foreground'>
                              Insurance:
                            </span>
                            <Badge variant='secondary'>Required</Badge>
                          </div>
                        )}

                        {loanData.financialDetails.start_date && (
                          <div className='flex justify-between items-center'>
                            <span className='text-sm text-muted-foreground'>
                              Start Date:
                            </span>
                            <span className='text-sm'>
                              {new Date(
                                loanData.financialDetails.start_date
                              ).toLocaleDateString('en-NZ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className='text-center py-8 text-muted-foreground'>
                      <CreditCard className='h-12 w-12 mx-auto mb-3 opacity-50' />
                      <p>Financial details not yet available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Loan Officer Card */}
              <Card className='shadow-none border rounded-xl lg:col-span-1'>
                <CardHeader>
                  <CardTitle className='flex items-center text-xl text-fcu-primary-500 font-light'>
                    <User className='mr-3 h-4 w-4 text-fcu-secondary-300' />
                    Your Loan Team
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Loan Officer */}
                  {loanData?.loanOfficer ? (
                    <div className='p-4 bg-fcu-primary-50 rounded-lg'>
                      <div className='flex items-start space-x-4'>
                        <Avatar className='h-12 w-12'>
                          <AvatarFallback className='bg-fcu-primary-500 text-white font-bold'>
                            {getUserInitials(loanData.loanOfficer)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex-1'>
                          <h4 className='font-semibold text-fcu-primary-500'>
                            {getUserFullName(loanData.loanOfficer)}
                          </h4>
                          <p className='text-sm text-fcu-secondary-300 mb-2'>
                            {loanData.loanOfficer.job_title || 'Loan Officer'}
                          </p>
                          <div className='flex items-center text-sm text-fcu-primary-500'>
                            <Mail className='h-4 w-4 mr-2' />
                            <a
                              href={`mailto:${loanData.loanOfficer.work_email}`}
                              className='hover:underline'
                            >
                              {loanData.loanOfficer.work_email}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='text-center py-6 text-muted-foreground'>
                      <User className='h-12 w-12 mx-auto mb-3 opacity-50' />
                      <p>Loan officer will be assigned soon</p>
                    </div>
                  )}

                  {/* Delegated User */}
                  {loanData?.delegatedUser &&
                    loanData.delegatedUser.client_number !==
                      loanData?.loanOfficer?.client_number && (
                      <div className='p-4 bg-blue-50 rounded-lg'>
                        <div className='flex items-start space-x-4'>
                          <Avatar className='h-10 w-10'>
                            <AvatarFallback className='bg-blue-600 text-white font-bold text-sm'>
                              {getUserInitials(loanData.delegatedUser)}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex-1'>
                            <h5 className='font-medium text-blue-900'>
                              {getUserFullName(loanData.delegatedUser)}
                            </h5>
                            <p className='text-sm text-blue-700'>
                              {loanData.delegatedUser.job_title ||
                                'Support Staff'}
                            </p>
                            <p className='text-xs text-blue-600 mt-1'>
                              Currently handling your application
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  <div className='text-center'>
                    <p className='text-xs text-muted-foreground'>
                      Feel free to contact your loan team if you have any
                      questions about your application.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Branch Information Card */}
              <Card className='shadow-none border rounded-xl lg:col-span-1'>
                <CardHeader>
                  <CardTitle className='flex items-center text-xl text-fcu-primary-500 font-light'>
                    <Building2 className='mr-3 h-4 w-4 text-fcu-secondary-300' />
                    Branch Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {loanData?.branchInfo ? (
                    <div className='space-y-4'>
                      <div className='p-4  rounded-lg'>
                        <h4 className='font-semibold text-fcu-primary-500 mb-2'>
                          {loanData.branchInfo.Organisation_Unit_Name}
                        </h4>
                        <div className='space-y-2 text-sm'>
                          <div className='flex items-center text-fcu-secondary-300'>
                            <MapPin className='h-4 w-4 mr-2' />
                            Address:{' '}
                            {loanData.branchInfo.Organisation_Unit_Name}
                          </div>
                        </div>
                      </div>
                      <div className='text-center'>
                        <p className='text-xs text-muted-foreground'>
                          This is your designated branch for this loan
                          application.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className='text-center py-8 text-muted-foreground'>
                      <Building2 className='h-12 w-12 mx-auto mb-3 opacity-50' />
                      <p>Branch information not available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Session Information Card */}
              <Card className='shadow-none border rounded-xl lg:col-span-2'>
                <CardHeader>
                  <CardTitle className='flex items-center text-xl text-fcu-primary-500 font-light'>
                    <Shield className='mr-3 h-4 w-4 text-fcu-secondary-300' />
                    Session & Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid md:grid-cols-3 gap-6'>
                    <div className='text-center p-4 bg-sky-50 rounded-xl'>
                      <Mail className='h-6 w-6 text-fcu-primary-500 mx-auto mb-2' />
                      <div className='text-sm text-muted-foreground mb-1'>
                        Email Address
                      </div>
                      <div className='font-medium text-fcu-primary-500 break-all'>
                        {sessionInfo?.email}
                      </div>
                    </div>
                    <div className='text-center p-4 bg-green-50 rounded-lg'>
                      <TrendingUp className='h-6 w-6 text-green-600 mx-auto mb-2' />
                      <div className='text-sm text-muted-foreground mb-1'>
                        Total Logins
                      </div>
                      <div className='text-2xl font-bold text-green-800'>
                        {sessionInfo?.totalLogins || 0}
                      </div>
                    </div>
                    <div className='text-center p-4 bg-blue-50 rounded-lg'>
                      <Clock className='h-6 w-6 text-blue-600 mx-auto mb-2' />
                      <div className='text-sm text-muted-foreground mb-1'>
                        Last Login
                      </div>
                      <div className='font-medium text-blue-800'>
                        {sessionInfo?.lastLoginAt
                          ? new Date(sessionInfo.lastLoginAt).toLocaleString(
                              'en-NZ'
                            )
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Bar */}
            <div className='text-center'>
              <Button
                onClick={loadDashboardData}
                variant='outline'
                size='lg'
                className='border-fcu-primary-500 text-fcu-primary-500 hover:bg-fcu-primary-50 font-medium px-8'
              >
                <RefreshCw className='mr-2 h-5 w-5' />
                Refresh Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Session Extension Dialog */}
        <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center text-xl'>
                <Timer className='mr-3 h-6 w-6 text-orange-600' />
                Session Expiring Soon
              </DialogTitle>
              <DialogDescription className='text-base'>
                Your session will expire in {formatTimeLeft(sessionTimeLeft)}{' '}
                for security reasons. Would you like to extend your session?
              </DialogDescription>
            </DialogHeader>
            <div className='flex space-x-4 pt-6'>
              <Button
                onClick={extendSession}
                className='flex-1 h-12 bg-fcu-primary-500 hover:bg-fcu-primary-600 text-white'
              >
                <Shield className='mr-2 h-4 w-4' />
                Extend Session
              </Button>
              <Button
                onClick={handleLogout}
                variant='outline'
                className='flex-1 h-12 border-fcu-primary-500 text-fcu-primary-500 hover:bg-fcu-primary-50'
              >
                <LogOut className='mr-2 h-4 w-4' />
                Logout Now
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

// Loading component for Suspense fallback
function DashboardPageLoading() {
  return (
    <div className='min-h-screen bg-white'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-7xl mx-auto space-y-8'>
          {/* Header skeleton */}
          <Card className='shadow-md'>
            <CardHeader>
              <div className='flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
                <div className='space-y-3'>
                  <Skeleton className='h-10 w-80' />
                  <Skeleton className='h-6 w-64' />
                </div>
                <div className='flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3'>
                  <Skeleton className='h-8 w-32' />
                  <Skeleton className='h-10 w-24' />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Content grid skeleton */}
          <div className='grid lg:grid-cols-3 md:grid-cols-2 gap-6 md:gap-8'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className='shadow-md'>
                <CardHeader>
                  <Skeleton className='h-6 w-32' />
                </CardHeader>
                <CardContent className='space-y-4'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-4 w-1/2' />
                </CardContent>
              </Card>
            ))}
          </div>
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
