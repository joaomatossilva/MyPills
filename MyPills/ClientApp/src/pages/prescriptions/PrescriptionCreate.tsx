import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { formatValidationError, requestJson } from '../../api/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import type { PrescriptionDetails, ValidationErrorResponse } from '../../types/api'

function PrescriptionCreateContent() {
  const navigate = useNavigate()
  const [date, setDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const { text } = useLanguage()

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
      const { response, data } = await requestJson<PrescriptionDetails>('/api/prescriptions', {
        method: 'POST',
        body: JSON.stringify({
          date,
          expiryDate
        })
      })

      if (!response.ok) {
        setError(formatValidationError(data as ValidationErrorResponse | null))
        return
      }

      navigate(`/prescriptions/${data.id}`)
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
              <button className="w-100 btn btn-lg btn-primary" type="submit" disabled={saving}>
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

