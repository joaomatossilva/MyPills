import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Test from './pages/Test'
import MedicinesList from './pages/medicines/MedicinesList'
import MedicineCreate from './pages/medicines/MedicineCreate'
import MedicineDetails from './pages/medicines/MedicineDetails'
import MedicineEdit from './pages/medicines/MedicineEdit'
import MedicineDelete from './pages/medicines/MedicineDelete'
import { AuthProvider } from './contexts/AuthContext'
import Splash from './pages/Splash'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router basename="/app">
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
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
