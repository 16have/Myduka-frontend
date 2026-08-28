// Key changes only — apply the same pattern as ClerkManagement above:

const refresh = useCallback(async () => {
  try {
    const [a, i] = await Promise.all([
      api.listAdmins(user.store_id),
      api.listInvitations(user.store_id),
    ])
    setAdmins(a); setInvitations(i)
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Failed to load data.')
  } finally { setLoading(false) }
}, [user])

async function sendInvite(e) {
  e.preventDefault(); setInviteError(null); setInviting(true)
  try { const inv = await api.inviteAdmin(inviteEmail, user.store_id); setIssued(inv); refresh() }
  catch (err) { setInviteError(err instanceof Error ? err.message : 'Could not create invitation.') }
  finally { setInviting(false) }
}

function inviteLink(inv) { return `${window.location.origin}/accept-invite?token=${inv.token}` }

async function toggleActive(admin) {
  setBusyId(admin.membership_id)
  try {
    if (admin.is_active) { await api.deactivateAdmin(admin.membership_id); toast.success(`${admin.username} deactivated.`) }
    else { await api.activateAdmin(admin.membership_id); toast.success(`${admin.username} reactivated.`) }
    await refresh()
  } catch (err) { toast.error(err instanceof Error ? err.message : 'Action failed.') }
  finally { setBusyId(null) }
}

async function remove(admin) {
  setBusyId(admin.membership_id)
  try { await api.deleteAdmin(admin.membership_id); toast.success(`${admin.username} removed.`); await refresh() }
  catch (err) { toast.error(err instanceof Error ? err.message : 'Delete failed.') }
  finally { setBusyId(null) }
}