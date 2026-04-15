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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    fontFamily: 'Inter, sans-serif',
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
    border: '1px solid #2D2D2D',
    outline: 'none',
    borderRadius: 0,
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500' as const,
    color: '#6B6B6B',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    marginBottom: '8px',
  }

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#FAFAF8', minHeight: '100vh', padding: '64px 24px' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>

          <p style={{ fontSize: '12px', fontWeight: 500, color: '#6B6B6B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Before you begin
          </p>

          <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, letterSpacing: '-0.01em', marginBottom: '16px', fontFamily: 'Inter, sans-serif' }}>
            Tell us a little about yourself
          </h1>

          <p style={{ fontSize: '16px', color: '#6B6B6B', lineHeight: 1.6, marginBottom: '48px' }}>
            All fields are optional. This information helps contextualise your results
            and allows us to send you your result ID by email.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            <div>
              <label style={labelStyle}>
                First Name <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Martina"
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.border = '2px solid #1A1A1A' }}
                onBlur={e => { e.currentTarget.style.border = '1px solid #2D2D2D' }}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Department <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Marketing"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.border = '2px solid #1A1A1A' }}
                onBlur={e => { e.currentTarget.style.border = '1px solid #2D2D2D' }}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Email <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <input
                type="email"
                placeholder="e.g. martina@company.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.border = '2px solid #1A1A1A' }}
                onBlur={e => { e.currentTarget.style.border = '1px solid #2D2D2D' }}
              />
            </div>

          </div>

          <div style={{ marginTop: '40px', padding: '20px 24px', backgroundColor: '#FFFFFF', borderTop: '3px solid #1A1A1A', border: '1px solid #F5F5F5', borderTopWidth: '3px', borderTopColor: '#1A1A1A' }}>
            <p style={{ fontSize: '12px', fontWeight: 500, color: '#1A1A1A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Privacy Notice
            </p>
            <p style={{ fontSize: '13px', color: '#6B6B6B', lineHeight: 1.6 }}>
              Your name and email are stored only if provided and used solely to send your result ID.
              Your answers are stored anonymously by a unique ID. No tracking cookies are used.
              You may request deletion at any time.
            </p>
          </div>

          <button
            onClick={handleStart}
            style={{ marginTop: '40px', width: '100%', padding: '18px', backgroundColor: '#1A1A1A', color: '#FFFFFF', fontSize: '16px', fontWeight: 500, fontFamily: 'Inter, sans-serif', border: 'none', cursor: 'pointer', letterSpacing: '0.01em' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EA580C' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A' }}
          >
            Start Test
          </button>

          <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px', color: '#6B6B6B' }}>
            Prefer to stay anonymous?{' '}
            <button
              onClick={handleStart}
              style={{ background: 'none', border: 'none', color: '#1D4ED8', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontFamily: 'Inter, sans-serif' }}
            >
              Skip and start the test
            </button>
          </p>

        </div>
      </main>
    </>
  )
}