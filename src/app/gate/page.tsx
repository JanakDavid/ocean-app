'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GatePage() {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value === 'WhoIsCher') {
      document.cookie = 'ocean_access=WhoIsCher; path=/; max-age=604800'
      router.push('/')
    } else {
      setError(true)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bone)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(48px, 8vw, 96px) clamp(24px, 6vw, 96px)',
    }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        <p className="eyebrow" style={{ marginBottom: 32 }}>Private Testing</p>

        <h1 className="h1" style={{ marginBottom: 56 }}>
          Enter access code
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginBottom: 32 }}>
            <label className="label" htmlFor="access-code">Access code</label>
            <input
              id="access-code"
              type="password"
              placeholder="••••••••"
              value={value}
              onChange={e => { setValue(e.target.value); setError(false) }}
              autoFocus
            />
          </div>

          {error && (
            <p style={{
              fontSize: 13,
              color: 'var(--clay)',
              marginBottom: 24,
              marginTop: -16,
            }}>
              Incorrect access code
            </p>
          )}

          <button type="submit" className="btn">
            Submit <span className="arrow" />
          </button>
        </form>
      </div>
    </div>
  )
}
