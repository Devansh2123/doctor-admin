import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const UsersList = () => {
  const { aToken, users, getAllUsers, updateUserBlock } = useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
      getAllUsers()
    }
  }, [aToken])

  return (
    <div className='panel-page'>
      <div className='panel-page-header'>
        <div>
          <p className='panel-page-title'>All Users</p>
          <p className='panel-page-subtitle'>Track users and manage access status instantly.</p>
        </div>
      </div>

      <div className='panel-data-shell text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='panel-table-head hidden sm:grid grid-cols-[2fr_2fr_1fr_1fr] grid-flow-col'>
          <p>User</p>
          <p>Email</p>
          <p>Status</p>
          <p>Action</p>
        </div>

        {users.length === 0 && (
          <p className='panel-empty'>No users found yet.</p>
        )}
        {users.map((user) => (
          <div className='panel-table-row flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[2fr_2fr_1fr_1fr] items-center text-slate-600' key={user._id}>
            <div className='flex items-center gap-2'>
              <img src={user.image} className='w-8 h-8 rounded-full object-cover' alt='' />
              <p>{user.name}</p>
            </div>
            <p>{user.email}</p>
            <p className={user.isBlocked ? 'panel-status-cancel' : 'panel-status-complete'}>
              {user.isBlocked ? 'Blocked' : 'Active'}
            </p>
            <button
              onClick={() => updateUserBlock(user._id, !user.isBlocked)}
              className={user.isBlocked ? 'panel-soft-btn' : 'panel-danger-btn'}
            >
              {user.isBlocked ? 'Unblock' : 'Block'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UsersList
