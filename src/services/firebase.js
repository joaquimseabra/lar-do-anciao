/**
 * Firebase Service - Lar do Ancião
 * Gerencia a conexão com Firestore e Auth para sincronização em tempo real.
 * Funciona de forma resiliente: se não houver credenciais ativas, entra em modo Mock Local (LocalStorage).
 */

import { initializeApp, getApps } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Configurações do Firebase obtidas por variáveis de ambiente ou fallback de demonstração
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {}
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "lar-do-anciao.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "lar-do-anciao",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "lar-do-anciao.appspot.com",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: env.VITE_FIREBASE_APP_ID || ""
}

let app = null
let db = null
let auth = null
let isConfigured = false

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.apiKey !== "SUA_API_KEY_AQUI") {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }
    db = getFirestore(app)
    auth = getAuth(app)
    isConfigured = true
    console.log('[Firebase] Conexão inicializada com sucesso!')
  } else {
    console.info('[Firebase] Executando em MODO DEMO LOCAL (sem chaves Firebase configuradas). Dados salvos localmente.')
  }
} catch (error) {
  console.warn('[Firebase] Erro ao inicializar Firebase. Alternando para modo local:', error)
}

export { 
  app, 
  db, 
  auth, 
  isConfigured,
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp 
}
