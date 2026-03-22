import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { formatValidationError, requestJson } from '../../api/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import type { ProfileDetails, ValidationErrorResponse } from '../../types/api'

function getPermissionLabel(permission: string, text: ReturnType<typeof useLanguage>['text']) {
  return permission === 'edit' ? text.profiles.editPermission : text.profiles.viewPermission
}

function ProfileDetailsContent() {
  const { id } = useParams()
  const [profile, setProfile] = useState<ProfileDetails | null>(null)
  const [userCode, setUserCode] = useState('')
  const [permission, setPermission] = useState('view')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { text } = useLanguage()

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

  useEffect(() => {
    void load()
  }, [id, text.profiles.failedDetails])

  const onShare = async event => {
    event.preventDefault()
    setError(null)

    const trimmedCode = userCode.trim()
    if (!trimmedCode) {
      setError(text.profiles.validation.userCodeRequired)
      return
    }

    if (!/^[A-Za-z0-9]{6}$/.test(trimmedCode)) {
      setError(text.profiles.validation.userCodeInvalid)
      return
    }

    if (!permission) {
      setError(text.profiles.validation.permissionRequired)
      return
    }

    setSaving(true)
    try {
      const { response, data } = await requestJson(`/api/profiles/${id}/shares`, {
        method: 'POST',
        body: JSON.stringify({
          userCode: trimmedCode,
          permission
        })
      })

      if (!response.ok) {
        setError(formatValidationError(data as ValidationErrorResponse | null))
        return
      }

      setUserCode('')
      await load()
    } catch (err) {
      setError((err as Error).message ?? text.profiles.failedShare)
    } finally {
      setSaving(false)
    }
  }

  const revokeShare = async shareId => {
    setError(null)
    try {
      const { response, data } = await requestJson(`/api/profiles/${id}/shares/${shareId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        setError(formatValidationError(data as ValidationErrorResponse | null))
        return
      }

      await load()
    } catch (err) {
      setError((err as Error).message ?? text.profiles.failedRevoke)
    }
  }

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
        {profile.isOwner ? (
          <Link to={`/profiles/${id}/edit`}>
            <i className="fa-regular fa-pen-to-square"></i>
          </Link>
        ) : null}
      </h2>

      {error ? <div className="text-danger mb-3">{error}</div> : null}

      <dl className="row mb-4">
        <dt className="col-sm-2">{text.profiles.name}</dt>
        <dd className="col-sm-10">{profile.name}</dd>
        <dt className="col-sm-2">{text.profiles.owner}</dt>
        <dd className="col-sm-10">{profile.ownerUsername}</dd>
        <dt className="col-sm-2">{text.profiles.permission}</dt>
        <dd className="col-sm-10">{getPermissionLabel(profile.permission, text)}</dd>
        <dt className="col-sm-2">{text.profiles.isDefault}</dt>
        <dd className="col-sm-10">{profile.isDefault ? 'Yes' : 'No'}</dd>
      </dl>

      {profile.isOwner ? (
        <>
          <div className="card mb-4">
            <div className="card-body">
              <h3 className="h5 mb-3">{text.profiles.shareProfile}</h3>
              <form onSubmit={onShare}>
                <div className="row g-3 align-items-end">
                  <div className="col-md-4">
                    <label className="form-label">{text.profiles.userCode}</label>
                    <input className="form-control" value={userCode} onChange={event => setUserCode(event.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">{text.profiles.permission}</label>
                    <select className="form-select" value={permission} onChange={event => setPermission(event.target.value)}>
                      <option value="view">{text.profiles.viewPermission}</option>
                      <option value="edit">{text.profiles.editPermission}</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? `${text.common.save}...` : text.common.save}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <h3 className="mb-3">{text.profiles.sharedWith}</h3>
          {profile.shares.length === 0 ? (
            <div className="alert alert-info">{text.profiles.noShares}</div>
          ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>{text.profiles.sharedWith}</th>
                  <th>{text.profiles.userCode}</th>
                  <th>{text.profiles.permission}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {profile.shares.map(share => (
                  <tr key={share.id}>
                    <td>{share.sharedWithUsername}</td>
                    <td>{share.sharedWithUserCode}</td>
                    <td>{getPermissionLabel(share.permission, text)}</td>
                    <td className="text-end">
                      <button type="button" className="btn btn-link link-danger p-0" onClick={() => revokeShare(share.id)}>
                        {text.common.delete}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : null}

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
