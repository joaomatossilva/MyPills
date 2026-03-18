import type { ReactNode } from 'react'

export interface AuthState {
  isAuthenticated: boolean
  username: string | null
  loading: boolean
}

export interface AuthStatusResponse {
  isAuthenticated: boolean
  username: string | null
}

export interface AuthContextValue extends AuthState {
  login: () => void
  logout: () => void
  refresh: () => Promise<void>
}

export interface AuthProviderProps {
  children: ReactNode
}

