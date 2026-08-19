/**
 * MyDuka — Member 1: Authentication & User Management API layer
 * ------------------------------------------------------------------
 * To connect the REAL backend, replace each method body with
 * a fetch() to API_BASE_URL + path — the UI code does not change.
 */

export const API_BASE_URL = '/api'

const USERS_KEY = 'myduka_users'
const PASSWORDS_KEY = 'myduka_passwords'
const INVITES_KEY = 'myduka_invitations'
const SESSION_KEY = 'myduka_session'

const INVITE_TTL_HOURS = 48

function seedIfEmpty() {
  if (localStorage.getItem(USERS_KEY)) return
  const now = new Date().toISOString()
  const seed = [
    { id: 1, name: 'Elias', email: 'merchant@myduka.com', role: 'merchant', is_active: true, created_at: now, password_hash: 'password123' },
    { id: 2, name: 'George', email: 'admin@myduka.com', role: 'admin', is_active: true, created_at: now, password_hash: 'password123' },
    { id: 3, name: 'Kelvin Tullo', email: 'clerk@myduka.com', role: 'clerk', is_active: true, created_at: now, password_hash: 'password123' },
    { id: 4, name: 'Joshua', email: 'clerk4@myduka.com', role: 'clerk', is_active: false, created_at: now, password_hash: 'password123' },
  ]
  localStorage.setItem(USERS_KEY, JSON.stringify(seed))
  localStorage.setItem(INVITES_KEY, JSON.stringify([]))
}

function readUsers() {
  seedIfEmpty()
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function readInvites() {
  seedIfEmpty()
  const invites = JSON.parse(localStorage.getItem(INVITES_KEY) || '[]')
  const now = Date.now()
  return invites.map((inv) =>
    inv.status === 'pending' && new Date(inv.expires_at).getTime() < now
      ? { ...inv, status: 'expired' }
      : inv,
  )
}

function writeInvites(invites) {
  localStorage.setItem(INVITES_KEY, JSON.stringify(invites))
}

function publicUser(u) {
  const { password_hash, ...rest } = u
  void password_hash
  return rest
}

function delay(ms = 350) {
  return new Promise((r) => setTimeout(r, ms))
}

function makeToken(len = 24) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let t = ''
  for (let i = 0; i < len; i++) t += chars[Math.floor(Math.random() * chars.length)]
  return t
}

function fail(message) {
  throw new Error(message)
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    const session = JSON.parse(raw)
    const fresh = readUsers().find((u) => u.id === session.user.id)
    if (!fresh || !fresh.is_active) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return { ...session, user: publicUser(fresh) }
  } catch {
    return null
  }
}

function saveSession(session) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(SESSION_KEY)
}

function requireRole(...roles) {
  const session = getSession()
  if (!session) fail('Not authenticated. Please log in.')
  if (!roles.includes(session.user.role)) fail('You do not have permission to perform this action.')
  return session.user
}

export async function login(email, password) {
  await delay()
  const user = readUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
  if (!user) fail('No account found for this email.')
  if (user.password_hash !== password) fail('Incorrect password. Please try again.')
  if (!user.is_active) fail('This account has been deactivated. Contact your administrator.')
  const session = { access_token: makeToken(48), user: publicUser(user) }
  saveSession(session)
  return session
}

export async function logout() {
  await delay(120)
  saveSession(null)
}

export async function me() {
  await delay(120)
  const session = getSession()
  if (!session) fail('Not authenticated.')
  return session.user
}

export async function inviteAdmin(email) {
  await delay()
  requireRole('merchant')
  const clean = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) fail('Please enter a valid email address.')
  if (readUsers().some((u) => u.email.toLowerCase() === clean)) fail('This email already belongs to an account.')
  const invites = readInvites()
  if (invites.some((i) => i.email === clean && i.status === 'pending')) fail('A pending invitation already exists for this email.')
  const invitation = {
    id: Date.now(),
    email: clean,
    token: makeToken(),
    status: 'pending',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + INVITE_TTL_HOURS * 3600 * 1000).toISOString(),
  }
  invites.push(invitation)
  writeInvites(invites)
  return invitation
}

