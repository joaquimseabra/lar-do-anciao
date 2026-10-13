import { defineStore } from 'pinia'
import { db, isConfigured, collection, addDoc, onSnapshot, serverTimestamp } from '../services/firebase.js'
import { playAlertBeep } from '../services/notificationService.js'

const LOCAL_STORAGE_KEY = 'lar_do_anciao_state_v3'

export const DEFAULT_RESIDENTS = [
  {
    id: 'res-1',
    name: 'Antônio da Silva',
    room: 'Quarto 101 - Leito A',
    healthConditions: ['Hipertensão', 'Insuficiência Cardíaca'],
    age: 79,
    notes: 'Uso de andador para locomoção. Aferir pressão diariamente.',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
    active: true
  },
  {
    id: 'res-2',
    name: 'Dona Nair de Oliveira',
    room: 'Quarto 102 - Leito B',
    healthConditions: ['Diabetes Tipo 2', 'Labirintite'],
    age: 84,
    notes: 'Dieta hipossódica e com controle estrito de glicose.',
    photoUrl: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=300&q=80',
    active: true
  },
  {
    id: 'res-3',
    name: 'Francisco de Assis Pereira',
    room: 'Quarto 103 - Leito A',
    healthConditions: ['Osteoporose', 'Artrose'],
    age: 81,
    notes: 'Tomar remédios com alimentação leve.',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    active: true
  },
  {
    id: 'res-4',
    name: 'Lourdes Aparecida Santos',
    room: 'Quarto 104 - Leito C',
    healthConditions: ['Hipertensão', 'Alergia a Dipirona'],
    age: 76,
    notes: 'Atenção redobrada: Alérgica a Dipirona e anti-inflamatórios.',
    photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80',
    active: true
  },
  {
    id: 'res-5',
    name: 'Geraldo Magela Barbosa',
    room: 'Quarto 105 - Leito B',
    healthConditions: ['Mal de Parkinson'],
    age: 83,
    notes: 'Horário estrito para Prolopa para controle de tremores.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    active: true
  }
]

export const DEFAULT_MEDICATIONS = [
  {
    id: 'med-1',
    residentId: 'res-1',
    name: 'Losartana Potássica',
    dosage: '50mg',
    schedules: ['08:00', '20:00'],
    instructions: 'Tomar com meio copo de água',
    photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'med-2',
    residentId: 'res-1',
    name: 'AAS Infantil',
    dosage: '100mg',
    schedules: ['12:00'],
    instructions: 'Tomar logo após o almoço para não agredir estômago',
    photoUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'med-3',
    residentId: 'res-2',
    name: 'Metformina',
    dosage: '850mg',
    schedules: ['08:00', '14:00'],
    instructions: 'Administrar junto com alimentação',
    photoUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'med-4',
    residentId: 'res-3',
    name: 'Carbonato de Cálcio + Vit D',
    dosage: '600mg',
    schedules: ['14:00'],
    instructions: 'Tomar à tarde após lanche',
    photoUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'med-5',
    residentId: 'res-4',
    name: 'Enalapril',
    dosage: '10mg',
    schedules: ['18:00'],
    instructions: 'Aferir pressão antes de ministrar',
    photoUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'med-6',
    residentId: 'res-5',
    name: 'Prolopa (Levodopa + Benserazida)',
    dosage: '100/25mg',
    schedules: ['08:00', '14:00', '20:00'],
    instructions: 'Horário estrito para controle de tremores',
    photoUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'med-7',
    residentId: 'res-2',
    name: 'Zolpidem',
    dosage: '10mg',
    schedules: ['22:00'],
    instructions: 'Administrar imediatamente antes de deitar',
    photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date().toISOString()
  }
]

// Utilitários de data locais (independentes de UTC para respeitar fuso horário de Brasília UTC-3)
export const getTodayDateStr = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const getYesterdayDateStr = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const getNowLocalDateTimeStr = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export const isTodayAdministration = (administeredAt) => {
  if (!administeredAt) return false
  const todayStr = getTodayDateStr()
  if (administeredAt.startsWith(todayStr)) return true
  try {
    const d = new Date(administeredAt)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}` === todayStr
  } catch {
    return false
  }
}

export const isYesterdayAdministration = (administeredAt) => {
  if (!administeredAt) return false
  const yesterdayStr = getYesterdayDateStr()
  if (administeredAt.startsWith(yesterdayStr)) return true
  try {
    const d = new Date(administeredAt)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}` === yesterdayStr
  } catch {
    return false
  }
}

