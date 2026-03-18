import type { NavLinkRenderProps } from 'react-router-dom'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function Layout() {
  const { isAuthenticated, username, login, logout, loading } = useAuth()
  const { language, setLanguage, text, availableLanguages } = useLanguage()
  const getNavLinkClass = ({ isActive }: NavLinkRenderProps) => `nav-link${isActive ? ' active' : ''}`

  useEffect(() => {
    const previousClassName = document.body.className
    document.body.className = 'layout-fixed sidebar-expand-lg sidebar-open bg-body-tertiary'
    return () => {
      document.body.className = previousClassName
    }
  }, [])

  return (
    <>
      <div className="skip-links">
        <a href="#main" className="skip-link">{text.layout.skipToContent}</a>
        <a href="#navigation" className="skip-link">{text.layout.skipToNavigation}</a>
      </div>
      <div className="app-wrapper app-shell">
        <nav className="app-header app-topbar navbar navbar-expand bg-body">
          <div className="container-fluid">
            <ul className="navbar-nav" role="navigation" aria-label="Navigation 1">
              <li className="nav-item">
                <a className="nav-link" data-lte-toggle="sidebar" href="#" role="button">
                  <i className="fa-solid fa-list"></i>
                </a>
              </li>
              <li className="nav-item d-none d-md-block">
                <Link to="/" className="nav-link">{text.layout.home}</Link>
              </li>
            </ul>
            <ul className="navbar-nav ms-auto">
              <li className="nav-item app-language-picker">
                <label className="app-language-label" htmlFor="app-language-select">{text.layout.languageLabel}</label>
                <select
                  id="app-language-select"
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
              </li>
              {loading ? (
                <li className="nav-item">
                  <span className="nav-link app-user-pill">{text.layout.loading}</span>
                </li>
              ) : isAuthenticated ? (
                <>
                  <li className="nav-item">
                    <span className="nav-link app-user-pill">{text.layout.welcome(username)}</span>
                  </li>
                  <li className="nav-item">
                    <button type="button" className="btn btn-link nav-link app-nav-button" onClick={logout}>{text.layout.logout}</button>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <button type="button" className="btn btn-link nav-link app-nav-button" onClick={login}>{text.layout.login}</button>
                </li>
              )}
            </ul>
          </div>
        </nav>

        <aside className="app-sidebar app-sidebar-panel bg-body-secondary shadow" data-bs-theme="dark">
          <div className="sidebar-brand">
            <Link to="/" className="brand-link app-brand-link">
              <span className="brand-text fw-light">My Pills</span>
            </Link>
          </div>
          <div className="sidebar-wrapper">
            <nav className="mt-2">
              <ul
                className="nav sidebar-menu flex-column"
                data-lte-toggle="treeview"
                role="navigation"
                aria-label="Main navigation"
                data-accordion="false"
                id="navigation"
              >
                <li className="nav-item">
                  <NavLink to="/" end className={getNavLinkClass}>
                    <i className="nav-icon bi bi-download"></i>
                    <p>{text.layout.home}</p>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/medicines" className={getNavLinkClass}>
                    <i className="nav-icon bi bi-download"></i>
                    <p>{text.layout.medicines}</p>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/stock" className={getNavLinkClass}>
                    <i className="nav-icon bi bi-download"></i>
                    <p>{text.layout.stock}</p>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/prescriptions" className={getNavLinkClass}>
                    <i className="nav-icon bi bi-download"></i>
                    <p>{text.layout.prescriptions}</p>
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        <main className="app-main app-main-shell" role="main" id="main">
          <Outlet />
        </main>

        <footer className="app-footer app-footer-shell">
          &copy; 2026 - {text.layout.footer}
        </footer>
      </div>
    </>
  )
}
