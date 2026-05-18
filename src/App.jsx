import { useContext, useEffect } from 'react'
import { DoctorContext } from './context/DoctorContext';
import { AdminContext } from './context/AdminContext';
import { Route, Routes, Navigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar'
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import UsersList from './pages/Admin/UsersList';
import Claims from './pages/Admin/Claims';
import SiteSettings from './pages/Admin/SiteSettings';
import AdminLogin from './pages/AdminLogin'
import DoctorLogin from './pages/DoctorLogin'
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import DoctorConsultation from './pages/Doctor/DoctorConsultation';
import { io } from 'socket.io-client';
import backendUrl from './config/backend';

const App = () => {

  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)
  const roleTheme = aToken ? 'theme-admin' : 'theme-doctor'
  useEffect(() => {
    if (!aToken || !backendUrl) return

    const socket = io(backendUrl, {
      auth: { role: 'admin' }
    })

    socket.on('appointment-reminder', (payload) => {
      toast.info(`Reminder: ${payload.userName} with ${payload.doctorName} at ${payload.slotTime} on ${payload.slotDate}`)
    })

    return () => {
      socket.disconnect()
    }
  }, [aToken, backendUrl])

  if (aToken) {
    return (
      <div className={`panel-app-bg min-h-screen w-full ${roleTheme}`}>
        <ToastContainer />
        <Navbar />
        <div className='w-full'>
          <Routes>
            <Route path='/' element={<Navigate to='/admin-dashboard' replace />} />
            <Route path='/admin-dashboard' element={<Dashboard />} />
            <Route path='/all-appointments' element={<AllAppointments />} />
            <Route path='/add-doctor' element={<AddDoctor />} />
            <Route path='/doctor-list' element={<DoctorsList />} />
            <Route path='/users-list' element={<UsersList />} />
            <Route path='/claims' element={<Claims />} />
            <Route path='/site-settings' element={<SiteSettings />} />
            <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
            <Route path='/doctor-appointments' element={<DoctorAppointments />} />
            <Route path='/doctor-profile' element={<DoctorProfile />} />
            <Route path='/doctor-consultation/:appointmentId' element={<DoctorConsultation />} />
            <Route path='*' element={<Navigate to='/admin-dashboard' replace />} />
          </Routes>
        </div>
      </div>
    )
  }

  if (dToken) {
    return (
      <div className={`panel-app-bg min-h-screen w-full ${roleTheme}`}>
        <ToastContainer />
        <Navbar />
        <div className='w-full'>
          <Routes>
            <Route path='/' element={<Navigate to='/doctor-dashboard' replace />} />
            <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
            <Route path='/doctor-appointments' element={<DoctorAppointments />} />
            <Route path='/doctor-profile' element={<DoctorProfile />} />
            <Route path='/doctor-consultation/:appointmentId' element={<DoctorConsultation />} />
            <Route path='*' element={<Navigate to='/doctor-dashboard' replace />} />
          </Routes>
        </div>
      </div>
    )
  }

  return (
    <>
      <ToastContainer />
      <div className='panel-app-bg min-h-screen w-full theme-admin'>
        <div className='w-full'>
          <Routes>
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/login' element={<Login />} />
            <Route path='/admin-login' element={<AdminLogin />} />
            <Route path='/doctor-login' element={<DoctorLogin />} />
            <Route path='*' element={<Navigate to='/login' replace />} />
          </Routes>
        </div>
      </div>
    </>
  )
}

export default App
