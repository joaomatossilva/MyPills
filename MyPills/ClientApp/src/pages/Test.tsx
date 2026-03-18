import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

function TestContent() {
  const { username } = useAuth()
  const { text } = useLanguage()

  return (
    <div>
      <h1>{text.test.title}</h1>
      <div className="success">
        <p>{text.test.successTitle}</p>
        <p>{text.test.authenticatedAs(username)}</p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>{text.test.protectedContent}</h2>
        <p>{text.test.protectedDescription}</p>
        
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          <h3>{text.test.technicalDetails}</h3>
          <ul>
            {text.test.details.map(item => (
              <li key={item}>{item}</li>
            ))}
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

