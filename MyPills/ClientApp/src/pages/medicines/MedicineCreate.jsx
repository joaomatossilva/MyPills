import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson, formatValidationError } from './medicinesApi'

function MedicineCreateContent() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [boxSize, setBoxSize] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

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
      const { response, data } = await requestJson('/api/medicines', {
        method: 'POST',
        body: JSON.stringify({
          name: trimmedName,
          boxSize: parsedBoxSize
        })
      })

      if (!response.ok) {
        setError(formatValidationError(data))
        return
      }

      navigate(`/medicines/${data.id}`)
    } catch (err) {
      setError(err.message ?? 'Failed to create medicine.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Add New Medicine</h2>
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
              <button className="w-100 btn btn-lg btn-primary" type="submit" disabled={saving}>
                {saving ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
          <div className="mt-3">
            <Link to="/medicines" className="btn btn-secondary">Back to List</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MedicineCreate() {
  return (
    <ProtectedRoute>
      <MedicineCreateContent />
    </ProtectedRoute>
  )
}

