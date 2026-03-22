import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { formatValidationError, requestJson } from '../../api/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import type { EditableProfileItem, EditableProfilesResponse, PrescriptionDetails, ValidationErrorResponse } from '../../types/api'

function PrescriptionCreateContent() {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<EditableProfileItem[]>([])
  const [profileId, setProfileId] = useState('')
  const [date, setDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { text } = useLanguage()

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson<EditableProfilesResponse>('/api/profiles/editable')
        if (!response.ok) {
          throw new Error(text.profiles.failedList)
        }

        const items = data?.profiles ?? []
        setProfiles(items)
        setProfileId(items[0]?.id ?? '')
      } catch (err) {
        setError((err as Error).message ?? text.profiles.failedList)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [text.profiles.failedList])

  const onSubmit = async event => {
    event.preventDefault()
    setError(null)

    if (!date) {
      setError(text.prescriptions.validation.dateRequired)
      return
    }

    if (!expiryDate) {
      setError(text.prescriptions.validation.expiryDateRequired)
      return
    }

    if (expiryDate < date) {
      setError(text.prescriptions.validation.expiryDateBeforeDate)
      return
    }

    if (!profileId) {
      setError(text.profiles.failedList)
      return
    }

    setSaving(true)
    try {
      const { response, data } = await requestJson<PrescriptionDetails>('/api/prescriptions', {
        method: 'POST',
        body: JSON.stringify({
          profileId,
          date,
          expiryDate
        })
      })

      if (!response.ok) {
        setError(formatValidationError(data as ValidationErrorResponse | null))
        return
      }

      navigate(`/prescriptions/${data?.id}`)
    } catch (err) {
      setError((err as Error).message ?? text.prescriptions.failedCreate)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">{text.prescriptions.createTitle}</h2>
      <div className="row">
        <div className="col-md-4">
          <form onSubmit={onSubmit}>
            {error ? <div className="text-danger mb-3">{error}</div> : null}
            <div className="form-floating mb-3">
              <select className="form-select" value={profileId} onChange={event => setProfileId(event.target.value)}>
                {profiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
              <label className="form-label">{text.prescriptions.profile}</label>
            </div>
            <div className="form-floating mb-3">
              <input className="form-control" type="date" value={date} onChange={event => setDate(event.target.value)} />
              <label className="form-label">{text.prescriptions.date}</label>
            </div>
            <div className="form-floating mb-3">
              <input className="form-control" type="date" value={expiryDate} onChange={event => setExpiryDate(event.target.value)} />
              <label className="form-label">{text.prescriptions.expiryDate}</label>
            </div>
            <div>
              <button className="w-100 btn btn-lg btn-primary" type="submit" disabled={saving || loading || !profileId}>
                {saving ? `${text.common.create}...` : text.common.create}
              </button>
            </div>
          </form>
          <div className="mt-3">
            <Link to="/prescriptions" className="btn btn-secondary">{text.common.backToList}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PrescriptionCreate() {
  return (
    <ProtectedRoute>
      <PrescriptionCreateContent />
    </ProtectedRoute>
  )
}
