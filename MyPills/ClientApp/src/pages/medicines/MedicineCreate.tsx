import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson, formatValidationError } from './medicinesApi'
import { useLanguage } from '../../contexts/LanguageContext'
import { useProfile } from '../../contexts/ProfileContext'
import type { MedicineDetails, ValidationErrorResponse } from '../../types/api'

function MedicineCreateContent() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [boxSize, setBoxSize] = useState('')
  const [dailyConsumption, setDailyConsumption] = useState('1')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { text } = useLanguage()
  const { selectedProfile, loading } = useProfile()

  const onSubmit = async event => {
    event.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    const parsedBoxSize = Number(boxSize)
    const parsedDailyConsumption = Number(dailyConsumption)

    if (!selectedProfile) {
      setError(text.profiles.selectionRequired)
      return
    }

    if (!trimmedName) {
      setError(text.medicines.validation.nameRequired)
      return
    }

    if (!Number.isInteger(parsedBoxSize) || parsedBoxSize <= 0) {
      setError(text.medicines.validation.boxSizePositive)
      return
    }

    if (!Number.isInteger(parsedDailyConsumption) || parsedDailyConsumption <= 0) {
      setError(text.medicines.validation.dailyConsumptionPositive)
      return
    }

    setSaving(true)
    try {
      const { response, data } = await requestJson<MedicineDetails>('/api/medicines', {
        method: 'POST',
        body: JSON.stringify({
          profileId: selectedProfile.id,
          name: trimmedName,
          boxSize: parsedBoxSize,
          dailyConsumption: parsedDailyConsumption
        })
      })

      if (!response.ok) {
        setError(formatValidationError(data as ValidationErrorResponse | null))
        return
      }

      navigate(`/medicines/${data?.id}`)
    } catch (err) {
      setError((err as Error).message ?? text.medicines.failedCreate)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading mb-3">{text.common.loadingForm}</div>
  }

  if (!selectedProfile) {
    return (
      <div className="container my-5">
        <div className="alert alert-info">{text.profiles.selectionRequired}</div>
        <Link to="/profiles" className="btn btn-secondary">{text.layout.profiles}</Link>
      </div>
    )
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">{text.medicines.createTitle}</h2>
      <div className="row">
        <div className="col-md-4">
          <form onSubmit={onSubmit}>
            {error ? <div className="text-danger mb-3">{error}</div> : null}
            <div className="form-floating mb-3">
              <input className="form-control" value={selectedProfile.name} readOnly disabled />
              <label className="form-label">{text.profiles.selectedProfile}</label>
            </div>
            <div className="form-floating mb-3">
              <input className="form-control" value={name} onChange={event => setName(event.target.value)} placeholder="Name" />
              <label className="form-label">{text.medicines.name}</label>
            </div>
            <div className="form-floating mb-3">
              <input className="form-control" type="number" min="1" value={boxSize} onChange={event => setBoxSize(event.target.value)} placeholder="Box Size" />
              <label className="form-label">{text.medicines.boxSize}</label>
            </div>
            <div className="form-floating mb-3">
              <input className="form-control" type="number" min="1" value={dailyConsumption} onChange={event => setDailyConsumption(event.target.value)} placeholder="Daily Consumption" />
              <label className="form-label">{text.medicines.dailyConsumption}</label>
            </div>
            <div>
              <button className="w-100 btn btn-lg btn-primary" type="submit" disabled={saving}>
                {saving ? `${text.common.create}...` : text.common.create}
              </button>
            </div>
          </form>
          <div className="mt-3">
            <Link to="/medicines" className="btn btn-secondary">{text.common.backToList}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MedicineCreate() {
  return (
    <ProtectedRoute>
      <MedicineCreateContent />
    </ProtectedRoute>
  )
}
