# Checklist de Funcionalidades Pendentes — Lar do Ancião

> **Documento de Planejamento e Roadmap de Desenvolvimento**  
> **Objetivo:** Mapear o que já foi entregue e estruturar em formato de checklist tudo o que é necessário para colocar o aplicativo em produção na Google Play Store com autenticação real e nuvem ativa.

---

## 📊 1. Resumo do Status Atual do Projeto

| Área | Status Atual | O Que Já Funciona | O Que Falta |
| :--- | :---: | :--- | :--- |
| **Interface / Design (Figma)** | 🟢 100% | Layout Mobile-First, Header Navy, Card Vermelho (Atrasados), Card Branco (Próximos), 5 Abas | Nada pendente no layout |
| **Regra de Negócio (Front)** | 🟢 100% | Confirmação em 1 toque, remoção da fila, fuso UTC-3, 25 testes unitários aprovados | Nada pendente na regra local |
| **Câmera & OCR** | 🟡 85% | Captura com Capacitor, Tesseract.js, Regex de dosagem (`20mg`, `50mg`), simuladores | Permissões nativas no AndroidManifest |
| **Login & Autenticação** | 🔴 10% | Seletor simulado de cuidadora no Perfil | Tela de Login, Senha, Firebase Auth, RBAC e Router Guard |
| **Nuvem em Tempo Real** | 🔴 15% | Código base preparado no `firebase.js` | Chaves reais (.env), `onSnapshot` bidirecional e Firestore Rules |
| **Fotos na Nuvem (Storage)** | 🔴 0% | Armazenamento temporário local (base64 / URL) | Firebase Storage para fotos de remédios e idosos |
| **Publicação Android (Play Store)** | 🟡 40% | Capacitor instalado e configurado (`capacitor.config.json`) | Criar pasta `android/`, ícones, splash screen e gerar `.aab` |

---

## 📝 2. Checklist Detalhado das Funcionalidades Pendentes

### 🔐 FASE 1: Autenticação Real (Login, Senha e Perfis)
*Acesso seguro para diferenciar o Administrador (que cadastra e altera prescrições) das Cuidadoras (que confirmam as doses no plantão).*

- [ ] **1.1. Tela de Login (`LoginView.vue`):**
  - [ ] Formulário com campos de **E-mail institucional** e **Senha**.
  - [ ] Validação visual de campos (e-mail válido, senha mínima de 6 caracteres).
  - [ ] Opção de *"Lembrar meu acesso"* para não deslogar a cuidadora entre turnos.
  - [ ] Feedback amigável para erros do Firebase (ex: "Senha incorreta", "E-mail não cadastrado", "Muitas tentativas").
  - [ ] Botão *"Esqueci minha senha"* com envio de e-mail de recuperação (`sendPasswordResetEmail`).

- [ ] **1.2. Integração com Firebase Authentication:**
  - [ ] Configurar provedor de autenticação por **E-mail/Senha** no Console do Firebase.
  - [ ] Função de login com `signInWithEmailAndPassword(auth, email, password)`.
  - [ ] Função de logout com `signOut(auth)`.
  - [ ] Observador de estado de login global com `onAuthStateChanged(auth, callback)`.

- [ ] **1.3. Níveis de Acesso (RBAC - Role-Based Access Control):**
  - [ ] Criação da coleção `usuarios` no Firestore com os campos: `{ uid, nome, email, papel: 'admin' | 'cuidador', foto_url }`.
  - [ ] **Regra para Perfil Cuidadora:**
    - Acessa Início, confere remédios, confirma doses com 1 toque, consulta idosos e histórico.
    - **Bloqueio:** Não pode cadastrar novos medicamentos, nem editar diagnósticos de idosos.
  - [ ] **Regra para Perfil Administrador:**
    - Acesso total: cadastra idosos, cadastra remédios (com câmera/OCR), gerencia contas de cuidadores.

- [ ] **1.4. Proteção de Rotas no Vue Router (`router/index.js`):**
  - [ ] Adicionar `meta: { requiresAuth: true, requiredRole: 'admin' }` nas rotas.
  - [ ] Interceptor `router.beforeEach` para redirecionar usuários não logados automaticamente para `/login`.

---

### ☁️ FASE 2: Banco de Dados em Tempo Real (Firebase Firestore)
*Garante que, quando a cuidadora Maria der o remédio no celular dela, o card suma instantaneamente do celular da cuidadora Joana (evitando dose dupla).*

