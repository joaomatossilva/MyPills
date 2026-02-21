import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Overview from './pages/Overview'
import Test from './pages/Test'
import './App.css'

function App() {
  return (
    <Router basename="/app">
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
