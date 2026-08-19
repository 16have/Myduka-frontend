import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, UserCheck, UserX, Trash2 } from 'lucide-react'
import s from './UserTable.module.css'

function ActionMenu({ user, noun, busy, onToggleActive, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className={s.dropdown} ref={ref}>
      <button className={s.menuBtn} disabled={busy} onClick={() => setOpen(v => !v)}>
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className={s.dropdownMenu}>
          <button className={s.dropdownItem} onClick={() => { setOpen(false); onToggleActive(user) }}>
            {user.is_active ? <><UserX size={14} /> Deactivate {noun}</> : <><UserCheck size={14} /> Reactivate {noun}</>}
          </button>
          <div className={s.dropdownSep} />
          <button className={`${s.dropdownItem} ${s.dropdownItemDanger}`} onClick={() => { setOpen(false); onDelete(user) }}>
            <Trash2 size={14} /> Delete permanently
          </button>
        </div>
      )}
    </div>
  )
}

export default function UserTable({ users, noun, busyId, onToggleActive, onDelete }) {
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try { await onDelete(pendingDelete) }
    finally { setDeleting(false); setPendingDelete(null) }
  }

  return (
    <>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead className={s.thead}>
            <tr>
              <th className={s.th}>Name</th>
              <th className={s.th}>Email</th>
              <th className={s.th}>Status</th>
              <th className={s.th}>Added</th>
              <th className={`${s.th} ${s.thRight}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr className={s.emptyRow}><td colSpan={5}>No {noun}s yet.</td></tr>
            )}
            {users.map(u => (
              <tr key={u.id} className={`${s.tr} ${u.is_active ? '' : s.trInactive}`}>
                <td className={s.td}>
                  <div className={s.nameCell}>
                    <div className={s.avatar}>{u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</div>
                    <span className={s.name}>{u.name}</span>
                  </div>
                </td>
                <td className={`${s.td} ${s.email}`}>{u.email}</td>
                <td className={s.td}>
                  {u.is_active
                    ? <span className={s.badgeActive}><span className={`${s.dot} ${s.dotGreen}`} />Active</span>
                    : <span className={s.badgeInactive}><span className={`${s.dot} ${s.dotGray}`} />Inactive</span>}
                </td>
                <td className={`${s.td} ${s.date}`}>
                  {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className={`${s.td} ${s.tdRight}`}>
                  <ActionMenu user={u} noun={noun} busy={busyId === u.id}
                    onToggleActive={onToggleActive} onDelete={(u) => setPendingDelete(u)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pendingDelete && (
        <div className={s.overlay} onClick={(e) => e.target === e.currentTarget && setPendingDelete(null)}>
          <div className={s.dialog}>
            <h2 className={s.dialogTitle}>Delete {pendingDelete.name}?</h2>
            <p className={s.dialogDesc}>
              This permanently removes the {noun} account for <strong>{pendingDelete.email}</strong>.
              This action cannot be undone. Are you sure you want to continue?
            </p>
            <div className={s.dialogFooter}>
              <button className={s.cancelBtn} disabled={deleting} onClick={() => setPendingDelete(null)}>Cancel</button>
              <button className={s.deleteBtn} disabled={deleting} onClick={confirmDelete}>
                {deleting ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
