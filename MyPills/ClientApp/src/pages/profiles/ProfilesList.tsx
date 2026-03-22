import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from '../../api/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import { useProfile } from '../../contexts/ProfileContext'
import type { OwnedProfilesResponse, OwnedProfileItem } from '../../types/api'

function ProfilesListContent() {
  const [profiles, setProfiles] = useState<OwnedProfileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { text } = useLanguage()
  const { selectedProfileId, selectProfile, refreshProfiles } = useProfile()

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson<OwnedProfilesResponse>('/api/profiles')
        if (!response.ok) {
          throw new Error(text.profiles.failedList)
        }

        setProfiles(data?.profiles ?? [])
        await refreshProfiles()
      } catch (err) {
        setError((err as Error).message ?? text.profiles.failedList)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [refreshProfiles, text.profiles.failedList])

  const renderSelectionAction = (profileId: string) => {
    const isSelected = selectedProfileId === profileId

    return (
      <button
        type="button"
        className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-primary'}`}
        disabled={isSelected}
        onClick={() => selectProfile(profileId)}
      >
        {isSelected ? text.profiles.selected : text.profiles.select}
      </button>
    )
  }

  if (loading) {
    return <div className="loading">{text.common.loading}</div>
  }

  if (error && profiles.length === 0) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4 gap-3 flex-wrap">
        <h2 className="mb-0">{text.profiles.title}</h2>
        <Link to="/profiles/new" className="btn btn-success">
          <i className="fa-solid fa-plus"></i> <span>{text.profiles.add}</span>
        </Link>
      </div>

      {error ? <div className="text-danger mb-3">{error}</div> : null}

      <h3 className="mb-3">{text.profiles.ownedSection}</h3>
      {profiles.length === 0 ? (
        <div className="alert alert-info">{text.profiles.emptyOwned}</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>{text.profiles.name}</th>
              <th>{text.profiles.isDefault}</th>
              <th className="text-end">{text.profiles.selectedProfile}</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(profile => (
              <tr key={profile.id} className={selectedProfileId === profile.id ? 'table-primary' : undefined}>
                <td><Link to={`/profiles/${profile.id}`}>{profile.name}</Link></td>
                <td>{profile.isDefault ? 'Yes' : 'No'}</td>
                <td className="text-end">{renderSelectionAction(profile.id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default function ProfilesList() {
  return (
    <ProtectedRoute>
      <ProfilesListContent />
    </ProtectedRoute>
  )
}
