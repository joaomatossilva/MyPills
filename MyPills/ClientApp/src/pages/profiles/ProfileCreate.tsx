import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { formatValidationError, requestJson } from '../../api/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import { useProfile } from '../../contexts/ProfileContext'
import type { ProfileDetails, ValidationErrorResponse } from '../../types/api'

function ProfileCreateContent() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { text } = useLanguage()
  const { refreshProfiles } = useProfile()

  const onSubmit = async event => {
    event.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError(text.profiles.validation.nameRequired)
      return
    }

    setSaving(true)
    try {
      const { response, data } = await requestJson<ProfileDetails>('/api/profiles', {
        method: 'POST',
        body: JSON.stringify({ name: trimmedName })
      })

      if (!response.ok) {
        setError(formatValidationError(data as ValidationErrorResponse | null))
        return
      }

      await refreshProfiles()
      navigate(`/profiles/${data?.id}`)
    } catch (err) {
      setError((err as Error).message ?? text.profiles.failedCreate)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">{text.profiles.createTitle}</h2>
      <div className="row">
        <div className="col-md-4">
          <form onSubmit={onSubmit}>
            {error ? <div className="text-danger mb-3">{error}</div> : null}
            <div className="form-floating mb-3">
              <input className="form-control" value={name} onChange={event => setName(event.target.value)} />
              <label className="form-label">{text.profiles.name}</label>
            </div>
            <button className="w-100 btn btn-lg btn-primary" type="submit" disabled={saving}>
              {saving ? `${text.common.create}...` : text.common.create}
            </button>
          </form>
          <div className="mt-3">
            <Link to="/profiles" className="btn btn-secondary">{text.common.backToList}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfileCreate() {
  return (
    <ProtectedRoute>
      <ProfileCreateContent />
    </ProtectedRoute>
  )
}
