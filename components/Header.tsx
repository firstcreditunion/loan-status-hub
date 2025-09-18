import FCULogo from '@/svgs/FCULogo'

export default function Header() {
  return (
    <div className='relative flex flex-row w-full bg-gray-100/50 border-b-1 border-fcu-secondary-300/10'>
      <div className='absolute flex w-full h-[5px] bg-gradient-to-r from-fcu-secondary-300 to-fcu-secondary-300'></div>
      <div className='flex w-full py-6 px-4 sm:px-10'>
        <FCULogo />
      </div>
    </div>
  )
}
