import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from '../../api/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import type { PrescriptionDetails, PrescriptionMedicineItem } from '../../types/api'

function PrescriptionMedicineDeleteContent() {
  const { id, medicineId } = useParams()
  const navigate = useNavigate()
  const [medicine, setMedicine] = useState<PrescriptionMedicineItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
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
      } catch (err) {
        setError((err as Error).message ?? text.prescriptions.failedLoadMedicine)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, medicineId, text.prescriptions.failedDetails, text.prescriptions.failedLoadMedicine, text.prescriptions.medicineNotFound])

  const onDelete = async event => {
    event.preventDefault()
    setError(null)
    setDeleting(true)

    try {
      const { response } = await requestJson(`/api/prescriptions/${id}/medicines/${medicineId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(text.prescriptions.failedDeleteMedicine)
      }

      navigate(`/prescriptions/${id}`)
    } catch (err) {
      setError((err as Error).message ?? text.prescriptions.failedDeleteMedicine)
    } finally {
      setDeleting(false)
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
      <h1>{text.prescriptions.deleteMedicineTitle}</h1>
      <h3>{text.prescriptions.deleteMedicinePrompt}</h3>
      <div>
        <h4>{text.prescriptions.deleteMedicineEntityLabel}</h4>
        <hr />
        <dl className="row">
          <dt className="col-sm-2">{text.prescriptions.medicine}</dt>
          <dd className="col-sm-10">{medicine?.medicineName}</dd>
          <dt className="col-sm-2">{text.prescriptions.quantity}</dt>
          <dd className="col-sm-10">{medicine?.quantity}</dd>
          <dt className="col-sm-2">{text.prescriptions.consumedQuantity}</dt>
          <dd className="col-sm-10">{medicine?.consumedQuantity}</dd>
        </dl>

        {error && <div className="text-danger mb-3">{error}</div>}

        <form onSubmit={onDelete}>
          <button className="btn btn-danger" type="submit" disabled={deleting}>
            {deleting ? `${text.common.delete}...` : text.common.delete}
          </button>
          <span className="ms-2">
            <Link to={`/prescriptions/${id}`}>{text.common.backToDetails}</Link>
          </span>
        </form>
      </div>
    </div>
  )
}

export default function PrescriptionMedicineDelete() {
  return (
    <ProtectedRoute>
      <PrescriptionMedicineDeleteContent />
    </ProtectedRoute>
  )
}

