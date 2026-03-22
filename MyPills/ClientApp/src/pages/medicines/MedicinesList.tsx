import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from './medicinesApi'
import { useLanguage } from '../../contexts/LanguageContext'
import type { MedicineListItem, MedicinesResponse } from '../../types/api'

function MedicinesListContent() {
  const [medicines, setMedicines] = useState<MedicineListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { text } = useLanguage()

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson<MedicinesResponse>('/api/medicines')
        if (!response.ok) {
          throw new Error(text.medicines.failedList)
        }

        setMedicines(data?.medicines ?? [])
      } catch (err) {
        setError((err as Error).message ?? text.medicines.failedList)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [text.medicines.failedList])

  if (loading) {
    return <div className="loading">{text.medicines.loadingList}</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">{text.medicines.title}</h2>
      <p>
        <Link to="/medicines/new" className="btn btn-success">
          <i className="fa-solid fa-plus"></i> <span>{text.medicines.add}</span>
        </Link>
      </p>

      {medicines.length === 0 ? (
        <div className="alert alert-info">{text.medicines.empty}</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>{text.medicines.profile}</th>
              <th>{text.medicines.name}</th>
              <th>{text.medicines.boxSize}</th>
              <th>{text.medicines.dailyConsumption}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {medicines.map(item => (
              <tr key={item.id}>
                <td>{item.profileName}</td>
                <td>
                  <Link to={`/medicines/${item.id}`}>{item.name}</Link>
                </td>
                <td>{item.boxSize}</td>
                <td>{item.dailyConsumption}</td>
                <td className="text-end">
                  {item.canEdit ? (
                    <>
                      <Link to={`/medicines/${item.id}/edit`} className="me-3">
                        <i className="fa-regular fa-pen-to-square"></i>
                      </Link>
                      <Link to={`/medicines/${item.id}/delete`} className="link-danger">
                        <i className="fa-solid fa-xmark"></i>
                      </Link>
                    </>
                  ) : null}
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

