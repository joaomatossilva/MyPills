import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function Home() {
  const { isAuthenticated, username } = useAuth()
  const { text } = useLanguage()

  return (
    <div>
      <h1>{text.home.title}</h1>
      <p>{text.home.subtitle}</p>
      
      {isAuthenticated ? (
        <div className="success">
          <p>{text.home.loggedIn(username)}</p>
          <p>{text.home.loggedInHint}</p>
        </div>
      ) : (
        <div className="error">
          <p>{text.home.notLoggedIn}</p>
          <p>{text.home.notLoggedInHint}</p>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2>{text.home.aboutTitle}</h2>
        <p>{text.home.aboutDescription}</p>
      </div>
    </div>
  )
}

