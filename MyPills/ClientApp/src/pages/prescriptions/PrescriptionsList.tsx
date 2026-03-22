import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from '../../api/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import { useProfile } from '../../contexts/ProfileContext'
import { formatDateOnly } from '../../utils/dateFormatting'
import type { PrescriptionListItem, PrescriptionsResponse } from '../../types/api'

function PrescriptionsListContent() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { text, locale } = useLanguage()
  const { selectedProfile, loading: profileLoading } = useProfile()

  useEffect(() => {
    const load = async () => {
      if (!selectedProfile) {
        setPrescriptions([])
        setError(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({ profileId: selectedProfile.id })
        const { response, data } = await requestJson<PrescriptionsResponse>(`/api/prescriptions?${params.toString()}`)
        if (!response.ok) {
          throw new Error(text.prescriptions.failedList)
        }

        setPrescriptions(data?.prescriptions ?? [])
      } catch (err) {
        setError((err as Error).message ?? text.prescriptions.failedList)
      } finally {
        setLoading(false)
      }
    }

    if (!profileLoading) {
      void load()
    }
  }, [profileLoading, selectedProfile, text.prescriptions.failedList])

  if (loading || profileLoading) {
    return <div className="loading">{text.prescriptions.loadingList}</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4 gap-3 flex-wrap">
        <h2 className="mb-0">{text.prescriptions.title}</h2>
        {selectedProfile?.canEdit ? (
          <Link to="/prescriptions/new" className="btn btn-success">
            <i className="fa-solid fa-plus"></i> <span>{text.prescriptions.add}</span>
          </Link>
        ) : null}
      </div>

      {!selectedProfile ? <div className="alert alert-info">{text.profiles.selectionRequired}</div> : null}
      {selectedProfile && !selectedProfile.canEdit ? <div className="alert alert-warning">{text.profiles.readOnlySelected}</div> : null}

      {selectedProfile ? prescriptions.length === 0 ? (
        <div className="alert alert-info">{text.prescriptions.empty}</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>{text.prescriptions.date}</th>
              <th>{text.prescriptions.expiryDate}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map(item => (
              <tr key={item.id}>
                <td>
                  <Link to={`/prescriptions/${item.id}`}>{formatDateOnly(item.date, locale)}</Link>
                </td>
                <td>{formatDateOnly(item.expiryDate, locale)}</td>
                <td className="text-end">
                  {item.canEdit ? (
                    <>
                      <Link to={`/prescriptions/${item.id}/edit`} className="me-3">
                        <i className="fa-regular fa-pen-to-square"></i>
                      </Link>
                      <Link to={`/prescriptions/${item.id}/delete`} className="link-danger">
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

export default function PrescriptionsList() {
  return (
    <ProtectedRoute>
      <PrescriptionsListContent />
    </ProtectedRoute>
  )
}
