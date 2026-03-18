import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { formatValidationError, requestJson } from '../../api/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import type { CreateStockEntryResponse, MedicinesResponse, MedicineListItem, ValidationErrorResponse } from '../../types/api'

function StockCreateContent() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [medicines, setMedicines] = useState<MedicineListItem[]>([])
  const [medicineId, setMedicineId] = useState(searchParams.get('medicineId') ?? '')
  const [quantity, setQuantity] = useState('1')
  const [type, setType] = useState('1')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const { text } = useLanguage()

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson<MedicinesResponse>('/api/medicines')
        if (!response.ok) {
          throw new Error(text.medicines.failedList)
        }

        const items = data?.medicines ?? []
        setMedicines(items)
        setMedicineId(currentMedicineId => currentMedicineId || items[0]?.id || '')
      } catch (err) {
        setError((err as Error).message ?? text.stock.failedLoadForm)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [text.medicines.failedList, text.stock.failedLoadForm])

  const onSubmit = async event => {
    event.preventDefault()
    setError(null)

    const parsedQuantity = Number(quantity)
    const parsedType = Number(type)

    if (!medicineId) {
      setError(text.stock.validation.medicineRequired)
      return
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setError(text.stock.validation.quantityPositive)
      return
    }

    if (![1, 2].includes(parsedType)) {
      setError(text.stock.validation.typeRequired)
      return
    }

    setSaving(true)
    try {
      const { response, data } = await requestJson<CreateStockEntryResponse>('/api/stock', {
        method: 'POST',
        body: JSON.stringify({
          medicineId,
          quantity: parsedQuantity,
          type: parsedType
        })
      })

      if (!response.ok) {
        setError(formatValidationError(data as ValidationErrorResponse | null))
        return
      }

      if (data.requiresPrescriptionDeduction) {
        navigate(`/stock/deductions?medicineId=${data.medicineId}&boxes=${data.deductionBoxes}`)
        return
      }

      navigate('/overview')
    } catch (err) {
      setError((err as Error).message ?? text.stock.failedCreate)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">{text.common.loadingForm}</div>
  }

  if (error && medicines.length === 0) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">{text.stock.createTitle}</h2>
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
              <label className="form-label">{text.stock.medicine}</label>
            </div>
            <div className="form-floating mb-3">
              <input
                className="form-control"
                type="number"
                min="1"
                value={quantity}
                onChange={event => setQuantity(event.target.value)}
              />
              <label className="form-label">{text.stock.quantity}</label>
            </div>
            <div className="form-floating mb-3">
              <select
                className="form-select"
                value={type}
                onChange={event => setType(event.target.value)}
              >
                <option value="1">{text.stock.box}</option>
                <option value="2">{text.stock.manual}</option>
              </select>
              <label className="form-label">{text.stock.type}</label>
            </div>
            <div className="form-floating">
              <button className="w-100 btn btn-lg btn-primary" type="submit" disabled={saving}>
                {saving ? `${text.common.create}...` : text.common.create}
              </button>
            </div>
          </form>
          <div className="mt-3">
            <Link to="/stock" className="btn btn-secondary">{text.common.backToList}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StockCreate() {
  return (
    <ProtectedRoute>
      <StockCreateContent />
    </ProtectedRoute>
  )
}

