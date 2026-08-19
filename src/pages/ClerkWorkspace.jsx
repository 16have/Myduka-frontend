import { PackagePlus, Boxes, Trash2, Truck, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import s from './ClerkWorkspace.module.css'

const CAPABILITIES = [
  { label: 'Record received products'},
  { label: 'Record stock information' },
  { label: 'Record spoiled products'},
  { label: 'Request additional supplies' },
]

export default function ClerkWorkspace() {
  const { user } = useAuth()
  return (
    <div className={s.page}>
      <h1 className={s.title}>Welcome, {user?.name}</h1>
      <p className={s.subtitle}>
        You're signed in as a <strong>clerk</strong>. Your account was created by a store Admin.
      </p>

      <div className={s.authBanner}>
        <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 2, color: 'var(--color-primary)' }} />
        <div className={s.authBannerText}>
          <p className={s.authBannerTitle}>Authentication is working.</p>
          <p>
            This screen proves role-based access: only active clerks land here.
          </p>
        </div>
      </div>

      <h2 className={s.sectionTitle}>What clerks can do</h2>
      <div className={s.capGrid}>
        {CAPABILITIES.map(({label, owner }) => (
          <div key={label} className={s.capCard}>
            <div>
              <p className={s.capLabel}>{label}</p>
              <p className={s.capOwner}>{owner}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
