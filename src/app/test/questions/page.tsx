'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

// Types
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

const QUESTIONS_PER_PAGE = 5

export default function QuestionsPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)

  // Load questions from the bigfive-org package
  useEffect(() => {
   async function loadQuestions() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { getQuestions, getChoices } = require('@bigfive-org/questions')
        const choices = getChoices('en')
        const qs = getQuestions('en').map((q: Question) => ({ 
  ...q, 
  choices: choices[q.keyed as 'plus' | 'minus'] 
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

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE)
  const currentQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  )
  const progressPercent = totalPages > 0 ? Math.round(((currentPage) / totalPages) * 100) : 0

  const handleAnswer = (questionId: string, domain: string, facet: number, score: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { questionId, domain, facet, score },
    }))
  }

  const currentPageAnswered = currentQuestions.every(q => answers[q.id] !== undefined)

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(p => p + 1)
      window.scrollTo(0, 0)
    }
  }

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(p => p - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleFinish = () => {
    const answerArray = Object.values(answers).map(a => ({
      domain: a.domain,
      facet: a.facet,
      score: a.score,
    }))
    sessionStorage.setItem('testAnswers', JSON.stringify(answerArray))
    router.push('/result')
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ backgroundColor: '#FAFAF8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '16px', color: '#6B6B6B', fontFamily: 'Inter, sans-serif' }}>
            Loading questions...
          </p>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: '#FAFAF8', minHeight: '100vh', padding: '48px 24px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>

          {/* Progress Section */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <p style={{ fontSize: '12px', fontWeight: 500, color: '#6B6B6B', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
                Page {currentPage + 1} of {totalPages}
              </p>
              <p style={{ fontSize: '12px', fontWeight: 500, color: '#6B6B6B', fontFamily: 'Inter, sans-serif' }}>
                {progressPercent}% complete
              </p>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '3px', backgroundColor: '#F5F5F5' }}>
              <div style={{ height: '3px', backgroundColor: '#1A1A1A', width: `${progressPercent}%`, transition: 'width 300ms ease' }} />
            </div>
          </div>

          {/* Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', marginBottom: '64px' }}>
            {currentQuestions.map((question, index) => (
              <div key={question.id}>
                {/* Question number and text */}
                <p style={{ fontSize: '12px', fontWeight: 500, color: '#6B6B6B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>
                  Question {currentPage * QUESTIONS_PER_PAGE + index + 1}
                </p>
                <p style={{ fontSize: '18px', fontWeight: 500, color: '#1A1A1A', marginBottom: '24px', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
                  I {question.text.charAt(0).toLowerCase() + question.text.slice(1)}
                </p>

                {/* Likert Scale */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', textAlign: 'center' }}>
                {question.choices.map((choice, ci) => (
                    <div key={choice.score} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Inter, sans-serif', height: '16px' }}>
                        {ci === 0 ? 'Strongly Disagree' : ci === 2 ? 'Neutral' : ci === 4 ? 'Strongly Agree' : ''}
                    </span>
                    <button
                        onClick={() => handleAnswer(question.id, question.domain, question.facet, choice.score)}
                        title={choice.text}
                        className="likert-circle"
                        style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: answers[question.id]?.score === choice.score ? '2px solid #1A1A1A' : '1.5px solid #2D2D2D',
                        backgroundColor: answers[question.id]?.score === choice.score ? '#1A1A1A' : '#FFFFFF',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 150ms ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        }}
                    >
                        {answers[question.id]?.score === choice.score && (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
                        )}
                    </button>
                    </div>
                ))}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '32px', borderTop: '1px solid #F5F5F5' }}>
            {/* Back button */}
            <button
              onClick={handleBack}
              disabled={currentPage === 0}
              style={{
                padding: '14px 32px',
                backgroundColor: 'transparent',
                color: currentPage === 0 ? '#D4D4D4' : '#1A1A1A',
                border: `1px solid ${currentPage === 0 ? '#D4D4D4' : '#1A1A1A'}`,
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                borderRadius: '4px',
              }}
            >
              Back
            </button>

            {/* Page number indicators */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '400px' }}>
              {Array.from({ length: Math.min(totalPages, 24) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  style={{
                    width: '28px',
                    height: '28px',
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: i === currentPage ? '#1A1A1A' : 'transparent',
                    color: i === currentPage ? '#FFFFFF' : '#6B6B6B',
                    border: '1px solid',
                    borderColor: i === currentPage ? '#1A1A1A' : '#F5F5F5',
                    cursor: 'pointer',
                    fontWeight: i === currentPage ? 600 : 400,
                    borderRadius: '4px',
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Next or Finish button */}
            {currentPage < totalPages - 1 ? (
              <button
                onClick={handleNext}
                disabled={!currentPageAnswered}
                style={{
                  padding: '14px 32px',
                  backgroundColor: currentPageAnswered ? '#1A1A1A' : '#D4D4D4',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '16px',
                  fontFamily: 'Inter, sans-serif',
                  cursor: currentPageAnswered ? 'pointer' : 'not-allowed',
                  fontWeight: 500,
                  borderRadius: '4px',
                }}
                onMouseEnter={e => { if (currentPageAnswered) e.currentTarget.style.backgroundColor = '#EA580C' }}
                onMouseLeave={e => { if (currentPageAnswered) e.currentTarget.style.backgroundColor = '#1A1A1A' }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={!currentPageAnswered}
                style={{
                  padding: '14px 32px',
                  backgroundColor: currentPageAnswered ? '#1A1A1A' : '#D4D4D4',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '16px',
                  fontFamily: 'Inter, sans-serif',
                  cursor: currentPageAnswered ? 'pointer' : 'not-allowed',
                  fontWeight: 500,
                  borderRadius: '4px',
                }}
                onMouseEnter={e => { if (currentPageAnswered) e.currentTarget.style.backgroundColor = '#15803D' }}
                onMouseLeave={e => { if (currentPageAnswered) e.currentTarget.style.backgroundColor = '#1A1A1A' }}
              >
                Finish Test
              </button>
            )}
          </div>

        </div>
      </main>
    </>
  )
}