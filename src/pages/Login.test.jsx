import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import Login from './Login'
import { AuthProvider } from '@/lib/auth'

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('Login page', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the sign in form and demo accounts', () => {
    renderLogin()

    expect(screen.getByRole('heading', { name: /^sign in$/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/^Email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Demo accounts$/i)).toBeInTheDocument()
  })

  it('fills a demo credential when a demo user button is clicked', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: /admin@myduka.com/i }))

    expect(screen.getByLabelText(/^Email$/i)).toHaveValue('admin@myduka.com')
    expect(screen.getByLabelText(/^Password$/i)).toHaveValue('password123')
  })
})
