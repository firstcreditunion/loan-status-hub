'use client'

import { cn } from '../utils'

interface DotPatternProps {
  width?: number
  height?: number
  x?: number
  y?: number
  cx?: number
  cy?: number
  cr?: number
  className?: string
  fill?: string
  opacity?: number
}

export function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  fill = 'currentColor',
  opacity = 0.1,
  ...props
}: DotPatternProps & React.SVGProps<SVGSVGElement>) {
  const id = `dot-pattern-${Math.random().toString(36).substr(2, 9)}`

  return (
    <svg
      aria-hidden='true'
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full',
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits='userSpaceOnUse'
          patternContentUnits='userSpaceOnUse'
          x={x}
          y={y}
        >
          <circle
            id='pattern-circle'
            cx={cx}
            cy={cy}
            r={cr}
            fill={fill}
            opacity={opacity}
          />
        </pattern>
      </defs>
      <rect width='100%' height='100%' strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  )
}

// Grid pattern variant
export function GridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = '0',
  className,
  stroke = 'currentColor',
  opacity = 0.1,
  ...props
}: {
  width?: number
  height?: number
  x?: number
  y?: number
  strokeDasharray?: string
  className?: string
  stroke?: string
  opacity?: number
} & React.SVGProps<SVGSVGElement>) {
  const id = `grid-pattern-${Math.random().toString(36).substr(2, 9)}`

  return (
    <svg
      aria-hidden='true'
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full',
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits='userSpaceOnUse'
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill='none'
            stroke={stroke}
            strokeDasharray={strokeDasharray}
            opacity={opacity}
          />
        </pattern>
      </defs>
      <rect width='100%' height='100%' strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  )
}
