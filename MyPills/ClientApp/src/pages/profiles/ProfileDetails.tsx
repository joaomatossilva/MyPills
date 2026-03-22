import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from '../../api/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import type { ProfileDetails } from '../../types/api'

function ProfileDetailsContent() {
  const { id } = useParams()
  const [profile, setProfile] = useState<ProfileDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { text } = useLanguage()

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson<ProfileDetails>(`/api/profiles/${id}`)
        if (!response.ok || !data) {
          throw new Error(text.profiles.failedDetails)
        }

        setProfile(data)
      } catch (err) {
        setError((err as Error).message ?? text.profiles.failedDetails)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id, text.profiles.failedDetails])

  if (loading) {
    return <div className="loading">{text.common.loading}</div>
  }

  if (error && !profile) {
    return <div className="error">{error}</div>
  }

  if (!profile) {
    return <div className="error">{text.common.notFound}</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">
        {text.profiles.detailsTitle}{' '}
        <Link to={`/profiles/${id}/edit`}>
          <i className="fa-regular fa-pen-to-square"></i>
        </Link>
      </h2>

      {error ? <div className="text-danger mb-3">{error}</div> : null}

      <dl className="row mb-4">
        <dt className="col-sm-2">{text.profiles.name}</dt>
        <dd className="col-sm-10">{profile.name}</dd>
        <dt className="col-sm-2">{text.profiles.owner}</dt>
        <dd className="col-sm-10">{profile.ownerUsername}</dd>
        <dt className="col-sm-2">{text.profiles.isDefault}</dt>
        <dd className="col-sm-10">{profile.isDefault ? 'Yes' : 'No'}</dd>
      </dl>

      <div className="mt-3">
        <Link to="/profiles" className="btn btn-secondary">{text.common.backToList}</Link>
      </div>
    </div>
  )
}

export default function ProfileDetailsPage() {
  return (
    <ProtectedRoute>
      <ProfileDetailsContent />
    </ProtectedRoute>
  )
}
