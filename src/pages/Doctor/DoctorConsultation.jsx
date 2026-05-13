import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'

const PREDEFINED_MEDICINES = [
  {
    name: 'Paracetamol 650mg',
    dosage: '1 - 0 - 1',
    timing: 'After food - 5 days',
    qty: '10',
    composition: 'Paracetamol 650mg',
    notes: 'Take after meals'
  },
  {
    name: 'Montelukast 10mg',
    dosage: '0 - 0 - 1',
    timing: 'Night - 10 days',
    qty: '10',
    composition: 'Montelukast 10mg',
    notes: 'Take at bedtime'
  },
  {
    name: 'Levocetirizine 5mg',
    dosage: '0 - 0 - 1',
    timing: 'Night - 5 days',
    qty: '5',
    composition: 'Levocetirizine 5mg',
    notes: 'May cause drowsiness'
  },
  {
    name: 'Azithromycin 500mg',
    dosage: '1 - 0 - 0',
    timing: 'Before food - 3 days',
    qty: '3',
    composition: 'Azithromycin 500mg',
    notes: 'Take at same time daily'
  },
  {
    name: 'Pantoprazole 40mg',
    dosage: '1 - 0 - 0',
    timing: 'Before breakfast - 7 days',
    qty: '7',
    composition: 'Pantoprazole 40mg',
    notes: 'Take 30 minutes before breakfast'
  }
]

const emptyMedicineRow = () => ({
  name: '',
  dosage: '',
  timing: '',
  qty: '',
  composition: '',
  notes: ''
})

const listToInput = (value = []) => (Array.isArray(value) ? value.join(', ') : '')
const inputToList = (value = '') => value.split(',').map((item) => item.trim()).filter(Boolean)

const buildDraftFromMedicalRecord = (medicalRecord = {}) => ({
  complaints: medicalRecord.complaints || '',
  diseases: listToInput(medicalRecord.diseases || []),
  symptoms: listToInput(medicalRecord.symptoms || []),
  diagnosis: medicalRecord.diagnosis || '',
  prescription: medicalRecord.prescription || '',
  vitals: {
    pulse: medicalRecord.vitals?.pulse || '',
    temperature: medicalRecord.vitals?.temperature || '',
    spo2: medicalRecord.vitals?.spo2 || ''
  },
  systemicExamination: {
    cvs: medicalRecord.systemicExamination?.cvs || '',
    rs: medicalRecord.systemicExamination?.rs || '',
    cns: medicalRecord.systemicExamination?.cns || '',
    pa: medicalRecord.systemicExamination?.pa || ''
  },
  medicines: Array.isArray(medicalRecord.medicines) && medicalRecord.medicines.length > 0
    ? medicalRecord.medicines.map((item) => ({ ...emptyMedicineRow(), ...item }))
    : [emptyMedicineRow()],
  dietAdvice: medicalRecord.dietAdvice || '',
  nextVisit: medicalRecord.nextVisit || ''
})

