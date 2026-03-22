import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from './medicinesApi'
import { useLanguage } from '../../contexts/LanguageContext'
import { useProfile } from '../../contexts/ProfileContext'
import type { MedicineListItem, MedicinesResponse } from '../../types/api'

function MedicinesListContent() {
  const [medicines, setMedicines] = useState<MedicineListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { text } = useLanguage()
  const { selectedProfile, loading: profileLoading } = useProfile()

  useEffect(() => {
    const load = async () => {
      if (!selectedProfile) {
        setMedicines([])
        setError(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({ profileId: selectedProfile.id })
        const { response, data } = await requestJson<MedicinesResponse>(`/api/medicines?${params.toString()}`)
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

    if (!profileLoading) {
      void load()
    }
  }, [profileLoading, selectedProfile, text.medicines.failedList])

  if (loading || profileLoading) {
    return <div className="loading">{text.medicines.loadingList}</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4 gap-3 flex-wrap">
        <h2 className="mb-0">{text.medicines.title}</h2>
        {selectedProfile ? (
          <Link to="/medicines/new" className="btn btn-success">
            <i className="fa-solid fa-plus"></i> <span>{text.medicines.add}</span>
          </Link>
        ) : null}
      </div>

      {!selectedProfile ? <div className="alert alert-info">{text.profiles.selectionRequired}</div> : null}
      {selectedProfile ? medicines.length === 0 ? (
        <div className="alert alert-info">{text.medicines.empty}</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>{text.medicines.name}</th>
              <th>{text.medicines.boxSize}</th>
              <th>{text.medicines.dailyConsumption}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {medicines.map(item => (
              <tr key={item.id}>
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
      ) : null}
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

