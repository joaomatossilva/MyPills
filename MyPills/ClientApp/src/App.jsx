import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Test from './pages/Test'
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
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
