import React, { useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AdminContext } from '../../context/AdminContext'

const SiteSettings = () => {
  const { aToken } = useContext(AdminContext)
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [logoFile, setLogoFile] = useState(null)
  const [aboutImageFile, setAboutImageFile] = useState(null)

  const [form, setForm] = useState({
    contactPhone: '',
    contactEmail: '',
    officeHours: '',
    addressLine1: '',
    addressLine2: '',
    logoUrl: '',
    aboutImageUrl: '',
    theme: {
      accent: '#0b1f4d',
      accentStrong: '#12337a',
      soft: '#e0e7ff',
      border: '#a5b4fc',
      text: '#0b1f4d',
      bgStart: '#f6f8ff',
      bgMid: '#ffffff',
      bgEnd: '#eef2ff'
    }
  })

  const theme = useMemo(() => form.theme || {}, [form.theme])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${backendUrl}/api/admin/site-settings`, { headers: { aToken } })
      if (data.success) {
        const settings = data.settings || {}
        setForm((prev) => ({
          ...prev,
          contactPhone: settings.contactPhone || '',
          contactEmail: settings.contactEmail || '',
          officeHours: settings.officeHours || '',
          addressLine1: settings.addressLine1 || '',
          addressLine2: settings.addressLine2 || '',
          logoUrl: settings.logoUrl || '',
          aboutImageUrl: settings.aboutImageUrl || '',
          theme: { ...prev.theme, ...(settings.theme || {}) }
        }))
      } else {
        toast.error(data.message || 'Unable to load site settings')
      }
    } catch (error) {
      console.log(error)
      toast.error('Unable to load site settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!aToken || !backendUrl) return
    loadSettings()
  }, [aToken, backendUrl])

  const updateTheme = (key, value) => {
    setForm((prev) => ({ ...prev, theme: { ...(prev.theme || {}), [key]: value } }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      const fd = new FormData()
      fd.append('contactPhone', form.contactPhone)
      fd.append('contactEmail', form.contactEmail)
      fd.append('officeHours', form.officeHours)
      fd.append('addressLine1', form.addressLine1)
      fd.append('addressLine2', form.addressLine2)
      fd.append('logoUrl', form.logoUrl)
      fd.append('aboutImageUrl', form.aboutImageUrl)
      fd.append('theme', JSON.stringify(form.theme || {}))

      if (logoFile) fd.append('logo', logoFile)
      if (aboutImageFile) fd.append('aboutImage', aboutImageFile)

      const { data } = await axios.put(`${backendUrl}/api/admin/site-settings`, fd, { headers: { aToken } })
      if (data.success) {
        toast.success(data.message || 'Saved')
        setLogoFile(null)
        setAboutImageFile(null)
        const settings = data.settings || {}
        setForm((prev) => ({
          ...prev,
          logoUrl: settings.logoUrl || prev.logoUrl,
          aboutImageUrl: settings.aboutImageUrl || prev.aboutImageUrl,
          theme: { ...(prev.theme || {}), ...(settings.theme || {}) }
        }))
      } else {
        toast.error(data.message || 'Unable to save')
      }
    } catch (error) {
      console.log(error)
      toast.error('Unable to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='w-full p-4 sm:p-6'>
      <div className='panel-shell p-5 sm:p-6'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <p className='panel-title'>Site Settings</p>
            <p className='text-sm text-slate-500 mt-1'>Update contact details, About image, and theme colors.</p>
          </div>
          <button
            type='button'
            onClick={loadSettings}
            className='panel-outline-btn'
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className='text-sm text-slate-500 mt-6'>Loading...</p>
        ) : (
          <form onSubmit={onSubmit} className='mt-6 grid gap-6'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <p className='text-sm font-medium text-slate-700'>Phone</p>
                <input
                  value={form.contactPhone}
                  onChange={(e) => setForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                  className='panel-input mt-2'
                  placeholder='+91 9879141914'
                />
              </div>
              <div>
                <p className='text-sm font-medium text-slate-700'>Email</p>
                <input
                  value={form.contactEmail}
                  onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                  className='panel-input mt-2'
                  placeholder='info@neuronet.in'
                />
              </div>
              <div className='md:col-span-2'>
                <p className='text-sm font-medium text-slate-700'>Office Hours</p>
                <input
                  value={form.officeHours}
                  onChange={(e) => setForm((prev) => ({ ...prev, officeHours: e.target.value }))}
                  className='panel-input mt-2'
                  placeholder='Mon - Sat, 10:00 AM to 9:00 PM'
                />
              </div>
              <div>
                <p className='text-sm font-medium text-slate-700'>Address Line 1</p>
                <input
                  value={form.addressLine1}
                  onChange={(e) => setForm((prev) => ({ ...prev, addressLine1: e.target.value }))}
                  className='panel-input mt-2'
                />
              </div>
              <div>
                <p className='text-sm font-medium text-slate-700'>Address Line 2</p>
                <input
                  value={form.addressLine2}
                  onChange={(e) => setForm((prev) => ({ ...prev, addressLine2: e.target.value }))}
                  className='panel-input mt-2'
                />
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='panel-card p-4'>
                <p className='text-sm font-semibold text-slate-800'>Logo</p>
                {form.logoUrl ? (
                  <img className='mt-3 h-16 w-auto rounded-lg border border-slate-200 bg-white p-2' src={form.logoUrl} alt='' />
                ) : (
                  <p className='mt-3 text-xs text-slate-500'>Using frontend bundled logo (no URL set).</p>
                )}
                <input
                  type='file'
                  accept='image/*'
                  className='panel-file-input mt-3'
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                />
                <p className='mt-2 text-xs text-slate-500'>Or paste a logo URL:</p>
                <input
                  value={form.logoUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  className='panel-input mt-2'
                  placeholder='https://...'
                />
              </div>

              <div className='panel-card p-4'>
                <p className='text-sm font-semibold text-slate-800'>About Image</p>
                {form.aboutImageUrl ? (
                  <img className='mt-3 h-24 w-auto rounded-lg border border-slate-200 bg-white p-2 object-cover' src={form.aboutImageUrl} alt='' />
                ) : (
                  <p className='mt-3 text-xs text-slate-500'>Using frontend bundled About image (no URL set).</p>
                )}
                <input
                  type='file'
                  accept='image/*'
                  className='panel-file-input mt-3'
                  onChange={(e) => setAboutImageFile(e.target.files?.[0] || null)}
                />
                <p className='mt-2 text-xs text-slate-500'>Or paste an image URL:</p>
                <input
                  value={form.aboutImageUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, aboutImageUrl: e.target.value }))}
                  className='panel-input mt-2'
                  placeholder='https://...'
                />
              </div>
            </div>

            <div className='panel-card p-4'>
              <p className='text-sm font-semibold text-slate-800'>Theme (Navy)</p>
              <p className='text-xs text-slate-500 mt-1'>These update the user website palette.</p>
              <div className='mt-4 grid gap-4 md:grid-cols-3'>
                <div>
                  <p className='text-xs font-semibold text-slate-600'>Accent</p>
                  <input type='color' value={theme.accent || '#0b1f4d'} onChange={(e) => updateTheme('accent', e.target.value)} className='mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white' />
                </div>
                <div>
                  <p className='text-xs font-semibold text-slate-600'>Accent Strong</p>
                  <input type='color' value={theme.accentStrong || '#12337a'} onChange={(e) => updateTheme('accentStrong', e.target.value)} className='mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white' />
                </div>
                <div>
                  <p className='text-xs font-semibold text-slate-600'>Text</p>
                  <input type='color' value={theme.text || '#0b1f4d'} onChange={(e) => updateTheme('text', e.target.value)} className='mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white' />
                </div>
              </div>
            </div>

            <div className='flex items-center justify-end gap-3'>
              <button type='submit' className='panel-btn px-6 py-2 rounded-full' disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default SiteSettings

