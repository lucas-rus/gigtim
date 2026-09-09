import { describe, it, expect } from 'vitest'
import { ro } from './dictionaries/ro'
import { en } from './dictionaries/en'

describe('i18n dictionaries', () => {
  it('should have parity between Romanian and English dictionaries', () => {
    function checkKeys(objRo: Record<string, any>, objEn: Record<string, any>, path = '') {
      for (const key of Object.keys(objRo)) {
        const currentPath = path ? `${path}.${key}` : key
        expect(objEn).toHaveProperty(key)
        if (typeof objRo[key] === 'object' && objRo[key] !== null) {
          expect(typeof objEn[key]).toBe('object')
          checkKeys(objRo[key], objEn[key], currentPath)
        } else {
          expect(typeof objEn[key]).toBe('string')
          expect((objEn[key] as string).length).toBeGreaterThan(0)
        }
      }
    }

    checkKeys(ro, en)
  })

  it('contains critical register and login redirect keys', () => {
    expect(ro.auth.alreadyHaveAccount).toBe('Ai deja un cont?')
    expect(en.auth.alreadyHaveAccount).toBe('Already have an account?')
    expect(ro.auth.logInHere).toBe('Conectează-te')
    expect(en.auth.logInHere).toBe('Log in')
  })
})
