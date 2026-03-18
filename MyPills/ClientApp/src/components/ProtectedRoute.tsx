import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, login } = useAuth()
  const { text } = useLanguage()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      login()
    }
  }, [isAuthenticated, loading, login])

  if (loading) {
    return <div className="loading">{text.common.loading}</div>
  }

  if (!isAuthenticated) {
    return <div className="loading">{text.common.redirecting}</div>
  }

  return children
}

