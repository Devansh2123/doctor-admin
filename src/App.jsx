import React, { useContext, useEffect } from 'react'
import { DoctorContext } from './context/DoctorContext';
import { AdminContext } from './context/AdminContext';
import { Route, Routes } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import UsersList from './pages/Admin/UsersList';
import Claims from './pages/Admin/Claims';
import Login from './pages/Login';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import DoctorConsultation from './pages/Doctor/DoctorConsultation';
import { io } from 'socket.io-client';

const App = () => {

  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)
  const roleTheme = aToken ? 'theme-admin' : 'theme-doctor'
  const backendUrl = import.meta.env.VITE_BACKEND_URL

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

  return dToken || aToken ? (
    <div className={`panel-app-bg min-h-screen w-full ${roleTheme}`}>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <Routes>
          <Route path='/' element={<></>} />
          <Route path='/admin-dashboard' element={<Dashboard />} />
          <Route path='/all-appointments' element={<AllAppointments />} />
          <Route path='/add-doctor' element={<AddDoctor />} />
          <Route path='/doctor-list' element={<DoctorsList />} />
          <Route path='/users-list' element={<UsersList />} />
          <Route path='/claims' element={<Claims />} />
          <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
          <Route path='/doctor-appointments' element={<DoctorAppointments />} />
          <Route path='/doctor-profile' element={<DoctorProfile />} />
          <Route path='/doctor-consultation/:appointmentId' element={<DoctorConsultation />} />
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <ToastContainer />
      <div className='panel-app-bg min-h-screen w-full theme-admin'>
        <div className='w-full'>
          <Login />
        </div>
      </div>
    </>
  )
}

export default App
