import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { MailPlus, Loader2, Copy, Check, ExternalLink, UserCog, UserCheck, MailWarning } from 'lucide-react'
import { toast } from 'sonner'
import UserTable from '@/components/UserTable'
import * as api from '@/lib/api'
import s from '@/styles/management.module.css'

export default function AdminManagement() {
  const navigate = useNavigate()
  const [admins, setAdmins] = useState([])
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteError, setInviteError] = useState(null)
  const [inviting, setInviting] = useState(false)
  const [issued, setIssued] = useState(null)
  const [copied, setCopied] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const [a, i] = await Promise.all([api.listAdmins(), api.listInvitations()])
      setAdmins(a); setInvitations(i)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load data.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    function run() { refresh() }
    run()
  }, [refresh])

  async function sendInvite(e) {
    e.preventDefault(); setInviteError(null); setInviting(true)
    try { const inv = await api.inviteAdmin(inviteEmail); setIssued(inv); refresh() }
    catch (err) { setInviteError(err instanceof Error ? err.message : 'Could not create invitation.') }
    finally { setInviting(false) }
  }

  function inviteLink(inv) { return `${window.location.origin}/admin/register?token=${inv.token}` }

  async function copyLink(inv) {
    try { await navigator.clipboard.writeText(inviteLink(inv)); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    catch { toast.error('Could not copy — copy the link manually.') }
  }

  function closeDialog() { setInviteOpen(false); setIssued(null); setInviteEmail(''); setInviteError(null) }

  async function toggleActive(u) {
    setBusyId(u.id)
    try {
      if (u.is_active) { await api.deactivateAdmin(u.id); toast.success(`${u.name} deactivated.`) }
      else { await api.activateAdmin(u.id); toast.success(`${u.name} reactivated.`) }
      await refresh()
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Action failed.') }
    finally { setBusyId(null) }
  }

  async function remove(u) {
    setBusyId(u.id)
    try { await api.deleteAdmin(u.id); toast.success(`${u.name} permanently deleted.`); await refresh() }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Delete failed.') }
    finally { setBusyId(null) }
  }

  const activeCount = admins.filter(a => a.is_active).length
  const pendingInvites = invitations.filter(i => i.status === 'pending').length

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Admin Management</h1>
          <p className={s.pageDesc}>Invite store admins by email, and activate, deactivate or remove their accounts.</p>
        </div>
        <button className={s.primaryBtn} onClick={() => setInviteOpen(true)}>
          <MailPlus size={15} /> Invite Admin
        </button>
      </div>

      <div className={s.statsGrid}>
        {[
          { icon: UserCog, label: 'Total admins', value: admins.length },
          { icon: UserCheck, label: 'Active admins', value: activeCount },
          { icon: MailWarning, label: 'Pending invitations', value: pendingInvites },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className={s.statCard}>
            <div className={s.statIcon}><Icon size={18} /></div>
            <div>
              <p className={s.statValue}>{loading ? '—' : value}</p>
              <p className={s.statLabel}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={s.section}>
        <h2 className={s.sectionTitle}>Store admins</h2>
        {loading
          ? <div className={s.loadingBox}><Loader2 size={22} className={s.spinner} /></div>
          : <UserTable users={admins} noun="admin" busyId={busyId} onToggleActive={toggleActive} onDelete={remove} />}
      </div>

      <div className={s.section}>
        <h2 className={s.sectionTitle}>Invitations</h2>
        <div className={s.tableWrap}>
          <table className={s.inviteTable}>
            <thead>
              <tr><th>Email</th><th>Status</th><th>Expires</th><th>Link</th></tr>
            </thead>
            <tbody>
              {invitations.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-light)' }}>No invitations sent yet.</td></tr>
              )}
              {invitations.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 500 }}>{inv.email}</td>
                  <td>
                    {inv.status === 'pending' && <span className={s.badgePending}>Pending</span>}
                    {inv.status === 'used'    && <span className={s.badgeUsed}>Registered</span>}
                    {inv.status === 'expired' && <span className={s.badgeExpired}>Expired</span>}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(inv.expires_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    {inv.status === 'pending' && (
                      <button className={s.openBtn} onClick={() => navigate(`/admin/register?token=${inv.token}`)}>
                        <ExternalLink size={13} /> Open
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={s.tableNote}>In production the link is emailed automatically; in this prototype you can open it directly.</p>
      </div>

      {inviteOpen && (
        <div className={s.overlay} onClick={(e) => e.target === e.currentTarget && closeDialog()}>
          <div className={s.dialog}>
            <h2 className={s.dialogTitle}>Invite a Store Admin</h2>
            <p className={s.dialogDesc}>Only the merchant can start admin registration. MyDuka creates a secure, expiring invitation link.</p>

            {!issued ? (
              <form onSubmit={sendInvite}>
                {inviteError && <div className={s.errorAlert}>{inviteError}</div>}
                <div className={s.formFields}>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="invite-email">Admin's email</label>
                    <input id="invite-email" className={s.input} type="email" placeholder="newadmin@example.com"
                      value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
                  </div>
                </div>
                <div className={s.dialogFooter}>
                  <button type="button" className={s.cancelBtn} onClick={closeDialog}>Cancel</button>
                  <button type="submit" className={s.submitBtn} disabled={inviting}>
                    {inviting && <Loader2 size={14} className={s.spinner} />} Send invitation
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className={s.successAlert}>
                  Invitation created for <strong>{issued.email}</strong>. It expires in 48 hours and can only be used once.
                </div>
                <div className={s.field}>
                  <label className={s.label}>Invitation link</label>
                  <div className={s.inputRow}>
                    <input className={`${s.input} ${s.inputMono}`} readOnly value={inviteLink(issued)} onFocus={e => e.target.select()} />
                    <button type="button" className={s.copyBtn} onClick={() => copyLink(issued)}>
                      {copied ? <Check size={15} style={{ color: 'var(--color-primary)' }} /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>
                <div className={s.dialogFooter}>
                  <button type="button" className={s.outlineBtn} onClick={() => navigate(`/admin/register?token=${issued.token}`)}>
                    <ExternalLink size={14} /> Open registration page
                  </button>
                  <button type="button" className={s.doneBtn} onClick={closeDialog}>Done</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
