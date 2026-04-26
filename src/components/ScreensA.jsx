// Screens A for OCEAN v2 — minimised
function HomeScreen({ onNav }) {
  return (
    <div className="screen">
      {/* Hero — single centered column, no side rails, no artwork */}
      <section style={{
        padding: 'clamp(96px, 16vh, 180px) clamp(24px, 6vw, 96px) clamp(72px, 10vh, 128px)',
        maxWidth: 1120, margin: '0 auto',
      }}>
        <p className="eyebrow" style={{ marginBottom: 40 }}>
          A behavioural instrument · 2026
        </p>

        <h1 className="display" style={{ maxWidth: 1000 }}>
          Know the <span style={{ fontStyle: 'italic', color: 'var(--clay)' }}>architecture</span> of a person.
        </h1>

        <p className="body-lg" style={{ marginTop: 40, maxWidth: 580 }}>
          The OCEAN Instrument renders the five enduring dimensions of human personality
          into a single, legible report. Ten minutes. No account. Yours.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 56 }}>
          <button className="btn" onClick={() => onNav('test')}>
            Begin the instrument <span className="arrow" />
          </button>
          <button onClick={() => onNav('results')} style={{
            background: 'none', border: 0, cursor: 'pointer', padding: 0,
            fontSize: 14, color: 'var(--ink-2)',
            textDecoration: 'underline', textUnderlineOffset: 4, textDecorationColor: 'var(--ink-4)',
          }}>
            Retrieve existing result
          </button>
        </div>
      </section>

      {/* Five dimensions — calm list, hairline dividers */}
      <section style={{ padding: '0 clamp(24px, 6vw, 96px) clamp(80px, 12vh, 160px)', maxWidth: 1120, margin: '0 auto' }}>
        <p className="eyebrow" style={{ marginBottom: 40 }}>The five dimensions</p>

        <div>
          {[
            { k: 'O', name: 'Openness',          gloss: 'Imagination, curiosity, breadth of interest.' },
            { k: 'C', name: 'Conscientiousness', gloss: 'Orderliness, diligence, self-discipline.' },
            { k: 'E', name: 'Extraversion',      gloss: 'Warmth, assertiveness, appetite for stimulus.' },
            { k: 'A', name: 'Agreeableness',     gloss: 'Trust, altruism, cooperative tendency.' },
            { k: 'N', name: 'Neuroticism',       gloss: 'Emotional reactivity, recovery from stress.' },
          ].map((t, i, arr) => (
            <div key={t.k} style={{
              display: 'grid', gridTemplateColumns: '72px 1fr 2fr', gap: 32, alignItems: 'baseline',
              padding: '28px 0',
              borderBottom: i < arr.length - 1 ? '1px solid var(--hairline)' : 0,
              borderTop: i === 0 ? '1px solid var(--hairline)' : 0,
            }}>
              <span style={{
                fontFamily: 'var(--serif)', fontSize: 44, lineHeight: 1,
                color: `var(--trait-${t.k})`, letterSpacing: '-0.02em',
              }}>{t.k}</span>
              <span className="h3" style={{ fontWeight: 500 }}>{t.name}</span>
              <span className="body" style={{ color: 'var(--ink-2)', fontSize: 15 }}>{t.gloss}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Method — quiet, same paper, no dark block */}
      <section style={{ padding: 'clamp(48px, 8vh, 96px) clamp(24px, 6vw, 96px)', maxWidth: 760, margin: '0 auto' }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>Method</p>
        <p style={{
          fontFamily: 'var(--serif)', fontSize: 'clamp(26px, 3vw, 40px)',
          lineHeight: 1.3, letterSpacing: '-0.01em', color: 'var(--ink)',
        }}>
          Not a quiz. An instrument. 120 items drawn from the IPIP-NEO-PI — the open-science
          counterpart to the NEO Personality Inventory — scored against a reference cohort of
          adult respondents.
        </p>
      </section>

      {/* Closing CTA */}
      <section style={{
        padding: 'clamp(48px, 8vh, 96px) clamp(24px, 6vw, 96px)',
        maxWidth: 1120, margin: '0 auto', textAlign: 'center',
      }}>
        <button className="btn" onClick={() => onNav('test')}>
          Begin · 120 items · ~10 min <span className="arrow" />
        </button>
      </section>

      <Footer />
    </div>
  );
}

function TestIntroScreen({ onNav, userData, setUserData }) {
  const [d, setD] = React.useState(userData || { firstName: '', department: '', email: '' });
  const commit = () => { setUserData(d); onNav('questions'); };

  return (
    <div className="screen" style={{
      minHeight: 'calc(100vh - 72px)',
      padding: 'clamp(64px, 10vh, 128px) clamp(24px, 6vw, 96px)',
      maxWidth: 720, margin: '0 auto',
    }}>
      <p className="eyebrow" style={{ marginBottom: 24 }}>Before you begin</p>
      <h1 className="h1" style={{ marginBottom: 24 }}>
        Identify yourself — <span style={{ fontStyle: 'italic', color: 'var(--ink-3)' }}>or don't.</span>
      </h1>
      <p className="body-lg" style={{ marginBottom: 64, maxWidth: 520 }}>
        All fields are optional. Leave them blank and your result lives under an anonymous ID.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {[
          { key: 'firstName',  label: 'First name', ph: 'Martina' },
          { key: 'department', label: 'Context',    ph: 'Research lab' },
          { key: 'email',      label: 'Email',      ph: 'martina@lab.de' },
        ].map(f => (
          <div key={f.key} className="field">
            <label className="label">{f.label}</label>
            <input
              type={f.key === 'email' ? 'email' : 'text'}
              placeholder={f.ph}
              value={d[f.key]}
              onChange={e => setD({ ...d, [f.key]: e.target.value })}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 72, display: 'flex', alignItems: 'center', gap: 24 }}>
        <button className="btn" onClick={commit}>
          Begin · 120 items <span className="arrow" />
        </button>
        <button onClick={commit} style={{
          background: 'none', border: 0, cursor: 'pointer', padding: 0,
          fontSize: 13, color: 'var(--ink-3)',
          textDecoration: 'underline', textUnderlineOffset: 4,
        }}>
          Skip — stay anonymous
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, TestIntroScreen });
