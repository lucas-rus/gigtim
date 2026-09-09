// Centralized Romanian labels for all database enum values
// Use these EVERYWHERE in the UI instead of raw database values

export const roleLabels: Record<string, string> = {
  WORKER: 'Lucrător',
  EMPLOYER: 'Angajator',
  ADMIN: 'Administrator',
}

export const skillLabels: Record<string, string> = {
  BARISTA: 'Barista / Bar Support',
  WAITER: 'Ajutor Ospătar / Servire',
  DISHWASHER: 'Spălător vase / Oficiant',
  KITCHEN_HELP: 'Ajutor Bucătar (prep)',
  STAGEHAND: 'Logistică / Scenotehnică',
  EVENT_CREW: 'Asistent Evenimente / Hostess',
  GARDENER: 'Tuns Iarba / Grădinărit',
  CLEANER: 'Curățenie & Menaj',
  PET_SITTER: 'Îngrijire Animale (Pet Care)',
  PROMOTER: 'Promoter & Sampling',
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

export type JobPillar = 'LAW_52' | 'LAW_111'

export const skillLegalPillar: Record<string, JobPillar> = {
  BARISTA: 'LAW_52',
  WAITER: 'LAW_52',
  DISHWASHER: 'LAW_52',
  KITCHEN_HELP: 'LAW_52',
  STAGEHAND: 'LAW_52',
  EVENT_CREW: 'LAW_52',
  PROMOTER: 'LAW_52',
  GARDENER: 'LAW_111',
  CLEANER: 'LAW_111',
  PET_SITTER: 'LAW_111',
}

export const legalPillarBadges: Record<JobPillar, { badge: string; label: string; description: string }> = {
  LAW_52: {
    badge: '✓ Legea 52/2011',
    label: 'Zilier HoReCa & Evenimente',
    description: 'Declarat electronic ITM · Reținere la sursă (D112)',
  },
  LAW_111: {
    badge: '✓ Legea 111/2022',
    label: 'Prestator Casnic',
    description: 'Tichete casnice · Asigurat sănătate la 85 tichete/lună',
  },
}

