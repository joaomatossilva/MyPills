import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from './medicinesApi'
import { useLanguage } from '../../contexts/LanguageContext'
import { getStockEntryTypeLabel } from '../../utils/stockEntryTypeLabels'
import type { MedicineDetails, MedicineStockEntry } from '../../types/api'

function MedicineDetailsContent() {
  const { id } = useParams()
  const [medicine, setMedicine] = useState<MedicineDetails | null>(null)
  const [stockEntries, setStockEntries] = useState<MedicineStockEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { text, locale } = useLanguage()

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson<MedicineDetails>(`/api/medicines/${id}`)
        if (!response.ok) {
          throw new Error(text.medicines.failedDetails)
        }

        setMedicine(data)
        setStockEntries(data.stockEntries ?? [])
      } catch (err) {
        setError((err as Error).message ?? text.medicines.failedDetails)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, text.medicines.failedDetails])

  if (loading) {
    return <div className="loading">{text.medicines.loadingDetails}</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (!medicine) {
    return <div className="error">{text.medicines.notFound}</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">
        {text.medicines.detailsTitle}{' '}
        <Link to={`/medicines/${id}/edit`}>
          <i className="fa-regular fa-pen-to-square"></i>
        </Link>
      </h2>

      <dl className="row mb-5">
        <dt className="col-sm-2">{text.medicines.name}</dt>
        <dd className="col-sm-10">{medicine.name}</dd>
        <dt className="col-sm-2">{text.medicines.boxSize}</dt>
        <dd className="col-sm-10">{medicine.boxSize}</dd>
        <dt className="col-sm-2">{text.medicines.dailyConsumption}</dt>
        <dd className="col-sm-10">{medicine.dailyConsumption}</dd>
        <dt className="col-sm-2">{text.medicines.stockQuantity}</dt>
        <dd className="col-sm-10">{medicine.stockQuantity}</dd>
        <dt className="col-sm-2">{text.medicines.stockDate}</dt>
        <dd className="col-sm-10">
          {medicine.stockDate ? new Date(medicine.stockDate).toLocaleDateString(locale) : 'N/A'}
        </dd>
      </dl>

      <h2 className="mb-4">{text.medicines.latestStocks}</h2>
      <p>
        <Link className="btn btn-success" to={`/stock/new?medicineId=${id}`}>
          <i className="fa-solid fa-plus"></i> <span>{text.medicines.addStockEntry}</span>
        </Link>
      </p>

      {stockEntries.length === 0 ? (
        <div className="alert alert-info">{text.stock.empty}</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>{text.medicines.date}</th>
              <th>{text.medicines.quantity}</th>
              <th>{text.medicines.type}</th>
            </tr>
          </thead>
          <tbody>
            {stockEntries.map(item => (
              <tr key={item.id}>
                <td>{new Date(item.date).toLocaleDateString(locale)}</td>
                <td>{item.quantity}</td>
                <td>{getStockEntryTypeLabel(item.type, text.stock)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-3">
        <Link to="/medicines" className="btn btn-secondary">{text.common.backToList}</Link>
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

