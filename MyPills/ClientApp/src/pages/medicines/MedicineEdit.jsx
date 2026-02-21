import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson, formatValidationError } from './medicinesApi'

function MedicineEditContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [boxSize, setBoxSize] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson(`/api/medicines/${id}`)
        if (!response.ok) {
          throw new Error('Failed to load medicine.')
        }

        setName(data.name ?? '')
        setBoxSize(String(data.boxSize ?? ''))
      } catch (err) {
        setError(err.message ?? 'Failed to load medicine.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  const onSubmit = async event => {
    event.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    const parsedBoxSize = Number(boxSize)

    if (!trimmedName) {
      setError('Name is required.')
      return
    }

    if (!Number.isInteger(parsedBoxSize) || parsedBoxSize <= 0) {
      setError('Box size must be a positive whole number.')
      return
    }

    setSaving(true)
    try {
      const { response, data } = await requestJson(`/api/medicines/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: trimmedName,
          boxSize: parsedBoxSize
        })
      })

      if (!response.ok) {
        setError(formatValidationError(data))
        return
      }

      navigate(`/medicines/${id}`)
    } catch (err) {
      setError(err.message ?? 'Failed to update medicine.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading medicine...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Edit Medicine</h2>
      <div className="row">
        <div className="col-md-4">
          <form onSubmit={onSubmit}>
            {error && <div className="text-danger mb-3">{error}</div>}
            <div className="form-floating mb-3">
              <input
                className="form-control"
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder="Name"
              />
              <label className="form-label">Name</label>
            </div>
            <div className="form-floating mb-3">
              <input
                className="form-control"
                type="number"
                min="1"
                value={boxSize}
                onChange={event => setBoxSize(event.target.value)}
                placeholder="Box Size"
              />
              <label className="form-label">Box Size</label>
            </div>
            <div>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
          <div className="mt-3">
            <Link to={`/medicines/${id}`} className="btn btn-secondary">Back to Details</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MedicineEdit() {
  return (
    <ProtectedRoute>
      <MedicineEditContent />
    </ProtectedRoute>
  )
}

