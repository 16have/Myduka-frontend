import { NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth, homeFor } from '@/lib/auth'
import s from './Layout.module.css'

const NAV = [
  { to: '/merchant', label: 'Portfolio overview', roles: ['merchant'] },
  { to: '/merchant/admins', label: 'Admin management', roles: ['merchant'] },
  { to: '/admin', label: 'Store overview', roles: ['admin'] },
  { to: '/admin/received', label: 'Received stock', roles: ['admin'] },
  { to: '/admin/unpaid', label: 'Payments', roles: ['admin'] },
  { to: '/admin/supply', label: 'Supply requests', roles: ['admin'] },
  { to: '/admin/clerks', label: 'Clerk management', roles: ['admin'] },
  { to: '/clerk', label: 'My workspace', roles: ['clerk'] },
  { to: '/clerk/receive-stock', label: 'Receive stock', roles: ['clerk'] },
  { to: '/clerk/stock', label: 'Stock levels', roles: ['clerk'] },
  { to: '/clerk/spoilage', label: 'Spoilage', roles: ['clerk'] },
  { to: '/clerk/supply-requests', label: 'Supply requests', roles: ['clerk'] },
]

const ROLE_CLASS = {
  merchant: s.roleMerchant,
  admin:    s.roleAdmin,
  clerk:    s.roleClerk,
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('')

  return (
    <div className={s.shell}>
      <aside className={s.sidebar}>
        <div className={s.sidebarHeader}>
          <div>
            <p className={s.sidebarAppName}>MyDuka</p>
            <p className={s.sidebarAppSub}>Inventory Management</p>
          </div>
        </div>

        <nav className={s.nav}>
          {NAV.filter(item => item.roles.includes(user.role)).map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => `${s.navLink} ${isActive ? s.navLinkActive : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={s.sidebarFooter}>
          <div className={s.userRow}>
            <div className={s.avatar}>{initials}</div>
            <div className={s.userInfo}>
              <p className={s.userName}>{user.name}</p>
              <span className={`${s.roleBadge} ${ROLE_CLASS[user.role]}`}>{user.role}</span>
            </div>
          </div>
          <div className={s.footerActions}>
            <button className={s.logoutBtn} onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className={s.main}>
        <Outlet />
      </main>
    </div>
  )
}

export { homeFor }