export async function listInvitations() {
  await delay(200)
  requireRole('merchant')
  return readInvites().sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function validateInvitation(token) {
  await delay(250)
  const inv = readInvites().find((i) => i.token === token)
  if (!inv) fail('This invitation link is invalid.')
  if (inv.status === 'used') fail('This invitation has already been used.')
  if (inv.status === 'expired') fail('This invitation has expired. Ask the merchant to send a new one.')
  return { email: inv.email }
}

export async function registerAdmin(token, name, password) {
  await delay()
  const invites = readInvites()
  const inv = invites.find((i) => i.token === token)
  if (!inv) fail('This invitation link is invalid.')
  if (inv.status === 'used') fail('This invitation has already been used.')
  if (inv.status === 'expired') fail('This invitation has expired.')
  if (name.trim().length < 2) fail('Please enter your full name.')
  if (password.length < 8) fail('Password must be at least 8 characters.')
  const users = readUsers()
  const user = {
    id: Math.max(0, ...users.map((u) => u.id)) + 1,
    name: name.trim(),
    email: inv.email,
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
    password_hash: password,
  }
  users.push(user)
  writeUsers(users)
  inv.status = 'used'
  writeInvites(invites)
  return publicUser(user)
}

export async function listAdmins() {
  await delay(200)
  requireRole('merchant')
  return readUsers().filter((u) => u.role === 'admin').map(publicUser)
}

export async function deactivateAdmin(id) {
  await delay()
  requireRole('merchant')
  const users = readUsers()
  const u = users.find((x) => x.id === id && x.role === 'admin')
  if (!u) fail('Admin not found.')
  u.is_active = false
  writeUsers(users)
}

export async function activateAdmin(id) {
  await delay()
  requireRole('merchant')
  const users = readUsers()
  const u = users.find((x) => x.id === id && x.role === 'admin')
  if (!u) fail('Admin not found.')
  u.is_active = true
  writeUsers(users)
}

export async function deleteAdmin(id) {
  await delay()
  requireRole('merchant')
  const users = readUsers()
  if (!users.some((x) => x.id === id && x.role === 'admin')) fail('Admin not found.')
  writeUsers(users.filter((x) => x.id !== id))
}

export async function listClerks() {
  await delay(200)
  requireRole('admin')
  return readUsers().filter((u) => u.role === 'clerk').map(publicUser)
}

export async function createClerk(name, email) {
  await delay()
  requireRole('admin')
  const clean = email.trim().toLowerCase()
  if (name.trim().length < 2) fail("Please enter the clerk's full name.")
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) fail('Please enter a valid email address.')
  const users = readUsers()
  if (users.some((u) => u.email.toLowerCase() === clean)) fail('This email already belongs to an account.')
  const temporaryPassword = makeToken(10)
  const user = {
    id: Math.max(0, ...users.map((u) => u.id)) + 1,
    name: name.trim(),
    email: clean,
    role: 'clerk',
    is_active: true,
    created_at: new Date().toISOString(),
    password_hash: temporaryPassword,
  }
  users.push(user)
  writeUsers(users)
  return { user: publicUser(user), temporaryPassword }
}

export async function deactivateClerk(id) {
  await delay()
  requireRole('admin')
  const users = readUsers()
  const u = users.find((x) => x.id === id && x.role === 'clerk')
  if (!u) fail('Clerk not found.')
  u.is_active = false
  writeUsers(users)
}

export async function activateClerk(id) {
  await delay()
  requireRole('admin')
  const users = readUsers()
  const u = users.find((x) => x.id === id && x.role === 'clerk')
  if (!u) fail('Clerk not found.')
  u.is_active = true
  writeUsers(users)
}

export async function deleteClerk(id) {
  await delay()
  requireRole('admin')
  const users = readUsers()
  if (!users.some((x) => x.id === id && x.role === 'clerk')) fail('Clerk not found.')
  writeUsers(users.filter((x) => x.id !== id))
}

export function resetDemoData() {
  localStorage.removeItem(USERS_KEY)
  localStorage.removeItem(PASSWORDS_KEY)
  localStorage.removeItem(INVITES_KEY)
  localStorage.removeItem(SESSION_KEY)
  seedIfEmpty()
}
