'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
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
  Phone,
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { getTradingBranches } from '@/lib/lookup-values'
import { DotPattern } from '@/components/magic'

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
  blurb: string | null
}

interface TradingBranch {
  Organisation_Unit_id: string
  Organisation_Unit_Name: string
  Organisation_Unit_Type_id: string | null
  Org_Unit_Client_Number: string | null
  Hidden: boolean
  addressline_1: string | null
  addressline_2: string | null
  addressline_3: string | null
  contact_phone: string | null
  map_link: string | null
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
  const [fullBranchInfo, setFullBranchInfo] = useState<TradingBranch | null>(
    null
  )

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

      // Fetch full trading branch information
      const tradingBranches = await getTradingBranches()
      if (
        tradingBranches &&
        sessionData.comprehensiveLoanData?.loanApplication?.trading_branch
      ) {
        const matchingBranch = tradingBranches.find(
          (branch) =>
            branch.Organisation_Unit_id ===
            sessionData.comprehensiveLoanData.loanApplication.trading_branch
        )
        if (matchingBranch) {
          setFullBranchInfo(matchingBranch)
        }
      }

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
      <div className='min-h-screen bg-white pt-20 px-4 sm:px-0 relative'>
        {/* Dot pattern background */}
        <DotPattern
          className='text-fcu-primary-500'
          opacity={0.04}
          width={20}
          height={20}
        />

        <div className='container mx-auto px-4 py-8 relative'>
          <div className='max-w-7xl mx-auto space-y-8'>
            {/* Header skeleton */}
            <div className='bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm shadow-gray-100/50 overflow-hidden'>
              <div className='p-6 md:p-8'>
                <div className='flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
                  <div className='flex items-start gap-4'>
                    <Skeleton className='h-14 w-14 rounded-full' />
                    <div className='space-y-3'>
                      <Skeleton className='h-8 w-80' />
                      <Skeleton className='h-4 w-64' />
                    </div>
                  </div>
                  <Skeleton className='h-11 w-32 rounded-full' />
                </div>
              </div>
            </div>

            {/* Content grid skeleton */}
            <div className='grid lg:grid-cols-3 md:grid-cols-2 gap-5 md:gap-6'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className='bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm shadow-gray-100/50 overflow-hidden'
                >
                  <div className='p-6'>
                    <div className='flex items-center gap-3 mb-6'>
                      <Skeleton className='h-10 w-10 rounded-full' />
                      <Skeleton className='h-6 w-40' />
                    </div>
                    <div className='space-y-4'>
                      <Skeleton className='h-20 w-full rounded-xl' />
                      <Skeleton className='h-4 w-full' />
                      <Skeleton className='h-4 w-3/4' />
                      <Skeleton className='h-4 w-1/2' />
                    </div>
                  </div>
                </div>
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
      <div className='min-h-screen flex items-center justify-center bg-white relative pt-32 px-4 sm:px-0'>
        {/* Dot pattern background */}
        <DotPattern
          className='text-fcu-primary-500'
          opacity={0.04}
          width={20}
          height={20}
        />

        <div className='w-full max-w-md outline-2 outline-offset-4 outline-fcu-secondary-300/5 bg-gray-100 backdrop-blur-sm relative rounded-xl shadow-fcu-secondary-500/15 shadow-2xl p-8'>
          <div className='text-center'>
            <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 border border-orange-100'>
              <Timer className='h-8 w-8 text-orange-600' />
            </div>
            <h2 className='text-2xl font-light tracking-tight text-fcu-primary-500 mb-3'>
              Session Expired
            </h2>
            <p className='text-sm text-fcu-secondary-300 mb-6'>
              Your session has expired for security reasons. Please verify your
              email again to continue.
            </p>
            <Button
              onClick={() => router.push('/')}
              className='w-full h-12 text-base bg-fcu-primary-600 hover:bg-fcu-primary-700 text-white rounded-full transition-all duration-200'
            >
              Return to Verification
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (state === 'error') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-white relative pt-32 px-4 sm:px-0'>
        {/* Dot pattern background */}
        <DotPattern
          className='text-fcu-primary-500'
          opacity={0.04}
          width={20}
          height={20}
        />