export const isWithinDays = (dateStr, days) => {
  if (!dateStr) return false
  try {
    const d = new Date(dateStr)
    const diffMs = Date.now() - d.getTime()
    return diffMs >= 0 && diffMs <= days * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

export const DEFAULT_ADMINISTRATIONS = [
  {
    id: 'adm-demo-1',
    medicationId: 'med-1',
    residentId: 'res-1',
    scheduledTime: '08:00',
    administeredAt: `${getTodayDateStr()}T08:05:00`,
    caregiverName: 'Maria Oliveira (Cuidadora)',
    status: 'taken',
    notes: 'Idoso tomou com tranquilidade'
  },
  {
    id: 'adm-demo-2',
    medicationId: 'med-3',
    residentId: 'res-2',
    scheduledTime: '08:00',
    administeredAt: `${getTodayDateStr()}T08:12:00`,
    caregiverName: 'Maria Oliveira (Cuidadora)',
    status: 'taken',
    notes: 'Administrado após o café'
  },
  {
    id: 'adm-demo-yesterday-1',
    medicationId: 'med-5',
    residentId: 'res-4',
    scheduledTime: '18:00',
    administeredAt: `${getYesterdayDateStr()}T18:04:00`,
    caregiverName: 'Carlos Eduardo (Enfermeiro Chefe)',
    status: 'taken',
    notes: 'Pressão aferida: 120x80 mmHg'
  }
]

export const AVAILABLE_CAREGIVERS = [
  { id: 'cg-1', name: 'Maria Oliveira', role: 'Cuidadora Plantonista', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80' },
  { id: 'cg-2', name: 'Joana Santos', role: 'Cuidadora da Tarde', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80' },
  { id: 'cg-3', name: 'Carlos Eduardo', role: 'Enfermeiro Chefe', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80' },
  { id: 'cg-4', name: 'Dra. Beatriz Lins', role: 'Administradora / Médica', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80' }
]

export const useMedicationStore = defineStore('medicationStore', {
  state: () => {
    // Carregar estado salvo localmente se existir (com migração de campos novos)
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem('lar_do_anciao_state_v2')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Migrar residentes caso não tenham room / healthConditions
        const loadedResidents = (parsed.residents && parsed.residents.length > 0) ? parsed.residents.map(r => {
          const def = DEFAULT_RESIDENTS.find(dr => dr.id === r.id) || {}
          return {
            ...r,
            room: r.room || def.room || 'Quarto Geral',
            healthConditions: r.healthConditions || def.healthConditions || ['Sob Acompanhamento'],
            age: r.age || def.age || 75,
            notes: r.notes || def.notes || ''
          }
        }) : DEFAULT_RESIDENTS

        return {
          residents: loadedResidents,
          medications: (parsed.medications && parsed.medications.length > 0) ? parsed.medications : DEFAULT_MEDICATIONS,
          administrations: parsed.administrations || DEFAULT_ADMINISTRATIONS,
          currentCaregiver: parsed.currentCaregiver || AVAILABLE_CAREGIVERS[0],
          searchQuery: '',
          lastSyncTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          notificationMessage: null
        }
      } catch (e) {
        console.error('Erro ao ler estado do localStorage, restaurando defaults:', e)
      }
    }

    return {
      residents: DEFAULT_RESIDENTS,
      medications: DEFAULT_MEDICATIONS,
      administrations: DEFAULT_ADMINISTRATIONS,
      currentCaregiver: AVAILABLE_CAREGIVERS[0],
      searchQuery: '',
      lastSyncTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      notificationMessage: null
    }
  },

  getters: {
    // Obter todos os slots agendados para o dia de hoje
    todayScheduleSlots: (state) => {
      const todayStr = getTodayDateStr()
      const slots = []

      state.medications.forEach(med => {
        const resident = state.residents.find(r => r.id === med.residentId)
        if (!resident || !resident.active) return

        med.schedules.forEach(scheduleTime => {
          // Verificar se já foi tomado hoje (usando utilitário resiliente a fuso horário)
          const administration = state.administrations.find(a => 
            a.medicationId === med.id && 
            a.scheduledTime === scheduleTime &&
            isTodayAdministration(a.administeredAt)
          )

          slots.push({
            slotId: `${med.id}_${scheduleTime}_${todayStr}`,
            medicationId: med.id,
            medicationName: med.name,
            dosage: med.dosage,
            instructions: med.instructions || '',
            medPhotoUrl: med.photoUrl || '',
            scheduledTime: scheduleTime,
            residentId: resident.id,
            residentName: resident.name,
            residentRoom: resident.room || 'Quarto Geral',
            residentPhoto: resident.photoUrl,
            isTaken: !!administration,
            administeredAt: administration ? administration.administeredAt : null,
            caregiverName: administration ? administration.caregiverName : null,
          })
        })
      })

      // Ordenar por horário previsto
      return slots.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
    },

    // Medicamentos Atrasados (não tomados e com horário anterior ou igual ao atual)
    delayedMedications() {
      const slots = this.todayScheduleSlots
      const now = new Date()
      const currentHourMinute = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      return slots.filter(slot => {
        if (slot.isTaken) return false

        // Se houver busca, filtrar
        if (this.searchQuery) {
          const q = this.searchQuery.toLowerCase()
          const matchName = slot.residentName.toLowerCase().includes(q)
          const matchMed = slot.medicationName.toLowerCase().includes(q)
          if (!matchName && !matchMed) return false
        }

        // Horário das 08:00 (não tomado) ou qualquer horário anterior à hora atual é considerado atrasado
        const isScheduledPast = slot.scheduledTime <= currentHourMinute || slot.scheduledTime <= '08:00'
        return isScheduledPast
      })
    },

    // Próximos Medicamentos (não tomados e não atrasados)
    upcomingMedications() {
      const slots = this.todayScheduleSlots
      const delayedIds = new Set(this.delayedMedications.map(d => d.slotId))

      return slots.filter(slot => {
        if (slot.isTaken) return false
        if (delayedIds.has(slot.slotId)) return false

        if (this.searchQuery) {
          const q = this.searchQuery.toLowerCase()
          const matchName = slot.residentName.toLowerCase().includes(q)
          const matchMed = slot.medicationName.toLowerCase().includes(q)
          if (!matchName && !matchMed) return false
        }

        return true
      })
    },

    // Helper para enriquecer o registro de administração com dados de residente e med
    enrichedAdministrations: (state) => {
      return state.administrations.map(a => {
        const med = state.medications.find(m => m.id === a.medicationId)
        const resident = state.residents.find(r => r.id === a.residentId)
        return {
          ...a,
          medicationName: med ? med.name : 'Medicamento',
          dosage: med ? med.dosage : '',
          residentName: resident ? resident.name : 'Residente',
          residentRoom: resident ? resident.room : 'Quarto Geral',
          residentPhoto: resident ? resident.photoUrl : '',
        }
      }).sort((a, b) => new Date(b.administeredAt || 0) - new Date(a.administeredAt || 0))
    },

    // Histórico de administrações realizadas hoje
    todayHistory() {
      return this.enrichedAdministrations.filter(a => isTodayAdministration(a.administeredAt))
    },

    // Histórico por período: 'today' | 'yesterday' | 'week' | 'all'
    historyByPeriod() {
      return (period = 'today') => {
        if (period === 'today') {
          return this.enrichedAdministrations.filter(a => isTodayAdministration(a.administeredAt))
        }
        if (period === 'yesterday') {
          return this.enrichedAdministrations.filter(a => isYesterdayAdministration(a.administeredAt))
        }
        if (period === 'week') {
          return this.enrichedAdministrations.filter(a => isWithinDays(a.administeredAt, 7))
        }
        return this.enrichedAdministrations
      }
    },

    // Totalizadores
    stats() {
      return {
        delayedCount: this.delayedMedications.length,
        upcomingCount: this.upcomingMedications.length,
        takenCount: this.todayHistory.length,
        totalResidents: this.residents.length
      }
    }
  },

  actions: {
    saveToStorage() {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
          residents: this.residents,
          medications: this.medications,
          administrations: this.administrations,
          currentCaregiver: this.currentCaregiver
        }))
        this.lastSyncTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      } catch (e) {
        console.error('Erro ao salvar no localStorage:', e)
      }
    },

    // CONFIRMAÇÃO DE MEDICAMENTO (COM 1 TOQUE)
    async confirmMedication(slot, customNotes = '') {
      const now = new Date()
      const nowFormattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      const nowLocalDateTime = getNowLocalDateTimeStr()
      const caregiver = this.currentCaregiver?.name || 'Cuidadora Plantonista'

      const newAdminRecord = {
        id: `adm-${Date.now()}`,
        medicationId: slot.medicationId,
        residentId: slot.residentId,
        scheduledTime: slot.scheduledTime,
        administeredAt: nowLocalDateTime,
        caregiverName: caregiver,
        status: 'taken',
        notes: customNotes || `Dose confirmada às ${nowFormattedTime} por ${caregiver}`
      }

      this.administrations.unshift(newAdminRecord)
      this.saveToStorage()
      playAlertBeep()

      // Se Firebase estiver configurado, salvar na nuvem
      if (isConfigured && db) {
        try {
          await addDoc(collection(db, 'administracoes_registro'), {
            ...newAdminRecord,
            serverTimestamp: serverTimestamp()
          })
          console.log('[Firebase] Administração sincronizada em tempo real.')
        } catch (err) {
          console.warn('[Firebase] Não foi possível salvar em nuvem:', err)
        }
      }

      this.notifySuccess(`Medicamento ${slot.medicationName} confirmado para ${slot.residentName}!`)
      return newAdminRecord
    },

    // Desfazer administração confirmada por engano
    undoAdministration(admId) {
      const idx = this.administrations.findIndex(a => a.id === admId)
      if (idx !== -1) {
        const removed = this.administrations.splice(idx, 1)[0]
        this.saveToStorage()
        this.notifySuccess('Registro de administração desfeito! O medicamento retornou ao painel.')
        return removed
      }
      return null
    },

    notifySuccess(message) {
      this.notificationMessage = message
      setTimeout(() => {
        if (this.notificationMessage === message) {
          this.notificationMessage = null
        }
      }, 3500)
    },

    // Cadastrar novo medicamento
    async addMedication(medData) {
      const newMed = {
        id: `med-${Date.now()}`,
        residentId: medData.residentId,
        name: medData.name,
        dosage: medData.dosage,
        schedules: medData.schedules || ['08:00'],
        instructions: medData.instructions || '',
        photoUrl: medData.photoUrl || '',
        createdAt: new Date().toISOString()
      }

      this.medications.push(newMed)
      this.saveToStorage()

      if (isConfigured && db) {
        try {
          await addDoc(collection(db, 'medicamentos'), newMed)
        } catch (e) {
          console.warn('[Firebase] Falha ao enviar remédio para a nuvem:', e)
        }
      }

      this.notifySuccess(`Remédio ${newMed.name} (${newMed.dosage}) cadastrado com sucesso!`)
      return newMed
    },

    // Atualizar prescrição de medicamento
    async updateMedication(id, updatedData) {
      const idx = this.medications.findIndex(m => m.id === id)
      if (idx !== -1) {
        this.medications[idx] = { ...this.medications[idx], ...updatedData }
        this.saveToStorage()
        this.notifySuccess(`Medicamento ${this.medications[idx].name} atualizado com sucesso!`)
        return this.medications[idx]
      }
      return null
    },

    // Excluir ou suspender medicamento
    async deleteMedication(id) {
      const med = this.medications.find(m => m.id === id)
      const name = med ? med.name : 'Medicamento'
      this.medications = this.medications.filter(m => m.id !== id)
      this.saveToStorage()
      this.notifySuccess(`Medicamento ${name} suspenso/removido do plano de cuidados.`)
    },

    // Cadastrar novo residente
    async addResident(resData) {
      const newRes = {
        id: `res-${Date.now()}`,
        name: resData.name,
        room: resData.room || 'Quarto Geral',
        healthConditions: Array.isArray(resData.healthConditions) 
          ? resData.healthConditions 
          : (resData.healthConditions ? resData.healthConditions.split(',').map(s => s.trim()).filter(Boolean) : ['Sob Acompanhamento']),
        age: Number(resData.age) || 75,
        notes: resData.notes || '',
        photoUrl: resData.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
        active: true
      }

      this.residents.push(newRes)
      this.saveToStorage()

      if (isConfigured && db) {
        try {
          await addDoc(collection(db, 'idosos'), newRes)
        } catch (e) {
          console.warn('[Firebase] Falha ao sincronizar idoso na nuvem:', e)
        }
      }

      this.notifySuccess(`Residente ${newRes.name} cadastrado com sucesso!`)
      return newRes
    },

    // Atualizar residente
    async updateResident(id, updatedData) {
      const idx = this.residents.findIndex(r => r.id === id)
      if (idx !== -1) {
        this.residents[idx] = { ...this.residents[idx], ...updatedData }
        this.saveToStorage()
        this.notifySuccess(`Cadastro de ${this.residents[idx].name} atualizado com sucesso!`)
        return this.residents[idx]
      }
      return null
    },

    // Desativar ou excluir residente
    async deleteResident(id) {
      const res = this.residents.find(r => r.id === id)
      const name = res ? res.name : 'Residente'
      this.residents = this.residents.filter(r => r.id !== id)
      this.medications = this.medications.filter(m => m.residentId !== id)
      this.saveToStorage()
      this.notifySuccess(`Residente ${name} e suas prescrições foram removidos.`)
    },

    setCurrentCaregiver(caregiver) {
      this.currentCaregiver = caregiver
      this.saveToStorage()
      this.notifySuccess(`Perfil ativo alterado para ${caregiver.name}`)
    },

    // Reset para os dados de demonstração
    resetToDemoData() {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      localStorage.removeItem('lar_do_anciao_state_v2')
      this.residents = [...DEFAULT_RESIDENTS]
      this.medications = [...DEFAULT_MEDICATIONS]
      this.administrations = [...DEFAULT_ADMINISTRATIONS]
      this.currentCaregiver = AVAILABLE_CAREGIVERS[0]
      this.searchQuery = ''
      this.saveToStorage()
      this.notifySuccess('Dados do sistema restaurados para a demonstração padrão!')
    }
  }
})
