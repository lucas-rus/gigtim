// Centralized Romanian labels for all database enum values
// Use these EVERYWHERE in the UI instead of raw database values

export const roleLabels: Record<string, string> = {
  WORKER: 'Lucrător',
  EMPLOYER: 'Angajator',
  ADMIN: 'Administrator',
}

export const skillLabels: Record<string, string> = {
  BARISTA: '☕ Barista',
  WAITER: '🍽️ Ospătar',
  DISHWASHER: '🧽 Spălător vase',
  STAGEHAND: '🎭 Stagehand',
}

export const shiftStatusLabels: Record<string, string> = {
  OPEN: 'Deschis',
  FILLED: 'Ocupat',
  IN_PROGRESS: 'În desfășurare',
  COMPLETED: 'Finalizat',
  CANCELLED: 'Anulat',
}

export const applicationStatusLabels: Record<string, string> = {
  PENDING: 'În așteptare',
  ACCEPTED: 'Acceptat',
  REJECTED: 'Respins',
  NO_SHOW: 'Absent',
}

export const verificationStatusLabels: Record<string, string> = {
  PENDING: 'În așteptare',
  APPROVED: 'Aprobat',
  REJECTED: 'Respins',
  EXPIRED: 'Expirat',
  NEEDS_REVIEW: 'Necesită revizuire',
}

// Helper to get a label from any map, falling back to the raw value
export function getLabel(map: Record<string, string>, value: string | null | undefined): string {
  if (!value) return 'Nespecificat'
  return map[value] || value
}
