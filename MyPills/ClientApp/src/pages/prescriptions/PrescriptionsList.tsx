import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from '../../api/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import { formatDateOnly } from '../../utils/dateFormatting'
import type { PrescriptionListItem, PrescriptionsResponse } from '../../types/api'

function PrescriptionsListContent() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { text, locale } = useLanguage()

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson<PrescriptionsResponse>('/api/prescriptions')
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

    load()
  }, [text.prescriptions.failedList])

  if (loading) {
    return <div className="loading">{text.prescriptions.loadingList}</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">{text.prescriptions.title}</h2>
      <p>
        <Link to="/prescriptions/new" className="btn btn-success">
          <i className="fa-solid fa-plus"></i> <span>{text.prescriptions.add}</span>
        </Link>
      </p>

      {prescriptions.length === 0 ? (
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
                  <Link to={`/prescriptions/${item.id}/edit`} className="me-3">
                    <i className="fa-regular fa-pen-to-square"></i>
                  </Link>
                  <Link to={`/prescriptions/${item.id}/delete`} className="link-danger">
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

export default function PrescriptionsList() {
  return (
    <ProtectedRoute>
      <PrescriptionsListContent />
    </ProtectedRoute>
  )
}

