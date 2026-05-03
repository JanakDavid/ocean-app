'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { questionHints } from '@/lib/questionHints'
import { questionHintsCz } from '@/lib/questionHintsCz'
import { useTranslation } from '@/lib/useTranslation'
import { useLanguage } from '@/lib/LanguageContext'
import czechQuestionsData from '@/lib/czechQuestions.json'

const PROGRESS_KEY = 'ocean-test-progress'
const PROGRESS_TTL = 24 * 60 * 60 * 1000 // 24 hours

interface Choice {
  text: string
  score: number
  color: number
}

interface Question {
  id: string
  text: string
  keyed: string
  domain: string
  facet: number
  num: number
  choices: Choice[]
}

interface Answer {
  questionId: string
  domain: string
  facet: number
  score: number
}

const czechMap: Record<string, string> = Object.fromEntries(
  czechQuestionsData.map(q => [q.id, q.czech])
)

export default function QuestionsPage() {
  const router = useRouter()
  const t = useTranslation()
  const { lang } = useLanguage()
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [resumePrompt, setResumePrompt] = useState<{ count: number } | null>(null)
  const savedProgress = useRef<{ answers: Record<string, Answer>; currentQuestion: number } | null>(null)
  const promptDismissed = useRef(false)

  useEffect(() => {
    async function loadQuestions() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { getQuestions, getChoices } = require('@bigfive-org/questions')
        const choices = getChoices('en')
        const qs = getQuestions('en').map((q: Question) => ({
          ...q,
          choices: choices[q.keyed as 'plus' | 'minus'],
        }))
        setQuestions(Array.isArray(qs) ? qs : [])
      } catch (err) {
        console.error('Failed to load questions:', err)
      } finally {
        setLoading(false)
      }
    }
    loadQuestions()
  }, [])

  // Check for saved progress once questions are loaded
  useEffect(() => {
    if (questions.length === 0) return
    try {
      const raw = localStorage.getItem(PROGRESS_KEY)
      if (!raw) { promptDismissed.current = true; return }
      const parsed = JSON.parse(raw)
      if (Date.now() - parsed.timestamp > PROGRESS_TTL) {
        localStorage.removeItem(PROGRESS_KEY)
        promptDismissed.current = true
        return
      }
      const count = Object.keys(parsed.answers || {}).length
      if (count > 0) {
        savedProgress.current = { answers: parsed.answers, currentQuestion: parsed.currentQuestion ?? 0 }
        setResumePrompt({ count })
      } else {
        promptDismissed.current = true
      }
    } catch {
      localStorage.removeItem(PROGRESS_KEY)
      promptDismissed.current = true
    }
  }, [questions])

  // Save progress on every answer change (after prompt is dismissed)
  useEffect(() => {
    if (!promptDismissed.current || Object.keys(answers).length === 0) return
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({
      answers,
      currentQuestion: currentPage,
      timestamp: Date.now(),
    }))
  }, [answers, currentPage])

  const total = questions.length
  const question = questions[currentPage]
  const displayedIdx = currentPage + 1
  const isFirst = currentPage === 0
  const isLast = currentPage === total - 1
  const hasAnswer = question ? answers[question.id] !== undefined : false

  const handleAnswer = (questionId: string, domain: string, facet: number, score: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { questionId, domain, facet, score },
    }))
  }

  const handleContinue = () => {
    if (savedProgress.current) {
      setAnswers(savedProgress.current.answers)
      setCurrentPage(savedProgress.current.currentQuestion)
    }
    promptDismissed.current = true
    setResumePrompt(null)
  }

  const handleStartFresh = () => {
    localStorage.removeItem(PROGRESS_KEY)
    savedProgress.current = null
    promptDismissed.current = true
    setResumePrompt(null)
  }

  const handleFinish = () => {
    localStorage.removeItem(PROGRESS_KEY)
    const answerArray = Object.values(answers).map(a => ({
      domain: a.domain,
      facet: a.facet,
      score: a.score,
    }))
    sessionStorage.setItem('testAnswers', JSON.stringify(answerArray))
    router.push('/processing')
  }

  const pick = (score: number) => {
    if (!question) return
    handleAnswer(question.id, question.domain, question.facet, score)
    if (!isLast) {
      setTimeout(() => setCurrentPage(p => Math.min(p + 1, total - 1)), 180)
    }
  }

  const goBack = () => { if (!isFirst) { setCurrentPage(p => p - 1); window.scrollTo(0, 0) } }
  const goNext = () => { if (!isLast && hasAnswer) { setCurrentPage(p => p + 1); window.scrollTo(0, 0) } }

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!question) return
      if (e.key >= '1' && e.key <= '5') {
        const idx = parseInt(e.key, 10) - 1
        const choice = question.choices[idx]
        if (choice) pick(choice.score)
      }
      if (e.key === 'ArrowLeft') goBack()
      if (e.key === 'ArrowRight' && hasAnswer && !isLast) goNext()
      if (e.key === 'Enter' && hasAnswer && isLast) handleFinish()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  })

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{
          background: 'var(--bone)', minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 28, color: 'var(--ink-3)', fontStyle: 'italic' }}>
            {t.test.loading}
          </p>
        </main>
      </>
    )
  }

  if (!question && !resumePrompt) return null

  const czechText = question && lang === 'cs' ? (czechMap[question.id] ?? null) : null

  // Resume prompt overlay
  if (resumePrompt) {
    return (
      <div className="screen">
        <Navbar />
        <div style={{
          minHeight: 'calc(100vh - 72px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 'clamp(48px, 8vh, 96px) clamp(24px, 6vw, 96px)',
        }}>
          <div style={{ maxWidth: 560, width: '100%' }}>
            <p className="eyebrow" style={{ marginBottom: 32 }}>
              {lang === 'cs' ? 'Nedokončený test' : 'Unfinished test'}
            </p>
            <p style={{
              fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 4vw, 44px)',
              lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 24,
            }}>
              {lang === 'cs'
                ? <>Máte rozdělaný postup — {resumePrompt.count}/120 otázek.</>
                : <>You have unfinished progress — {resumePrompt.count}/120 questions.</>}
            </p>
            <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.6, marginBottom: 48 }}>
              {lang === 'cs'
                ? 'Chcete pokračovat tam, kde jste skončili?'
                : 'Would you like to continue where you left off?'}
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button className="btn" onClick={handleContinue}>
                {lang === 'cs' ? 'Pokračovat' : 'Continue'} <span className="arrow" />
              </button>
              <button className="btn btn--ghost" onClick={handleStartFresh}>
                {lang === 'cs' ? 'Začít znovu' : 'Start fresh'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <Navbar />

      <div style={{
        minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column',
        padding: 'clamp(48px, 8vh, 96px) clamp(24px, 6vw, 96px)',
        maxWidth: 960, margin: '0 auto',
      }}>

        {/* Progress: thin 2px bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="label">
              {String(displayedIdx).padStart(3, '0')} / {String(total).padStart(3, '0')}
            </span>
            <span className="label" style={{ color: 'var(--ink-3)' }}>
              {Math.round((displayedIdx / total) * 100)}%
            </span>
          </div>
          <div style={{ height: 2, background: 'var(--bone-deep)' }}>
            <div style={{
              height: '100%', background: 'var(--ink)',
              width: `${(displayedIdx / total) * 100}%`,
              transition: 'width 150ms ease',
            }} />
          </div>
        </div>

        {/* Question — centered, fills available space */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
          <div key={question.id} className="fade-in" style={{ textAlign: 'center', maxWidth: 820 }}>
            <p className="eyebrow" style={{ marginBottom: 32, color: 'var(--ink-4)' }}>{t.test.consider}</p>
            <p style={{
              fontFamily: 'var(--serif)', fontSize: 'clamp(36px, 5vw, 64px)',
              lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--ink)',
            }}>
              {czechText
                ? <>&ldquo;{czechText}&rdquo;</>
                : <>&ldquo;I {question.text.charAt(0).toLowerCase() + question.text.slice(1)}&rdquo;</>
              }
            </p>
            {lang === 'cs' && czechText && questionHintsCz[czechText] && (
              <p style={{
                fontSize: 13,
                color: 'var(--ink-3)',
                fontStyle: 'italic',
                marginTop: 16,
                letterSpacing: '0.01em',
              }}>
                {questionHintsCz[czechText]}
              </p>
            )}
            {lang === 'en' && questionHints[question.text] && (
              <p style={{
                fontSize: 13,
                color: 'var(--ink-3)',
                fontStyle: 'italic',
                marginTop: 16,
                letterSpacing: '0.01em',
              }}>
                {questionHints[question.text]}
              </p>
            )}
          </div>
        </div>

        {/* Likert — five bordered cells */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {question.choices.map((choice, ci) => {
              const active = answers[question.id]?.score === choice.score
              return (
                <button key={choice.score} onClick={() => pick(choice.score)} style={{
                  padding: '20px 8px',
                  border: '1px solid ' + (active ? 'var(--ink)' : 'var(--hairline)'),
                  background: active ? 'var(--ink)' : 'transparent',
                  color: active ? 'var(--bone)' : 'var(--ink)',
                  cursor: 'pointer',
                  fontFamily: 'var(--sans)', fontSize: 13,
                  transition: 'all 150ms ease',
                  borderRadius: 0,
                }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--ink)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--hairline)' }}
                >
                  {t.test.likert[ci] ?? choice.text}
                </button>
              )
            })}
          </div>

          <p style={{ marginTop: 16, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12 }}>
            {t.test.pressHint}
          </p>

          {/* Navigation — Back left, Next / Submit right */}
          <div style={{
            marginTop: 32,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <button
              onClick={goBack}
              disabled={isFirst}
              className="btn btn--ghost"
              style={{
                padding: '14px 28px', minHeight: 48, fontSize: 13,
                opacity: isFirst ? 0.3 : 1,
                cursor: isFirst ? 'not-allowed' : 'pointer',
              }}
            >
              <span className="arrow" style={{ transform: 'rotate(180deg)', marginRight: 8, display: 'inline-block' }} />
              {t.test.backBtn}
            </button>

            {isLast ? (
              <button
                onClick={handleFinish}
                disabled={!hasAnswer}
                className="btn"
                style={{
                  padding: '14px 28px', minHeight: 48, fontSize: 13,
                  opacity: hasAnswer ? 1 : 0.35,
                  cursor: hasAnswer ? 'pointer' : 'not-allowed',
                }}
              >
                {t.test.submitBtn} <span className="arrow" />
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={!hasAnswer}
                className="btn"
                style={{
                  padding: '14px 28px', minHeight: 48, fontSize: 13,
                  opacity: hasAnswer ? 1 : 0.35,
                  cursor: hasAnswer ? 'pointer' : 'not-allowed',
                }}
              >
                {t.test.nextBtn} <span className="arrow" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
