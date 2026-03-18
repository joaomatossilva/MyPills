import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { formatValidationError, requestJson } from '../../api/apiClient'

function PrescriptionMedicineEditContent() {
  const { id, medicineId } = useParams()
  const navigate = useNavigate()
  const [medicine, setMedicine] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [consumedQuantity, setConsumedQuantity] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson(`/api/prescriptions/${id}`)
        if (!response.ok) {
          throw new Error('Failed to load prescription.')
        }

        const selectedMedicine = data?.medicines?.find(item => item.medicineId === medicineId)
        if (!selectedMedicine) {
          throw new Error('Prescription medicine not found.')
        }

        setMedicine(selectedMedicine)
        setQuantity(String(selectedMedicine.quantity))
        setConsumedQuantity(String(selectedMedicine.consumedQuantity))
      } catch (err) {
        setError(err.message ?? 'Failed to load prescription medicine.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, medicineId])

  const onSubmit = async event => {
    event.preventDefault()
    setError(null)

    const parsedQuantity = Number(quantity)
    const parsedConsumedQuantity = Number(consumedQuantity)

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setError('Quantity must be a positive whole number.')
      return
    }

    if (!Number.isInteger(parsedConsumedQuantity) || parsedConsumedQuantity < 0) {
      setError('Consumed quantity must be zero or a positive whole number.')
      return
    }

    if (parsedConsumedQuantity > parsedQuantity) {
      setError('Consumed quantity cannot exceed quantity.')
      return
    }

    setSaving(true)
    try {
      const { response, data } = await requestJson(`/api/prescriptions/${id}/medicines/${medicineId}`, {
        method: 'PUT',
        body: JSON.stringify({
          quantity: parsedQuantity,
          consumedQuantity: parsedConsumedQuantity
        })
      })

      if (!response.ok) {
        setError(formatValidationError(data))
        return
      }

      navigate(`/prescriptions/${id}`)
    } catch (err) {
      setError(err.message ?? 'Failed to update prescription medicine.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading prescription medicine...</div>
  }

  if (error && !medicine) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Edit Prescription Medicine</h2>
      <div className="row">
        <div className="col-md-4">
          <form onSubmit={onSubmit}>
            {error && <div className="text-danger mb-3">{error}</div>}
            <div className="form-floating mb-3">
              <input className="form-control" value={medicine?.medicineName ?? ''} disabled />
              <label className="form-label">Medicine</label>
            </div>
            <div className="form-floating mb-3">
              <input
                className="form-control"
                type="number"
                min="1"
                value={quantity}
                onChange={event => setQuantity(event.target.value)}
              />
              <label className="form-label">Quantity</label>
            </div>
            <div className="form-floating mb-3">
              <input
                className="form-control"
                type="number"
                min="0"
                value={consumedQuantity}
                onChange={event => setConsumedQuantity(event.target.value)}
              />
              <label className="form-label">Consumed Quantity</label>
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

export default function PrescriptionMedicineEdit() {
  return (
    <ProtectedRoute>
      <PrescriptionMedicineEditContent />
    </ProtectedRoute>
  )
}

