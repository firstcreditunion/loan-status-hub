'use client'

import { motion } from 'framer-motion'
import { cn, useReducedMotion } from '../utils'

interface AnimatedShinyTextProps {
  text: string
  className?: string
  shimmerWidth?: number
  animationDuration?: number
  delay?: number
}

export function AnimatedShinyText({
  text,
  className,
  shimmerWidth = 100,
  animationDuration = 3,
  delay = 0,
}: AnimatedShinyTextProps) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return <span className={cn('font-bold', className)}>{text}</span>
  }

  return (
    <motion.div
      className={cn(
        'relative inline-block font-bold overflow-hidden',
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
    >
      <span className='relative z-10'>{text}</span>
      <motion.div
        className='absolute inset-0 -top-0 -bottom-0 bg-gradient-to-r from-transparent via-white/30 to-transparent'
        style={{
          width: `${shimmerWidth}px`,
          filter: 'blur(1px)',
        }}
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration: animationDuration,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 2,
          delay,
        }}
      />
    </motion.div>
  )
}

// Alternative version with CSS-only animation (fallback)
export function AnimatedShinyTextCSS({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'relative inline-block font-bold bg-gradient-to-r from-fcu-primary-600 via-fcu-primary-400 to-fcu-primary-600 bg-clip-text text-transparent animate-shimmer',
        className
      )}
      style={{
        backgroundSize: '200% 100%',
        animation: 'shimmer 3s ease-in-out infinite',
      }}
    >
      {text}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </span>
  )
}
