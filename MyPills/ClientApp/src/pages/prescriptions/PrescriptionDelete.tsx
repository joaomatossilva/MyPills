import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from '../../api/apiClient'
import { formatDateOnly } from '../../utils/dateFormatting'

function PrescriptionDeleteContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [prescription, setPrescription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson(`/api/prescriptions/${id}`)
        if (!response.ok) {
          throw new Error('Failed to load prescription.')
        }

        setPrescription(data)
      } catch (err) {
        setError(err.message ?? 'Failed to load prescription.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  const onDelete = async event => {
    event.preventDefault()
    setError(null)
    setDeleting(true)

    try {
      const { response } = await requestJson(`/api/prescriptions/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete prescription.')
      }

      navigate('/prescriptions')
    } catch (err) {
      setError(err.message ?? 'Failed to delete prescription.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading prescription...</div>
  }

  if (error && !prescription) {
    return <div className="error">{error}</div>
  }

  if (!prescription) {
    return <div className="error">Prescription not found.</div>
  }

  return (
    <div className="container my-5">
      <h1>Delete</h1>
      <h3>Are you sure you want to delete this?</h3>
      <div>
        <h4>Prescription</h4>
        <hr />
        <dl className="row">
          <dt className="col-sm-2">Date</dt>
          <dd className="col-sm-10">{formatDateOnly(prescription.date)}</dd>
          <dt className="col-sm-2">Expiry Date</dt>
          <dd className="col-sm-10">{formatDateOnly(prescription.expiryDate)}</dd>
        </dl>

        {error && <div className="text-danger mb-3">{error}</div>}

        <form onSubmit={onDelete}>
          <button className="btn btn-danger" type="submit" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <span className="ms-2">
            <Link to="/prescriptions">Back to List</Link>
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

