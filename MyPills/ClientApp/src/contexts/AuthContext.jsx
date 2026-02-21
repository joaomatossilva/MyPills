import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    username: null,
    loading: true
  })

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setAuthState({
          isAuthenticated: data.isAuthenticated,
          username: data.username,
          loading: false
        })
      } else {
        setAuthState({
          isAuthenticated: false,
          username: null,
          loading: false
        })
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      setAuthState({
        isAuthenticated: false,
        username: null,
        loading: false
      })
    }
  }

  const login = () => {
    window.location.href = '/Identity/Account/Login'
  }

  const logout = () => {
    window.location.href = '/Identity/Account/Logout'
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, refresh: checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

