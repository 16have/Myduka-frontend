import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import * as api from '@/lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => api.getSession())

  const login = useCallback(async (email, password) => {
    const s = await api.login(email, password)
    setSession(s)
    return s.user
  }, [])

  const logout = useCallback(async () => {
    await api.logout()
    setSession(null)
  }, [])

  const hasRole = useCallback(
    (...roles) => (session ? roles.includes(session.user.role) : false),
    [session],
  )

  const value = useMemo(
    () => ({ user: session?.user ?? null, login, logout, hasRole }),
    [session, login, logout, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export function homeFor(role) {
  switch (role) {
    case 'merchant':
      return '/merchant'
    case 'admin':
      return '/admin'
    case 'clerk':
      return '/clerk'
  }
}

export function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <>{children}</>
}

export function RequireRole({ roles, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />
  return <>{children}</>
}
