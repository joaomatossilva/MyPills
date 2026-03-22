import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from '../../api/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import { useProfile } from '../../contexts/ProfileContext'
import { formatDateTime } from '../../utils/dateFormatting'
import { getStockEntryTypeLabel } from '../../utils/stockEntryTypeLabels'
import type { StockEntriesResponse, StockEntryListItem } from '../../types/api'

function StockListContent() {
  const [stockEntries, setStockEntries] = useState<StockEntryListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { text, locale } = useLanguage()
  const { selectedProfile, loading: profileLoading } = useProfile()

  useEffect(() => {
    const load = async () => {
      if (!selectedProfile) {
        setStockEntries([])
        setError(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({ profileId: selectedProfile.id })
        const { response, data } = await requestJson<StockEntriesResponse>(`/api/stock?${params.toString()}`)
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

    if (!profileLoading) {
      void load()
    }
  }, [profileLoading, selectedProfile, text.stock.failedList])

  if (loading || profileLoading) {
    return <div className="loading">{text.stock.loadingList}</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4 gap-3 flex-wrap">
        <h2 className="mb-0">{text.stock.title}</h2>
        {selectedProfile ? (
          <Link to="/stock/new" className="btn btn-success">
            <i className="fa-solid fa-plus"></i> <span>{text.stock.add}</span>
          </Link>
        ) : null}
      </div>

      {!selectedProfile ? <div className="alert alert-info">{text.profiles.selectionRequired}</div> : null}
      {selectedProfile ? stockEntries.length === 0 ? (
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
      ) : null}
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
