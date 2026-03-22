import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from './medicinesApi'
import { useLanguage } from '../../contexts/LanguageContext'
import type { MedicineDetails } from '../../types/api'

function MedicineDeleteContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [medicine, setMedicine] = useState<MedicineDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const { text } = useLanguage()

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson<MedicineDetails>(`/api/medicines/${id}`)
        if (!response.ok) {
          throw new Error(text.medicines.failedDetails)
        }

        setMedicine(data ?? null)
      } catch (err) {
        setError((err as Error).message ?? text.medicines.failedDetails)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, text.medicines.failedDetails])

  const onDelete = async event => {
    event.preventDefault()
    setDeleting(true)
    setError(null)

    try {
      const { response } = await requestJson(`/api/medicines/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(text.medicines.failedDelete)
      }

      navigate('/medicines')
    } catch (err) {
      setError((err as Error).message ?? text.medicines.failedDelete)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="loading">{text.medicines.loadingDelete}</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (!medicine) {
    return <div className="error">{text.medicines.notFound}</div>
  }

  return (
    <div className="container my-5">
      <h1>{text.common.delete}</h1>
      <h3>{text.medicines.deletePrompt}</h3>
      <div>
        <h4>{text.medicines.entityLabel}</h4>
        <hr />
        <dl className="row">
          <dt className="col-sm-2">{text.medicines.name}</dt>
          <dd className="col-sm-10">{medicine.name}</dd>
          <dt className="col-sm-2">{text.medicines.boxSize}</dt>
          <dd className="col-sm-10">{medicine.boxSize}</dd>
          <dt className="col-sm-2">{text.medicines.dailyConsumption}</dt>
          <dd className="col-sm-10">{medicine.dailyConsumption}</dd>
        </dl>

        {error && <div className="text-danger mb-3">{error}</div>}

        <form onSubmit={onDelete}>
          <button className="btn btn-danger" type="submit" disabled={deleting}>
            {deleting ? `${text.common.delete}...` : text.common.delete}
          </button>
          <span className="ms-2">
            <Link to="/medicines">{text.common.backToList}</Link>
          </span>
        </form>
      </div>
    </div>
  )
}

export default function MedicineDelete() {
  return (
    <ProtectedRoute>
      <MedicineDeleteContent />
    </ProtectedRoute>
  )
}

