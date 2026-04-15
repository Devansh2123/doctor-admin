import React, { useContext, useEffect, useMemo, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'

const Dashboard = () => {

  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext)
  const { slotDateFormat, currency } = useContext(AppContext)
  const [selectedTrend, setSelectedTrend] = useState('sevenDays')

  useEffect(() => {
    if (!aToken) return

    getDashData()

    const intervalId = setInterval(() => {
      getDashData()
    }, 10000)

    const handleWindowFocus = () => {
      getDashData()
    }

    window.addEventListener('focus', handleWindowFocus)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [aToken])

  const {
    appointmentsPerDay,
    topDoctors,
    busiestSlots,
    totalRevenueDisplay,
    revenueTrend,
    revenueByDoctor,
    revenueBySpeciality,
    paymentSplit,
    cancellationStats
  } = useMemo(() => {
    if (!dashData) {
      return {
        appointmentsPerDay: [],
        topDoctors: [],
        busiestSlots: [],
        totalRevenueDisplay: 0,
        revenueTrend: [],
        revenueByDoctor: [],
        revenueBySpeciality: [],
        paymentSplit: {
          paid: { count: 0, amount: 0 },
          cash: { count: 0, amount: 0 },
          pending: { count: 0, amount: 0 }
        },
        cancellationStats: { count: 0, amount: 0 }
      }
    }

    const appointments = Array.isArray(dashData.latestAppointments)
      ? dashData.latestAppointments
      : []

    const parseSlotDate = (slotDate) => {
      if (!slotDate) return null
      const [day, month, year] = String(slotDate).split('_').map(Number)
      if (!day || !month || !year) return null
      return new Date(year, month - 1, day, 12, 0, 0, 0)
    }

    const formatDayLabel = (date) => date.toLocaleDateString('en-US', { weekday: 'short' })
    const formatDayKey = (date) => date.toISOString().slice(0, 10)

    const today = new Date()
    const dayBuckets = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (6 - index))
      return {
        dateKey: formatDayKey(date),
        label: formatDayLabel(date),
        count: 0
      }
    })

    const perDayMap = new Map(dayBuckets.map((bucket) => [bucket.dateKey, bucket]))

    const doctorMap = new Map()
    const slotMap = new Map()

    appointments.forEach((appointment) => {
      const appointmentDate = parseSlotDate(appointment.slotDate)
      if (appointmentDate) {
        const dayKey = formatDayKey(appointmentDate)
        const bucket = perDayMap.get(dayKey)
        if (bucket) {
          bucket.count += 1
        }
      }

      const docName = appointment?.docData?.name || 'Unknown'
      const docImage = appointment?.docData?.image || ''
      const doctorEntry = doctorMap.get(docName) || {
        name: docName,
        count: 0,
        image: docImage
      }
      doctorEntry.count += 1
      doctorMap.set(docName, doctorEntry)

      const slotLabel = appointment?.slotTime || 'Unknown'
      const slotEntry = slotMap.get(slotLabel) || { slot: slotLabel, count: 0 }
      slotEntry.count += 1
      slotMap.set(slotLabel, slotEntry)
    })

    const topDoctorData = Array.from(doctorMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    const busiestSlotData = Array.from(slotMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    return {
      appointmentsPerDay: dayBuckets,
      topDoctors: topDoctorData,
      busiestSlots: busiestSlotData,
      totalRevenueDisplay: dashData.totalRevenue || 0,
      revenueTrend: dashData.revenueAnalytics?.revenueTrend?.[selectedTrend] || [],
      revenueByDoctor: dashData.revenueAnalytics?.revenueByDoctor || [],
      revenueBySpeciality: dashData.revenueAnalytics?.revenueBySpeciality || [],
      paymentSplit: dashData.revenueAnalytics?.paymentSplit || {
        paid: { count: 0, amount: 0 },
        cash: { count: 0, amount: 0 },
        pending: { count: 0, amount: 0 }
      },
      cancellationStats: dashData.revenueAnalytics?.cancellations || { count: 0, amount: 0 }
    }
  }, [dashData, selectedTrend])

  const trendTabs = [
    { key: 'sevenDays', label: '7D' },
    { key: 'thirtyDays', label: '30D' },
    { key: 'ninetyDays', label: '90D' }
  ]

  const formatCurrency = (value) => `${currency}${Number(value || 0).toLocaleString()}`

  return dashData && (
    <div className='panel-page'>
      <div className='panel-hero'>
        <div>
          <p className='panel-hero-title'>Admin Command Center</p>
          <p className='panel-hero-subtitle'>Monitor live clinic activity, revenue, and the latest bookings at a glance.</p>
        </div>
      </div>

      <div className='panel-stats-grid'>
        <div className='panel-stat-card flex items-center gap-3'>
          <img className='w-12' src={assets.doctor_icon} alt="" />
          <div>
            <p className='panel-stat-label'>Doctors</p>
            <p className='panel-stat-value'>{dashData.doctors}</p>
          </div>
        </div>
        <div className='panel-stat-card flex items-center gap-3'>
          <img className='w-12' src={assets.appointments_icon} alt="" />
          <div>
            <p className='panel-stat-label'>Appointments</p>
            <p className='panel-stat-value'>{dashData.appointments}</p>
          </div>
        </div>
        <div className='panel-stat-card flex items-center gap-3'>
          <img className='w-12' src={assets.patients_icon} alt="" />
          <div>
            <p className='panel-stat-label'>Users</p>
            <p className='panel-stat-value'>{dashData.patients}</p>
          </div>
        </div>
        <div className='panel-stat-card flex items-center gap-3'>
          <img className='w-12' src={assets.earning_icon} alt="" />
          <div>
            <p className='panel-stat-label'>Total Revenue</p>
            <p className='panel-stat-value'>{currency}{totalRevenueDisplay}</p>
          </div>
        </div>
      </div>

      <div className='panel-section p-5 mb-6'>
        <div className='panel-analytics-head'>
          <div>
            <p className='panel-analytics-title'>Revenue Pulse</p>
            <p className='panel-analytics-subtitle'>Track revenue trends, payment mix, and cancellations.</p>
          </div>
          <div className='flex flex-wrap gap-2'>
            {trendTabs.map((tab) => (
              <button
                key={tab.key}
                type='button'
                onClick={() => setSelectedTrend(tab.key)}
                className={`panel-tab-btn ${selectedTrend === tab.key ? 'panel-tab-btn-active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className='panel-chart-shell mb-5'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={revenueTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray='4 6' vertical={false} stroke='#e2e8f0' />
              <XAxis dataKey='label' tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip cursor={{ fill: 'rgba(15, 23, 42, 0.06)' }} formatter={(value) => formatCurrency(value)} />
              <Line type='monotone' dataKey='revenue' stroke='#0f172a' strokeWidth={2.5} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className='panel-stats-grid'>
          <div className='panel-stat-card'>
            <p className='panel-stat-label'>Paid (Online)</p>
            <p className='panel-stat-value'>{formatCurrency(paymentSplit.paid?.amount)}</p>
            <p className='text-xs text-slate-500 mt-1'>{paymentSplit.paid?.count || 0} payments</p>
          </div>
          <div className='panel-stat-card'>
            <p className='panel-stat-label'>Cash / Unpaid</p>
            <p className='panel-stat-value'>{formatCurrency(paymentSplit.cash?.amount)}</p>
            <p className='text-xs text-slate-500 mt-1'>{paymentSplit.cash?.count || 0} completed visits</p>
          </div>
          <div className='panel-stat-card'>
            <p className='panel-stat-label'>Pending Revenue</p>
            <p className='panel-stat-value'>{formatCurrency(paymentSplit.pending?.amount)}</p>
            <p className='text-xs text-slate-500 mt-1'>{paymentSplit.pending?.count || 0} upcoming</p>
          </div>
          <div className='panel-stat-card'>
            <p className='panel-stat-label'>Cancelled</p>
            <p className='panel-stat-value'>{formatCurrency(cancellationStats.amount)}</p>
            <p className='text-xs text-slate-500 mt-1'>{cancellationStats.count} cancelled</p>
          </div>
        </div>
      </div>

      <div className='panel-analytics-grid'>
        <div className='panel-section p-5'>
          <div className='panel-analytics-head'>
            <div>
              <p className='panel-analytics-title'>Top Revenue Doctors</p>
              <p className='panel-analytics-subtitle'>Highest earning doctors by completed/paid visits.</p>
            </div>
            <span className='panel-note-chip'>Top 8</span>
          </div>
          <div className='panel-chart-shell'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={revenueByDoctor} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray='4 6' vertical={false} stroke='#e2e8f0' />
                <XAxis dataKey='name' tickLine={false} axisLine={false} fontSize={11} interval={0} angle={-15} textAnchor='end' height={50} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip cursor={{ fill: 'rgba(15, 23, 42, 0.06)' }} formatter={(value) => formatCurrency(value)} />
                <Bar dataKey='revenue' radius={[10, 10, 0, 0]} fill='#0f172a' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='panel-section p-5'>
          <div className='panel-analytics-head'>
            <div>
              <p className='panel-analytics-title'>Revenue By Speciality</p>
              <p className='panel-analytics-subtitle'>Specialities driving the most earnings.</p>
            </div>
            <span className='panel-note-chip'>Top 8</span>
          </div>
          <div className='panel-chart-shell'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={revenueBySpeciality} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray='4 6' vertical={false} stroke='#e2e8f0' />
                <XAxis dataKey='speciality' tickLine={false} axisLine={false} fontSize={11} interval={0} angle={-15} textAnchor='end' height={50} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip cursor={{ fill: 'rgba(15, 23, 42, 0.06)' }} formatter={(value) => formatCurrency(value)} />
              <Bar dataKey='revenue' radius={[10, 10, 0, 0]} fill='#0b1f4d' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className='panel-analytics-grid'>
        <div className='panel-section p-5'>
          <div className='panel-analytics-head'>
            <div>
              <p className='panel-analytics-title'>Appointments Per Day</p>
              <p className='panel-analytics-subtitle'>Last 7 days booking volume.</p>
            </div>
            <span className='panel-note-chip'>Weekly</span>
          </div>
          <div className='panel-chart-shell'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={appointmentsPerDay} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray='4 6' vertical={false} stroke='#e2e8f0' />
                <XAxis dataKey='label' tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(15, 23, 42, 0.06)' }} />
                <Bar dataKey='count' radius={[10, 10, 0, 0]} fill='#0f172a' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='panel-section p-5'>
          <div className='panel-analytics-head'>
            <div>
              <p className='panel-analytics-title'>Top Doctors</p>
              <p className='panel-analytics-subtitle'>Most booked in the current dataset.</p>
            </div>
            <span className='panel-note-chip'>Top 6</span>
          </div>
          <div className='panel-chart-shell'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={topDoctors} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray='4 6' vertical={false} stroke='#e2e8f0' />
                <XAxis dataKey='name' tickLine={false} axisLine={false} fontSize={11} interval={0} angle={-15} textAnchor='end' height={50} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(15, 23, 42, 0.06)' }} />
              <Bar dataKey='count' radius={[10, 10, 0, 0]} fill='#0b1f4d' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='panel-section p-5'>
          <div className='panel-analytics-head'>
            <div>
              <p className='panel-analytics-title'>Busiest Time Slots</p>
              <p className='panel-analytics-subtitle'>Peak appointment hours.</p>
            </div>
            <span className='panel-note-chip'>Top 6</span>
          </div>
          <div className='panel-chart-shell'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={busiestSlots} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray='4 6' vertical={false} stroke='#e2e8f0' />
                <XAxis dataKey='slot' tickLine={false} axisLine={false} fontSize={11} interval={0} angle={-15} textAnchor='end' height={50} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(15, 23, 42, 0.06)' }} />
                <Bar dataKey='count' radius={[10, 10, 0, 0]} fill='#2563eb' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className='panel-section overflow-hidden'>
        <div className='panel-section-head flex items-center gap-2.5 px-5 py-4 border-b'>
          <img src={assets.list_icon} alt="" />
          <p className='panel-section-headline'>Latest Bookings</p>
        </div>

        <div className='py-2'>
          {dashData.latestAppointments.slice(0, 5).map((item, index) => {
            const parseSlotDateTime = (slotDate, slotTime) => {
              if (!slotDate || !slotTime) return null
              const [day, month, year] = String(slotDate).split('_').map(Number)
              if (!day || !month || !year) return null
              const timeMatch = String(slotTime).trim().toUpperCase().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/)
              if (!timeMatch) return new Date(year, month - 1, day)
              let hours = Number(timeMatch[1])
              const minutes = Number(timeMatch[2])
              const meridiem = timeMatch[3]
              if (meridiem === 'PM' && hours !== 12) hours += 12
              if (meridiem === 'AM' && hours === 12) hours = 0
              return new Date(year, month - 1, day, hours, minutes, 0, 0)
            }

            const appointmentDate = parseSlotDateTime(item.slotDate, item.slotTime)
            const isPast = appointmentDate ? appointmentDate < new Date() : false
            const isCompleted = Boolean(item.isCompleted || item.completedAt || (isPast && !item.cancelled))

            const statusLabel = item.cancelled
              ? { text: 'Cancelled', className: 'panel-status-cancel' }
              : isCompleted
                ? { text: 'Completed', className: 'panel-status-complete' }
                : { text: 'Upcoming', className: 'panel-note-chip' }

            return (
            <div className='panel-table-row flex items-center gap-3' key={index}>
              <img className='rounded-full w-10' src={item.docData.image} alt="" />
              <div className='flex-1 text-sm'>
                <p className='text-slate-800 font-medium'>{item.docData.name}</p>
                <p className='text-slate-500 '>Booking on {slotDateFormat(item.slotDate)}</p>
              </div>
              {item.cancelled || item.isCompleted ? (
                <p className={statusLabel.className}>{statusLabel.text}</p>
              ) : (
                <div className='flex items-center gap-3'>
                  <span className={statusLabel.className}>{statusLabel.text}</span>
                  <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                </div>
              )}
            </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
