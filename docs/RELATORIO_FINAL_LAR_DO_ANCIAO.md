# Sistema de Controle Visual de Medicamentos — Lar do Ancião

> **Status:** Concluído com Sucesso  
> **Fidelidade ao Design:** 100% aderente ao protótipo do Figma  
> **Stack:** Vue.js 3 + Tailwind CSS + Pinia + Vue Router + Capacitor + Tesseract.js (OCR) + Firebase  
> **Auditoria Automatizada:** 25/25 testes unitários e de integração aprovados

---

## 1. Visão Geral da Solução

O aplicativo foi desenvolvido sob medida para cuidadores e administração do **Lar do Ancião**, com foco estrito em **CONTROLE VISUAL DA MEDICAÇÃO** (eliminando a sobrecarga de notificações sonoras no ambiente da instituição).

A interface mobile-first garante que o cuidador, ao abrir o aplicativo no seu turno:
1. **Identifique instantaneamente os medicamentos atrasados** através de um card de alerta prioritário vermelho com ação direta em 1 toque.
2. **Consulte a sequência cronológica** dos próximos medicamentos a serem administrados com horários e instruções claras.
3. **Registre administrações com 1 toque**, gravando na hora o nome da cuidadora logada, horário exato e removendo a dose da fila de pendências em tempo real (evitando intoxicação por dose dupla).
4. **Cadastre novos medicamentos com OCR inteligente**, fotografando a caixa do remédio para extrair o Nome e Dosagem (via Regex `/\b(\d+(?:\.\d+)?\s*(?:mg|g|ml|mcg|UI))\b/i`).
5. **Audite o histórico completo** de doses aplicadas com status verde ("Tomado").

---

## 2. Design System Implementado (Baseado no Protótipo do Figma)

| Elemento | Especificação no Código | Detalhes Visuais |
| :--- | :--- | :--- |
| **Container Central** | `max-w-md mx-auto min-h-screen bg-slate-50` | Layout responsivo centrado simulando perfeitamente um dispositivo mobile |
| **Header Institucional** | `#0f172a` / `bg-slate-900` | Barra superior escura com logotipo oficial, data atual formatada em português, cuidadora de plantão e avatar com link direto para o perfil |
| **Card de Alerta (Atrasados)** | `bg-red-50 border border-red-200 rounded-2xl` | Borda vermelha suave, badge pulsante de pendências, foto do idoso, nome, medicamento, dosagem e botão vermelho chamativo (`bg-red-600 hover:bg-red-700 text-white`) |
| **Card de Próximos Medicamentos** | `bg-white shadow-sm rounded-2xl border border-slate-200` | Tag amarela/âmbar para horários (`14:00`, `18:00`), foto do idoso, dosagem e botão de ação azul marinho (`bg-slate-800 hover:bg-slate-900 text-white`) |
| **Barra Inferior (Bottom Bar)** | `fixed bottom-0 bg-white/95 backdrop-blur-md border-t` | 5 abas fixas: **Início**, **Idosos**, **Medicamentos** (com botão em destaque central), **Histórico** e **Perfil** |

---

## 3. Estrutura Modular de Arquivos

```text
lar-do-anciao/
├── index.html                           # HTML5 com viewport mobile e fontes Google (Inter)
├── package.json                         # Dependências (Vue 3, Pinia, Router, Lucide, Tesseract, Capacitor, Firebase)
├── vite.config.js                       # Configuração do Vite com alias '@/src' e manualChunks otimizados
├── tailwind.config.js                   # Paleta institucional personalizada (navy, brand colors)
├── postcss.config.js                   # Autoprefixer e Tailwind
├── capacitor.config.json                # Configuração do app nativo Android para Google Play Store
├── .gitignore                           # Exclusão de node_modules, dist e arquivos locais
├── test_app.js                          # Suíte automatizada com 25 testes de OCR, RegEx e Pinia Store
├── src/
│   ├── main.js                          # Ponto de entrada Vue 3 + Pinia + Router
│   ├── App.vue                          # Layout mobile-first com HeaderBar, BottomNav e transições suaves
│   ├── router/
│   │   └── index.js                     # 5 rotas principais com scroll top automático
│   ├── stores/
│   │   └── medicationStore.js           # Gerenciamento reativo de idosos, remédios, horários e histórico
│   ├── services/
│   │   ├── ocrService.js                # Extração de Nome e Dosagem via Tesseract.js e Regex
│   │   └── firebase.js                  # Integração com Firestore e Auth (com fallback para modo local)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── HeaderBar.vue            # Topo escuro institucional com avatar e status
│   │   │   └── BottomNav.vue            # 5 abas fixas no rodapé com badge de atrasados
│   │   └── dashboard/
│   │       ├── DelayedList.vue          # Bloco vermelho prioritário de medicamentos atrasados
│   │       └── UpcomingList.vue         # Lista cronológica de próximos remédios com horários
│   ├── views/
│   │   ├── DashboardView.vue            # Tela inicial com métricas, busca rápida e cards
│   │   ├── ResidentsView.vue            # Aba Idosos com cartões, restrições e modal de cadastro
│   │   ├── AddMedicationView.vue        # Cadastro inteligente com câmera, OCR e presets de horário
│   │   ├── HistoryView.vue              # Auditoria de doses aplicadas com cuidadora e horário
│   │   └── ProfileView.vue              # Troca de cuidadora, sincronização e reset para demonstração
│   └── assets/
│       └── main.css                     # Tailwind base, safe areas para mobile e scrollbars
```

