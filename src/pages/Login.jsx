import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAuth, homeFor } from '@/lib/auth'
import s from './Login.module.css'

const DEMO_ACCOUNTS = [
  { role: 'Merchant', email: 'merchant@myduka.test', hint: 'Invites & manages admins' },
  { role: 'Admin', email: 'admin@myduka.test', hint: 'Adds & manages clerks' },
  { role: 'Clerk', email: 'clerk@myduka.test', hint: 'Records stock information' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [registeredMsg, setRegisteredMsg] = useState(location.state?.registered ?? null)

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setRegisteredMsg(null)
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(location.state?.from && location.state.from !== '/login' ? location.state.from : homeFor(user.role), { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  function fillDemo(demoEmail) {
    setEmail(demoEmail)
    setPassword('TestPass123')
    setError(null)
    setRegisteredMsg(null)
  }

  return (
    <div className={s.page}>
      <div className={s.brand}>
        <div className={s.brandLogo}>
          <div>
            <p className={s.brandName}>MyDuka</p>
            <p className={s.brandTagline}>Inventory Management</p>
          </div>
        </div>

        <div>
          <h1 className={s.brandHeading}>Do you have the right role?<br />Do you have the right credentials?</h1>
          <p className={s.brandDesc}>
            Every action in MyDuka is scoped to a role. Merchants run the business, admins run
            the store, clerks record what comes in and goes out.
          </p>
          <div className={s.roleCards}>
            {[
              { title: 'Merchant', text: 'Highest-level user: invites, activates and removes store admins.' },
              { title: 'Store Admin', text: 'Onboards clerks and keeps the store team up to date.' },
              { title: 'Clerk', text: 'Signs in to record stock information.' },
            ].map(({ title, text }) => (
              <div key={title} className={s.roleCard}>
                <div>
                  <p className={s.roleCardTitle}>{title}</p>
                  <p className={s.roleCardText}>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className={s.brandFooter}>MyDuka Inventory Management</p>
      </div>

      <div className={s.formPanel}>
        <div className={s.formBox}>
          <div className={s.mobileLogo}>
            <p className={s.mobileLogoName}>MyDuka</p>
          </div>

          <h2 className={s.heading}>Sign in</h2>
          <p className={s.subheading}>Use the email and password for your MyDuka account.</p>

          {registeredMsg && (
            <div className={s.successAlert}>
              <span>{registeredMsg}</span>
            </div>
          )}

          {error && <div className={s.errorAlert}>{error}</div>}

          <form onSubmit={onSubmit} className={s.form}>
            <div className={s.field}>
              <label className={s.label} htmlFor="email">Email</label>
              <input
                id="email"
                className={s.input}
                type="email"
                autoComplete="email"
                placeholder="me@myduka.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={s.field}>
              <label className={s.label} htmlFor="password">Password</label>
              <div className={s.passwordWrap}>
                <input
                  id="password"
                  className={`${s.input} ${s.passwordInput}`}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className={s.eyeBtn} onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <button type="submit" className={s.submitBtn} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className={s.divider}>
            <div className={s.dividerLine} />
            <span className={s.dividerText}>Demo accounts</span>
            <div className={s.dividerLine} />
          </div>

          <div className={s.demoList}>
            {DEMO_ACCOUNTS.map((acc) => (
              <button key={acc.email} type="button" className={s.demoBtn} onClick={() => fillDemo(acc.email)}>
                <div>
                  <p className={s.demoBtnRole}>{acc.role}</p>
                  <p className={s.demoBtnHint}>{acc.hint}</p>
                </div>
                <span className={s.demoBtnEmail}>{acc.email}</span>
              </button>
            ))}
          </div>
          <p className={s.demoNote}>Demo accounts for illustration purposes only.</p>
        </div>
      </div>
    </div>
  )
}
