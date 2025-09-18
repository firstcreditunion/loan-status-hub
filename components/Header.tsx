'use client'

import FCULogo from '@/svgs/FCULogo'

import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  console.log('Path name', pathname)

  if (pathname === '/dashboard') {
    return null
  }

  return (
    <div className='absolute flex flex-row w-full bg-transparent border-fcu-secondary-300/10'>
      <div className='absolute flex w-full h-[5px] bg-gradient-to-r from-fcu-secondary-300 to-fcu-secondary-300'></div>
      <div className='flex w-full py-6 px-4 sm:px-10'>
        <FCULogo />
      </div>
    </div>
  )
}
