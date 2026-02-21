import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { isAuthenticated, username } = useAuth()

  return (
    <div>
      <h1>Welcome to MyPills</h1>
      <p>This is the home page and is accessible to everyone.</p>
      
      {isAuthenticated ? (
        <div className="success">
          <p>You are logged in as <strong>{username}</strong></p>
          <p>You can now access protected pages like the Test page.</p>
        </div>
      ) : (
        <div className="error">
          <p>You are not logged in.</p>
          <p>Click the Login button in the navigation to authenticate.</p>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2>About This Page</h2>
        <p>
          This is a React SPA (Single Page Application) integrated with ASP.NET Core.
          Authentication is handled via cookies, so when you log in through the Identity pages,
          your session is maintained across the entire application.
        </p>
      </div>
    </div>
  )
}

