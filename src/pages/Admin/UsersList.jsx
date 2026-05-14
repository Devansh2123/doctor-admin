import React, { useContext, useEffect, useMemo, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'

const UsersList = () => {
  const { aToken, users, getAllUsers, updateUserBlock } = useContext(AdminContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (aToken) {
      getAllUsers()
    }
  }, [aToken])

  const userStats = useMemo(() => {
    const blocked = users.filter((user) => user.isBlocked).length
    const active = users.length - blocked
    const complete = users.filter((user) => {
      const address = user.address || {}
      return Boolean(
        user.name &&
        user.email &&
        user.phone &&
        address.line1 &&
        address.line2 &&
        user.gender &&
        user.gender !== 'Not Selected' &&
        user.dob &&
        user.dob !== 'Not Selected'
      )
    }).length

    return { total: users.length, active, blocked, complete }
  }, [users])

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return users.filter((user) => {
      if (statusFilter === 'active' && user.isBlocked) return false
      if (statusFilter === 'blocked' && !user.isBlocked) return false

      if (!query) return true
      const address = user.address || {}
      const haystack = [
        user.name,
        user.email,
        user.phone,
        user.patientCode,
        user.gender,
        user.dob,
        address.line1,
        address.line2,
      ].join(' ').toLowerCase()

      return haystack.includes(query)
    })
  }, [users, searchTerm, statusFilter])

  const getProfileStatus = (user) => {
    const address = user.address || {}
    const requiredValues = [
      user.name,
      user.email,
      user.phone,
      address.line1,
      address.line2,
      user.gender !== 'Not Selected' ? user.gender : '',
      user.dob !== 'Not Selected' ? user.dob : '',
    ]
    const completed = requiredValues.filter(Boolean).length
    return {
      completed,
      total: requiredValues.length,
      label: completed === requiredValues.length ? 'Complete' : `${completed}/${requiredValues.length} complete`,
      className: completed === requiredValues.length ? 'text-emerald-700 border-emerald-200 bg-emerald-50' : 'text-amber-700 border-amber-200 bg-amber-50',
    }
  }

  const formatAccessPass = (user) => {
    if (!user.accessPassActive) return 'Not active'
    if (!user.accessPassExpiresAt) return 'Active'
    return `Active until ${new Date(user.accessPassExpiresAt).toLocaleDateString()}`
  }

  return (
    <div className='panel-page'>
      <div className='panel-stats-grid'>
        <div className='panel-stat-card'>
          <p className='panel-stat-label'>Total Users</p>
          <p className='panel-stat-value'>{userStats.total}</p>
        </div>
        <div className='panel-stat-card'>
          <p className='panel-stat-label'>Active</p>
          <p className='panel-stat-value'>{userStats.active}</p>
        </div>
        <div className='panel-stat-card'>
          <p className='panel-stat-label'>Blocked</p>
          <p className='panel-stat-value'>{userStats.blocked}</p>
        </div>
        <div className='panel-stat-card'>
          <p className='panel-stat-label'>Complete Profiles</p>
          <p className='panel-stat-value'>{userStats.complete}</p>
        </div>
      </div>

      <div className='panel-section p-4 mb-5'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search by name, email, phone, patient code, address...'
            className='panel-input lg:max-w-xl'
          />
          <div className='flex flex-wrap gap-2'>
            {[
              ['all', 'All'],
              ['active', 'Active'],
              ['blocked', 'Blocked'],
            ].map(([value, label]) => (
              <button
                key={value}
                type='button'
                onClick={() => setStatusFilter(value)}
                className={`panel-tab-btn ${statusFilter === value ? 'panel-tab-btn-active' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className='panel-data-shell overflow-hidden'>
        <div className='panel-table-head hidden xl:grid grid-cols-[1.35fr_1.4fr_1.4fr_1fr_1fr_0.8fr]'>
          <p>User</p>
          <p>Contact</p>
          <p>Address</p>
          <p>Basic Info</p>
          <p>Access</p>
          <p>Action</p>
        </div>

        {filteredUsers.length === 0 && (
          <p className='panel-empty'>No users match this view.</p>
        )}

        <div className='divide-y divide-slate-200'>
          {filteredUsers.map((user) => {
            const address = user.address || {}
            const profileStatus = getProfileStatus(user)

            return (
              <div
                key={user._id}
                className='grid gap-4 px-5 py-5 text-sm text-slate-600 transition hover:bg-slate-50 xl:grid-cols-[1.35fr_1.4fr_1.4fr_1fr_1fr_0.8fr] xl:items-center'
              >
                <div className='flex items-center gap-3 min-w-0'>
                  <img src={user.image || assets.patient_icon} className='h-12 w-12 rounded-2xl border border-slate-200 object-cover bg-slate-50' alt='' />
                  <div className='min-w-0'>
                    <p className='truncate text-base font-semibold text-slate-900'>{user.name || 'Unnamed user'}</p>
                    <p className='text-xs text-slate-500'>Patient ID: {user.patientCode || 'Not assigned'}</p>
                    <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${user.isBlocked ? 'text-red-700 border-red-200 bg-red-50' : 'text-emerald-700 border-emerald-200 bg-emerald-50'}`}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </div>
                </div>

                <div className='space-y-1'>
                  <p className='text-xs uppercase tracking-widest text-slate-400 xl:hidden'>Contact</p>
                  <p className='break-all text-slate-800'>{user.email || 'No email'}</p>
                  <p>{user.phone || 'No phone'}</p>
                </div>

                <div className='space-y-1'>
                  <p className='text-xs uppercase tracking-widest text-slate-400 xl:hidden'>Address</p>
                  <p className='text-slate-800'>{address.line1 || 'Address line 1 missing'}</p>
                  <p>{address.line2 || 'Address line 2 missing'}</p>
                </div>

                <div className='space-y-1'>
                  <p className='text-xs uppercase tracking-widest text-slate-400 xl:hidden'>Basic Info</p>
                  <p>Gender: <span className='text-slate-800'>{user.gender || 'Not Selected'}</span></p>
                  <p>DOB: <span className='text-slate-800'>{user.dob || 'Not Selected'}</span></p>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${profileStatus.className}`}>
                    {profileStatus.label}
                  </span>
                </div>

                <div className='space-y-1'>
                  <p className='text-xs uppercase tracking-widest text-slate-400 xl:hidden'>Access</p>
                  <p className={user.accessPassActive ? 'text-emerald-700' : 'text-slate-500'}>{formatAccessPass(user)}</p>
                  <p className='text-xs text-slate-400'>Amount: {user.accessPassAmount || 0}</p>
                </div>

                <div>
                  <button
                    onClick={() => updateUserBlock(user._id, !user.isBlocked)}
                    className={user.isBlocked ? 'panel-soft-btn' : 'panel-danger-btn'}
                  >
                    {user.isBlocked ? 'Unblock User' : 'Block User'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default UsersList
