# Backlog de Desenvolvimento — Lar do Ancião

> **Documento Oficial de Acompanhamento do Projeto**  
> **Objetivo:** Mapear o status detalhado das entregas, separando o que já foi totalmente concluído no frontend local do que ainda precisa ser desenvolvido (Nuvem Firebase e Publicação na Google Play Store).

---

## 🟢 1. O Que Já Foi Desenvolvido (Concluído)

### 🎨 1.1. Interface e Experiência do Usuário (Design System do Figma)
- [x] **Layout Mobile-First Responsivo:** Container central de smartphone (`max-w-md mx-auto`) com paleta institucional Navy/Azul Marinho (`#0f172a`), fundo limpo e tipografia moderna.
- [x] **Header Superior:** Título institucional "Lar do Ancião", data de hoje formatada em português e avatar da cuidadora ativa com atalho para o perfil.
- [x] **Card de Alerta de Medicamentos Atrasados (Bloco Vermelho):** Destaque prioritário visual suave (`bg-red-50`), badge pulsante de pendência, quarto do residente e botão vermelho *"Confirmar"* com 1 toque.
- [x] **Lista Cronológica de Próximos Medicamentos (Bloco Branco):** Cards com foto do idoso, nome, quarto, remédio, dosagem, horário previsto e chips de filtro interativos por horário (*Todos*, *14:00*, *18:00*, *22:00*).
- [x] **Barra de Navegação Inferior (5 Abas Fixas):** Início, Idosos, Medicamentos (com badge `ADM`), Histórico e Perfil, com indicador visual de rota ativa.
- [x] **Feedback Visual (Toast):** Notificações temporárias de sucesso no topo para confirmações de doses e alterações cadastrais.

### ⚙️ 1.2. Regras de Negócio e Estado Reativo Local (Pinia Store)
- [x] **Confirmação de Medicamentos com 1 Toque:** Registra imediatamente o profissional responsável, a data e o horário exato, remove o item da fila de pendências e grava no histórico.
- [x] **Desfazer Dose (Undo):** Permite reverter uma confirmação acidental diretamente no histórico, restaurando o medicamento ao painel de pendências.
- [x] **Fuso Horário Resiliente (UTC-3 Brasília):** Tratamento independente de UTC para garantir cálculo preciso de horários do plantão sem distorção por fuso.
- [x] **Persistência Local (LocalStorage):** Modo offline completo onde todas as ações ficam salvas no navegador/celular mesmo após fechar o aplicativo.

### 📷 1.3. Câmera, Compressão e OCR de Medicamentos
- [x] **Captura com Câmera e Galeria:** Integração com `@capacitor/camera` para acionar a câmera nativa no Android e fallback com `<input type="file">` na web.
- [x] **Compressão Automática no Aparelho (`imageService.js`):** Redução inteligente via HTML5 Canvas para JPEG de `~150KB` antes de salvar, poupando armazenamento e dados móveis.
- [x] **Reconhecimento Óptico de Caracteres (OCR):** Processamento da caixa de remédio via Tesseract.js em português com barra de progresso em tempo real.
- [x] **Extração de Dosagem via Regex:** Reconhecimento automático de dosagens como `20mg`, `50mg`, `850mg`, `5000UI`, `10ml`, etc.
- [x] **Filtro Inteligente de Ruídos:** Limpeza de dizeres legais da embalagem para isolar o nome real do remédio.

### 🧓 1.4. Gestão Completa de Idosos Residentes (`ResidentsView.vue`)
- [x] **Ficha Cadastral Médica:** Armazenamento de Nome, **Quarto / Leito**, Idade, **Condições de Saúde / Alergias** (com destaque vermelho para alergias) e Observações de Cuidados.
- [x] **Prontuário Completo (Modal):** Ao tocar no card do idoso, exibe seu prontuário com diagnósticos e a lista de todos os medicamentos prescritos ativos.
- [x] **Fotografia do Residente:** Opção de tirar foto com a câmera, escolher da galeria (com compressão) ou selecionar avatares padrão.
- [x] **Ações Administrativas:** Edição cadastral e desativação/exclusão de residente e seus remédios associados.

