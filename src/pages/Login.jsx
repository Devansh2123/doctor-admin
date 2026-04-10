import axios from 'axios'
import React, { useContext, useState } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { toast } from 'react-toastify'
import safeStorage from '../utils/safeStorage'

const Login = () => {

  const [state, setState] = useState('Admin')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const { setDToken } = useContext(DoctorContext)
  const { setAToken } = useContext(AdminContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (state === 'Admin') {

      const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
      if (data.success) {
        setAToken(data.token)
        safeStorage.set('aToken', data.token)
      } else {
        toast.error(data.message)
      }

    } else {

      const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })
      if (data.success) {
        setDToken(data.token)
        safeStorage.set('dToken', data.token)
      } else {
        toast.error(data.message)
      }

    }

  }

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center px-4'>
      <div className='panel-shell flex flex-col gap-4 m-auto items-start p-8 min-w-[340px] sm:min-w-96 text-slate-600 text-sm shadow-lg'>
        <div className='text-center w-full'>
          <p className='text-2xl font-semibold text-slate-800'><span className='panel-text-accent'>{state}</span> Login</p>
          <p className='text-xs text-slate-500 mt-1'>Welcome back. Please enter your credentials.</p>
        </div>
        <div className='w-full '>
          <p>Email</p>
          <input onChange={(e) => setEmail(e.target.value)} value={email} className='panel-input mt-1' type="email" required />
        </div>
        <div className='w-full '>
          <p>Password</p>
          <input onChange={(e) => setPassword(e.target.value)} value={password} className='panel-input mt-1' type="password" required />
        </div>
        <button className='panel-btn w-full py-2 rounded-lg text-base'>Login</button>
        {
          state === 'Admin'
            ? <p>Doctor Login? <span onClick={() => setState('Doctor')} className='panel-link'>Click here</span></p>
            : <p>Admin Login? <span onClick={() => setState('Admin')} className='panel-link'>Click here</span></p>
        }
      </div>
    </form>
  )
}

export default Login
