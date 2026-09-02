import { beforeEach, describe, expect, it } from 'vitest'

import { getSession, login, logout } from './api'

describe('auth api', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('logs in a seeded merchant with the demo password', async () => {
    const session = await login('merchant@myduka.com', 'password123')

    expect(session.user.email).toBe('merchant@myduka.com')
    expect(session.user.role).toBe('merchant')
    expect(getSession().user.email).toBe('merchant@myduka.com')
  })

  it('rejects an incorrect password', async () => {
    await expect(login('admin@myduka.com', 'wrong-pass')).rejects.toThrow(
      'Incorrect password. Please try again.',
    )
  })

  it('clears the active session on logout', async () => {
    await login('clerk@myduka.com', 'password123')
    await logout()

    expect(getSession()).toBeNull()
  })
})
