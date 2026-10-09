/**
 * Auth Service - Lar do Ancião
 * Autenticação em MODO DEMO LOCAL (sem Firebase).
 * A interface (login, logout, getCurrentUser, sendPasswordReset) e os códigos de erro
 * seguem o padrão do Firebase Auth, para que a troca futura altere apenas este arquivo.
 */

const SESSION_KEY = 'lar_do_anciao_session'
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_MS = 30 * 1000

// Usuários de demonstração (substituídos pela coleção `usuarios` do Firestore na Fase 2)
const DEMO_USERS = [
  { uid: 'u-1', email: 'maria@lardoanciao.org', password: '123456', nome: 'Maria Oliveira', papel: 'cuidador', caregiverId: 'cg-1' },
  { uid: 'u-2', email: 'joana@lardoanciao.org', password: '123456', nome: 'Joana Santos', papel: 'cuidador', caregiverId: 'cg-2' },
  { uid: 'u-3', email: 'carlos@lardoanciao.org', password: '123456', nome: 'Carlos Eduardo', papel: 'cuidador', caregiverId: 'cg-3' },
  { uid: 'u-4', email: 'beatriz@lardoanciao.org', password: '123456', nome: 'Dra. Beatriz Lins', papel: 'admin', caregiverId: 'cg-4' }
]

// Mensagens amigáveis para os códigos de erro do Firebase Auth
export const AUTH_ERROR_MESSAGES = {
  'auth/invalid-email': 'E-mail inválido.',
  'auth/user-not-found': 'E-mail não cadastrado.',
  'auth/wrong-password': 'Senha incorreta.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns segundos e tente novamente.',
  'auth/network-request-failed': 'Sem conexão com a internet.'
}

export const getAuthErrorMessage = (code) =>
  AUTH_ERROR_MESSAGES[code] || 'Não foi possível entrar. Tente novamente.'

const authError = (code) => {
  const err = new Error(getAuthErrorMessage(code))
  err.code = code
  return err
}

let failedAttempts = 0
let lockedUntil = 0

const toPublicUser = ({ password, ...user }) => user

export const getCurrentUser = () => {
  try {
    const saved = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export const login = async (email, password, remember = true) => {
  if (Date.now() < lockedUntil) throw authError('auth/too-many-requests')

  const normalizedEmail = email.trim().toLowerCase()
  const user = DEMO_USERS.find(u => u.email === normalizedEmail)

  if (!user || user.password !== password) {
    failedAttempts++
    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      failedAttempts = 0
      lockedUntil = Date.now() + LOCKOUT_MS
      throw authError('auth/too-many-requests')
    }
    throw authError(user ? 'auth/wrong-password' : 'auth/user-not-found')
  }

  failedAttempts = 0
  const publicUser = toPublicUser(user)
  // "Lembrar meu acesso": localStorage sobrevive ao fechar o app; sessionStorage não
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(SESSION_KEY, JSON.stringify(publicUser))
  return publicUser
}

export const logout = async () => {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

// No modo local não há envio real de e-mail; apenas valida se a conta existe
export const sendPasswordReset = async (email) => {
  const normalizedEmail = email.trim().toLowerCase()
  if (!DEMO_USERS.some(u => u.email === normalizedEmail)) throw authError('auth/user-not-found')
}

export const DEMO_ACCOUNTS = DEMO_USERS.map(({ email, password, nome, papel }) => ({ email, password, nome, papel }))
