import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from './medicinesApi'

function MedicineDeleteContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [medicine, setMedicine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson(`/api/medicines/${id}`)
        if (!response.ok) {
          throw new Error('Failed to load medicine.')
        }

        setMedicine(data)
      } catch (err) {
        setError(err.message ?? 'Failed to load medicine.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  const onDelete = async event => {
    event.preventDefault()
    setDeleting(true)
    setError(null)

    try {
      const { response } = await requestJson(`/api/medicines/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete medicine.')
      }

      navigate('/medicines')
    } catch (err) {
      setError(err.message ?? 'Failed to delete medicine.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading medicine...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (!medicine) {
    return <div className="error">Medicine not found.</div>
  }

  return (
    <div className="container my-5">
      <h1>Delete</h1>
      <h3>Are you sure you want to delete this?</h3>
      <div>
        <h4>Medicine</h4>
        <hr />
        <dl className="row">
          <dt className="col-sm-2">Name</dt>
          <dd className="col-sm-10">{medicine.name}</dd>
          <dt className="col-sm-2">Box Size</dt>
          <dd className="col-sm-10">{medicine.boxSize}</dd>
        </dl>

        {error && <div className="text-danger mb-3">{error}</div>}

        <form onSubmit={onDelete}>
          <button className="btn btn-danger" type="submit" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <span className="ms-2">
            <Link to="/medicines">Back to List</Link>
          </span>
        </form>
      </div>
    </div>
  )
}

export default function MedicineDelete() {
  return (
    <ProtectedRoute>
      <MedicineDeleteContent />
    </ProtectedRoute>
  )
}