- [ ] **2.1. Conexão com Projeto Real do Firebase:**
  - [ ] Criar o projeto no [Firebase Console](https://console.firebase.google.com/).
  - [ ] Criar o banco de dados **Cloud Firestore** em modo produção.
  - [ ] Preencher o arquivo `.env` com as chaves reais da instituição:
    - `VITE_FIREBASE_API_KEY`
    - `VITE_FIREBASE_AUTH_DOMAIN`
    - `VITE_FIREBASE_PROJECT_ID`
    - `VITE_FIREBASE_STORAGE_BUCKET`
    - `VITE_FIREBASE_MESSAGING_SENDER_ID`
    - `VITE_FIREBASE_APP_ID`

- [ ] **2.2. Sincronização Bidirecional em Tempo Real (`onSnapshot`):**
  - [ ] Conectar `onSnapshot` na coleção `administracoes_registro`: atualiza o painel de todos os celulares no mesmo segundo.
  - [ ] Conectar `onSnapshot` na coleção `medicamentos`: novos remédios aparecem na hora para toda a equipe.
  - [ ] Conectar `onSnapshot` na coleção `idosos`: alterações de quarto ou novas internações são sincronizadas.

- [ ] **2.3. Cache Offline do Firestore (Trabalho sem Internet):**
  - [ ] Habilitar `enableIndexedDbPersistence(db)` para que o app continue funcionando se o Wi-Fi do asilo oscilar.
  - [ ] Sincronização automática em background assim que a conexão retornar.

- [ ] **2.4. Regras de Segurança (`firestore.rules`):**
  - [ ] Regras que impedem qualquer usuário não autenticado de ler dados médicos dos idosos.
  - [ ] Regras que impedem que registros de administrações já salvos sejam deletados ou adulterados (auditoria protegida).

---

### 🖼️ FASE 3: Upload de Imagens na Nuvem (Firebase Storage)
*Salvar as fotos das embalagens dos remédios e fotos dos residentes de forma leve e segura.*

- [ ] **3.1. Bucket do Firebase Storage:**
  - [ ] Ativar o **Firebase Storage** no console do Firebase.
  - [ ] Regras de acesso (`storage.rules`) permitindo upload apenas por usuários autenticados.
- [ ] **3.2. Serviço de Upload (`storageService.js`):**
  - [ ] Função para comprimir a foto antes do envio (reduzir para ~150KB para economizar dados móveis).
  - [ ] Upload da imagem para `medicamentos/{id_remedio}.jpg` e `idosos/{id_idoso}.jpg`.
  - [ ] Gravação da URL pública gerada no documento correspondente do Firestore.

---

### 📱 FASE 4: Pacote Nativo Android (Capacitor & Google Play Store)
*Transformar a aplicação Vue.js em um aplicativo Android (.apk / .aab) pronto para a Play Store.*

- [ ] **4.1. Adicionar o Projeto Android Nativo:**
  - [ ] Executar no terminal:
    ```bash
    npx cap add android
    ```
- [ ] **4.2. Permissões de Câmera no Android (`AndroidManifest.xml`):**
  - [ ] Inserir permissões obrigatórias da câmera no arquivo `android/app/src/main/AndroidManifest.xml`:
    ```xml
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    ```
- [ ] **4.3. Identidade Visual do App:**
  - [ ] Ícone do aplicativo adaptativo para Android (Adaptive Icons em `res/mipmap`).
  - [ ] Tela de Splash Screen com o logotipo institucional do Lar do Ancião.
- [ ] **4.4. Geração de Chave Criptográfica (Keystore):**
  - [ ] Gerar o arquivo `lar-do-anciao.keystore` via comando `keytool` para assinar o aplicativo.
- [ ] **4.5. Build de Release para a Google Play Store:**
  - [ ] Compilar os arquivos do Vue: `cmd /c "npm run build"`.
  - [ ] Sincronizar: `npx cap sync android`.
  - [ ] Gerar o **Android App Bundle (.aab)** assinado no Android Studio para publicação na Google Play Console.

---

### 📄 FASE 5: Relatórios e Exportação Administrativa (Bônus para o Asilo)
*Facilidade para coordenação, médicos e auditorias de saúde.*

- [ ] **5.1. Exportação em PDF/Excel:**
  - [ ] Botão na aba Histórico para baixar relatório diário ou semanal das medicações ministradas.
  - [ ] Documento pronto para apresentação em caso de fiscalização da Vigilância Sanitária ou prontuário médico.

---

## 🎯 3. Ordem de Prioridade Recomendada para Implementação

```text
[Prioridade 1 - Crítica]  ──▶  Login e Senha (Firebase Auth) + Proteção de Rotas
          │
[Prioridade 2 - Crítica]  ──▶  Banco em Tempo Real (Firestore onSnapshot) + .env real
          │
[Prioridade 3 - Média]    ──▶  Firebase Storage (Upload de fotos)
          │
[Prioridade 4 - Final]    ──▶  Build Nativo Android (.aab) no Android Studio para a Play Store
```
