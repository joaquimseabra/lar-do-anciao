/**
 * notificationService.js
 * Gerenciamento de alertas sonoros e notificações locais sem depender de servidores push.
 * Utiliza Web Audio API (áudio sintetizado localmente) e Web Notifications API.
 */

// Preferências salvas no navegador
const PREF_NOTIF_KEY = 'lar_anciao_notif_enabled'
const PREF_SOUND_KEY = 'lar_anciao_sound_enabled'

let audioCtx = null

/**
 * Inicializa ou obtém o contexto de áudio sintetizado
 */
function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    try {
      audioCtx.resume()
    } catch (e) {}
  }
  return audioCtx
}

/**
 * Toca um bip harmônico e agradável de alerta médico usando Web Audio API nativo
 * (Funciona 100% offline sem arquivos MP3/WAV externos)
 */
export function playAlertBeep() {
  try {
    if (!isSoundEnabled()) return

    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    // Primeiro tom suave (880 Hz - Nota Lá)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(880, now)
    gain1.gain.setValueAtTime(0.12, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.18)

    // Segundo tom (1046.5 Hz - Nota Dó agudo) para formar um chime amigável
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1046.5, now + 0.12)
    gain2.gain.setValueAtTime(0.15, now + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.12)
    osc2.stop(now + 0.35)
  } catch (e) {
    console.warn('Não foi possível emitir sinal sonoro:', e)
  }
}

/**
 * Solicita permissão para notificações no dispositivo
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported'
  }

  if (Notification.permission === 'granted') {
    setNotificationEnabled(true)
    return 'granted'
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      setNotificationEnabled(true)
    }
    return permission
  }

  return Notification.permission
}

/**
 * Dispara uma notificação local no navegador / celular
 */
export function sendLocalNotification(title, body, tag = 'medication_alert') {
  try {
    // Sempre toca o alerta sonoro se habilitado
    playAlertBeep()

    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted' || !isNotificationEnabled()) return

    const options = {
      body,
      tag,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      renotify: true,
      requireInteraction: false
    }

    const notif = new Notification(title, options)
    notif.onclick = () => {
      window.focus()
      notif.close()
    }
  } catch (e) {
    console.warn('Falha ao disparar notificação local:', e)
  }
}

/**
 * Verifica se notificações estão ativadas pelo usuário
 */
export function isNotificationEnabled() {
  if (typeof localStorage === 'undefined') return true
  const saved = localStorage.getItem(PREF_NOTIF_KEY)
  return saved === null ? true : saved === 'true'
}

export function setNotificationEnabled(enabled) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(PREF_NOTIF_KEY, enabled ? 'true' : 'false')
}

/**
 * Verifica se alertas sonoros estão ativados pelo usuário
 */
export function isSoundEnabled() {
  if (typeof localStorage === 'undefined') return true
  const saved = localStorage.getItem(PREF_SOUND_KEY)
  return saved === null ? true : saved === 'true'
}

export function setSoundEnabled(enabled) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(PREF_SOUND_KEY, enabled ? 'true' : 'false')
}
