import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from './medicinesApi'
import type { MedicineListItem, MedicinesResponse } from '../../types/api'

function MedicinesListContent() {
  const [medicines, setMedicines] = useState<MedicineListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson<MedicinesResponse>('/api/medicines')
        if (!response.ok) {
          throw new Error('Failed to load medicines.')
        }

        setMedicines(data?.medicines ?? [])
      } catch (err) {
        setError(err.message ?? 'Failed to load medicines.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return <div className="loading">Loading medicines...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Manage Medicines</h2>
      <p>
        <Link to="/medicines/new" className="btn btn-success">
          <i className="fa-solid fa-plus"></i> <span>Add New Medicine</span>
        </Link>
      </p>

      {medicines.length === 0 ? (
        <div className="alert alert-info">No medicines yet. Add one to get started.</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {medicines.map(item => (
              <tr key={item.id}>
                <td>
                  <Link to={`/medicines/${item.id}`}>{item.name}</Link>
                </td>
                <td className="text-end">
                  <Link to={`/medicines/${item.id}/edit`} className="me-3">
                    <i className="fa-regular fa-pen-to-square"></i>
                  </Link>
                  <Link to={`/medicines/${item.id}/delete`} className="link-danger">
                    <i className="fa-solid fa-xmark"></i>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default function MedicinesList() {
  return (
    <ProtectedRoute>
      <MedicinesListContent />
    </ProtectedRoute>
  )
}

