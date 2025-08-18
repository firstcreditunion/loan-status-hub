'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Clock, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface SessionTimerProps {
  expiresAt: string
  onExpired: () => void
  onExtend?: () => Promise<void>
  showWarningAt?: number // seconds before expiry to show warning
  className?: string
}

export function SessionTimer({
  expiresAt,
  onExpired,
  onExtend,
  showWarningAt = 120, // 2 minutes
  className = '',
}: SessionTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [showWarning, setShowWarning] = useState(false)
  const [isExtending, setIsExtending] = useState(false)

  // Calculate time left
  useEffect(() => {
    const calculateTimeLeft = () => {
      const expires = new Date(expiresAt)
      const now = new Date()
      const remaining = Math.max(
        0,
        Math.floor((expires.getTime() - now.getTime()) / 1000)
      )
      return remaining
    }

    const updateTimer = () => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)

      if (remaining === 0) {
        onExpired()
      }
    }

    // Initial calculation
    updateTimer()

    // Set up interval
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpired])

  // Show warning dialog
  useEffect(() => {
    if (timeLeft === showWarningAt && !showWarning) {
      setShowWarning(true)
      toast.warning(
        `Session will expire in ${Math.floor(showWarningAt / 60)} minutes`
      )
    }
  }, [timeLeft, showWarningAt, showWarning])

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getTimerVariant = () => {
    if (timeLeft <= 60) return 'destructive' // Last minute
    if (timeLeft <= 300) return 'secondary' // Last 5 minutes
    return 'outline'
  }

  const handleExtendSession = async () => {
    if (!onExtend) return

    setIsExtending(true)
    try {
      await onExtend()
      setShowWarning(false)
      toast.success('Session extended successfully')
    } catch (error) {
      toast.error('Failed to extend session')
    } finally {
      setIsExtending(false)
    }
  }

  return (
    <>
      <Badge variant={getTimerVariant()} className={`text-xs ${className}`}>
        <Clock className='mr-1 h-3 w-3' />
        {formatTime(timeLeft)}
      </Badge>

      {/* Warning Dialog */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center'>
              <AlertTriangle className='mr-2 h-5 w-5 text-orange-600' />
              Session Expiring Soon
            </DialogTitle>
            <DialogDescription>
              Your session will expire in {formatTime(timeLeft)} for security
              reasons.
              {onExtend
                ? ' Would you like to extend your session?'
                : ' Please save any work and prepare to re-authenticate.'}
            </DialogDescription>
          </DialogHeader>
          <div className='flex space-x-3 pt-4'>
            {onExtend && (
              <Button
                onClick={handleExtendSession}
                className='flex-1'
                disabled={isExtending}
              >
                {isExtending ? 'Extending...' : 'Extend Session'}
              </Button>
            )}
            <Button
              onClick={() => setShowWarning(false)}
              variant='outline'
              className='flex-1'
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
