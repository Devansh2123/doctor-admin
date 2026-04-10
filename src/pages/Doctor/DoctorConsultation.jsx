import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DoctorContext } from '../../context/DoctorContext'

const DoctorConsultation = () => {
  const { appointmentId } = useParams()
  const { backendUrl, dToken } = useContext(DoctorContext)

  const [loading, setLoading] = useState(true)
  const [consultation, setConsultation] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)

  const loadConsultation = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const { data } = await axios.get(`${backendUrl}/api/doctor/consultation/${appointmentId}`, { headers: { dToken } })
      if (data.success) {
        setConsultation(data.consultation)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const sendMessage = async () => {
    try {
      if (!messageText.trim()) return
      setSending(true)
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/consultation/message`,
        { appointmentId, message: messageText },
        { headers: { dToken } }
      )
      if (data.success) {
        setMessageText('')
        await loadConsultation(true)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    if (dToken) {
      loadConsultation()
    }
  }, [dToken, appointmentId])

  useEffect(() => {
    if (!dToken) return
    const intervalId = setInterval(() => {
      loadConsultation(true)
    }, 5000)
    return () => clearInterval(intervalId)
  }, [dToken, appointmentId])

  const sortedMessages = useMemo(() => {
    if (!consultation?.messages) return []
    return [...consultation.messages].sort((a, b) => a.date - b.date)
  }, [consultation])

  if (loading) return <div className='panel-page text-sm text-slate-500'>Loading consultation...</div>
  if (!consultation) return <div className='panel-page text-sm text-slate-500'>Consultation not found.</div>

  return (
    <div className='panel-page'>
      <div className='panel-page-header'>
        <div>
          <p className='panel-page-title'>Consultation Room</p>
          <p className='panel-page-subtitle'>Video session and secure chat for patient follow‑up.</p>
        </div>
      </div>
      <div className='grid lg:grid-cols-[2fr_1fr] gap-4'>
      <div className='panel-section overflow-hidden bg-black min-h-[460px]'>
        <iframe
          title='Doctor Video Consultation'
          src={`${consultation.videoUrl}#config.prejoinPageEnabled=false`}
          allow='camera; microphone; fullscreen; display-capture'
          className='w-full h-[76vh] min-h-[460px]'
        />
      </div>

      <div className='panel-chat-shell'>
        <p className='panel-chat-head'>Consultation Chat</p>
        <div className='flex-1 overflow-y-auto py-3 space-y-2'>
          {sortedMessages.length === 0 && <p className='text-xs text-slate-500'>No messages yet.</p>}
          {sortedMessages.map((item, index) => {
            const isMine = item.senderType === 'doctor'
            return (
              <div key={`${item.date}-${index}`} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={isMine ? 'panel-chat-mine' : 'panel-chat-other'}>
                  <p className='font-medium mb-1'>{item.senderName}</p>
                  <p>{item.message}</p>
                  <p className={`mt-1 ${isMine ? 'text-white/80' : 'text-slate-400'}`}>
                    {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        <div className='border-t pt-2 flex gap-2 border-[var(--panel-accent-border)]'>
          <input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder='Type a message...'
            className='panel-input flex-1'
            onKeyDown={(e) => e.key === 'Enter' && !sending && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={sending}
            className='panel-btn px-4 py-2 rounded text-sm disabled:opacity-50'
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}

export default DoctorConsultation
