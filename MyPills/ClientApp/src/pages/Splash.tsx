import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function Splash() {
  const { isAuthenticated, loading } = useAuth()
  const { language, setLanguage, text, availableLanguages } = useLanguage()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/overview', { replace: true })
    }
  }, [isAuthenticated, loading, navigate])

  if (loading) {
    return <div className="loading">{text.common.loading}</div>
  }

  return (
    <div className="splash">
      <nav className="splash-nav">
        <div className="splash-container">
          <span className="splash-brand">💊 My Pills</span>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <label className="app-language-label" htmlFor="splash-language-select">{text.layout.languageLabel}</label>
            <select
              id="splash-language-select"
              className="form-select form-select-sm app-language-select"
              value={language}
              onChange={event => setLanguage(event.target.value as typeof language)}
            >
              {availableLanguages.map(option => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
            <a className="splash-button-outline" href="/Identity/Account/Login">{text.splash.signIn}</a>
          </div>
        </div>
      </nav>

      <header className="splash-hero">
        <div className="splash-container splash-hero-content">
          <div className="splash-hero-text">
            <h1 className="splash-title">
              {text.splash.titleStart} <span className="splash-title-accent">{text.splash.titleAccent}</span>
            </h1>
            <p className="splash-lead">
              {text.splash.lead}
            </p>
            <a className="splash-button-primary" href="/Identity/Account/Register">{text.splash.getStarted}</a>
          </div>
          <div className="splash-mockup">
            <div className="splash-mockup-card">
              <h2>{text.splash.liveInventory}</h2>
              <hr />
              <p>{text.splash.inventoryAspirin}</p>
              <p>{text.splash.inventoryVitaminD}</p>
              <span className="splash-badge-warning">{text.splash.expiringSoon}</span>
            </div>
          </div>
        </div>
      </header>

      <section className="splash-features">
        <div className="splash-container splash-features-grid">
          <div className="splash-feature">
            <div className="splash-feature-icon">📦</div>
            <h3>{text.splash.stockTracking}</h3>
            <p>{text.splash.stockTrackingDescription}</p>
          </div>
          <div className="splash-feature">
            <div className="splash-feature-icon">📄</div>
            <h3>{text.splash.prescriptionVault}</h3>
            <p>{text.splash.prescriptionVaultDescription}</p>
          </div>
          <div className="splash-feature">
            <div className="splash-feature-icon">🔔</div>
            <h3>{text.splash.smartAlerts}</h3>
            <p>{text.splash.smartAlertsDescription}</p>
          </div>
        </div>
      </section>

      <footer className="splash-footer">
        <p>{text.splash.footer}</p>
      </footer>
    </div>
  )
}

