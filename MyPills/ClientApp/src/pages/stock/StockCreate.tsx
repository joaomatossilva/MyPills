import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { formatValidationError, requestJson } from '../../api/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import { useProfile } from '../../contexts/ProfileContext'
import type { CreateStockEntryResponse, MedicinesResponse, MedicineListItem, ValidationErrorResponse } from '../../types/api'

const stockEntryTypes = [1, 2, 3, 4]

function StockCreateContent() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [medicines, setMedicines] = useState<MedicineListItem[]>([])
  const [medicineId, setMedicineId] = useState(searchParams.get('medicineId') ?? '')
  const [quantity, setQuantity] = useState('1')
  const [type, setType] = useState('1')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { text } = useLanguage()
  const { selectedProfile, loading: profileLoading } = useProfile()

  useEffect(() => {
    const load = async () => {
      if (!selectedProfile?.canEdit) {
        setMedicines([])
        setMedicineId('')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          editableOnly: 'true',
          profileId: selectedProfile.id
        })
        const { response, data } = await requestJson<MedicinesResponse>(`/api/medicines?${params.toString()}`)
        if (!response.ok) {
          throw new Error(text.medicines.failedList)
        }

        const items = data?.medicines ?? []
        setMedicines(items)
        setMedicineId(currentMedicineId => {
          if (items.some(item => item.id === currentMedicineId)) {
            return currentMedicineId
          }

          const requestedMedicineId = searchParams.get('medicineId')
          if (requestedMedicineId && items.some(item => item.id === requestedMedicineId)) {
            return requestedMedicineId
          }

          return items[0]?.id ?? ''
        })
      } catch (err) {
        setError((err as Error).message ?? text.stock.failedLoadForm)
      } finally {
        setLoading(false)
      }
    }

    if (!profileLoading) {
      void load()
    }
  }, [profileLoading, searchParams, selectedProfile, text.medicines.failedList, text.stock.failedLoadForm])

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

    if (!stockEntryTypes.includes(parsedType)) {
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

      if (data?.requiresPrescriptionDeduction) {
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

  if (loading || profileLoading) {
    return <div className="loading">{text.common.loadingForm}</div>
  }

  if (!selectedProfile) {
    return (
      <div className="container my-5">
        <div className="alert alert-info">{text.profiles.selectionRequired}</div>
        <Link to="/profiles" className="btn btn-secondary">{text.layout.profiles}</Link>
      </div>
    )
  }

  if (!selectedProfile.canEdit) {
    return (
      <div className="container my-5">
        <div className="alert alert-warning">{text.profiles.readOnlySelected}</div>
        <Link to="/profiles" className="btn btn-secondary">{text.layout.profiles}</Link>
      </div>
    )
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
            {error ? <div className="text-danger mb-3">{error}</div> : null}
            <div className="form-floating mb-3">
              <input className="form-control" value={selectedProfile.name} readOnly disabled />
              <label className="form-label">{text.profiles.selectedProfile}</label>
            </div>
            <div className="form-floating mb-3">
              <select className="form-select" value={medicineId} onChange={event => setMedicineId(event.target.value)}>
                {medicines.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <label className="form-label">{text.stock.medicine}</label>
            </div>
            {medicines.length === 0 ? <div className="alert alert-info">{text.medicines.empty}</div> : null}
            <div className="form-floating mb-3">
              <input className="form-control" type="number" min="1" value={quantity} onChange={event => setQuantity(event.target.value)} />
              <label className="form-label">{text.stock.quantity}</label>
            </div>
            <div className="form-floating mb-3">
              <select className="form-select" value={type} onChange={event => setType(event.target.value)}>
                <option value="1">{text.stock.box}</option>
                <option value="2">{text.stock.increase}</option>
                <option value="3">{text.stock.decrease}</option>
                <option value="4">{text.stock.set}</option>
              </select>
              <label className="form-label">{text.stock.type}</label>
            </div>
            <div className="form-floating">
              <button className="w-100 btn btn-lg btn-primary" type="submit" disabled={saving || !medicineId}>
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
