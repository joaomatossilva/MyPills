import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from '../../api/apiClient'
import { formatDateOnly } from '../../utils/dateFormatting'

function PrescriptionsListContent() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson('/api/prescriptions')
        if (!response.ok) {
          throw new Error('Failed to load prescriptions.')
        }

        setPrescriptions(data?.prescriptions ?? [])
      } catch (err) {
        setError(err.message ?? 'Failed to load prescriptions.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return <div className="loading">Loading prescriptions...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Prescriptions</h2>
      <p>
        <Link to="/prescriptions/new" className="btn btn-success">
          <i className="fa-solid fa-plus"></i> <span>Add Prescription</span>
        </Link>
      </p>

      {prescriptions.length === 0 ? (
        <div className="alert alert-info">No prescriptions yet. Add one to get started.</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Expiry Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map(item => (
              <tr key={item.id}>
                <td>
                  <Link to={`/prescriptions/${item.id}`}>{formatDateOnly(item.date)}</Link>
                </td>
                <td>{formatDateOnly(item.expiryDate)}</td>
                <td className="text-end">
                  <Link to={`/prescriptions/${item.id}/edit`} className="me-3">
                    <i className="fa-regular fa-pen-to-square"></i>
                  </Link>
                  <Link to={`/prescriptions/${item.id}/delete`} className="link-danger">
                    <i className="fa-solid fa-xmark"></i>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default function PrescriptionsList() {
  return (
    <ProtectedRoute>
      <PrescriptionsListContent />
    </ProtectedRoute>
  )
}

