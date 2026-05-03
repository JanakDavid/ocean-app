'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useTranslation } from '@/lib/useTranslation'

export default function TestIntroPage() {
  const router = useRouter()
  const t = useTranslation()
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
    { key: 'firstName'  as const, label: t.form.fields.firstName.label,  placeholder: t.form.fields.firstName.placeholder },
    { key: 'department' as const, label: t.form.fields.department.label, placeholder: t.form.fields.department.placeholder },
    { key: 'email'      as const, label: t.form.fields.email.label,      placeholder: t.form.fields.email.placeholder },
  ]

  return (
    <div className="screen">
      <Navbar />

      <div style={{
        minHeight: 'calc(100vh - 72px)',
        padding: 'clamp(64px, 10vh, 128px) clamp(24px, 6vw, 96px)',
        maxWidth: 720, margin: '0 auto',
      }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>{t.form.eyebrow}</p>
        <h1 className="h1" style={{ marginBottom: 24 }}>
          {t.form.h1.pre}{' '}
          <span style={{ fontStyle: 'italic', color: 'var(--ink-3)' }}>{t.form.h1.italic}</span>
        </h1>
        <p className="body-lg" style={{ marginBottom: 64, maxWidth: 520 }}>
          {t.form.body}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {fields.map(f => (
            <div key={f.key} className="field">
              <label className="label">{f.label}</label>
              <input
                type={f.key === 'email' ? 'email' : 'text'}
                placeholder={f.placeholder}
                value={formData[f.key]}
                onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  border: 'none',
                  borderBottom: '1px solid var(--ink)',
                  background: 'transparent',
                  fontFamily: 'var(--serif)',
                  fontSize: '22px',
                  color: 'var(--ink)',
                  outline: 'none',
                  borderRadius: 0,
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 72, display: 'flex', alignItems: 'center', gap: 24 }}>
          <button
            className="btn"
            onClick={handleStart}
            style={{
              background: 'var(--ink)',
              color: 'var(--bone)',
              border: 'none',
              borderRadius: 0,
              padding: '20px 32px',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              minHeight: 56,
            }}
          >
            {t.form.beginBtn} <span className="arrow" />
          </button>
          <button onClick={handleStart} style={{
            background: 'none', border: 0, cursor: 'pointer', padding: 0,
            fontSize: 13, color: 'var(--ink-3)',
            textDecoration: 'underline', textUnderlineOffset: 4,
          }}>
            {t.form.skipBtn}
          </button>
        </div>
      </div>
    </div>
  )
}
