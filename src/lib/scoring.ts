/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Answer {
  domain: string
  facet: number
  score: number
}

export function computeScores(answers: Answer[]): any[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { calculateScore } = require('@bigfive-org/score')
  const result = calculateScore({ answers })
  return Object.values(result)
}