import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from '../../api/apiClient'
import { formatDateTime } from '../../utils/dateFormatting'

function StockDetailsContent() {
  const { id } = useParams()
  const [stockEntry, setStockEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson(`/api/stock/${id}`)
        if (!response.ok) {
          throw new Error('Failed to load stock entry.')
        }

        setStockEntry(data)
      } catch (err) {
        setError(err.message ?? 'Failed to load stock entry.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  if (loading) {
    return <div className="loading">Loading stock entry...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (!stockEntry) {
    return <div className="error">Stock entry not found.</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Stock Entry Details</h2>
      <dl className="row mb-5">
        <dt className="col-sm-2">Medicine</dt>
        <dd className="col-sm-10">{stockEntry.medicineName}</dd>
        <dt className="col-sm-2">Date</dt>
        <dd className="col-sm-10">{formatDateTime(stockEntry.date)}</dd>
        <dt className="col-sm-2">Quantity</dt>
        <dd className="col-sm-10">{stockEntry.quantity}</dd>
        <dt className="col-sm-2">Type</dt>
        <dd className="col-sm-10">{stockEntry.type}</dd>
      </dl>

      <div>
        <Link to="/stock" className="btn btn-secondary">Back to List</Link>
      </div>
    </div>
  )
}

export default function StockDetails() {
  return (
    <ProtectedRoute>
      <StockDetailsContent />
    </ProtectedRoute>
  )
}

