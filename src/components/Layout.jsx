import { NavLink, Outlet, useNavigate } from 'react-router'
import { Store, Users, UserCog, LogOut, ClipboardList, RotateCcw } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { resetDemoData } from '@/lib/api'
import s from './Layout.module.css'

const NAV = [
  { to: '/merchant/admins', label: 'Admin Management', icon: UserCog, roles: ['merchant'] },
  { to: '/admin/clerks',    label: 'Clerk Management', icon: Users,   roles: ['admin'] },
  { to: '/clerk',           label: 'My Workspace',     icon: ClipboardList, roles: ['clerk'] },
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

  function handleResetDemo() {
    resetDemoData()
    window.location.href = '/login'
  }

  const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('')

  return (
    <div className={s.shell}>
      <aside className={s.sidebar}>
        <div className={s.sidebarHeader}>
          <div className={s.sidebarLogoIcon}><Store size={18} /></div>
          <div>
            <p className={s.sidebarAppName}>MyDuka</p>
            <p className={s.sidebarAppSub}>Inventory Management</p>
          </div>
        </div>

        <nav className={s.nav}>
          {NAV.filter(item => item.roles.includes(user.role)).map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => `${s.navLink} ${isActive ? s.navLinkActive : ''}`}>
              <item.icon size={16} />
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
              <LogOut size={13} /> Sign out
            </button>
            <button className={s.resetBtn} title="Reset demo data" onClick={handleResetDemo}>
              <RotateCcw size={13} />
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
