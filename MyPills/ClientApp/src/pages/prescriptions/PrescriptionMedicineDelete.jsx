import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from '../../api/apiClient'

function PrescriptionMedicineDeleteContent() {
  const { id, medicineId } = useParams()
  const navigate = useNavigate()
  const [medicine, setMedicine] = useState(null)
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

        const selectedMedicine = data?.medicines?.find(item => item.medicineId === medicineId)
        if (!selectedMedicine) {
          throw new Error('Prescription medicine not found.')
        }

        setMedicine(selectedMedicine)
      } catch (err) {
        setError(err.message ?? 'Failed to load prescription medicine.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, medicineId])

  const onDelete = async event => {
    event.preventDefault()
    setError(null)
    setDeleting(true)

    try {
      const { response } = await requestJson(`/api/prescriptions/${id}/medicines/${medicineId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete prescription medicine.')
      }

      navigate(`/prescriptions/${id}`)
    } catch (err) {
      setError(err.message ?? 'Failed to delete prescription medicine.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading prescription medicine...</div>
  }

  if (error && !medicine) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="container my-5">
      <h1>Delete</h1>
      <h3>Are you sure you want to remove this medicine from the prescription?</h3>
      <div>
        <h4>Prescription Medicine</h4>
        <hr />
        <dl className="row">
          <dt className="col-sm-2">Medicine</dt>
          <dd className="col-sm-10">{medicine?.medicineName}</dd>
          <dt className="col-sm-2">Quantity</dt>
          <dd className="col-sm-10">{medicine?.quantity}</dd>
          <dt className="col-sm-2">Consumed Quantity</dt>
          <dd className="col-sm-10">{medicine?.consumedQuantity}</dd>
        </dl>

        {error && <div className="text-danger mb-3">{error}</div>}

        <form onSubmit={onDelete}>
          <button className="btn btn-danger" type="submit" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <span className="ms-2">
            <Link to={`/prescriptions/${id}`}>Back to Details</Link>
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

