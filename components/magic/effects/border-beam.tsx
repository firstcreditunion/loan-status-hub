'use client'

import { motion } from 'framer-motion'
import { cn, useReducedMotion } from '../utils'

interface BorderBeamProps {
  children: React.ReactNode
  className?: string
  duration?: number
  delay?: number
  colorFrom?: string
  colorTo?: string
  borderRadius?: string
}

export function BorderBeam({
  children,
  className,
  duration = 5,
  delay = 0,
  colorFrom = 'rgb(3, 105, 161)', // fcu-primary-500
  colorTo = 'rgb(118, 193, 113)', // fcu-secondary-300
  borderRadius = '0.75rem',
}: BorderBeamProps) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return (
      <div
        className={cn(
          'relative overflow-hidden border border-fcu-primary-200',
          className
        )}
        style={{ borderRadius }}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ borderRadius }}
    >
      {children}
      <motion.div
        className='absolute inset-0 rounded-[inherit]'
        style={{
          background: `conic-gradient(from 0deg, transparent, ${colorFrom}, ${colorTo}, transparent)`,
          padding: '2px',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'xor',
          WebkitMask:
            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
        }}
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{
          duration,
          ease: 'linear',
          repeat: Infinity,
          delay,
        }}
      />
    </div>
  )
}

// Simplified CSS-only version
export function BorderBeamCSS({
  children,
  className,
  borderRadius = '0.75rem',
}: {
  children: React.ReactNode
  className?: string
  borderRadius?: string
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden border-beam-container',
        className
      )}
      style={{ borderRadius }}
    >
      {children}
      <div className='border-beam-effect' />
      <style jsx>{`
        .border-beam-container {
          position: relative;
        }
        .border-beam-effect {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 2px;
          background: conic-gradient(
            from 0deg,
            transparent,
            rgb(3, 105, 161),
            rgb(118, 193, 113),
            transparent
          );
          mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          mask-composite: xor;
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          animation: border-beam-spin 5s linear infinite;
        }
        @keyframes border-beam-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
