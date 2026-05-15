import axios from 'axios'
import { useContext, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import { toast } from 'react-toastify'
import safeStorage from '../utils/safeStorage'
import { useNavigate } from 'react-router-dom'

const AdminLogin = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const navigate = useNavigate()

  const { setAToken } = useContext(AdminContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
      if (data.success) {
        setAToken(data.token)
        safeStorage.set('aToken', data.token)
        toast.success(data.message || 'Login successful')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.message || 'An error occurred. Please try again.')
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center justify-center px-4'>
      <div className='panel-shell w-full max-w-md rounded-2xl p-8 text-sm text-slate-600 shadow-lg'>
        <div className='mb-6 text-center'>
          <p className='text-2xl font-semibold text-slate-800'>Admin Login</p>
          <p className='mt-2 text-sm text-slate-500'>Please log in with your admin credentials to continue</p>
        </div>

        <div className='space-y-4'>
          <div>
            <label className='text-sm font-medium text-slate-700'>Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className='panel-input mt-1.5'
              type='email'
              placeholder='Enter your email'
              required
            />
          </div>

          <div>
            <label className='text-sm font-medium text-slate-700'>Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className='panel-input mt-1.5'
              type='password'
              placeholder='Enter your password'
              required
            />
          </div>
        </div>

        <button className='mt-6 w-full rounded-lg bg-[#0b1f4d] py-3 text-base font-medium text-white transition hover:bg-[#12337a]'>Login as Admin</button>

        <button
          type='button'
          onClick={() => navigate('/forgot-password')}
          className='mt-5 w-full text-center text-sm font-medium text-[#0b1f4d] underline'
        >
          Forgot Password?
        </button>
      </div>
    </form>
  )
}

export default AdminLogin
