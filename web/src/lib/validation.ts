/** Romanian CNP: exactly 13 digits. */
export function isValidCNP(cnp: string): boolean {
  return /^\d{13}$/.test(cnp.trim())
}

/** Romanian CUI: optional "RO" prefix + 2–10 digits. */
export function isValidCUI(cui: string): boolean {
  return /^(RO)?\d{2,10}$/i.test(cui.trim())
}

export const VALID_ROLES = ['BARISTA', 'WAITER', 'DISHWASHER', 'STAGEHAND'] as const
export type ValidRole = (typeof VALID_ROLES)[number]

export function isValidRole(role: string): role is ValidRole {
  return (VALID_ROLES as readonly string[]).includes(role)
}

/** True when a chat message body is non-empty and within the length limit. */
export function isValidMessageBody(content: string, max = 2000): boolean {
  const trimmed = content?.trim() ?? ''
  return trimmed.length > 0 && trimmed.length <= max
}
