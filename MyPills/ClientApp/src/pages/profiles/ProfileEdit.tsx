import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { formatValidationError, requestJson } from '../../api/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import type { ProfileDetails, ValidationErrorResponse } from '../../types/api'

function ProfileEditContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { text } = useLanguage()

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson<ProfileDetails>(`/api/profiles/${id}`)
        if (!response.ok || !data) {
          throw new Error(text.profiles.failedDetails)
        }

        setName(data.name)
      } catch (err) {
        setError((err as Error).message ?? text.profiles.failedDetails)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id, text.profiles.failedDetails])

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
      const { response, data } = await requestJson<ProfileDetails>(`/api/profiles/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: trimmedName })
      })

      if (!response.ok) {
        setError(formatValidationError(data as ValidationErrorResponse | null))
        return
      }

      navigate(`/profiles/${id}`)
    } catch (err) {
      setError((err as Error).message ?? text.profiles.failedUpdate)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">{text.common.loadingForm}</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">{text.profiles.editTitle}</h2>
      <div className="row">
        <div className="col-md-4">
          <form onSubmit={onSubmit}>
            {error ? <div className="text-danger mb-3">{error}</div> : null}
            <div className="form-floating mb-3">
              <input className="form-control" value={name} onChange={event => setName(event.target.value)} />
              <label className="form-label">{text.profiles.name}</label>
            </div>
            <button className="w-100 btn btn-lg btn-primary" type="submit" disabled={saving}>
              {saving ? `${text.common.save}...` : text.common.save}
            </button>
          </form>
          <div className="mt-3">
            <Link to={`/profiles/${id}`} className="btn btn-secondary">{text.common.backToDetails}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfileEdit() {
  return (
    <ProtectedRoute>
      <ProfileEditContent />
    </ProtectedRoute>
  )
}
