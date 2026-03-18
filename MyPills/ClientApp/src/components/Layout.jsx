import { Link, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const { isAuthenticated, username, login, logout, loading } = useAuth()

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
        <a href="#main" className="skip-link">Skip to main content</a>
        <a href="#navigation" className="skip-link">Skip to navigation</a>
      </div>
      <div className="app-wrapper">
        <nav className="app-header navbar navbar-expand bg-body">
          <div className="container-fluid">
            <ul className="navbar-nav" role="navigation" aria-label="Navigation 1">
              <li className="nav-item">
                <a className="nav-link" data-lte-toggle="sidebar" href="#" role="button">
                  <i className="fa-solid fa-list"></i>
                </a>
              </li>
              <li className="nav-item d-none d-md-block">
                <Link to="/" className="nav-link">Home</Link>
              </li>
            </ul>
            <ul className="navbar-nav ms-auto">
              {loading ? (
                <li className="nav-item">
                  <span className="nav-link">Loading...</span>
                </li>
              ) : isAuthenticated ? (
                <>
                  <li className="nav-item">
                    <span className="nav-link">Welcome, {username}</span>
                  </li>
                  <li className="nav-item">
                    <button type="button" className="btn btn-link nav-link" onClick={logout}>Logout</button>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <button type="button" className="btn btn-link nav-link" onClick={login}>Login</button>
                </li>
              )}
            </ul>
          </div>
        </nav>

        <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
          <div className="sidebar-brand">
            <Link to="/" className="brand-link">
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
                  <Link to="/" className="nav-link">
                    <i className="nav-icon bi bi-download"></i>
                    <p>Home</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/medicines" className="nav-link">
                    <i className="nav-icon bi bi-download"></i>
                    <p>Medicines</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/stock" className="nav-link">
                    <i className="nav-icon bi bi-download"></i>
                    <p>Stock</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/prescriptions" className="nav-link">
                    <i className="nav-icon bi bi-download"></i>
                    <p>Prescriptions</p>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        <main className="app-main" role="main" id="main">
          <Outlet />
        </main>

        <footer className="app-footer">
          &copy; 2026 - MyPills
        </footer>
      </div>
    </>
  )
}
