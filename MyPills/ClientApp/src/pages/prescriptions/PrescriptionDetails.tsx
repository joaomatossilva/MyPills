import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute'
import { requestJson } from '../../api/apiClient'
import { useLanguage } from '../../contexts/LanguageContext'
import { formatDateOnly } from '../../utils/dateFormatting'

function PrescriptionDetailsContent() {
  const { id } = useParams()
  const [prescription, setPrescription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { text, locale } = useLanguage()

  useEffect(() => {
    const load = async () => {
      try {
        const { response, data } = await requestJson(`/api/prescriptions/${id}`)
        if (!response.ok) {
          throw new Error(text.prescriptions.failedDetails)
        }

        setPrescription(data)
      } catch (err) {
        setError((err as Error).message ?? text.prescriptions.failedDetails)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, text.prescriptions.failedDetails])

  if (loading) {
    return <div className="loading">{text.prescriptions.loadingDetails}</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (!prescription) {
    return <div className="error">{text.prescriptions.notFound}</div>
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">
        {text.prescriptions.detailsTitle}{' '}
        <Link to={`/prescriptions/${id}/edit`}>
          <i className="fa-regular fa-pen-to-square"></i>
        </Link>
      </h2>

      <dl className="row mb-5">
        <dt className="col-sm-2">{text.prescriptions.date}</dt>
        <dd className="col-sm-10">{formatDateOnly(prescription.date, locale)}</dd>
        <dt className="col-sm-2">{text.prescriptions.expiryDate}</dt>
        <dd className="col-sm-10">{formatDateOnly(prescription.expiryDate, locale)}</dd>
      </dl>

      <h2 className="mb-4">{text.prescriptions.medicinesSection}</h2>
      <p>
        <Link to={`/prescriptions/${id}/medicines/add`} className="btn btn-success">
          <i className="fa-solid fa-plus"></i> <span>{text.prescriptions.addMedicine}</span>
        </Link>
      </p>

      {prescription.medicines?.length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>{text.prescriptions.medicine}</th>
              <th>{text.prescriptions.quantity}</th>
              <th>{text.prescriptions.consumedQuantity}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {prescription.medicines.map(item => (
              <tr key={item.medicineId}>
                <td>{item.medicineName}</td>
                <td>{item.quantity}</td>
                <td>{item.consumedQuantity}</td>
                <td className="text-end">
                  <Link to={`/prescriptions/${id}/medicines/${item.medicineId}/edit`} className="me-3">
                    {text.common.edit}
                  </Link>
                  <Link to={`/prescriptions/${id}/medicines/${item.medicineId}/delete`} className="link-danger">
                    {text.common.delete}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="alert alert-info">{text.prescriptions.noMedicines}</div>
      )}

      <div className="mt-3">
        <Link to="/prescriptions" className="btn btn-secondary">{text.common.backToList}</Link>
      </div>
    </div>
  )
}

export default function PrescriptionDetails() {
  return (
    <ProtectedRoute>
      <PrescriptionDetailsContent />
    </ProtectedRoute>
  )
}

