import { useCallback, useEffect, useState } from 'react'
import { UserPlus, Loader2, Copy, Check, KeyRound, Users, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import UserTable from '@/components/UserTable'
import * as api from '@/lib/api'
import s from '@/styles/management.module.css'

export default function ClerkManagement() {
  const [clerks, setClerks] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const [addOpen, setAddOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState(null)
  const [copied, setCopied] = useState(false)

  const refresh = useCallback(async () => {
    try { setClerks(await api.listClerks()) }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to load clerks.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  async function submit(e) {
    e.preventDefault(); setFormError(null); setSaving(true)
    try { const result = await api.createClerk(name, email); setCreated(result); refresh() }
    catch (err) { setFormError(err instanceof Error ? err.message : 'Could not create clerk.') }
    finally { setSaving(false) }
  }

  function closeDialog() { setAddOpen(false); setCreated(null); setName(''); setEmail(''); setFormError(null) }

  async function copyPassword() {
    if (!created) return
    try { await navigator.clipboard.writeText(created.temporaryPassword); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    catch { toast.error('Could not copy — note it down manually.') }
  }

  async function toggleActive(u) {
    setBusyId(u.id)
    try {
      if (u.is_active) { await api.deactivateClerk(u.id); toast.success(`${u.name} deactivated.`) }
      else { await api.activateClerk(u.id); toast.success(`${u.name} reactivated.`) }
      await refresh()
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Action failed.') }
    finally { setBusyId(null) }
  }

  async function remove(u) {
    setBusyId(u.id)
    try { await api.deleteClerk(u.id); toast.success(`${u.name} permanently deleted.`); await refresh() }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Delete failed.') }
    finally { setBusyId(null) }
  }

  const activeCount = clerks.filter(c => c.is_active).length

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Clerk Management</h1>
          <p className={s.pageDesc}>Add data-entry clerks to your store, and activate, deactivate or remove their accounts.</p>
        </div>
        <button className={s.primaryBtn} onClick={() => setAddOpen(true)}>
          <UserPlus size={15} /> Add Clerk
        </button>
      </div>

      <div className={s.statsGrid}>
        {[
          { icon: Users, label: 'Total clerks', value: clerks.length },
          { icon: UserCheck, label: 'Active clerks', value: activeCount },
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
        {loading
          ? <div className={s.loadingBox}><Loader2 size={22} className={s.spinner} /></div>
          : <UserTable users={clerks} noun="clerk" busyId={busyId} onToggleActive={toggleActive} onDelete={remove} />}
      </div>

      {addOpen && (
        <div className={s.overlay} onClick={(e) => e.target === e.currentTarget && closeDialog()}>
          <div className={s.dialog}>
            <h2 className={s.dialogTitle}>Add a Clerk</h2>
            <p className={s.dialogDesc}>Clerks record received products, stock levels and spoilage. Share the temporary password with the clerk.</p>

            {!created ? (
              <form onSubmit={submit}>
                {formError && <div className={s.errorAlert}>{formError}</div>}
                <div className={s.formFields}>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="clerk-name">Full name</label>
                    <input id="clerk-name" className={s.input} placeholder="Jonnie Bravo" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="clerk-email">Email</label>
                    <input id="clerk-email" className={s.input} type="email" placeholder="jonnie@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className={s.dialogFooter}>
                  <button type="button" className={s.cancelBtn} onClick={closeDialog}>Cancel</button>
                  <button type="submit" className={s.submitBtn} disabled={saving}>
                    {saving && <Loader2 size={14} className={s.spinner} />} Create clerk account
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className={s.successAlert}>
                  <strong>{created.user.name}</strong> ({created.user.email}) is now an active clerk.
                </div>
                <div className={s.field}>
                  <label className={s.labelRow}><KeyRound size={13} /> Temporary password</label>
                  <div className={s.inputRow}>
                    <input className={`${s.input} ${s.inputMono}`} readOnly value={created.temporaryPassword} onFocus={e => e.target.select()} />
                    <button type="button" className={s.copyBtn} onClick={copyPassword}>
                      {copied ? <Check size={15} style={{ color: 'var(--color-primary)' }} /> : <Copy size={15} />}
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
