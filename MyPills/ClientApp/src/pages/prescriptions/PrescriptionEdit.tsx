import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { formatValidationError, requestJson } from '../../api/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import type { PrescriptionDetails, ValidationErrorResponse } from '../../types/api'

function PrescriptionEditContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [date, setDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const { text } = useLanguage()

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson<PrescriptionDetails>(`/api/prescriptions/${id}`)
        if (!response.ok) {
          throw new Error(text.prescriptions.failedDetails)
        }

        setDate(data.date ?? '')
        setExpiryDate(data.expiryDate ?? '')
      } catch (err) {
        setError((err as Error).message ?? text.prescriptions.failedDetails)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, text.prescriptions.failedDetails])

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

    setSaving(true)
    try {
      const { response, data } = await requestJson<PrescriptionDetails>(`/api/prescriptions/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          date,
          expiryDate
        })
      })

      if (!response.ok) {
        setError(formatValidationError(data as ValidationErrorResponse | null))
        return
      }

      navigate(`/prescriptions/${id}`)
    } catch (err) {
      setError((err as Error).message ?? text.prescriptions.failedUpdate)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">{text.prescriptions.loadingDetails}</div>
  }

  if (error && !saving && !date && !expiryDate) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">{text.prescriptions.editTitle}</h2>
      <div className="row">
        <div className="col-md-4">
          <form onSubmit={onSubmit}>
            {error && <div className="text-danger mb-3">{error}</div>}
            <div className="form-floating mb-3">
              <input
                className="form-control"
                type="date"
                value={date}
                onChange={event => setDate(event.target.value)}
              />
              <label className="form-label">{text.prescriptions.date}</label>
            </div>
            <div className="form-floating mb-3">
              <input
                className="form-control"
                type="date"
                value={expiryDate}
                onChange={event => setExpiryDate(event.target.value)}
              />
              <label className="form-label">{text.prescriptions.expiryDate}</label>
            </div>
            <div>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? `${text.common.save}...` : text.common.save}
              </button>
            </div>
          </form>
          <div className="mt-3">
            <Link to={`/prescriptions/${id}`} className="btn btn-secondary">{text.common.backToDetails}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PrescriptionEdit() {
  return (
    <ProtectedRoute>
      <PrescriptionEditContent />
    </ProtectedRoute>
  )
}

