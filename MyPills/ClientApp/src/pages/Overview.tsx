import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import { requestJson } from '../api/apiClient'
import { useLanguage } from '../contexts/LanguageContext'
import type { OverviewMedicine, OverviewResponse } from '../types/api'

function OverviewContent() {
  const [medicines, setMedicines] = useState<OverviewMedicine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { text, locale } = useLanguage()

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson<OverviewResponse>('/api/overview')

        if (!response.ok) {
          throw new Error(text.overview.error)
        }

        setMedicines(data.medicines ?? [])
      } catch (err) {
        setError((err as Error).message ?? text.overview.error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [text.overview.error])

  if (loading) {
    return <div className="loading">{text.overview.loading}</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">{text.overview.title}</h2>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {medicines.map(item => (
          <div className="col" key={item.medicineId}>
            <div className="card h-100 shadow-sm">
              <h5 className="card-header fw-bold">{item.name}</h5>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    {text.overview.remainingPills}
                    <span className="badge bg-success rounded-pill">{item.availableQuantity}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    {text.overview.estimatedFinish}
                    <span className="text-primary fw-semibold">
                      {new Date(item.estimatedDate).toLocaleDateString(locale)}
                    </span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    {text.overview.prescriptions}
                    <span className="badge bg-secondary rounded-pill">{item.boxesInPrescription}</span>
                  </li>
                </ul>
              </div>
              <div className="card-footer bg-white border-top-0 pb-3">
                <Link
                  className="btn btn-outline-primary btn-sm w-100"
                  to={`/stock/new?medicineId=${item.medicineId}`}
                >
                  {text.overview.addStock}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Overview() {
  return (
    <ProtectedRoute>
      <OverviewContent />
    </ProtectedRoute>
  )
}
