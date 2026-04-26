// Shared components for OCEAN v2 — minimised shapes & lines
const { useState, useEffect, useMemo, useRef } = React;

function Navbar({ current, onNav }) {
  const links = [
    { id: 'home', label: 'Overview' },
    { id: 'test', label: 'Take the test' },
    { id: 'results', label: 'Retrieve' },
    { id: 'about', label: 'Method' },
  ];
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'var(--bone)',
      borderBottom: '1px solid var(--hairline)',
      padding: '0 clamp(24px, 4vw, 48px)',
      height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <button onClick={() => onNav('home')} style={{
        display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 0, cursor: 'pointer', padding: 0,
      }}>
        <Logomark size={18} />
        <span style={{ fontFamily: 'var(--sans)', fontWeight: 500, fontSize: 14, color: 'var(--ink)' }}>OCEAN</span>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {links.map(l => (
          <button key={l.id} onClick={() => onNav(l.id)} style={{
            background: 'none', border: 0, cursor: 'pointer', padding: 0,
            fontFamily: 'var(--sans)', fontSize: 13,
            color: current === l.id ? 'var(--ink)' : 'var(--ink-3)',
            fontWeight: current === l.id ? 500 : 400,
          }}>
            {l.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function Logomark({ size = 18 }) {
  // Single trait dot, minimal
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="var(--clay)" />
    </svg>
  );
}

function Footer() {
  return (
    <footer style={{
      marginTop: 128, padding: '40px clamp(24px, 4vw, 48px)',
      borderTop: '1px solid var(--hairline)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontSize: 12, color: 'var(--ink-3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Logomark size={12} />
        <span>OCEAN Instrument</span>
      </div>
      <span>© 2026 · Built on open science</span>
    </footer>
  );
}

// Kept for API compatibility — renders nothing
function BauhausComposition() { return null; }
function Ticker() { return null; }

function TraitDisc({ trait, size = 10 }) {
  const c = { O: 'var(--trait-O)', C: 'var(--trait-C)', E: 'var(--trait-E)', A: 'var(--trait-A)', N: 'var(--trait-N)' }[trait];
  return <span style={{ display: 'inline-block', width: size, height: size, background: c, borderRadius: '50%', verticalAlign: 'middle' }} />;
}

Object.assign(window, { Navbar, Logomark, Footer, BauhausComposition, Ticker, TraitDisc });
