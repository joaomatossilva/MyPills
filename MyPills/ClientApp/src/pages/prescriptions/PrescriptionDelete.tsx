import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from '../../api/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import { formatDateOnly } from '../../utils/dateFormatting'

function PrescriptionDeleteContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [prescription, setPrescription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)
  const { text, locale } = useLanguage()

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson(`/api/prescriptions/${id}`)
        if (!response.ok) {
          throw new Error(text.prescriptions.failedDetails)
        }

        setPrescription(data)
      } catch (err) {
        setError((err as Error).message ?? text.prescriptions.failedDetails)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, text.prescriptions.failedDetails])

  const onDelete = async event => {
    event.preventDefault()
    setError(null)
    setDeleting(true)

    try {
      const { response } = await requestJson(`/api/prescriptions/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(text.prescriptions.failedDelete)
      }

      navigate('/prescriptions')
    } catch (err) {
      setError((err as Error).message ?? text.prescriptions.failedDelete)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="loading">{text.prescriptions.loadingDelete}</div>
  }

  if (error && !prescription) {
    return <div className="error">{error}</div>
  }

  if (!prescription) {
    return <div className="error">{text.prescriptions.notFound}</div>
  }

  return (
    <div className="container my-5">
      <h1>{text.prescriptions.deleteTitle}</h1>
      <h3>{text.prescriptions.deletePrompt}</h3>
      <div>
        <h4>{text.prescriptions.entityLabel}</h4>
        <hr />
        <dl className="row">
          <dt className="col-sm-2">{text.prescriptions.date}</dt>
          <dd className="col-sm-10">{formatDateOnly(prescription.date, locale)}</dd>
          <dt className="col-sm-2">{text.prescriptions.expiryDate}</dt>
          <dd className="col-sm-10">{formatDateOnly(prescription.expiryDate, locale)}</dd>
        </dl>

        {error && <div className="text-danger mb-3">{error}</div>}

        <form onSubmit={onDelete}>
          <button className="btn btn-danger" type="submit" disabled={deleting}>
            {deleting ? `${text.common.delete}...` : text.common.delete}
          </button>
          <span className="ms-2">
            <Link to="/prescriptions">{text.common.backToList}</Link>
          </span>
        </form>
      </div>
    </div>
  )
}

export default function PrescriptionDelete() {
  return (
    <ProtectedRoute>
      <PrescriptionDeleteContent />
    </ProtectedRoute>
  )
}

