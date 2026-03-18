import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { formatValidationError, requestJson } from '../../api/apiClient'
import { formatDateOnly } from '../../utils/dateFormatting'

function StockPrescriptionDeductionContent() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const medicineId = searchParams.get('medicineId') ?? ''
  const boxes = searchParams.get('boxes') ?? ''
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      if (!medicineId || !boxes) {
        setError('Medicine and box count are required.')
        setLoading(false)
        return
      }

      try {
        const { response, data } = await requestJson(`/api/stock/prescription-deductions?medicineId=${medicineId}&boxes=${boxes}`)
        if (!response.ok) {
          throw new Error('Failed to load prescription deductions.')
        }

        const items = data?.prescriptions ?? []
        if (items.length === 0) {
          navigate('/overview', { replace: true })
          return
        }

        setPrescriptions(items)
      } catch (err) {
        setError(err.message ?? 'Failed to load prescription deductions.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [boxes, medicineId, navigate])

  const updateQuantity = (prescriptionId, quantity) => {
    setPrescriptions(currentItems =>
      currentItems.map(item =>
        item.prescriptionId === prescriptionId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const onSubmit = async event => {
    event.preventDefault()
    setError(null)

    const requestPrescriptions = []
    for (const item of prescriptions) {
      const parsedQuantity = Number(item.quantity)
      if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
        setError('Each deduction quantity must be zero or a positive whole number.')
        return
      }

      requestPrescriptions.push({
        prescriptionId: item.prescriptionId,
        quantity: parsedQuantity
      })
    }

    setSaving(true)
    try {
      const { response, data } = await requestJson('/api/stock/prescription-deductions', {
        method: 'POST',
        body: JSON.stringify({
          medicineId,
          prescriptions: requestPrescriptions
        })
      })

      if (!response.ok) {
        setError(formatValidationError(data))
        return
      }

      navigate('/overview')
    } catch (err) {
      setError(err.message ?? 'Failed to apply prescription deductions.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading prescription deductions...</div>
  }

  if (error && prescriptions.length === 0) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Prescription Deductions</h2>
      <div className="row">
        <div className="col-md-5">
          <form onSubmit={onSubmit}>
            {error && <div className="text-danger mb-3">{error}</div>}
            {prescriptions.map(item => (
              <div className="form-floating mb-3" key={item.prescriptionId}>
                <input
                  className="form-control"
                  type="number"
                  min="0"
                  value={item.quantity}
                  onChange={event => updateQuantity(item.prescriptionId, event.target.value)}
                />
                <label className="form-label">
                  {formatDateOnly(item.date)} ({item.available} Available)
                </label>
              </div>
            ))}
            <div className="form-floating">
              <button className="w-100 btn btn-lg btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Submit'}
              </button>
            </div>
          </form>

          <div className="mt-3">
            <Link to="/overview" className="btn btn-secondary">Back to Overview</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StockPrescriptionDeduction() {
  return (
    <ProtectedRoute>
      <StockPrescriptionDeductionContent />
    </ProtectedRoute>
  )
}
