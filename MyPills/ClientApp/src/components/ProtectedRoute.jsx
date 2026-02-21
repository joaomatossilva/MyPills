import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, login } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      login()
    }
  }, [isAuthenticated, loading, login])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!isAuthenticated) {
    return <div className="loading">Redirecting to login...</div>
  }

  return children
}

