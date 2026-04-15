import Link from 'next/link'

export default function Navbar() {
  return (
    <nav
      style={{
        backgroundColor: '#FAFAF8',
        borderBottom: '1px solid #F5F5F5',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '0 24px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '20px',
            fontWeight: '700',
            color: '#1A1A1A',
            textDecoration: 'none',
            letterSpacing: '0.08em',
          }}
        >
          OCEAN
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <Link
            href="/test"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: '500',
              color: '#1A1A1A',
              textDecoration: 'none',
            }}
          >
            Take the Test
          </Link>
          <Link
            href="/results"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: '400',
              color: '#6B6B6B',
              textDecoration: 'none',
            }}
          >
            View Results
          </Link>
        </div>
      </div>
    </nav>
  )
}