### 💊 1.5. Gestão de Prescrições Médicas (`AddMedicationView.vue`)
- [x] **Prescrição Inteligente:** Cadastro de remédios com foto, OCR, seleção do idoso e chips de horários diários (ex: 8/8h, 12/12h).
- [x] **Lista de Prescrições Ativas:** Alternador de aba para consultar todos os medicamentos cadastrados na instituição com busca rápida.
- [x] **Edição e Suspensão:** O administrador pode alterar dosagens/horários ou suspender/excluir medicamentos que o médico interrompeu.

### 🔐 1.6. Autenticação Local e Controle de Acesso (RBAC)
- [x] **Tela de Login (`LoginView.vue`):** Campos com validação de e-mail e senha (mínimo de 6 caracteres), "Lembrar meu acesso", feedback visual de erros e fluxo de recuperação.
- [x] **Contas Mockadas de Demonstração:** Contas prontas para cuidadoras e administradora médica (Dra. Beatriz).
- [x] **Controle de Níveis de Acesso (RBAC):**
  - **Cuidador:** Confere pendências, confirma doses com 1 toque, consulta idosos e histórico. Botões de cadastro/edição ficam ocultados.
  - **Administrador:** Acesso irrestrito a cadastrar idosos, prescrever e suspender remédios.
- [x] **Proteção de Rotas (`router/index.js`):** Interceptor que redireciona usuários não logados para `/login` e bloqueia cuidadores de acessar telas exclusivas de administrador (`requiredRole: 'admin'`).
- [x] **Alternância Dinâmica no Perfil (`ProfileView.vue`):** Permite trocar de profissional logado para testar ambos os perfis instantaneamente.

### 🧪 1.7. Qualidade e Testes Automatizados
- [x] **37 Testes Unitários Aprovados (`test_app.js`):** Cobrindo OCR, Regex de dosagem, helpers de fuso horário, regras do Pinia Store e RBAC com 100% de aprovação.
- [x] **Build de Produção do Vite:** Compilação limpa sem erros de sintaxe ou dependências quebradas.

---

## 🔴 2. O Que Ainda Precisa de Desenvolvimento (Pendências)

As pendências restantes estão divididas em **Nuvem (Firebase)** e **Publicação Mobile (Android)**:

### ☁️ 1. Autenticação Real em Nuvem (Firebase Authentication)
*Objetivo: Substituir as contas mockadas por contas reais com senha criptografada na nuvem.*

- [ ] **1.1. Ativação no Firebase Console:**
  - [ ] Criar projeto institucional no Firebase Console.
  - [ ] Ativar o provedor de autenticação por **E-mail/Senha**.
  - [ ] Preencher as chaves reais no arquivo `.env`.
- [ ] **1.2. Integração no `authService.js`:**
  - [ ] Trocar o login local por `signInWithEmailAndPassword(auth, email, password)`.
  - [ ] Trocar o logout local por `signOut(auth)`.
  - [ ] Adicionar o observador global `onAuthStateChanged(auth, callback)` para persistir a sessão nativamente.
  - [ ] Conectar o envio real de e-mail de recuperação de senha com `sendPasswordResetEmail(auth, email)`.
- [ ] **1.3. Coleção de Usuários no Firestore:**
  - [ ] Criar coleção `usuarios` vinculada ao `uid` do Firebase Auth com `{ uid, nome, email, papel: 'admin' | 'cuidador', foto_url }`.
  - [ ] Carregar o papel (`papel`) do Firestore no momento do login.

---

### 🌐 2. Banco de Dados em Tempo Real (Cloud Firestore)
*Objetivo: Evitar dose dupla garantindo que, quando uma cuidadora confirmar um remédio no celular dela, o card suma no mesmo segundo dos aparelhos das demais cuidadoras.*

