import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import UserTable from '@/components/UserTable'
import * as api from '@/lib/api'
import { useAuth } from '@/lib/auth'
import s from '@/styles/management.module.css'

export default function ClerkManagement() {
  const { user } = useAuth()
  const [clerks, setClerks] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const [addOpen, setAddOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [issued, setIssued] = useState(null)
  const [copied, setCopied] = useState(false)

  const refresh = useCallback(async () => {
    try { setClerks(await api.listClerks(user.store_id)) }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to load clerks.') }
    finally { setLoading(false) }
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  async function submit(e) {
    e.preventDefault(); setFormError(null); setSaving(true)
    try {
      const invite = await api.inviteClerk(email, user.store_id)
      setIssued(invite)
      refresh()
    } catch (err) { setFormError(err instanceof Error ? err.message : 'Could not send invitation.') }
    finally { setSaving(false) }
  }

  function inviteLink(inv) { return `${window.location.origin}/accept-invite?token=${inv.token}` }

  function closeDialog() { setAddOpen(false); setIssued(null); setEmail(''); setFormError(null) }

  async function copyLink() {
    if (!issued) return
    try { await navigator.clipboard.writeText(inviteLink(issued)); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    catch { toast.error('Could not copy — copy the link manually.') }
  }

  async function toggleActive(clerk) {
    setBusyId(clerk.membership_id)
    try {
      if (clerk.is_active) { await api.deactivateClerk(clerk.membership_id); toast.success(`${clerk.name} deactivated.`) }
      else { await api.activateClerk(clerk.membership_id); toast.success(`${clerk.name} reactivated.`) }
      await refresh()
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Action failed.') }
    finally { setBusyId(null) }
  }

  async function remove(clerk) {
    setBusyId(clerk.membership_id)
    try { await api.deleteClerk(clerk.membership_id); toast.success(`${clerk.name} removed.`); await refresh() }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Delete failed.') }
    finally { setBusyId(null) }
  }

  const activeCount = clerks.filter(c => c.is_active).length

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Clerk Management</h1>
          <p className={s.pageDesc}>Invite data-entry clerks to your store, and activate, deactivate or remove their accounts.</p>
        </div>
        <button className={s.primaryBtn} onClick={() => setAddOpen(true)}>Invite Clerk</button>
      </div>

      <div className={s.statsGrid}>
        {[
          { label: 'Total clerks', value: clerks.length },
          { label: 'Active clerks', value: activeCount },
        ].map(({ label, value }) => (
          <div key={label} className={s.statCard}>
            <div>
              <p className={s.statValue}>{loading ? '—' : value}</p>
              <p className={s.statLabel}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={s.section}>
        {loading
          ? <div className={s.loadingBox}>Loading clerks...</div>
          : <UserTable users={clerks} noun="clerk" busyId={busyId} onToggleActive={toggleActive} onDelete={remove} />}
      </div>

      {addOpen && (
        <div className={s.overlay} onClick={(e) => e.target === e.currentTarget && closeDialog()}>
          <div className={s.dialog}>
            <h2 className={s.dialogTitle}>Invite a Clerk</h2>
            <p className={s.dialogDesc}>Clerks record received products, stock levels and spoilage. They'll set their own password via the invite link.</p>

            {!issued ? (
              <form onSubmit={submit}>
                {formError && <div className={s.errorAlert}>{formError}</div>}
                <div className={s.formFields}>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="clerk-email">Email</label>
                    <input id="clerk-email" className={s.input} type="email" placeholder="jonnie@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className={s.dialogFooter}>
                  <button type="button" className={s.cancelBtn} onClick={closeDialog}>Cancel</button>
                  <button type="submit" className={s.submitBtn} disabled={saving}>{saving ? 'Sending...' : 'Send invitation'}</button>
                </div>
              </form>
            ) : (
              <div>
                <div className={s.successAlert}>
                  Invitation created for <strong>{issued.email}</strong>.
                </div>
                <div className={s.field}>
                  <label className={s.labelRow}>Invitation link</label>
                  <div className={s.inputRow}>
                    <input className={`${s.input} ${s.inputMono}`} readOnly value={inviteLink(issued)} onFocus={e => e.target.select()} />
                    <button type="button" className={s.copyBtn} onClick={copyLink}>
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className={s.inputNote}>Share it with the clerk securely.</p>
                </div>
                <div className={s.dialogFooter}>
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