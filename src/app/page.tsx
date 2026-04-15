'use client'

import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main
        style={{
          backgroundColor: '#FAFAF8',
          minHeight: '100vh',
        }}
      >
        {/* Hero Section */}
        <section
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            padding: '96px 24px',
            textAlign: 'center',
          }}
        >
          {/* Label */}
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: '500',
              color: '#6B6B6B',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}
          >
            Scientific · Free · Private
          </p>

          {/* Headline */}
          <h1
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(36px, 6vw, 56px)',
              fontWeight: '700',
              color: '#1A1A1A',
              lineHeight: '1.15',
              letterSpacing: '-0.02em',
              marginBottom: '24px',
            }}
          >
            Understand who you are.
          </h1>

          {/* Subheadline */}
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '18px',
              fontWeight: '400',
              color: '#6B6B6B',
              lineHeight: '1.6',
              maxWidth: '520px',
              margin: '0 auto 16px',
            }}
          >
            The OCEAN test is the most scientifically validated personality
            assessment in psychology. 120 questions. No registration. Your results
            are yours.
          </p>

          {/* Time estimate */}
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '400',
              color: '#6B6B6B',
              marginBottom: '48px',
            }}
          >
            Estimated time: 10–12 minutes
          </p>

          {/* CTA Button */}
          <Link
            href="/test"
            style={{
              display: 'inline-block',
              backgroundColor: '#1A1A1A',
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: '500',
              padding: '16px 48px',
              textDecoration: 'none',
              letterSpacing: '0.01em',
              transition: 'background-color 150ms ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#EA580C'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#1A1A1A'
            }}
          >
            Take the free test
          </Link>

          <p
            style={{
              marginTop: '16px',
              fontSize: '13px',
              color: '#6B6B6B',
            }}
          >
            No registration required
          </p>
        </section>

        {/* Divider */}
        <div
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            padding: '0 24px',
          }}
        >
          <div style={{ borderTop: '1px solid #F5F5F5' }} />
        </div>

        {/* Value Props Section */}
        <section
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            padding: '96px 24px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '48px',
            }}
          >
            {/* Scientific */}
            <div>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#1D4ED8',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                Scientific
              </p>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1A1A1A',
                  marginBottom: '8px',
                  lineHeight: '1.3',
                }}
              >
                Peer-reviewed methodology
              </h3>
              <p style={{ fontSize: '15px', color: '#6B6B6B', lineHeight: '1.6' }}>
                Based on the IPIP-NEO-PI — the gold standard in personality
                research, used by psychologists worldwide.
              </p>
            </div>

            {/* Free */}
            <div>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#15803D',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                Free
              </p>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1A1A1A',
                  marginBottom: '8px',
                  lineHeight: '1.3',
                }}
              >
                Always free, no catch
              </h3>
              <p style={{ fontSize: '15px', color: '#6B6B6B', lineHeight: '1.6' }}>
                No subscription, no premium tier. The full assessment and your
                complete results at no cost.
              </p>
            </div>

            {/* Private */}
            <div>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#EA580C',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                Private
              </p>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1A1A1A',
                  marginBottom: '8px',
                  lineHeight: '1.3',
                }}
              >
                No registration needed
              </h3>
              <p style={{ fontSize: '15px', color: '#6B6B6B', lineHeight: '1.6' }}>
                Name and email are optional. Your result is stored by a unique
                ID only — no account, no tracking.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            borderTop: '1px solid #F5F5F5',
            padding: '32px 24px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '14px', color: '#6B6B6B' }}>
            © {new Date().getFullYear()} OCEAN Platform · Built on open science
          </p>
        </footer>
      </main>
    </>
  )
}