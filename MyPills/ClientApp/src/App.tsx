import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Test from './pages/Test'
import MedicinesList from './pages/medicines/MedicinesList'
import MedicineCreate from './pages/medicines/MedicineCreate'
import MedicineDetails from './pages/medicines/MedicineDetails'
import MedicineEdit from './pages/medicines/MedicineEdit'
import MedicineDelete from './pages/medicines/MedicineDelete'
import PrescriptionsList from './pages/prescriptions/PrescriptionsList'
import PrescriptionCreate from './pages/prescriptions/PrescriptionCreate'
import PrescriptionDetails from './pages/prescriptions/PrescriptionDetails'
import PrescriptionEdit from './pages/prescriptions/PrescriptionEdit'
import PrescriptionDelete from './pages/prescriptions/PrescriptionDelete'
import PrescriptionMedicineAdd from './pages/prescriptions/PrescriptionMedicineAdd'
import PrescriptionMedicineEdit from './pages/prescriptions/PrescriptionMedicineEdit'
import PrescriptionMedicineDelete from './pages/prescriptions/PrescriptionMedicineDelete'
import StockList from './pages/stock/StockList'
import StockCreate from './pages/stock/StockCreate'
import StockDetails from './pages/stock/StockDetails'
import StockPrescriptionDeduction from './pages/stock/StockPrescriptionDeduction'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import Splash from './pages/Splash'
import './App.css'

function App() {
  return (
      <LanguageProvider>
        <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route element={<Layout />}>
              <Route path="overview" element={<Overview />} />
              <Route path="test" element={<Test />} />
              <Route path="medicines" element={<MedicinesList />} />
              <Route path="medicines/new" element={<MedicineCreate />} />
              <Route path="medicines/:id" element={<MedicineDetails />} />
              <Route path="medicines/:id/edit" element={<MedicineEdit />} />
              <Route path="medicines/:id/delete" element={<MedicineDelete />} />
              <Route path="prescriptions" element={<PrescriptionsList />} />
              <Route path="prescriptions/new" element={<PrescriptionCreate />} />
              <Route path="prescriptions/:id" element={<PrescriptionDetails />} />
              <Route path="prescriptions/:id/edit" element={<PrescriptionEdit />} />
              <Route path="prescriptions/:id/delete" element={<PrescriptionDelete />} />
              <Route path="prescriptions/:id/medicines/add" element={<PrescriptionMedicineAdd />} />
              <Route path="prescriptions/:id/medicines/:medicineId/edit" element={<PrescriptionMedicineEdit />} />
              <Route path="prescriptions/:id/medicines/:medicineId/delete" element={<PrescriptionMedicineDelete />} />
              <Route path="stock" element={<StockList />} />
              <Route path="stock/new" element={<StockCreate />} />
              <Route path="stock/:id" element={<StockDetails />} />
              <Route path="stock/deductions" element={<StockPrescriptionDeduction />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
