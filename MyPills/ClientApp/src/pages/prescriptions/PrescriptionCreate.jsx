import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { formatValidationError, requestJson } from '../../api/apiClient'

function PrescriptionCreateContent() {
  const navigate = useNavigate()
  const [date, setDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

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
      const { response, data } = await requestJson('/api/prescriptions', {
        method: 'POST',
        body: JSON.stringify({
          date,
          expiryDate
        })
      })

      if (!response.ok) {
        setError(formatValidationError(data))
        return
      }

      navigate(`/prescriptions/${data.id}`)
    } catch (err) {
      setError(err.message ?? 'Failed to create prescription.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Add Prescription</h2>
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
              <button className="w-100 btn btn-lg btn-primary" type="submit" disabled={saving}>
                {saving ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
          <div className="mt-3">
            <Link to="/prescriptions" className="btn btn-secondary">Back to List</Link>
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

