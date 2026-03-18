import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from '../../api/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import { formatDateTime } from '../../utils/dateFormatting'
import { getStockEntryTypeLabel } from '../../utils/stockEntryTypeLabels'
import type { StockEntriesResponse, StockEntryListItem } from '../../types/api'

function StockListContent() {
  const [stockEntries, setStockEntries] = useState<StockEntryListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { text, locale } = useLanguage()

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson<StockEntriesResponse>('/api/stock')
        if (!response.ok) {
          throw new Error(text.stock.failedList)
        }

        setStockEntries(data?.stockEntries ?? [])
      } catch (err) {
        setError((err as Error).message ?? text.stock.failedList)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [text.stock.failedList])

  if (loading) {
    return <div className="loading">{text.stock.loadingList}</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">{text.stock.title}</h2>
      <p>
        <Link to="/stock/new" className="btn btn-success">
          <i className="fa-solid fa-plus"></i> <span>{text.stock.add}</span>
        </Link>
      </p>

      {stockEntries.length === 0 ? (
        <div className="alert alert-info">{text.stock.empty}</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>{text.stock.medicine}</th>
              <th>{text.stock.date}</th>
              <th>{text.stock.quantity}</th>
              <th>{text.stock.type}</th>
            </tr>
          </thead>
          <tbody>
            {stockEntries.map(item => (
              <tr key={item.id}>
                <td>
                  <Link to={`/stock/${item.id}`}>{item.medicineName}</Link>
                </td>
                <td>{formatDateTime(item.date, locale)}</td>
                <td>{item.quantity}</td>
                <td>{getStockEntryTypeLabel(item.type, text.stock)}</td>
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

