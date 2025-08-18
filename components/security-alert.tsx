'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  // Shield unused
  AlertTriangle,
  Info,
  X,
  Clock,
  UserX,
  Activity,
} from 'lucide-react'

interface SecurityEvent {
  type:
    | 'rate_limit'
    | 'session_timeout'
    | 'suspicious_activity'
    | 'max_attempts'
    | 'info'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  dismissible?: boolean
  autoHide?: number // milliseconds
}

interface SecurityAlertProps {
  event: SecurityEvent
  onDismiss?: () => void
  className?: string
}

export function SecurityAlert({
  event,
  onDismiss,
  className = '',
}: SecurityAlertProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (event.autoHide && event.autoHide > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
        onDismiss?.()
      }, event.autoHide)

      return () => clearTimeout(timer)
    }
  }, [event.autoHide, onDismiss])

  const getIcon = () => {
    switch (event.type) {
      case 'rate_limit':
        return <Clock className='h-4 w-4' />
      case 'session_timeout':
        return <Clock className='h-4 w-4' />
      case 'suspicious_activity':
        return <AlertTriangle className='h-4 w-4' />
      case 'max_attempts':
        return <UserX className='h-4 w-4' />
      default:
        return <Info className='h-4 w-4' />
    }
  }

  const getVariant = () => {
    switch (event.severity) {
      case 'critical':
      case 'high':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getSeverityBadge = () => {
    const colors = {
      low: 'bg-blue-100 text-blue-800 border-blue-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200',
    }

    return (
      <Badge className={`text-xs ${colors[event.severity]}`}>
        {event.severity.toUpperCase()}
      </Badge>
    )
  }

  const handleDismiss = () => {
    setVisible(false)
    onDismiss?.()
  }

  if (!visible) return null

  return (
    <Alert variant={getVariant()} className={`${className} relative`}>
      <div className='flex items-start justify-between'>
        <div className='flex items-start space-x-3'>
          {getIcon()}
          <div className='flex-1 space-y-1'>
            <div className='flex items-center space-x-2'>
              <span className='font-medium'>Security Alert</span>
              {getSeverityBadge()}
            </div>
            <AlertDescription>{event.message}</AlertDescription>
            <p className='text-xs text-muted-foreground'>
              {new Date(event.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        {event.dismissible !== false && (
          <Button
            variant='ghost'
            size='sm'
            onClick={handleDismiss}
            className='h-6 w-6 p-0 hover:bg-transparent'
          >
            <X className='h-3 w-3' />
          </Button>
        )}
      </div>
    </Alert>
  )
}

// Security Alert Manager Component
interface SecurityAlertManagerProps {
  events: SecurityEvent[]
  onDismissEvent: (index: number) => void
  maxVisible?: number
  className?: string
}

export function SecurityAlertManager({
  events,
  onDismissEvent,
  maxVisible = 3,
  className = '',
}: SecurityAlertManagerProps) {
  const visibleEvents = events.slice(0, maxVisible)

  if (visibleEvents.length === 0) return null

  return (
    <div className={`space-y-3 ${className}`}>
      {visibleEvents.map((event, index) => (
        <SecurityAlert
          key={`${event.timestamp}-${index}`}
          event={event}
          onDismiss={() => onDismissEvent(index)}
        />
      ))}

      {events.length > maxVisible && (
        <div className='text-center'>
          <Badge variant='outline' className='text-xs'>
            <Activity className='mr-1 h-3 w-3' />+{events.length - maxVisible}{' '}
            more security events
          </Badge>
        </div>
      )}
    </div>
  )
}

// Predefined security event creators
export const createSecurityEvent = {
  rateLimitExceeded: (remainingTime: number): SecurityEvent => ({
    type: 'rate_limit',
    severity: 'medium',
    message: `Too many requests. Please wait ${Math.ceil(remainingTime / 60)} minutes before trying again.`,
    timestamp: new Date().toISOString(),
    dismissible: false,
  }),

  sessionTimeout: (): SecurityEvent => ({
    type: 'session_timeout',
    severity: 'medium',
    message:
      'Your session has expired for security reasons. Please verify your email again.',
    timestamp: new Date().toISOString(),
    dismissible: false,
  }),

  maxAttemptsExceeded: (): SecurityEvent => ({
    type: 'max_attempts',
    severity: 'high',
    message:
      'Maximum verification attempts exceeded. Please request a new verification code.',
    timestamp: new Date().toISOString(),
    dismissible: false,
  }),

  suspiciousActivity: (details: string): SecurityEvent => ({
    type: 'suspicious_activity',
    severity: 'high',
    message: `Suspicious activity detected: ${details}`,
    timestamp: new Date().toISOString(),
    dismissible: true,
  }),

  securityInfo: (message: string, autoHide?: number): SecurityEvent => ({
    type: 'info',
    severity: 'low',
    message,
    timestamp: new Date().toISOString(),
    dismissible: true,
    autoHide,
  }),
}
