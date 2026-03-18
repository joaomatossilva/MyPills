import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from '../../api/apiClient'
import { formatDateTime } from '../../utils/dateFormatting'

function StockListContent() {
  const [stockEntries, setStockEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson('/api/stock')
        if (!response.ok) {
          throw new Error('Failed to load stock entries.')
        }

        setStockEntries(data?.stockEntries ?? [])
      } catch (err) {
        setError(err.message ?? 'Failed to load stock entries.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return <div className="loading">Loading stock entries...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Stock Entries</h2>
      <p>
        <Link to="/stock/new" className="btn btn-success">
          <i className="fa-solid fa-plus"></i> <span>Add Stock Entry</span>
        </Link>
      </p>

      {stockEntries.length === 0 ? (
        <div className="alert alert-info">No stock entries yet. Add one to get started.</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Date</th>
              <th>Quantity</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {stockEntries.map(item => (
              <tr key={item.id}>
                <td>
                  <Link to={`/stock/${item.id}`}>{item.medicineName}</Link>
                </td>
                <td>{formatDateTime(item.date)}</td>
                <td>{item.quantity}</td>
                <td>{item.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default function StockList() {
  return (
    <ProtectedRoute>
      <StockListContent />
    </ProtectedRoute>
  )
}

