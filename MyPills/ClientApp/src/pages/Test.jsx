import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../contexts/AuthContext'

function TestContent() {
  const { username } = useAuth()

  return (
    <div>
      <h1>Test Page</h1>
      <div className="success">
        <p>🎉 Success! You have accessed a protected page.</p>
        <p>You are authenticated as <strong>{username}</strong></p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Protected Content</h2>
        <p>
          This page is only accessible to authenticated users. If you weren't logged in,
          you would have been redirected to the login page.
        </p>
        
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          <h3>Technical Details</h3>
          <ul>
            <li>Authentication is handled via ASP.NET Core Identity cookies</li>
            <li>The ProtectedRoute component checks authentication status</li>
            <li>Unauthenticated users are redirected to /Identity/Account/Login</li>
            <li>After login, you can navigate back to this page</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function Test() {
  return (
    <ProtectedRoute>
      <TestContent />
    </ProtectedRoute>
  )
}

