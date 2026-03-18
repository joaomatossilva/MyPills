import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from './medicinesApi'
import type { MedicineDetails, MedicineStockEntry } from '../../types/api'

function MedicineDetailsContent() {
  const { id } = useParams()
  const [medicine, setMedicine] = useState<MedicineDetails | null>(null)
  const [stockEntries, setStockEntries] = useState<MedicineStockEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson<MedicineDetails>(`/api/medicines/${id}`)
        if (!response.ok) {
          throw new Error('Failed to load medicine.')
        }

        setMedicine(data)
        setStockEntries(data.stockEntries ?? [])
      } catch (err) {
        setError(err.message ?? 'Failed to load medicine.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  if (loading) {
    return <div className="loading">Loading medicine...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (!medicine) {
    return <div className="error">Medicine not found.</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">
        Medicine Details{' '}
        <Link to={`/medicines/${id}/edit`}>
          <i className="fa-regular fa-pen-to-square"></i>
        </Link>
      </h2>

      <dl className="row mb-5">
        <dt className="col-sm-2">Name</dt>
        <dd className="col-sm-10">{medicine.name}</dd>
        <dt className="col-sm-2">Box Size</dt>
        <dd className="col-sm-10">{medicine.boxSize}</dd>
        <dt className="col-sm-2">Stock Quantity</dt>
        <dd className="col-sm-10">{medicine.stockQuantity}</dd>
        <dt className="col-sm-2">Stock Date</dt>
        <dd className="col-sm-10">
          {medicine.stockDate ? new Date(medicine.stockDate).toLocaleDateString() : 'N/A'}
        </dd>
      </dl>

      <h2 className="mb-4">Latest Stocks</h2>
      <p>
        <Link className="btn btn-success" to={`/stock/new?medicineId=${id}`}>
          <i className="fa-solid fa-plus"></i> <span>Add Stock Entry</span>
        </Link>
      </p>

      {stockEntries.length === 0 ? (
        <div className="alert alert-info">No stock entries yet.</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Quantity</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {stockEntries.map(item => (
              <tr key={item.id}>
                <td>{new Date(item.date).toLocaleDateString()}</td>
                <td>{item.quantity}</td>
                <td>{item.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-3">
        <Link to="/medicines" className="btn btn-secondary">Back to List</Link>
      </div>
    </div>
  )
}

export default function MedicineDetails() {
  return (
    <ProtectedRoute>
      <MedicineDetailsContent />
    </ProtectedRoute>
  )
}

