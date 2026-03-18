import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from '../../api/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import { formatDateTime } from '../../utils/dateFormatting'

function getStockEntryTypeLabel(type: string, boxLabel: string, manualLabel: string) {
  if (type === 'Box') {
    return boxLabel
  }

  if (type === 'Manual') {
    return manualLabel
  }

  return type
}

function StockDetailsContent() {
  const { id } = useParams()
  const [stockEntry, setStockEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { text, locale } = useLanguage()

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson(`/api/stock/${id}`)
        if (!response.ok) {
          throw new Error(text.stock.failedDetails)
        }

        setStockEntry(data)
      } catch (err) {
        setError((err as Error).message ?? text.stock.failedDetails)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, text.stock.failedDetails])

  if (loading) {
    return <div className="loading">{text.stock.loadingDetails}</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (!stockEntry) {
    return <div className="error">{text.stock.notFound}</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">{text.stock.detailsTitle}</h2>
      <dl className="row mb-5">
        <dt className="col-sm-2">{text.stock.medicine}</dt>
        <dd className="col-sm-10">{stockEntry.medicineName}</dd>
        <dt className="col-sm-2">{text.stock.date}</dt>
        <dd className="col-sm-10">{formatDateTime(stockEntry.date, locale)}</dd>
        <dt className="col-sm-2">{text.stock.quantity}</dt>
        <dd className="col-sm-10">{stockEntry.quantity}</dd>
        <dt className="col-sm-2">{text.stock.type}</dt>
        <dd className="col-sm-10">{getStockEntryTypeLabel(stockEntry.type, text.stock.box, text.stock.manual)}</dd>
      </dl>

      <div>
        <Link to="/stock" className="btn btn-secondary">{text.common.backToList}</Link>
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

