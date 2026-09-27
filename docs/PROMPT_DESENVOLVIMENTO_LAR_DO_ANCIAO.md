# PROMPT MESTRE DE DESENVOLVIMENTO — LAR DO ANCIÃO

> **Como usar este prompt:**  
> Copie todo o conteúdo abaixo e cole no assistente de IA da sua IDE (como Cursor, VS Code Copilot, Antigravity, etc.) para inicializar e construir o projeto completo com fidelidade ao design do Figma.

---

```markdown
Você é um desenvolvedor Frontend Sênior especialista em Vue.js 3, Tailwind CSS e Capacitor.

Nós estamos desenvolvendo o aplicativo mobile para o "Lar do Ancião" (instituição de acolhimento para idosos), voltado para a Google Play Store.

### 1. OBJETIVO DO APLICATIVO
Um aplicativo mobile voltado para cuidadores e administração com foco estrito em CONTROLE VISUAL DA MEDICAÇÃO (sem notificações push). O cuidador abre o app no plantão e vê de imediato o que está atrasado e o que deve ser dado a seguir, podendo confirmar com 1 toque. Também possui cadastro inteligente de medicamentos via foto da embalagem com OCR de Nome e Dosagem (ex: 20mg, 40mg).

---

### 2. DESIGN SYSTEM (BASEADO NO PROTÓTIPO DO FIGMA)
O design deve seguir estritamente o layout do protótipo:
- **Tema e Cores:**
  - Header institucional: Azul escuro / Navy (`#0f172a` / `#1e293b`) com título "Lar do Ancião" e avatar do usuário no canto superior direito.
  - Card de Alerta (Medicamentos Atrasados): Fundo vermelho claro suave (`bg-red-50`), borda sutil (`border-red-200`) e botão de ação vermelho chamativo (`bg-red-600 hover:bg-red-700 text-white`).
  - Card de Próximos Medicamentos: Fundo branco limpo com sombra suave (`bg-white shadow-sm rounded-2xl`), tag amarela/cinza para horários (ex: `14:00`, `18:00`) e botão de ação azul marinho (`bg-slate-800 hover:bg-slate-900 text-white`).
  - Barra de Navegação Inferior (Bottom Bar fixa): Fundo branco, borda superior sutil, com 5 abas e ícones (Início, Idosos, Medicamentos, Histórico, Perfil). Aba ativa em destaque azul.
  - Layout Mobile-First: O container central deve ser responsivo e centrado (`max-w-md mx-auto min-h-screen bg-slate-50`).

---

### 3. ESTRUTURA DE PASTAS E ARQUIVOS QUE DEVEM SER CRIADOS

Crie o projeto com a seguinte estrutura modular:

```text
lar-do-anciao/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── capacitor.config.json
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── router/
│   │   └── index.js
│   ├── stores/
│   │   └── medicationStore.js   # Estado reativo (Idosos, Medicamentos, Histórico)
│   ├── services/
│   │   ├── ocrService.js        # Extração de Nome e Dosagem via OCR + Regex
│   │   └── firebase.js          # Configuração e integração do Firebase
│   ├── components/
│   │   ├── layout/
│   │   │   ├── HeaderBar.vue    # Topo escuro com avatar
│   │   │   └── BottomNav.vue    # 5 abas fixas no rodapé
│   │   └── dashboard/
│   │       ├── DelayedList.vue  # Seção vermelha de medicamentos atrasados
│   │       └── UpcomingList.vue # Seção de próximos remédios com horários
│   ├── views/
│   │   ├── DashboardView.vue    # Tela Início (Figma)
│   │   ├── ResidentsView.vue    # Aba Idosos (Lista e cadastro)
│   │   ├── AddMedicationView.vue# Aba Medicamentos (Câmera + OCR de Nome/Dosagem)
│   │   ├── HistoryView.vue      # Aba Histórico (Auditoria de quem aplicou)
│   │   └── ProfileView.vue      # Aba Perfil / ADM
│   └── assets/
│       └── main.css             # Diretivas do Tailwind CSS
```

---

### 4. DEPENDÊNCIAS DO PROJETO

As dependências principais a serem adicionadas no `package.json` são:
- `vue`: ^3.4.0
- `vue-router`: ^4.3.0
- `pinia`: ^2.1.7 (para estado global dos medicamentos)
- `lucide-vue-next`: ^0.350.0 (ícones modernos para a Bottom Navigation)
- `tesseract.js`: ^5.0.5 (motor de OCR para leitura da caixa do remédio)
- `@capacitor/core`: ^6.0.0
- `@capacitor/camera`: ^6.0.0 (para acionar a câmera nativa no Android)
- `firebase`: ^10.9.0 (para sincronização em nuvem)
- `tailwindcss`, `postcss`, `autoprefixer` (estilização)

---

### 5. ESPECIFICAÇÃO DAS REGRAS E TELAS

1. **DashboardView (Tela Inicial do Figma):**
   - No topo, exibe a saudação da cuidadora e o botão de perfil.
   - Bloco 1 (Card Vermelho - Atrasados): Lista idosos com remédios que passaram do horário e não foram confirmados.
     - Cada item exibe: Foto do idoso, Nome, Remédio, Dosagem e botão vermelho "Confirmar".
   - Bloco 2 (Próximos Medicamentos): Lista cronológica com horários (ex: 14:00, 18:00).
     - Cada item exibe: Foto do idoso, Nome, Remédio, Dosagem, Badge de Horário e botão azul "Confirmar".
   - Ação de "Confirmar": Ao clicar, registra na hora o nome da cuidadora logada, a data e hora exata, remove da pendência e insere no Histórico.

2. **AddMedicationView (Cadastro Inteligente com Câmera e OCR):**
   - Botão em destaque: "Tirar Foto da Embalagem".
   - Aciona a câmera (`@capacitor/camera` no celular ou `<input type="file" capture>` no navegador).
   - Ao capturar a imagem, o `ocrService.js` processa a foto via Tesseract.js:
     - Identifica o Nome do Medicamento (texto principal).
     - Aplica Regex `/\b(\d+(?:\.\d+)?\s*(?:mg|g|ml|mcg|UI))\b/i` para extrair a **Dosagem** (ex: `20mg`, `40mg`, `500mg`).
     - Preenche automaticamente os inputs: `Nome do Remédio` e `Dosagem`.
   - Cuidadora seleciona o Idoso e os horários diários (ex: 08:00 e 20:00).

3. **ResidentsView & HistoryView:**
   - Idosos: Lista de cartões com foto, quarto e restrições.
   - Histórico: Log de auditoria com badge verde ("Tomado"), horário programado, horário de aplicação e nome da cuidadora responsável.

---

### 6. INSTRUÇÕES DE EXECUÇÃO
Por favor, comece estruturando os arquivos do projeto com código limpo, reativo, com dados de exemplo (mock) para funcionar de imediato, visual idêntico ao protótipo do Figma e preparado para conexão com Firebase.
```
