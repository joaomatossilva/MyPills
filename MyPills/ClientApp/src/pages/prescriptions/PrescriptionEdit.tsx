import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { formatValidationError, requestJson } from '../../api/apiClient'
import type { PrescriptionDetails, ValidationErrorResponse } from '../../types/api'

function PrescriptionEditContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [date, setDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson<PrescriptionDetails>(`/api/prescriptions/${id}`)
        if (!response.ok) {
          throw new Error('Failed to load prescription.')
        }

        setDate(data.date ?? '')
        setExpiryDate(data.expiryDate ?? '')
      } catch (err) {
        setError(err.message ?? 'Failed to load prescription.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  const onSubmit = async event => {
    event.preventDefault()
    setError(null)

    if (!date) {
      setError('Date is required.')
      return
    }

    if (!expiryDate) {
      setError('Expiry date is required.')
      return
    }

    if (expiryDate < date) {
      setError('Expiry date cannot be before the prescription date.')
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
      setError(err.message ?? 'Failed to update prescription.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading prescription...</div>
  }

  if (error && !saving && !date && !expiryDate) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Edit Prescription</h2>
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
              <label className="form-label">Date</label>
            </div>
            <div className="form-floating mb-3">
              <input
                className="form-control"
                type="date"
                value={expiryDate}
                onChange={event => setExpiryDate(event.target.value)}
              />
              <label className="form-label">Expiry Date</label>
            </div>
            <div>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
          <div className="mt-3">
            <Link to={`/prescriptions/${id}`} className="btn btn-secondary">Back to Details</Link>
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

