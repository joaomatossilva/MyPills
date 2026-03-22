import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from '../../api/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import type { OwnedProfilesResponse, SharedProfilesResponse, UserCodeResponse, OwnedProfileItem, SharedProfileItem } from '../../types/api'

function getPermissionLabel(permission: string, text: ReturnType<typeof useLanguage>['text']) {
  return permission === 'edit' ? text.profiles.editPermission : text.profiles.viewPermission
}

function ProfilesListContent() {
  const [ownedProfiles, setOwnedProfiles] = useState<OwnedProfileItem[]>([])
  const [sharedProfiles, setSharedProfiles] = useState<SharedProfileItem[]>([])
  const [shareCode, setShareCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const { text } = useLanguage()

  const load = async () => {
    try {
      const [ownedResult, sharedResult, codeResult] = await Promise.all([
        requestJson<OwnedProfilesResponse>('/api/profiles'),
        requestJson<SharedProfilesResponse>('/api/profiles/shared'),
        requestJson<UserCodeResponse>('/api/profiles/user-code')
      ])

      if (!ownedResult.response.ok || !sharedResult.response.ok || !codeResult.response.ok) {
        throw new Error(text.profiles.failedList)
      }

      setOwnedProfiles(ownedResult.data?.profiles ?? [])
      setSharedProfiles(sharedResult.data?.profiles ?? [])
      setShareCode(codeResult.data?.shareCode ?? '')
    } catch (err) {
      setError((err as Error).message ?? text.profiles.failedList)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [text.profiles.failedList])

  const regenerateCode = async () => {
    setRegenerating(true)
    setError(null)

    try {
      const { response, data } = await requestJson<UserCodeResponse>('/api/profiles/user-code/regenerate', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error(text.profiles.failedCode)
      }

      setShareCode(data?.shareCode ?? '')
    } catch (err) {
      setError((err as Error).message ?? text.profiles.failedCode)
    } finally {
      setRegenerating(false)
    }
  }

  if (loading) {
    return <div className="loading">{text.common.loading}</div>
  }

  if (error && ownedProfiles.length === 0 && sharedProfiles.length === 0) {
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

      <div className="card mb-4">
        <div className="card-body d-flex justify-content-between align-items-center gap-3 flex-wrap">
          <div>
            <div className="text-muted">{text.profiles.yourCode}</div>
            <div className="fs-4 fw-semibold">{shareCode || '-'}</div>
          </div>
          <button type="button" className="btn btn-outline-primary" onClick={regenerateCode} disabled={regenerating}>
            {regenerating ? `${text.profiles.regenerateCode}...` : text.profiles.regenerateCode}
          </button>
        </div>
      </div>

      <h3 className="mb-3">{text.profiles.ownedSection}</h3>
      {ownedProfiles.length === 0 ? (
        <div className="alert alert-info">{text.profiles.emptyOwned}</div>
      ) : (
        <table className="table table-striped mb-5">
          <thead>
            <tr>
              <th>{text.profiles.name}</th>
              <th>{text.profiles.isDefault}</th>
              <th>{text.profiles.shareCount}</th>
            </tr>
          </thead>
          <tbody>
            {ownedProfiles.map(profile => (
              <tr key={profile.id}>
                <td><Link to={`/profiles/${profile.id}`}>{profile.name}</Link></td>
                <td>{profile.isDefault ? 'Yes' : 'No'}</td>
                <td>{profile.shareCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 className="mb-3">{text.profiles.sharedSection}</h3>
      {sharedProfiles.length === 0 ? (
        <div className="alert alert-info">{text.profiles.emptyShared}</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>{text.profiles.name}</th>
              <th>{text.profiles.owner}</th>
              <th>{text.profiles.permission}</th>
            </tr>
          </thead>
          <tbody>
            {sharedProfiles.map(profile => (
              <tr key={profile.id}>
                <td><Link to={`/profiles/${profile.id}`}>{profile.name}</Link></td>
                <td>{profile.ownerUsername}</td>
                <td>{getPermissionLabel(profile.permission, text)}</td>
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
