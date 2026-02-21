import { Link } from 'react-router-dom'
import { AuthProvider, useAuth } from '../contexts/AuthContext'

function Navigation() {
  const { isAuthenticated, username, login, logout, loading } = useAuth()

  return (
    <nav style={{ display: 'flex', alignItems: 'center' }}>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/test">Test</Link></li>
      </ul>
      <div className="auth-info">
        {loading ? (
          <span>Loading...</span>
        ) : isAuthenticated ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>Welcome, {username}</span>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <button onClick={login}>Login</button>
        )}
      </div>
    </nav>
  )
}

export default function Layout({ children }) {
  return (
    <AuthProvider>
      <div className="app">
        <Navigation />
        <main className="container">
          {children}
        </main>
      </div>
    </AuthProvider>
  )
}

