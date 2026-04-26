// Screens B for OCEAN v2 — minimised
const SAMPLE_ITEMS = [
  { id: 1, trait: 'O', text: 'I have a vivid imagination.' },
  { id: 2, trait: 'C', text: 'I get chores done right away.' },
  { id: 3, trait: 'E', text: 'I start conversations with strangers.' },
  { id: 4, trait: 'A', text: 'I sympathise with others\u2019 feelings.' },
  { id: 5, trait: 'N', text: 'I get stressed out easily.' },
  { id: 6, trait: 'O', text: 'I enjoy hearing new ideas.' },
];

function QuestionsScreen({ onNav }) {
  const [i, setI] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const item = SAMPLE_ITEMS[i];
  const total = 120;
  const displayedIdx = i + 1;

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key >= '1' && e.key <= '5') pick(parseInt(e.key, 10));
      if (e.key === 'ArrowLeft' && i > 0) setI(i - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const pick = (v) => {
    setAnswers(a => ({ ...a, [item.id]: v }));
    setTimeout(() => {
      if (i < SAMPLE_ITEMS.length - 1) setI(i + 1);
      else onNav('result');
    }, 180);
  };

  const opts = [
    { v: 1, long: 'Strongly disagree' },
    { v: 2, long: 'Disagree' },
    { v: 3, long: 'Neutral' },
    { v: 4, long: 'Agree' },
    { v: 5, long: 'Strongly agree' },
  ];

  return (
    <div className="screen" style={{
      minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column',
      padding: 'clamp(48px, 8vh, 96px) clamp(24px, 6vw, 96px)',
      maxWidth: 960, margin: '0 auto',
    }}>
      {/* Progress: thin hairline only */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span className="label">{String(displayedIdx).padStart(3, '0')} / {total}</span>
          <span className="label" style={{ color: 'var(--ink-4)' }}>
            <TraitDisc trait={item.trait} size={8} />
            <span style={{ marginLeft: 8 }}>
              {{ O: 'Openness', C: 'Conscientiousness', E: 'Extraversion', A: 'Agreeableness', N: 'Neuroticism' }[item.trait]}
            </span>
          </span>
        </div>
        <div style={{ height: 1, background: 'var(--bone-deep)' }}>
          <div style={{ height: '100%', background: 'var(--ink)', width: `${(displayedIdx / total) * 100}%`, transition: 'width 150ms ease' }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
        <div key={item.id} className="fade-in" style={{ textAlign: 'center', maxWidth: 820 }}>
          <p className="eyebrow" style={{ marginBottom: 32, color: 'var(--ink-4)' }}>Consider</p>
          <p style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(36px, 5vw, 64px)',
            lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--ink)',
          }}>
            &ldquo;{item.text}&rdquo;
          </p>
        </div>
      </div>

      {/* Likert — five bordered cells, spaced */}
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {opts.map((o) => {
            const active = answers[item.id] === o.v;
            return (
              <button key={o.v} onClick={() => pick(o.v)} style={{
                padding: '20px 8px',
                border: '1px solid ' + (active ? 'var(--ink)' : 'var(--hairline)'),
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'var(--bone)' : 'var(--ink)',
                cursor: 'pointer',
                fontFamily: 'var(--sans)', fontSize: 13,
                transition: 'all 150ms ease',
                borderRadius: 0,
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--ink)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--hairline)'; }}
              >
                {o.long}
              </button>
            );
          })}
        </div>
        <p style={{ marginTop: 16, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12 }}>
          Press 1 – 5, or click
        </p>
      </div>
    </div>
  );
}

function RetrieveScreen({ onNav }) {
  const [id, setId] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState(null);

  const search = () => {
    if (!id.trim()) return;
    setLoading(true); setErr(null);
    setTimeout(() => {
      setLoading(false);
      if (id.trim().length < 8) { setErr('Result not found. Check the ID and try again.'); return; }
      onNav('result');
    }, 600);
  };

  return (
    <div className="screen" style={{
      minHeight: 'calc(100vh - 72px)',
      padding: 'clamp(80px, 14vh, 160px) clamp(24px, 6vw, 96px)',
      maxWidth: 720, margin: '0 auto',
    }}>
      <p className="eyebrow" style={{ marginBottom: 24 }}>Retrieve result</p>
      <h1 className="h1" style={{ marginBottom: 24 }}>Enter your ID.</h1>
      <p className="body-lg" style={{ marginBottom: 64, maxWidth: 520 }}>
        Paste the UUID you received after completing the test.
      </p>

      <div className="field">
        <label className="label">Result ID</label>
        <input
          value={id}
          onChange={e => setId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="3dd4ca19-647a-40dd-8910-4efc73879225"
          style={{ fontFamily: 'var(--mono)', fontSize: 16 }}
        />
      </div>

      <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 24 }}>
        <button className="btn" onClick={search} disabled={loading || !id.trim()} style={{
          opacity: (loading || !id.trim()) ? 0.35 : 1,
          cursor: (loading || !id.trim()) ? 'not-allowed' : 'pointer',
        }}>
          {loading ? 'Searching…' : 'Retrieve'} <span className="arrow" />
        </button>
        <button onClick={() => onNav('test')} style={{
          background: 'none', border: 0, cursor: 'pointer', padding: 0,
          fontSize: 13, color: 'var(--ink-3)', textDecoration: 'underline', textUnderlineOffset: 4,
        }}>
          Don't have one? Take the test
        </button>
      </div>

      {err && <p style={{ marginTop: 32, fontSize: 14, color: 'var(--clay)' }}>{err}</p>}
    </div>
  );
}

