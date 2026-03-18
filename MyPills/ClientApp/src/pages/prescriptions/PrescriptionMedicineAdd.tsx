import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { formatValidationError, requestJson } from '../../api/apiClient'
import type { MedicinesResponse, MedicineListItem, PrescriptionDetails, ValidationErrorResponse } from '../../types/api'

function PrescriptionMedicineAddContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [medicines, setMedicines] = useState<MedicineListItem[]>([])
  const [medicineId, setMedicineId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [consumedQuantity, setConsumedQuantity] = useState('0')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [{ response: medicinesResponse, data: medicinesData }, { response: prescriptionResponse }] = await Promise.all([
          requestJson<MedicinesResponse>('/api/medicines'),
          requestJson<PrescriptionDetails>(`/api/prescriptions/${id}`)
        ])

        if (!medicinesResponse.ok) {
          throw new Error('Failed to load medicines.')
        }

        if (!prescriptionResponse.ok) {
          throw new Error('Failed to load prescription.')
        }

        const items = medicinesData?.medicines ?? []
        setMedicines(items)
        setMedicineId(items[0]?.id ?? '')
      } catch (err) {
        setError(err.message ?? 'Failed to load form.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  const onSubmit = async event => {
    event.preventDefault()
    setError(null)

    const parsedQuantity = Number(quantity)
    const parsedConsumedQuantity = Number(consumedQuantity)

    if (!medicineId) {
      setError('Medicine is required.')
      return
    }

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
      const { response, data } = await requestJson<PrescriptionDetails>(`/api/prescriptions/${id}/medicines`, {
        method: 'POST',
        body: JSON.stringify({
          medicineId,
          quantity: parsedQuantity,
          consumedQuantity: parsedConsumedQuantity
        })
      })

      if (!response.ok) {
        setError(formatValidationError(data as ValidationErrorResponse | null))
        return
      }

      navigate(`/prescriptions/${id}`)
    } catch (err) {
      setError(err.message ?? 'Failed to add medicine to prescription.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading form...</div>
  }

  if (error && medicines.length === 0) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Add Medicine to Prescription</h2>
      <div className="row">
        <div className="col-md-4">
          <form onSubmit={onSubmit}>
            {error && <div className="text-danger mb-3">{error}</div>}
            <div className="form-floating mb-3">
              <select
                className="form-select"
                value={medicineId}
                onChange={event => setMedicineId(event.target.value)}
              >
                {medicines.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
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
                {saving ? 'Saving...' : 'Add Medicine'}
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

export default function PrescriptionMedicineAdd() {
  return (
    <ProtectedRoute>
      <PrescriptionMedicineAddContent />
    </ProtectedRoute>
  )
}

