import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Store, Loader2, ShieldX, MailCheck, Eye, EyeOff } from 'lucide-react'
import * as api from '@/lib/api'
import s from './RegisterAdmin.module.css'

export default function RegisterAdmin() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''

  const [state, setState] = useState({ kind: 'checking' })
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    function run() {
      if (!token) {
        setState({ kind: 'invalid', reason: 'This invitation link is missing its token.' })
        return
      }
      api.validateInvitation(token)
        .then(({ email }) => setState({ kind: 'ready', email }))
        .catch((err) => setState({ kind: 'invalid', reason: err instanceof Error ? err.message : 'Invalid invitation.' }))
    }
    run()
  }, [token])

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const user = await api.registerAdmin(token, name, password)
      navigate('/login', { state: { registered: `Welcome, ${user.name}! Your admin account for ${user.email} is active — sign in to continue.` } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.cardLogo}>
          <div className={s.cardLogoIcon}><Store size={18} /></div>
          <div>
            <p className={s.cardLogoName}>MyDuka</p>
            <p className={s.cardLogoSub}>Admin invitation</p>
          </div>
        </div>

        {state.kind === 'checking' && (
          <div className={s.checking}>
            <Loader2 size={24} className={s.spinner} />
            <p>Verifying your invitation…</p>
          </div>
        )}

        {state.kind === 'invalid' && (
          <div className={s.invalid}>
            <div className={s.invalidIcon}><ShieldX size={24} /></div>
            <h1 className={s.invalidTitle}>Invitation not valid</h1>
            <p className={s.invalidReason}>{state.reason}</p>
            <Link to="/login"><button className={s.backBtn}>Back to sign in</button></Link>
          </div>
        )}

        {state.kind === 'ready' && (
          <>
            <div className={s.inviteBanner}>
              <MailCheck size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <p>
                You've been invited to MyDuka as a <strong>Store Admin</strong> for{' '}
                <strong>{state.email}</strong>. Set your name and password to activate the account.
              </p>
            </div>

            {error && <div className={s.errorAlert}>{error}</div>}

            <form onSubmit={onSubmit} className={s.form}>
              <div className={s.field}>
                <label className={s.label} htmlFor="name">Full name</label>
                <input id="name" className={s.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="John Kamau" required />
              </div>
              <div className={s.field}>
                <label className={s.label} htmlFor="password">Password</label>
                <div className={s.passwordWrap}>
                  <input id="password" className={`${s.input} ${s.passwordInput}`}
                    type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} />
                  <button type="button" className={s.eyeBtn} onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className={s.field}>
                <label className={s.label} htmlFor="confirm">Confirm password</label>
                <input id="confirm" className={s.input} type={showPassword ? 'text' : 'password'}
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat your password" required />
              </div>
              <button type="submit" className={s.submitBtn} disabled={loading}>
                {loading && <Loader2 size={16} className={s.spinner} />}
                Activate admin account
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
