import { useNavigate } from 'react-router'
import { useAuth } from '@/lib/auth'
import s from './ClerkWorkspace.module.css'

const CAPABILITIES = [
  { label: 'Receive stock', desc: 'Record new deliveries from suppliers', to: '/clerk/receive-stock' },
  { label: 'View stock levels', desc: 'See current quantities for all products', to: '/clerk/stock' },
  { label: 'Record spoilage', desc: 'Log broken, expired or discarded items', to: '/clerk/spoilage' },
  { label: 'Request supplies', desc: 'Ask the admin to order more stock', to: '/clerk/supply-requests' },
]

export default function ClerkWorkspace() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const displayName = user?.username ?? user?.name ?? 'Clerk'

  return (
    <div className={s.page}>
      <h1 className={s.title}>Welcome, {displayName}</h1>
      <p className={s.subtitle}>
        You're signed in as a <strong>clerk</strong> at <strong>{user?.store_name ?? 'your store'}</strong>.
        Use the actions below or the sidebar to get started.
      </p>

      <div className={s.authBanner}>
        <div className={s.authBannerText}>
          <p className={s.authBannerTitle}>You're logged in and ready.</p>
          <p>Your account was set up by a store admin. All your actions are recorded against your name.</p>
        </div>
      </div>

      <h2 className={s.sectionTitle}>Quick actions</h2>
      <div className={s.capGrid}>
        {CAPABILITIES.map(({ label, desc, to }) => (
          <button key={label} className={s.capCard} onClick={() => navigate(to)}>
            <p className={s.capLabel}>{label}</p>
            <p className={s.capOwner}>{desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
