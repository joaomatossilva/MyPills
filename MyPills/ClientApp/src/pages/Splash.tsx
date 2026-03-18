import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Splash() {
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/overview', { replace: true })
    }
  }, [isAuthenticated, loading, navigate])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="splash">
      <nav className="splash-nav">
        <div className="splash-container">
          <span className="splash-brand">💊 My Pills</span>
          <a className="splash-button-outline" href="/Identity/Account/Login">Sign In</a>
        </div>
      </nav>

      <header className="splash-hero">
        <div className="splash-container splash-hero-content">
          <div className="splash-hero-text">
            <h1 className="splash-title">
              Your Home Pharmacy, <span className="splash-title-accent">Organized.</span>
            </h1>
            <p className="splash-lead">
              Stop guessing how many pills are left in the bottle. My Pills monitors your home stock and reminds you to renew prescriptions before they expire.
            </p>
            <a className="splash-button-primary" href="/Identity/Account/Register">Get Started Free</a>
          </div>
          <div className="splash-mockup">
            <div className="splash-mockup-card">
              <h2>Live Inventory</h2>
              <hr />
              <p>Aspirin: 12 Units Left</p>
              <p>Vitamin D3: 5 Units Left (Refill Soon!)</p>
              <span className="splash-badge-warning">1 Prescription Expiring Soon</span>
            </div>
          </div>
        </div>
      </header>

      <section className="splash-features">
        <div className="splash-container splash-features-grid">
          <div className="splash-feature">
            <div className="splash-feature-icon">📦</div>
            <h3>Stock Tracking</h3>
            <p>Log your current bottle count and let our algorithm subtract doses automatically based on your schedule.</p>
          </div>
          <div className="splash-feature">
            <div className="splash-feature-icon">📄</div>
            <h3>Prescription Vault</h3>
            <p>Store photos of your prescriptions. Get alerts when they are about to expire or run out of refills.</p>
          </div>
          <div className="splash-feature">
            <div className="splash-feature-icon">🔔</div>
            <h3>Smart Alerts</h3>
            <p>Receive a notification when it's time to visit the pharmacy, not when you've already run out.</p>
          </div>
        </div>
      </section>

      <footer className="splash-footer">
        <p>&copy; 2026 My Pills. All rights reserved.</p>
      </footer>
    </div>
  )
}

