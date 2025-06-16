import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LPHome from './pages/landingpage/LPHome'
import LPAbout from './pages/landingpage/LPAbout'
import LPContact from './pages/landingpage/LPContact'
import LPNavbar from './pages/landingpage/components/LPNavbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function App() {
  return (
    <>
      <Router>
        <LPNavbar/>
        <Routes>
          {/* Route for Landing Page - Home, About, Contact*/}
          <Route path="/" element={<LPHome/>}/>
          <Route path="/about" element={<LPAbout/>}/>
          <Route path="/contact" element={<LPContact/>}/>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/signup" element={<RegisterPage/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
