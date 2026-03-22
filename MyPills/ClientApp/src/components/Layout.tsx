import type { NavLinkRenderProps } from 'react-router-dom'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

const desktopSidebarMediaQuery = '(min-width: 992px)'

function isDesktopViewport() {
  return typeof window !== 'undefined' && window.matchMedia(desktopSidebarMediaQuery).matches
}

export default function Layout() {
  const location = useLocation()
  const { isAuthenticated, username, login, logout, loading } = useAuth()
  const { language, setLanguage, text, availableLanguages } = useLanguage()
  const [isDesktop, setIsDesktop] = useState(isDesktopViewport)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(isDesktopViewport)
  const originalBodyClassNameRef = useRef<string | null>(null)
  const getNavLinkClass = ({ isActive }: NavLinkRenderProps) => `nav-link${isActive ? ' active' : ''}`
  const sidebarToggleLabel = isSidebarExpanded ? text.layout.collapseSidebar : text.layout.expandSidebar

  useEffect(() => {
    const mediaQueryList = window.matchMedia(desktopSidebarMediaQuery)
    const handleViewportChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches)
      setIsSidebarExpanded(event.matches)
    }

    setIsDesktop(mediaQueryList.matches)
    setIsSidebarExpanded(mediaQueryList.matches)
    mediaQueryList.addEventListener('change', handleViewportChange)

    return () => {
      mediaQueryList.removeEventListener('change', handleViewportChange)
    }
  }, [])

  useEffect(() => {
    if (!isDesktop) {
      setIsSidebarExpanded(false)
    }
  }, [isDesktop, location.pathname])

  const bodyClassName = [
    'layout-fixed',
    'sidebar-expand-lg',
    'bg-body-tertiary',
    isDesktop
      ? (isSidebarExpanded ? null : 'sidebar-collapse')
      : (isSidebarExpanded ? 'sidebar-open' : null)
  ]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    originalBodyClassNameRef.current ??= document.body.className
    document.body.className = bodyClassName

    return () => {
      document.body.className = originalBodyClassNameRef.current ?? ''
    }
  }, [bodyClassName])

  const toggleSidebar = () => {
    setIsSidebarExpanded(previousValue => !previousValue)
  }

  const closeMobileSidebar = () => {
    if (!isDesktop) {
      setIsSidebarExpanded(false)
    }
  }

  return (
    <>
      <div className="skip-links">
        <a href="#main" className="skip-link">{text.layout.skipToContent}</a>
        <a href="#navigation" className="skip-link">{text.layout.skipToNavigation}</a>
      </div>
      <div className={`app-wrapper app-shell${isSidebarExpanded ? ' app-shell--sidebar-open' : ''}`}>
        <nav className="app-header app-topbar navbar navbar-expand bg-body">
          <div className="container-fluid app-topbar-content">
            <div className="app-topbar-title">
              <button
                type="button"
                className="btn btn-link nav-link app-sidebar-toggle"
                aria-label={sidebarToggleLabel}
                aria-controls="app-sidebar"
                aria-expanded={isSidebarExpanded}
                onClick={toggleSidebar}
              >
                <i className="fa-solid fa-bars" aria-hidden="true"></i>
              </button>
              <Link to="/" className="app-header-brand" onClick={closeMobileSidebar}>My Pills</Link>
            </div>
            <ul className="navbar-nav d-none d-md-flex" role="navigation" aria-label="Navigation 1">
              <li className="nav-item">
                <Link to="/" className="nav-link">{text.layout.home}</Link>
              </li>
            </ul>
            <ul className="navbar-nav ms-auto app-topbar-actions">
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

        {!isDesktop && isSidebarExpanded ? (
          <button
            type="button"
            className="app-sidebar-backdrop"
            aria-label={text.layout.collapseSidebar}
            onClick={closeMobileSidebar}
          />
        ) : null}

        <aside
          id="app-sidebar"
          className="app-sidebar app-sidebar-panel bg-body-secondary shadow"
          data-bs-theme="dark"
          aria-hidden={!isDesktop && !isSidebarExpanded}
        >
          <div className="sidebar-brand">
            <Link to="/" className="brand-link app-brand-link" onClick={closeMobileSidebar}>
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
                  <NavLink to="/" end className={getNavLinkClass} onClick={closeMobileSidebar}>
                    <i className="nav-icon bi bi-download"></i>
                    <p>{text.layout.home}</p>
                  </NavLink>
                </li>
                 <li className="nav-item">
                  <NavLink to="/profiles" className={getNavLinkClass} onClick={closeMobileSidebar}>
                    <i className="nav-icon bi bi-download"></i>
                    <p>{text.layout.profiles}</p>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/medicines" className={getNavLinkClass} onClick={closeMobileSidebar}>
                    <i className="nav-icon bi bi-download"></i>
                    <p>{text.layout.medicines}</p>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/stock" className={getNavLinkClass} onClick={closeMobileSidebar}>
                    <i className="nav-icon bi bi-download"></i>
                    <p>{text.layout.stock}</p>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/prescriptions" className={getNavLinkClass} onClick={closeMobileSidebar}>
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