const DoctorConsultation = () => {
  const { appointmentId } = useParams()
  const { backendUrl, dToken } = useContext(DoctorContext)
  const { slotDateFormat, calculateAge } = useContext(AppContext)

  const [loading, setLoading] = useState(true)
  const [consultation, setConsultation] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)

  const [draft, setDraft] = useState(buildDraftFromMedicalRecord())
  const [isDraftDirty, setIsDraftDirty] = useState(false)
  const [savingPrescription, setSavingPrescription] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiDiagnosis, setAiDiagnosis] = useState(null)

  const loadConsultation = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const { data } = await axios.get(`${backendUrl}/api/doctor/consultation/${appointmentId}`, { headers: { dToken } })
      if (data.success) {
        setConsultation(data.consultation)
        if (!silent || !isDraftDirty) {
          setDraft(buildDraftFromMedicalRecord(data.consultation?.medicalRecord || {}))
        }
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

  const savePrescription = async () => {
    try {
      setSavingPrescription(true)
      const payload = {
        appointmentId,
        complaints: draft.complaints,
        diseases: inputToList(draft.diseases),
        symptoms: inputToList(draft.symptoms),
        diagnosis: draft.diagnosis,
        prescription: draft.prescription,
        vitals: draft.vitals,
        systemicExamination: draft.systemicExamination,
        medicines: draft.medicines,
        dietAdvice: draft.dietAdvice,
        nextVisit: draft.nextVisit
      }

      const { data } = await axios.post(`${backendUrl}/api/doctor/consultation/prescription`, payload, { headers: { dToken } })
      if (!data.success) {
        toast.error(data.message)
        return
      }

      setDraft(buildDraftFromMedicalRecord(data.medicalRecord || {}))
      setIsDraftDirty(false)
      toast.success(data.message || 'Prescription saved')
      await loadConsultation(true)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSavingPrescription(false)
    }
  }

  const getAiDiagnosis = async () => {
    try {
      const symptoms = inputToList(draft.symptoms)
      if (symptoms.length === 0 && !draft.complaints.trim()) {
        toast.warning('Add symptoms or complaints first')
        return
      }

      setAiLoading(true)
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/consultation/ai-diagnosis`,
        {
          appointmentId,
          symptoms,
          notes: draft.complaints
        },
        { headers: { dToken } }
      )

      if (!data.success) {
        toast.error(data.message)
        return
      }

      setAiDiagnosis(data.diagnosis)
      if (data.diagnosis?.suggestedDiagnosis) {
        setDraft((prev) => ({ ...prev, diagnosis: data.diagnosis.suggestedDiagnosis }))
        setIsDraftDirty(true)
      }
      toast.success('AI diagnosis suggestion updated')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setAiLoading(false)
    }
  }

  useEffect(() => {
    if (dToken) {
      loadConsultation()
    }
  }, [dToken, appointmentId])

  useEffect(() => {
    setIsDraftDirty(false)
  }, [appointmentId])

  useEffect(() => {
    if (!dToken) return
    const intervalId = setInterval(() => {
      loadConsultation(true)
    }, 5000)
    return () => clearInterval(intervalId)
  }, [dToken, appointmentId, isDraftDirty])

  const sortedMessages = useMemo(() => {
    if (!consultation?.messages) return []
    return [...consultation.messages].sort((a, b) => a.date - b.date)
  }, [consultation])

  const patientHistory = consultation?.patientHistory || []
  const appointment = consultation?.appointment
  const patient = appointment?.user || {}

  const updateDraft = (field, value) => {
    setIsDraftDirty(true)
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  const updateNestedDraft = (group, field, value) => {
    setIsDraftDirty(true)
    setDraft((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [field]: value
      }
    }))
  }

  const updateMedicine = (index, field, value) => {
    setIsDraftDirty(true)
    setDraft((prev) => ({
      ...prev,
      medicines: prev.medicines.map((item, idx) => idx === index ? { ...item, [field]: value } : item)
    }))
  }

  const addBlankMedicine = () => {
    setIsDraftDirty(true)
    setDraft((prev) => ({ ...prev, medicines: [...prev.medicines, emptyMedicineRow()] }))
  }

  const addSuggestedMedicine = (medicine) => {
    setIsDraftDirty(true)
    setDraft((prev) => ({ ...prev, medicines: [...prev.medicines, { ...emptyMedicineRow(), ...medicine }] }))
  }

  const removeMedicine = (index) => {
    setIsDraftDirty(true)
    setDraft((prev) => {
      const filtered = prev.medicines.filter((_, idx) => idx !== index)
      return { ...prev, medicines: filtered.length ? filtered : [emptyMedicineRow()] }
    })
  }

  if (loading) return <div className='panel-page text-sm text-slate-500'>Loading consultation...</div>
  if (!consultation || !appointment) return <div className='panel-page text-sm text-slate-500'>Consultation not found.</div>

  return (
    <div className='panel-page'>
      <div className='panel-page-header'>
        <div>
          <p className='panel-page-title'>Consultation + Prescription</p>
          <p className='panel-page-subtitle'>Auto-filled patient data, AI diagnosis support, medicine suggestions, and print-ready format.</p>
        </div>
        <div className='flex gap-2'>
          <button onClick={savePrescription} disabled={savingPrescription} className='panel-btn'>
            {savingPrescription ? 'Saving...' : 'Save Prescription'}
          </button>
          <button onClick={() => window.print()} className='panel-outline-btn'>Print Prescription</button>
        </div>
      </div>

      <div className='grid xl:grid-cols-[2fr_1fr] gap-4'>
        <div className='space-y-4'>
          <div className='panel-section p-4'>
            <p className='panel-section-headline mb-3'>Patient Details (Auto-filled from Appointment)</p>
            <div className='grid sm:grid-cols-4 gap-2 text-sm'>
              <p><span className='font-semibold'>Name:</span> {patient.name || '-'}</p>
              <p><span className='font-semibold'>Code:</span> {patient.patientCode || '-'}</p>
              <p><span className='font-semibold'>Age:</span> {patient.age || calculateAge(patient.dob)}</p>
              <p><span className='font-semibold'>Gender:</span> {patient.gender || '-'}</p>
              <p><span className='font-semibold'>Phone:</span> {patient.phone || '-'}</p>
              <p><span className='font-semibold'>Date:</span> {slotDateFormat(appointment.slotDate)}</p>
              <p className='sm:col-span-2'><span className='font-semibold'>Appointment ID:</span> {appointment.id}</p>
              <p className='sm:col-span-2'><span className='font-semibold'>Appointment Code:</span> {appointment?.appointmentCode || '-'}</p>
            </div>
          </div>

          <div className='panel-section p-4'>
            <p className='panel-section-headline mb-3'>Clinical Notes</p>
            <textarea
              value={draft.complaints}
              onChange={(e) => updateDraft('complaints', e.target.value)}
              placeholder='Complaints'
              rows={2}
              className='panel-input mb-2'
            />
            <div className='grid sm:grid-cols-2 gap-2'>
              <input
                type='text'
                value={draft.diseases}
                onChange={(e) => updateDraft('diseases', e.target.value)}
                placeholder='Diseases (comma separated)'
                className='panel-input'
              />
              <input
                type='text'
                value={draft.symptoms}
                onChange={(e) => updateDraft('symptoms', e.target.value)}
                placeholder='Symptoms (comma separated)'
                className='panel-input'
              />
            </div>

            <div className='grid sm:grid-cols-3 gap-2 mt-2'>
              <input
                type='text'
                value={draft.vitals.pulse}
                onChange={(e) => updateNestedDraft('vitals', 'pulse', e.target.value)}
                placeholder='Pulse (e.g. 80 bpm)'
                className='panel-input'
              />
              <input
                type='text'
                value={draft.vitals.temperature}
                onChange={(e) => updateNestedDraft('vitals', 'temperature', e.target.value)}
                placeholder='Temperature (e.g. N/F)'
                className='panel-input'
              />
              <input
                type='text'
                value={draft.vitals.spo2}
                onChange={(e) => updateNestedDraft('vitals', 'spo2', e.target.value)}
                placeholder='SPO2 (e.g. 99%)'
                className='panel-input'
              />
            </div>

            <div className='grid sm:grid-cols-2 gap-2 mt-2'>
              <input
                type='text'
                value={draft.systemicExamination.cvs}
                onChange={(e) => updateNestedDraft('systemicExamination', 'cvs', e.target.value)}
                placeholder='CVS'
                className='panel-input'
              />
              <input
                type='text'
                value={draft.systemicExamination.rs}
                onChange={(e) => updateNestedDraft('systemicExamination', 'rs', e.target.value)}
                placeholder='RS'
                className='panel-input'
              />
              <input
                type='text'
                value={draft.systemicExamination.cns}
                onChange={(e) => updateNestedDraft('systemicExamination', 'cns', e.target.value)}
                placeholder='CNS'
                className='panel-input'
              />
              <input
                type='text'
                value={draft.systemicExamination.pa}
                onChange={(e) => updateNestedDraft('systemicExamination', 'pa', e.target.value)}
                placeholder='PA'
                className='panel-input'
              />
            </div>

            <div className='grid sm:grid-cols-[1fr_auto] gap-2 mt-2'>
              <textarea
                value={draft.diagnosis}
                onChange={(e) => updateDraft('diagnosis', e.target.value)}
                placeholder='Diagnosis'
                rows={2}
                className='panel-input'
              />
              <button onClick={getAiDiagnosis} disabled={aiLoading} className='panel-outline-btn h-fit'>
                {aiLoading ? 'Generating...' : 'AI Diagnosis'}
              </button>
            </div>

            <textarea
              value={draft.prescription}
              onChange={(e) => updateDraft('prescription', e.target.value)}
              placeholder='Prescription summary / notes'
              rows={2}
              className='panel-input mt-2'
            />
          </div>

          <div className='panel-section p-4'>
            <div className='flex flex-wrap items-center justify-between gap-2 mb-2'>
              <p className='panel-section-headline'>Medicine Suggestions + Rx Table</p>
              <button onClick={addBlankMedicine} className='panel-soft-btn'>Add Medicine Row</button>
            </div>

            <div className='flex flex-wrap gap-2 mb-3'>
              {PREDEFINED_MEDICINES.map((item) => (
                <button key={item.name} onClick={() => addSuggestedMedicine(item)} className='panel-note-chip'>
                  + {item.name}
                </button>
              ))}
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full text-xs border border-slate-200'>
                <thead>
                  <tr className='bg-slate-50 text-slate-700'>
                    <th className='border border-slate-200 p-2 text-left'>Medicine</th>
                    <th className='border border-slate-200 p-2 text-left'>Dose</th>
                    <th className='border border-slate-200 p-2 text-left'>Frequency</th>
                    <th className='border border-slate-200 p-2 text-left'>Duration</th>
                    <th className='border border-slate-200 p-2 text-left'>Composition</th>
                    <th className='border border-slate-200 p-2 text-left'>Notes</th>
                    <th className='border border-slate-200 p-2 text-left'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.medicines.map((medicine, index) => (
                    <tr key={`medicine-${index}`}>
                      <td className='border border-slate-200 p-1'><input className='panel-input py-1 text-xs' value={medicine.name} onChange={(e) => updateMedicine(index, 'name', e.target.value)} /></td>
                      <td className='border border-slate-200 p-1'><input className='panel-input py-1 text-xs' value={medicine.dosage} onChange={(e) => updateMedicine(index, 'dosage', e.target.value)} /></td>
                      <td className='border border-slate-200 p-1'><input className='panel-input py-1 text-xs' value={medicine.timing} onChange={(e) => updateMedicine(index, 'timing', e.target.value)} /></td>
                      <td className='border border-slate-200 p-1'><input className='panel-input py-1 text-xs' value={medicine.qty} onChange={(e) => updateMedicine(index, 'qty', e.target.value)} placeholder='3 Month(s)' /></td>
                      <td className='border border-slate-200 p-1'><input className='panel-input py-1 text-xs' value={medicine.composition} onChange={(e) => updateMedicine(index, 'composition', e.target.value)} /></td>
                      <td className='border border-slate-200 p-1'>
                        <input
                          className='panel-input py-1 text-xs'
                          value={medicine.notes}
                          onChange={(e) => updateMedicine(index, 'notes', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Tab' && index === draft.medicines.length - 1) {
                              e.preventDefault()
                              addBlankMedicine()
                            }
                          }}
                        />
                      </td>
                      <td className='border border-slate-200 p-1'>
                        <button onClick={() => removeMedicine(index)} className='panel-danger-btn'>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <textarea
              value={draft.dietAdvice}
              onChange={(e) => updateDraft('dietAdvice', e.target.value)}
              placeholder='Diet and exercise advice'
              rows={2}
              className='panel-input mt-2'
            />
            <input
              type='text'
              value={draft.nextVisit}
              onChange={(e) => updateDraft('nextVisit', e.target.value)}
              placeholder='Next visit (e.g. 1 month)'
              className='panel-input mt-2'
            />
          </div>

          <div className='prescription-paper'>
            <div className='prescription-head'>
              <div>
                <p className='prescription-doc-name'>{appointment.doctor?.name || 'Doctor'}</p>
                <p className='prescription-small'>{appointment.doctor?.speciality || ''}</p>
              </div>
              <div className='text-center'>
                <p className='prescription-hospital'>Zydus</p>
              </div>
              <div className='text-right'>
                <p className='prescription-doc-name'>{appointment.doctor?.name || 'Doctor'}</p>
                <p className='prescription-small'>{appointment.doctor?.degree || ''}</p>
              </div>
            </div>

            <div className='prescription-row'>
              <p><span className='font-semibold'>Patient:</span> {patient.name || '-'} ({patient.age || calculateAge(patient.dob) || '-'}, {patient.gender || '-'})</p>
              <p><span className='font-semibold'>Date & Time:</span> {slotDateFormat(appointment.slotDate)} {appointment.slotTime}</p>
            </div>

            <div className='prescription-body'>
              <p><span className='font-semibold'>Complaints:</span> {draft.complaints || '-'}</p>
              <p><span className='font-semibold'>Pulse:</span> {draft.vitals.pulse || '-'} | <span className='font-semibold'>Temperature:</span> {draft.vitals.temperature || '-'} | <span className='font-semibold'>SPO2:</span> {draft.vitals.spo2 || '-'}</p>
              <p><span className='font-semibold'>Systemic Examination:</span> CVS: {draft.systemicExamination.cvs || '-'}, RS: {draft.systemicExamination.rs || '-'}, CNS: {draft.systemicExamination.cns || '-'}, PA: {draft.systemicExamination.pa || '-'}</p>
              <p><span className='font-semibold'>Diagnosis:</span> {draft.diagnosis || '-'}</p>
            </div>

            <table className='prescription-table'>
              <thead>
                <tr>
                  <th>S. No</th>
                  <th>Medicine</th>
                  <th>Dose</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {draft.medicines.filter((m) => m.name).length === 0 && (
                  <tr>
                    <td colSpan={6}>No medicines added yet.</td>
                  </tr>
                )}
                {draft.medicines.filter((m) => m.name).map((medicine, index) => (
                  <tr key={`preview-${index}`}>
                    <td>{index + 1}</td>
                    <td>
                      <p className='font-semibold'>{medicine.name}</p>
                      {medicine.composition && <p className='prescription-small'>Composition: {medicine.composition}</p>}
                    </td>
                    <td>{medicine.dosage || '-'}</td>
                    <td>{medicine.timing || '-'}</td>
                    <td>{medicine.qty || '-'}</td>
                    <td>{medicine.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className='prescription-foot'>
              <p><span className='font-semibold'>Diet and Exercise:</span> {draft.dietAdvice || '-'}</p>
              <p><span className='font-semibold'>Next Visit:</span> {draft.nextVisit || '-'}</p>
            </div>
          </div>
        </div>

        <div className='space-y-4'>
          <div className='panel-section p-4'>
            <p className='panel-section-headline mb-2'>AI Diagnosis Result</p>
            {!aiDiagnosis && <p className='text-xs text-slate-500'>Click "AI Diagnosis" after adding symptoms.</p>}
            {aiDiagnosis && (
              <div className='space-y-2 text-xs'>
                <p><span className='font-semibold'>Diagnosis:</span> {aiDiagnosis.suggestedDiagnosis || '-'}</p>
                <p><span className='font-semibold'>Confidence:</span> {aiDiagnosis.confidence || '-'}</p>
                {aiDiagnosis.differentialDiagnoses?.length > 0 && (
                  <p><span className='font-semibold'>Differentials:</span> {aiDiagnosis.differentialDiagnoses.join(', ')}</p>
                )}
                {aiDiagnosis.recommendedQuestions?.length > 0 && (
                  <p><span className='font-semibold'>Questions:</span> {aiDiagnosis.recommendedQuestions.join(', ')}</p>
                )}
                {aiDiagnosis.redFlags?.length > 0 && (
                  <p><span className='font-semibold'>Red Flags:</span> {aiDiagnosis.redFlags.join(', ')}</p>
                )}
                <p className='text-[11px] text-slate-500'>{aiDiagnosis.disclaimer}</p>
              </div>
            )}
          </div>

          <div className='panel-section p-4'>
            <p className='panel-section-headline mb-2'>Previous Prescriptions (History Tracking)</p>
            {patientHistory.length === 0 && (
              <p className='text-xs text-slate-500'>No previous prescriptions for this patient.</p>
            )}
            <div className='space-y-2 max-h-[340px] overflow-y-auto'>
              {patientHistory.map((entry) => (
                <div key={entry.appointmentId} className='border border-slate-200 rounded-lg p-2 text-xs bg-slate-50/60'>
                  <p className='font-semibold text-slate-700'>{entry.slotDateLabel} at {entry.slotTime}</p>
                  {entry.medicalRecord?.diagnosis && <p><span className='font-semibold'>Diagnosis:</span> {entry.medicalRecord.diagnosis}</p>}
                  {entry.medicalRecord?.complaints && <p><span className='font-semibold'>Complaints:</span> {entry.medicalRecord.complaints}</p>}
                  {entry.medicalRecord?.medicines?.length > 0 && (
                    <p>
                      <span className='font-semibold'>Medicines:</span>{' '}
                      {entry.medicalRecord.medicines.map((m) => m.name).filter(Boolean).join(', ')}
                    </p>
                  )}
                  {entry.medicalRecord?.prescription && <p><span className='font-semibold'>Notes:</span> {entry.medicalRecord.prescription}</p>}
                  {entry.prescriptionUrl && (
                    <a href={entry.prescriptionUrl} target='_blank' rel='noreferrer' className='panel-link'>
                      View Uploaded File
                    </a>
                  )}
                </div>
              ))}
            </div>
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
    </div>
  )
}

export default DoctorConsultation
