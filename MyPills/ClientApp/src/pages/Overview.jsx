import { useEffect, useState } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'

function OverviewContent() {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/overview', {
          credentials: 'include'
        })

        if (response.status === 401) {
          window.location.href = '/Identity/Account/Login'
          return
        }

        if (!response.ok) {
          throw new Error('Failed to load overview')
        }

        const data = await response.json()
        setMedicines(data.medicines ?? [])
      } catch (err) {
        setError(err.message ?? 'Failed to load overview')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return <div className="loading">Loading overview...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="overview">
      <h2 className="overview-title">Overview</h2>
      <div className="overview-grid">
        {medicines.map(item => (
          <div className="overview-card" key={item.medicineId}>
            <div className="overview-card-header">{item.name}</div>
            <div className="overview-card-body">
              <div className="overview-row">
                <span>Remaining Pills</span>
                <span className="badge badge-success">{item.availableQuantity}</span>
              </div>
              <div className="overview-row">
                <span>Estimated Finish</span>
                <span className="text-primary">{new Date(item.estimatedDate).toLocaleDateString()}</span>
              </div>
              <div className="overview-row">
                <span>Prescriptions</span>
                <span className="badge badge-secondary">{item.boxesInPrescription}</span>
              </div>
            </div>
            <div className="overview-card-footer">
              <a className="btn btn-outline" href={`/Stock/Create?id=${item.medicineId}`}>+ Add Stock</a>
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