---

## 4. Funcionalidades e Regras de Negócio

### 4.1. Dashboard Diário (Início)
- **Banner do Plantão:** Exibe a cuidadora ativa, status de sincronização e métricas em tempo real de doses atrasadas, próximas e tomadas.
- **Busca em Tempo Real:** Campo de pesquisa instantânea que filtra por nome do residente, quarto ou medicamento.
- **Card Vermelho (Atrasados):** Mostra qualquer medicamento cujo horário já passou e ainda não foi confirmado. O botão "Confirmar" registra a dose imediatamente e remove o alerta.
- **Próximos Medicamentos:** Agrupados e ordenados por horário previsto, com filtro rápido por horário (ex: "Todos", "14:00", "18:00", "20:00").

### 4.2. Cadastro Inteligente com OCR (Medicamentos)
- **Botão em Destaque:** `"Tirar Foto da Embalagem"` com acesso à câmera do celular (`@capacitor/camera`) ou galeria de imagens.
- **Extração com IA:** O motor Tesseract.js analisa os dizeres da embalagem e executa a expressão regular de dosagem (`DOSAGE_REGEX`), preenchendo automaticamente os campos `Nome do Remédio` e `Dosagem`.
- **Botões de Teste Rápido:** Atalhos simulados ("Losartana 50mg" e "Omeprazol 20mg") para validação e demonstração ágil sem necessidade de foto real.
- **Presets de Horário:** Botões de 1 clique para horários comuns (1x ao dia, 12/12h, 8/8h, noturno).

### 4.3. Residentes (Idosos)
- Lista de cartões com foto em alta qualidade, idade, quarto, diagnósticos clínicos, alerta destacado de alergias e lista de remédios prescritos.
- Modal para cadastro de novos idosos com persistência local e suporte a Firebase.

### 4.4. Histórico de Aplicações
- Linha do tempo auditável de doses tomadas hoje.
- Registra: nome do idoso, quarto, medicamento, dosagem, badge verde `"Tomado"`, horário previsto, horário real de aplicação e nome completo da cuidadora responsável.

### 4.5. Perfil e Alternância de Cuidadores
- Permite alternar entre diferentes cuidadoras (Maria Oliveira, Joana Santos, Carlos Eduardo, Dra. Beatriz) para auditar quem de fato aplicou cada medicamento.
- Status da conexão Firebase (Modo Nuvem vs Modo Demonstração Local).
- Botão de restauração rápida para dados padrões do protótipo.

---

## 5. Como Executar o Projeto

### Servidor de Desenvolvimento Local
```bash
cmd /c "npm run dev"
```
O servidor inicializa em `http://localhost:3000/`.

### Gerar Bundle de Produção (Vite)
```bash
cmd /c "npm run build"
```
Os arquivos otimizados são gerados na pasta `dist/` com divisão de código (`vendor`, `tesseract` e `firebase` separados).

### Compilar para Android (Google Play Store com Capacitor)
```bash
# Adicionar plataforma Android (caso ainda não criada)
npx cap add android

# Sincronizar os arquivos da pasta dist para o projeto nativo
npx cap sync android

# Abrir no Android Studio para gerar o APK ou AAB assinado
npx cap open android
```