        <div className='w-full max-w-md outline-2 outline-offset-4 outline-fcu-secondary-300/5 bg-gray-100 backdrop-blur-sm relative rounded-xl shadow-fcu-secondary-500/15 shadow-2xl p-8'>
          <div className='text-center'>
            <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-100'>
              <AlertCircle className='h-8 w-8 text-red-600' />
            </div>
            <h2 className='text-2xl font-light tracking-tight text-fcu-primary-500 mb-3'>
              Error
            </h2>
            <p className='text-sm text-fcu-secondary-300 mb-6'>{error}</p>
            <div className='space-y-3'>
              <Button
                onClick={loadDashboardData}
                className='w-full h-12 border-fcu-primary-500/20 text-fcu-primary-500 bg-fcu-primary-50 hover:bg-fcu-primary-100 rounded-full transition-all duration-200'
                variant='outline'
              >
                <RefreshCw className='mr-2 h-4 w-4' />
                Try Again
              </Button>
              <Button
                onClick={() => router.push('/')}
                className='w-full h-12 bg-fcu-primary-600 hover:bg-fcu-primary-700 text-white rounded-full transition-all duration-200'
              >
                Return to Verification
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Active dashboard
  return (
    <TooltipProvider>
      <div className='min-h-screen bg-white tracking-tight px-4 sm:px-0 relative'>
        {/* Dot pattern background */}
        <DotPattern
          className='text-fcu-primary-500'
          opacity={0.04}
          width={20}
          height={20}
        />

        <div className='container mx-auto px-4 py-8 relative'>
          <div className='max-w-7xl mx-auto space-y-8'>
            {/* Header */}
            <div className='bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm shadow-gray-100/50 overflow-hidden'>
              <div className='p-6 md:p-8'>
                <div className='flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
                  <div className='flex-1'>
                    <div className='flex flex-row justify-start items-start gap-4'>
                      <div className='flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-fcu-primary-50 to-fcu-secondary-50 shadow-sm'>
                        <Image
                          src='/logo/android-chrome-192x192.png'
                          alt='FCU Logo'
                          width={56}
                          height={56}
                        />
                      </div>
                      <div className='flex flex-col justify-start items-start'>
                        <h1 className='text-2xl md:text-3xl font-light tracking-tight text-fcu-primary-500 mb-1'>
                          Loan Status Dashboard
                        </h1>
                        <p className='text-sm md:text-base text-fcu-secondary-300 tracking-tight'>
                          Welcome back,{' '}
                          <span className='font-medium'>
                            {loanData?.loanApplication.applicant_name ||
                              'Valued Customer'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4'>
                    <Button
                      variant='outline'
                      size='lg'
                      onClick={handleLogout}
                      className='border-fcu-primary-500/20 text-fcu-primary-500 bg-fcu-primary-50 hover:bg-fcu-primary-100 hover:border-fcu-primary-500/30 rounded-full transition-all duration-200'
                    >
                      <LogOut className='mr-2 h-4 w-4' />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className='grid lg:grid-cols-3 md:grid-cols-2 gap-5 md:gap-6'>
              {/* Loan Overview Card */}
              <div className='bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm shadow-gray-100/50 overflow-hidden lg:col-span-1 hover:shadow-md hover:shadow-gray-100/50 transition-shadow duration-300'>
                <div className='p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-fcu-primary-500'>
                      <FileText className='h-5 w-5 text-white' />
                    </div>
                    <h2 className='text-xl font-light tracking-tight text-fcu-primary-500'>
                      Loan Overview
                    </h2>
                  </div>
                  <div className='space-y-6'>
                    <div
                      id='application-status'
                      className='p-4 bg-gradient-to-br from-sky-50/50 to-blue-50/30 rounded-xl space-y-3 border border-sky-100/50'
                    >
                      <div className='flex items-center justify-between'>
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
                      {loanData?.statusInfo?.blurb && (
                        <p className='text-xs text-fcu-secondary-300 leading-relaxed'>
                          {loanData.statusInfo.blurb}
                        </p>
                      )}
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
                  </div>
                </div>
              </div>

              {/* Financial Details Card */}
              <div className='bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm shadow-gray-100/50 overflow-hidden lg:col-span-1 hover:shadow-md hover:shadow-gray-100/50 transition-shadow duration-300'>
                <div className='p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-50'>
                      <CircleDollarSignIcon className='h-5 w-5 text-green-600' />
                    </div>
                    <h2 className='text-xl font-light tracking-tight text-fcu-primary-500'>
                      Financial Details
                    </h2>
                  </div>
                  <div className='space-y-6'>
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
                              {loanData.financialDetails.interest_rate || 'N/A'}
                              %
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
                  </div>
                </div>
              </div>

              {/* Loan Officer Card */}
              <div className='bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm shadow-gray-100/50 overflow-hidden lg:col-span-1 hover:shadow-md hover:shadow-gray-100/50 transition-shadow duration-300'>
                <div className='p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-fcu-secondary-300'>
                      <User className='h-5 w-5 text-white' />
                    </div>
                    <h2 className='text-xl font-light tracking-tight text-fcu-primary-500'>
                      Your Lending Consultant
                    </h2>
                  </div>
                  <div className='space-y-6'>
                    {/* Loan Officer */}
                    {!loanData?.loanOfficer ||
                    loanData?.loanApplication.app_status === 'DRAFT' ||
                    loanData?.loanApplication.app_status === 'INIT' ? (
                      <div className='text-center py-6 text-muted-foreground'>
                        <User className='h-12 w-12 mx-auto mb-3 opacity-50' />
                        <p>Loan officer will be assigned soon</p>
                      </div>
                    ) : (
                      <div className='p-4 rounded-lg'>
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
                    )}

                    {/* Delegated User */}
                    {loanData?.delegatedUser &&
                      loanData.delegatedUser.client_number !==
                        loanData?.loanOfficer?.client_number &&
                      loanData?.loanApplication.app_status !== 'DRAFT' &&
                      loanData?.loanApplication.app_status !== 'INIT' && (
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

                    {!loanData?.loanOfficer ||
                      loanData?.loanApplication.app_status === 'DRAFT' ||
                      (loanData?.loanApplication.app_status === 'INIT' && (
                        <div className='text-center'>
                          <p className='text-xs text-muted-foreground'>
                            Feel free to contact your lending consultant using
                            the above email if you have any questions about your
                            application.
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Branch Information Card */}
              <div className='bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm shadow-gray-100/50 overflow-hidden lg:col-span-1 hover:shadow-md hover:shadow-gray-100/50 transition-shadow duration-300'>
                <div className='p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-50'>
                      <Building2 className='h-5 w-5 text-blue-600' />
                    </div>
                    <h2 className='text-xl font-light tracking-tight text-fcu-primary-500'>
                      Branch Information
                    </h2>
                  </div>
                  <div className='space-y-4'>
                    {fullBranchInfo ? (
                      <div className='space-y-4'>
                        <div className='p-4 rounded-lg'>
                          <h4 className='font-semibold text-fcu-primary-500 mb-3'>
                            Branch: {fullBranchInfo.Organisation_Unit_Name}
                          </h4>

                          {/* Contact Phone */}
                          {fullBranchInfo.contact_phone && (
                            <div className='flex items-center text-sm text-fcu-secondary-300 mb-3'>
                              <Phone className='h-4 w-4 mr-2 flex-shrink-0' />
                              <a
                                href={`tel:${fullBranchInfo.contact_phone}`}
                                className='hover:underline text-fcu-primary-500 font-medium'
                              >
                                {fullBranchInfo.contact_phone}
                              </a>
                            </div>
                          )}

                          {/* Address with Map Link */}
                          {(fullBranchInfo.addressline_1 ||
                            fullBranchInfo.addressline_2 ||
                            fullBranchInfo.addressline_3) && (
                            <div className='space-y-1 text-sm'>
                              <div className='flex items-start text-fcu-secondary-300'>
                                <MapPin className='h-4 w-4 mr-2 flex-shrink-0 mt-0.5' />
                                <div className='flex-1'>
                                  {fullBranchInfo.map_link ? (
                                    <a
                                      href={fullBranchInfo.map_link}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='hover:underline text-fcu-primary-500'
                                    >
                                      {fullBranchInfo.addressline_1 && (
                                        <div>
                                          {fullBranchInfo.addressline_1}
                                        </div>
                                      )}
                                      {fullBranchInfo.addressline_2 && (
                                        <div>
                                          {fullBranchInfo.addressline_2}
                                        </div>
                                      )}
                                      {fullBranchInfo.addressline_3 && (
                                        <div>
                                          {fullBranchInfo.addressline_3}
                                        </div>
                                      )}
                                    </a>
                                  ) : (
                                    <div className='text-fcu-secondary-300'>
                                      {fullBranchInfo.addressline_1 && (
                                        <div>
                                          {fullBranchInfo.addressline_1}
                                        </div>
                                      )}
                                      {fullBranchInfo.addressline_2 && (
                                        <div>
                                          {fullBranchInfo.addressline_2}
                                        </div>
                                      )}
                                      {fullBranchInfo.addressline_3 && (
                                        <div>
                                          {fullBranchInfo.addressline_3}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
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
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className='text-center pb-4'>
              <Button
                onClick={loadDashboardData}
                variant='outline'
                size='lg'
                className='border-fcu-primary-500/20 text-fcu-primary-500 bg-fcu-primary-50/50 hover:bg-fcu-primary-100 hover:border-fcu-primary-500/30 font-medium px-8 rounded-full transition-all duration-200 shadow-sm hover:shadow-md'
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
    <div className='min-h-screen bg-white pt-20 px-4 sm:px-0 relative'>
      {/* Dot pattern background */}
      <DotPattern
        className='text-fcu-primary-500'
        opacity={0.04}
        width={20}
        height={20}
      />

      <div className='container mx-auto px-4 py-8 relative'>
        <div className='max-w-7xl mx-auto space-y-8'>
          {/* Header skeleton */}
          <div className='bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm shadow-gray-100/50 overflow-hidden'>
            <div className='p-6 md:p-8'>
              <div className='flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
                <div className='flex items-start gap-4'>
                  <Skeleton className='h-14 w-14 rounded-full' />
                  <div className='space-y-3'>
                    <Skeleton className='h-8 w-80' />
                    <Skeleton className='h-4 w-64' />
                  </div>
                </div>
                <Skeleton className='h-11 w-32 rounded-full' />
              </div>
            </div>
          </div>

          {/* Content grid skeleton */}
          <div className='grid lg:grid-cols-3 md:grid-cols-2 gap-5 md:gap-6'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className='bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm shadow-gray-100/50 overflow-hidden'
              >
                <div className='p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <Skeleton className='h-10 w-10 rounded-full' />
                    <Skeleton className='h-6 w-40' />
                  </div>
                  <div className='space-y-4'>
                    <Skeleton className='h-20 w-full rounded-xl' />
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-3/4' />
                    <Skeleton className='h-4 w-1/2' />
                  </div>
                </div>
              </div>
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

// Re-Commit
