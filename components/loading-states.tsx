'use client'

import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2, Shield, Mail } from 'lucide-react'

// Generic loading spinner component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  text,
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <Loader2
        className={`animate-spin text-fcu-primary-600 ${sizeClasses[size]}`}
      />
      {text && <p className='text-sm text-muted-foreground'>{text}</p>}
    </div>
  )
}

// Verification page loading state
export function VerificationPageSkeleton() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-fcu-primary-50 to-fcu-secondary-50'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100'>
            <Skeleton className='h-6 w-6 rounded-full' />
          </div>
          <Skeleton className='h-6 w-48 mx-auto mb-2' />
          <Skeleton className='h-4 w-64 mx-auto' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Skeleton className='h-14 w-full' />
            <div className='flex justify-between'>
              <Skeleton className='h-3 w-32' />
              <Skeleton className='h-3 w-24' />
            </div>
          </div>
          <Skeleton className='h-10 w-full' />
          <div className='text-center'>
            <Skeleton className='h-4 w-40 mx-auto' />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Dashboard page loading state
export function DashboardPageSkeleton() {
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

// Landing page loading state
export function LandingPageSkeleton() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-fcu-primary-50 to-fcu-secondary-50'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100'>
            <Skeleton className='h-6 w-6 rounded-full' />
          </div>
          <Skeleton className='h-6 w-48 mx-auto mb-2' />
          <Skeleton className='h-4 w-64 mx-auto' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-3 p-4 bg-gray-50 rounded-lg'>
            <div className='flex justify-between'>
              <Skeleton className='h-4 w-12' />
              <Skeleton className='h-4 w-32' />
            </div>
            <div className='flex justify-between'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-4 w-24' />
            </div>
          </div>
          <Skeleton className='h-10 w-full' />
        </CardContent>
      </Card>
    </div>
  )
}

// Email sending state
export function EmailSendingState({ email }: { email: string }) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-fcu-primary-50 to-fcu-secondary-50'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-fcu-primary-100'>
            <Mail className='h-6 w-6 text-fcu-primary-600 animate-pulse' />
          </div>
          <CardTitle>Sending Verification Code</CardTitle>
          <CardDescription>
            Please wait while we send a verification code to
            <br />
            <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center space-x-2'>
            <LoadingSpinner size='sm' />
            <span className='text-sm text-muted-foreground'>
              Sending email...
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Code verification state
export function CodeVerificationState({ code }: { code: string }) {
  return (
    <div className='flex items-center justify-center space-x-2 py-2'>
      <LoadingSpinner size='sm' />
      <span className='text-sm text-muted-foreground'>
        Verifying code {code}...
      </span>
    </div>
  )
}

// Dashboard data loading state
export function DashboardDataLoading() {
  return (
    <div className='flex items-center justify-center space-x-2 py-4'>
      <LoadingSpinner size='sm' />
      <span className='text-sm text-muted-foreground'>
        Loading loan status...
      </span>
    </div>
  )
}

// Session validation state
export function SessionValidationState() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-fcu-primary-50 to-fcu-secondary-50'>
      <Card className='w-full max-w-md'>
        <CardContent className='pt-6'>
          <div className='flex flex-col items-center space-y-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-fcu-primary-100'>
              <Shield className='h-6 w-6 text-fcu-primary-600 animate-pulse' />
            </div>
            <LoadingSpinner text='Validating session...' />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
