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
    <div className="container my-5">
      <h2 className="mb-4">Overview</h2>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {medicines.map(item => (
          <div className="col" key={item.medicineId}>
            <div className="card h-100 shadow-sm">
              <h5 className="card-header fw-bold">{item.name}</h5>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Remaining Pills
                    <span className="badge bg-success rounded-pill">{item.availableQuantity}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Estimated Finish
                    <span className="text-primary fw-semibold">
                      {new Date(item.estimatedDate).toLocaleDateString()}
                    </span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Prescriptions
                    <span className="badge bg-secondary rounded-pill">{item.boxesInPrescription}</span>
                  </li>
                </ul>
              </div>
              <div className="card-footer bg-white border-top-0 pb-3">
                <a
                  className="btn btn-outline-primary btn-sm w-100"
                  href={`/Stock/Create?id=${item.medicineId}`}
                >
                  + Add Stock
                </a>
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
