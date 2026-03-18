import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from '../../api/apiClient'
import { formatDateOnly } from '../../utils/dateFormatting'

function PrescriptionDetailsContent() {
  const { id } = useParams()
  const [prescription, setPrescription] = useState(null)
  const [loading, setLoading] = useState(true)
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

  if (loading) {
    return <div className="loading">Loading prescription...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (!prescription) {
    return <div className="error">Prescription not found.</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">
        Prescription Details{' '}
        <Link to={`/prescriptions/${id}/edit`}>
          <i className="fa-regular fa-pen-to-square"></i>
        </Link>
      </h2>

      <dl className="row mb-5">
        <dt className="col-sm-2">Date</dt>
        <dd className="col-sm-10">{formatDateOnly(prescription.date)}</dd>
        <dt className="col-sm-2">Expiry Date</dt>
        <dd className="col-sm-10">{formatDateOnly(prescription.expiryDate)}</dd>
      </dl>

      <h2 className="mb-4">Medicines</h2>
      <p>
        <Link to={`/prescriptions/${id}/medicines/add`} className="btn btn-success">
          <i className="fa-solid fa-plus"></i> <span>Add Medicine</span>
        </Link>
      </p>

      {prescription.medicines?.length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Quantity</th>
              <th>Consumed Quantity</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {prescription.medicines.map(item => (
              <tr key={item.medicineId}>
                <td>{item.medicineName}</td>
                <td>{item.quantity}</td>
                <td>{item.consumedQuantity}</td>
                <td className="text-end">
                  <Link to={`/prescriptions/${id}/medicines/${item.medicineId}/edit`} className="me-3">
                    Edit
                  </Link>
                  <Link to={`/prescriptions/${id}/medicines/${item.medicineId}/delete`} className="link-danger">
                    Delete
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="alert alert-info">No medicines added to this prescription yet.</div>
      )}

      <div className="mt-3">
        <Link to="/prescriptions" className="btn btn-secondary">Back to List</Link>
      </div>
    </div>
  )
}

export default function PrescriptionDetails() {
  return (
    <ProtectedRoute>
      <PrescriptionDetailsContent />
    </ProtectedRoute>
  )
}

