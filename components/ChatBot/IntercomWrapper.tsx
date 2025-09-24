'use client'

import IntercomProvider from './IntercomProvider'

interface IntercomWrapperProps {
  children: React.ReactNode
}

export default function IntercomWrapper({ children }: IntercomWrapperProps) {
  // For now, we'll use anonymous mode by default
  // The IntercomDemo component will handle the dynamic switching
  const intercomConfig = {
    isAuthenticated: false,
    userId: '',
    userName: '',
    userEmail: '',
    userCreatedAt: Math.floor(Date.now() / 1000),
  }

  return (
    <IntercomProvider
      appId={process.env.NEXT_PUBLIC_INTERCOM_APP_ID || 'a30t2fvp'}
      isAuthenticated={intercomConfig.isAuthenticated}
      userId={
        intercomConfig.isAuthenticated ? intercomConfig.userId : undefined
      }
      userName={
        intercomConfig.isAuthenticated ? intercomConfig.userName : undefined
      }
      userEmail={
        intercomConfig.isAuthenticated ? intercomConfig.userEmail : undefined
      }
      userCreatedAt={
        intercomConfig.isAuthenticated
          ? intercomConfig.userCreatedAt
          : undefined
      }
    >
      {children}
    </IntercomProvider>
  )
}
