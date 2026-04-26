'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function TestIntroPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    department: '',
    email: '',
  })

  const handleStart = () => {
    sessionStorage.setItem('userData', JSON.stringify(formData))
    router.push('/test/questions')
  }

  const fields = [
    { key: 'firstName' as const,  label: 'First name', ph: 'Martina' },
    { key: 'department' as const, label: 'Context',    ph: 'Research lab' },
    { key: 'email' as const,      label: 'Email',      ph: 'martina@lab.de' },
  ]

  return (
    <div className="screen">
      <Navbar />

      <div style={{
        minHeight: 'calc(100vh - 72px)',
        padding: 'clamp(64px, 10vh, 128px) clamp(24px, 6vw, 96px)',
        maxWidth: 720, margin: '0 auto',
      }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>Before you begin</p>
        <h1 className="h1" style={{ marginBottom: 24 }}>
          Identify yourself — <span style={{ fontStyle: 'italic', color: 'var(--ink-3)' }}>or don&apos;t.</span>
        </h1>
        <p className="body-lg" style={{ marginBottom: 64, maxWidth: 520 }}>
          All fields are optional. Leave them blank and your result lives under an anonymous ID.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {fields.map(f => (
            <div key={f.key} className="field">
              <label className="label">{f.label}</label>
              <input
                type={f.key === 'email' ? 'email' : 'text'}
                placeholder={f.ph}
                value={formData[f.key]}
                onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
              />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 72, display: 'flex', alignItems: 'center', gap: 24 }}>
          <button className="btn" onClick={handleStart}>
            Begin · 120 items <span className="arrow" />
          </button>
          <button onClick={handleStart} style={{
            background: 'none', border: 0, cursor: 'pointer', padding: 0,
            fontSize: 13, color: 'var(--ink-3)',
            textDecoration: 'underline', textUnderlineOffset: 4,
          }}>
            Skip — stay anonymous
          </button>
        </div>
      </div>
    </div>
  )
}
