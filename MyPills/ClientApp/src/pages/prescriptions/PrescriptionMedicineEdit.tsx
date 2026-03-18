import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { formatValidationError, requestJson } from '../../api/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import type { PrescriptionDetails, PrescriptionMedicineItem, ValidationErrorResponse } from '../../types/api'

function PrescriptionMedicineEditContent() {
  const { id, medicineId } = useParams()
  const navigate = useNavigate()
  const [medicine, setMedicine] = useState<PrescriptionMedicineItem | null>(null)
  const [quantity, setQuantity] = useState('')
  const [consumedQuantity, setConsumedQuantity] = useState('')
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

        const selectedMedicine = data?.medicines?.find(item => item.medicineId === medicineId)
        if (!selectedMedicine) {
          throw new Error(text.prescriptions.medicineNotFound)
        }

        setMedicine(selectedMedicine)
        setQuantity(String(selectedMedicine.quantity))
        setConsumedQuantity(String(selectedMedicine.consumedQuantity))
      } catch (err) {
        setError((err as Error).message ?? text.prescriptions.failedLoadMedicine)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, medicineId, text.prescriptions.failedDetails, text.prescriptions.failedLoadMedicine, text.prescriptions.medicineNotFound])

  const onSubmit = async event => {
    event.preventDefault()
    setError(null)

    const parsedQuantity = Number(quantity)
    const parsedConsumedQuantity = Number(consumedQuantity)

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setError(text.prescriptions.validation.quantityPositive)
      return
    }

    if (!Number.isInteger(parsedConsumedQuantity) || parsedConsumedQuantity < 0) {
      setError(text.prescriptions.validation.consumedNonNegative)
      return
    }

    if (parsedConsumedQuantity > parsedQuantity) {
      setError(text.prescriptions.validation.consumedExceedsQuantity)
      return
    }

    setSaving(true)
    try {
      const { response, data } = await requestJson<PrescriptionDetails>(`/api/prescriptions/${id}/medicines/${medicineId}`, {
        method: 'PUT',
        body: JSON.stringify({
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
      setError((err as Error).message ?? text.prescriptions.failedUpdateMedicine)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">{text.prescriptions.loadingMedicine}</div>
  }

  if (error && !medicine) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">{text.prescriptions.editMedicineTitle}</h2>
      <div className="row">
        <div className="col-md-4">
          <form onSubmit={onSubmit}>
            {error && <div className="text-danger mb-3">{error}</div>}
            <div className="form-floating mb-3">
              <input className="form-control" value={medicine?.medicineName ?? ''} disabled />
               <label className="form-label">{text.prescriptions.medicine}</label>
            </div>
            <div className="form-floating mb-3">
              <input
                className="form-control"
                type="number"
                min="1"
                value={quantity}
                onChange={event => setQuantity(event.target.value)}
              />
               <label className="form-label">{text.prescriptions.quantity}</label>
            </div>
            <div className="form-floating mb-3">
              <input
                className="form-control"
                type="number"
                min="0"
                value={consumedQuantity}
                onChange={event => setConsumedQuantity(event.target.value)}
              />
               <label className="form-label">{text.prescriptions.consumedQuantity}</label>
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

export default function PrescriptionMedicineEdit() {
  return (
    <ProtectedRoute>
      <PrescriptionMedicineEditContent />
    </ProtectedRoute>
  )
}

