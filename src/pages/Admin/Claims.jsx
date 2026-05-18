import React, { useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AdminContext } from '../../context/AdminContext'
import backendUrl from '../../config/backend'

const statusOptions = ['claimed', 'pending', 'approved', 'rejected']

const statusLabel = (status) => {
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  if (status === 'pending') return 'Pending'
  return 'Claimed'
}

const statusClass = (status) => {
  if (status === 'approved') return 'claim-pill claim-pill-approved'
  if (status === 'rejected') return 'claim-pill claim-pill-rejected'
  if (status === 'pending') return 'claim-pill claim-pill-pending'
  return 'claim-pill claim-pill-claimed'
}

const Claims = () => {
  const { aToken } = useContext(AdminContext)
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState('')
  const [notes, setNotes] = useState({})
  const [search, setSearch] = useState('')

  const fetchClaims = async () => {
    if (!aToken || !backendUrl) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data } = await axios.get(`${backendUrl}/api/admin/claims`, { headers: { aToken } })
      if (data.success) {
        const claimData = Array.isArray(data.claims) ? data.claims : []
        setClaims(claimData)
        setNotes((prev) => {
          const next = { ...prev }
          claimData.forEach((claim) => {
            next[claim._id] = claim.adminNote || ''
          })
          return next
        })
      } else {
        toast.error(data.message || 'Unable to load claims')
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClaims()
  }, [aToken, backendUrl])

  const filteredClaims = useMemo(() => {
    const base = activeFilter === 'all' ? claims : claims.filter((claim) => claim.itemType === activeFilter)
    if (!search.trim()) return base
    const term = search.trim().toLowerCase()
    return base.filter((claim) => {
      const userName = claim.user?.name || ''
      const userEmail = claim.user?.email || ''
      const itemName = claim.item?.title || claim.item?.name || ''
      return [userName, userEmail, itemName, claim.itemType].some((value) => value.toLowerCase().includes(term))
    })
  }, [claims, activeFilter, search])

  const stats = useMemo(() => {
    const total = claims.length
    const pending = claims.filter((claim) => claim.status === 'pending').length
    const approved = claims.filter((claim) => claim.status === 'approved').length
    const rejected = claims.filter((claim) => claim.status === 'rejected').length
    return { total, pending, approved, rejected }
  }, [claims])

  const updateStatus = async (claimId, status) => {
    if (!claimId) return
    try {
      setUpdatingId(claimId)
      const { data } = await axios.put(
        `${backendUrl}/api/admin/claims/${claimId}`,
        { status, note: notes[claimId] || '' },
        { headers: { aToken } }
      )
      if (data.success) {
        toast.success(data.message || 'Claim updated')
        setClaims((prev) => prev.map((item) => item._id === claimId ? { ...item, status, adminNote: notes[claimId] || item.adminNote } : item))
      } else {
        toast.error(data.message || 'Unable to update claim')
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <div className='w-full md:w-[83%] px-4 md:px-8 py-6'>
      <div className='claim-hero'>
        <div>
          <p className='claim-hero-title'>Claims Hub</p>
          <p className='claim-hero-subtitle'>Track approvals and verify coverage across offers, memberships, and insurance partners.</p>
        </div>
        <div className='claim-hero-actions'>
          <button onClick={fetchClaims} className='panel-outline-btn'>Refresh</button>
        </div>
      </div>

      <div className='claim-stats-grid'>
        <div className='claim-stat-card'>
          <p className='claim-stat-label'>Total Claims</p>
          <p className='claim-stat-value'>{stats.total}</p>
        </div>
        <div className='claim-stat-card'>
          <p className='claim-stat-label'>Pending</p>
          <p className='claim-stat-value text-amber-700'>{stats.pending}</p>
        </div>
        <div className='claim-stat-card'>
          <p className='claim-stat-label'>Approved</p>
          <p className='claim-stat-value text-emerald-700'>{stats.approved}</p>
        </div>
        <div className='claim-stat-card'>
          <p className='claim-stat-label'>Rejected</p>
          <p className='claim-stat-value text-red-700'>{stats.rejected}</p>
        </div>
      </div>

      <div className='claim-controls'>
        <div className='claim-search'>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Search by user, email, or item name'
            className='panel-input'
          />
        </div>
        <div className='claim-filters'>
          {['all', 'offer', 'membership', 'insurance'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`claim-filter-chip ${activeFilter === filter ? 'claim-filter-chip-active' : ''}`}
            >
              {filter === 'all' ? 'All Claims' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className='panel-card p-5'>
          <p className='text-sm text-slate-600'>Loading claims...</p>
        </div>
      )}

      {!loading && filteredClaims.length === 0 && (
        <div className='panel-card p-5'>
          <p className='text-sm text-slate-600'>No claims found for this filter.</p>
        </div>
      )}

      {!loading && filteredClaims.length > 0 && (
        <div className='claim-list-grid'>
          {filteredClaims.map((claim) => (
            <div key={claim._id} className='claim-card'>
              <div className='claim-card-head'>
                <div>
                  <p className='claim-card-title'>{claim.item?.title || claim.item?.name || 'Item removed'}</p>
                  <p className='claim-card-subtitle'>{claim.itemType.toUpperCase()} CLAIM</p>
                </div>
                <span className={statusClass(claim.status)}>{statusLabel(claim.status)}</span>
              </div>

              <div className='claim-card-body'>
                <div>
                  <p className='claim-card-meta'>User</p>
                  <p className='claim-card-value'>{claim.user?.name || 'Unknown user'}</p>
                  <p className='claim-card-value text-xs text-slate-500'>{claim.user?.email || 'No email'}</p>
                </div>
                <div>
                  <p className='claim-card-meta'>Details</p>
                  {claim.item?.tag && <p className='text-xs text-slate-600'>{claim.item.tag}</p>}
                  {claim.itemType === 'offer' && claim.item?.desc && <p className='text-xs text-slate-600'>{claim.item.desc}</p>}
                  {claim.itemType === 'insurance' && claim.item?.coverage && <p className='text-xs text-slate-600'>{claim.item.coverage}</p>}
                  {claim.itemType === 'membership' && Array.isArray(claim.item?.benefits) && claim.item.benefits.length > 0 && (
                    <p className='text-xs text-slate-600'>Benefits: {claim.item.benefits.join(', ')}</p>
                  )}
                </div>
                <div>
                  <p className='claim-card-meta'>Last update</p>
                  <p className='text-xs text-slate-600'>
                    {claim.history?.length > 0
                      ? `${claim.history[claim.history.length - 1]?.dateLocal || ''} ${claim.history[claim.history.length - 1]?.timeLocal || ''}`.trim()
                      : 'No updates yet'}
                  </p>
                </div>
              </div>

              <div className='claim-card-actions'>
                <input
                  value={notes[claim._id] || ''}
                  onChange={(event) => setNotes((prev) => ({ ...prev, [claim._id]: event.target.value }))}
                  placeholder='Admin note (optional)'
                  className='panel-input text-xs'
                />
                <div className='flex items-center gap-2'>
                  <select
                    value={claim.status}
                    onChange={(event) => updateStatus(claim._id, event.target.value)}
                    disabled={updatingId === claim._id}
                    className='panel-input text-xs'
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>{statusLabel(option)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Claims