const MOCK_RESULT = {
  id: '3dd4ca19-647a-40dd-8910-4efc73879225',
  createdAt: '2026-04-12',
  firstName: 'Martina',
  department: 'Research Lab',
  traits: [
    { k: 'O', name: 'Openness',           score: 78, desc: 'Imaginative, curious, inclined toward novelty and abstract reasoning.' },
    { k: 'C', name: 'Conscientiousness',  score: 64, desc: 'Organised and reliable, with a steady orientation toward goals.' },
    { k: 'E', name: 'Extraversion',       score: 42, desc: 'Balanced — sociable in familiar settings, reserved with strangers.' },
    { k: 'A', name: 'Agreeableness',      score: 71, desc: 'Cooperative and considerate, with clear limits when tested.' },
    { k: 'N', name: 'Neuroticism',        score: 31, desc: 'Emotionally even; recovers quickly from stressors.' },
  ],
};

function ResultScreen({ onNav }) {
  const [expanded, setExpanded] = React.useState(null);
  const [copied, setCopied] = React.useState(false);
  const r = MOCK_RESULT;

  const copy = () => {
    try { navigator.clipboard.writeText(r.id); } catch (e) {}
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="screen">
      {/* Masthead — single column, no sidebar */}
      <section style={{
        padding: 'clamp(64px, 10vh, 128px) clamp(24px, 6vw, 96px) 64px',
        maxWidth: 960, margin: '0 auto',
      }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>Your result · {r.createdAt}</p>
        <h1 className="display" style={{ fontSize: 'clamp(56px, 8vw, 128px)' }}>
          {r.firstName}.
        </h1>
        <p className="body-lg" style={{ marginTop: 32, maxWidth: 580 }}>
          A behavioural profile against the IPIP-NEO-PI reference cohort.
          Read each score as a percentile — <em>50</em> is exactly average.
        </p>
      </section>

      {/* Trait rows — hairline, expandable */}
      <section style={{ padding: '0 clamp(24px, 6vw, 96px) 96px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ borderTop: '1px solid var(--hairline)' }}>
          {r.traits.map(t => {
            const open = expanded === t.k;
            const color = `var(--trait-${t.k})`;
            return (
              <div key={t.k} style={{ borderBottom: '1px solid var(--hairline)' }}>
                <button onClick={() => setExpanded(open ? null : t.k)} style={{
                  width: '100%', background: 'none', border: 0, cursor: 'pointer', padding: 0,
                  display: 'grid', gridTemplateColumns: '1fr 1.4fr auto', gap: 48, alignItems: 'center',
                  textAlign: 'left',
                }}>
                  <div style={{ padding: '36px 0' }}>
                    <p style={{ fontFamily: 'var(--serif)', fontSize: 32, color, lineHeight: 1, marginBottom: 6 }}>{t.k}</p>
                    <p className="h3" style={{ fontWeight: 500 }}>{t.name}</p>
                  </div>
                  <div style={{ padding: '36px 0' }}>
                    <div style={{ height: 2, background: 'var(--bone-deep)', position: 'relative', marginBottom: 12 }}>
                      <div style={{ position: 'absolute', inset: 0, width: `${t.score}%`, background: color, height: 2 }} />
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>{t.desc}</p>
                  </div>
                  <div style={{ padding: '36px 0', textAlign: 'right' }}>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: 56, lineHeight: 1, color: 'var(--ink)' }}>{t.score}</span>
                  </div>
                </button>
                {open && (
                  <div className="fade-in" style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32,
                    padding: '0 0 40px',
                  }}>
                    {['Fantasy', 'Aesthetics', 'Feelings', 'Actions', 'Ideas', 'Values'].map((f, i) => {
                      const s = Math.max(20, Math.min(90, t.score + (i - 2) * 6));
                      return (
                        <div key={f}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{f}</span>
                            <span className="mono" style={{ fontSize: 12, color }}>{s}</span>
                          </div>
                          <div style={{ height: 1, background: 'var(--bone-deep)' }}>
                            <div style={{ height: 1, background: color, width: `${s}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Interpretation — quiet, on paper */}
      <section style={{ padding: '48px clamp(24px, 6vw, 96px) 64px', maxWidth: 720, margin: '0 auto' }}>
        <p className="eyebrow" style={{ marginBottom: 24 }}>Interpretation</p>
        <p style={{
          fontFamily: 'var(--serif)', fontSize: 'clamp(22px, 2.6vw, 32px)',
          lineHeight: 1.35, letterSpacing: '-0.01em', color: 'var(--ink)',
        }}>
          Curiosity is the organising force of your profile. High Openness and moderate
          Conscientiousness produce a tempered explorer — drawn to ideas yet willing to
          finish what they begin. Reserved warmth, low reactivity.
        </p>
      </section>

      {/* ID + actions */}
      <section style={{
        padding: '48px clamp(24px, 6vw, 96px)', maxWidth: 720, margin: '0 auto',
        borderTop: '1px solid var(--hairline)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <p className="label" style={{ marginBottom: 10 }}>Result ID</p>
            <p className="mono" style={{ fontSize: 13, color: 'var(--ink-2)' }}>{r.id}</p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <button onClick={copy} className="btn btn--ghost" style={{ padding: '14px 22px', minHeight: 44, fontSize: 13 }}>
              {copied ? '✓ Copied' : 'Copy ID'}
            </button>
            <button className="btn" style={{ padding: '14px 22px', minHeight: 44, fontSize: 13 }}>
              Download PDF <span className="arrow" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

Object.assign(window, { QuestionsScreen, RetrieveScreen, ResultScreen });
