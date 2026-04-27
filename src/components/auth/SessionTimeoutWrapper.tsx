'use client'

import React from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'
import { SessionTimeoutWarning } from '@/components/auth/SessionTimeoutWarning'

const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
const WARNING_BEFORE_MS = 5 * 60 * 1000 // 5 minutes

export function SessionTimeoutWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuthContext()

  const { showWarning, remainingSeconds, stayLoggedIn, handleLogout } = useSessionTimeout({
    timeoutMs: SESSION_TIMEOUT_MS,
    warningBeforeMs: WARNING_BEFORE_MS,
    enabled: isAuthenticated,
    onTimeout: async () => {
      await logout()
    },
  })

  return (
    <>
      {children}
      <SessionTimeoutWarning
        showWarning={showWarning}
        remainingSeconds={remainingSeconds}
        onStayLoggedIn={stayLoggedIn}
        onLogout={handleLogout}
      />
    </>
  )
}