- [ ] **2.1. Conexão do Firestore:**
  - [ ] Criar o banco Cloud Firestore em modo de produção.
  - [ ] Validar a conexão no `src/services/firebase.js`.
- [ ] **2.2. Sincronização Bidirecional (`onSnapshot`):**
  - [ ] Conectar escuta em tempo real (`onSnapshot`) na coleção `administracoes_registro`.
  - [ ] Conectar escuta em tempo real (`onSnapshot`) na coleção `medicamentos`.
  - [ ] Conectar escuta em tempo real (`onSnapshot`) na coleção `idosos`.
- [ ] **2.3. Cache Offline do Firestore:**
  - [ ] Habilitar persistência local com `enableIndexedDbPersistence(db)` para manter o aplicativo operando em caso de queda de Wi-Fi no asilo.
- [ ] **2.4. Regras de Segurança (`firestore.rules`):**
  - [ ] Configurar regras que restrinjam a leitura apenas para usuários autenticados da instituição.
  - [ ] Proibir edição ou deleção de registros da coleção `administracoes_registro` (proteção de auditoria contra fraudes).

---

### 🖼️ 3. Fotos na Nuvem (Firebase Storage)
*Objetivo: Salvar as fotos de embalagens e idosos na nuvem para que fiquem visíveis em todos os aparelhos.*

- [ ] **3.1. Ativação do Storage:**
  - [ ] Ativar o serviço de Firebase Storage no Console.
  - [ ] Configurar regras de segurança (`storage.rules`) permitindo upload apenas para usuários autenticados.
- [ ] **3.2. Serviço de Envio de Fotos (`storageService.js`):**
  - [ ] Criar função para enviar o arquivo JPEG comprimido para `medicamentos/{id_remedio}.jpg` e `idosos/{id_idoso}.jpg`.
  - [ ] Obter a URL pública permanente (`getDownloadURL`) e salvar no respectivo documento do Firestore.

---

### 📱 4. Publicação Nativa Android (Capacitor & Play Store)
*Objetivo: Gerar o aplicativo instalável (.apk / .aab) para a Google Play Store.*

- [ ] **4.1. Adicionar o Projeto Nativo:**
  - [ ] Instalar dependências nativas: `npm install @capacitor/android @capacitor/cli`.
  - [ ] Gerar pasta do Android: `npx cap add android`.
- [ ] **4.2. Permissões de Câmera (`AndroidManifest.xml`):**
  - [ ] Inserir permissões da câmera e leitura de arquivos em `android/app/src/main/AndroidManifest.xml`:
    - `<uses-permission android:name="android.permission.CAMERA" />`
    - `<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />`
- [ ] **4.3. Identidade Visual do App:**
  - [ ] Gerar os ícones adaptativos do aplicativo para Android em `res/mipmap`.
  - [ ] Configurar a tela de Splash Screen com o logotipo oficial do Lar do Ancião.
- [ ] **4.4. Chave Criptográfica (Keystore):**
  - [ ] Gerar o arquivo de assinatura `lar-do-anciao.keystore` via comando `keytool`.
- [ ] **4.5. Compilação e Geração do Pacote:**
  - [ ] Sincronizar os arquivos: `npm run build && npx cap sync android`.
  - [ ] Gerar o **Android App Bundle (.aab)** assinado no Android Studio para submissão na Google Play Console.

---

## 📊 3. Resumo Visual do Progresso

```text
[Interface e Design Figma]  ████████████████████ 100% (Concluído)
[Regras de Negócio e Front] ████████████████████ 100% (Concluído)
[Câmera, Compressão e OCR]  ██████████████████░░  90% (Concluído no Front)
[Login e RBAC Local]        █████████████░░░░░░░  65% (Interface e Regras prontas)
[Publicação Android Nativa] ████████░░░░░░░░░░░░  40% (Capacitor configurado)
[Banco Firestore em Nuvem]  ███░░░░░░░░░░░░░░░░░  15% (Estrutura base pronta)
[Fotos no Firebase Storage] ███░░░░░░░░░░░░░░░░░  15% (Compressão pronta)
```
