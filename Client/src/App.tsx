import React, { useContext } from 'react'
import { Container } from 'react-bootstrap'
import './App.css'
import { Route, Routes, Navigate } from 'react-router-dom'
import Home from "./Pages/Home"
import Store from "./Pages/Store"
import FoodNavbar from './Components/FoodNavbar'
import Contact from './Pages/Contact'
import FoodFooter from './Components/FoodFooter'
import PrivacyPolicy from './Pages/PrivacyPolicy'
import TermsOfService from './Pages/TermsOfService'
import { AuthProvider, AuthContext } from './context/AuthContext'
import AuthPage from './Pages/Auth'
import AdminDashboard from './Pages/AdminDashboard'
import UserOrders from './Pages/UserOrders'
import ProtectedRoute from './Components/ProtectedRoute'

const AppContent: React.FC = () => {
  const auth = useContext(AuthContext)

  if (auth?.isAuthenticated && auth.user?.role === 'admin') {
    return (
      <>
        <FoodNavbar/>
        <Container className='mb-4 mt-4'>
          <Routes>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Container>
        <FoodFooter/>
      </>
    )
  }

  return (
    <>
      <FoodNavbar/>
      <Container className='mb-4 mt-4'>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/menu-items" element={<Store/>} />
          <Route path="/contact" element={<Contact/>}/>
          <Route path="/privacy" element={<PrivacyPolicy/>} />
          <Route path='/terms' element={<TermsOfService/>} />
          <Route path='/auth' element={<AuthPage/>} />
          
          <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
            <Route path="/my-orders" element={<UserOrders />} />
          </Route>
          
          <Route path="/admin" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
      <FoodFooter/>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App