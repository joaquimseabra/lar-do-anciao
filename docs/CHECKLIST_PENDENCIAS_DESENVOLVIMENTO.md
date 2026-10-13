# Checklist de Funcionalidades Pendentes — Lar do Ancião

> **Documento de Planejamento e Roadmap de Desenvolvimento**  
> **Objetivo:** Mapear o que já foi entregue e estruturar em formato de checklist tudo o que é necessário para colocar o aplicativo em produção na Google Play Store com autenticação real e nuvem ativa.

---

## 📊 1. Resumo do Status Atual do Projeto

| Área | Status Atual | O Que Já Funciona | O Que Falta |
| :--- | :---: | :--- | :--- |
| **Interface / Design (Figma)** | 🟢 100% | Layout Mobile-First, Header Navy, Card Vermelho (Atrasados), Card Branco (Próximos com chips de filtro), 5 Abas | Nada pendente no layout |
| **Regra de Negócio (Front)** | 🟢 100% | Confirmação em 1 toque, desfeita de dose (undo), gestão de idosos com quarto/saúde/prontuário, edição e suspensão de remédios, testes unitários aprovados (42/42) | Nada pendente na regra local |
| **Câmera, Compressão & OCR** | 🟢 100% | Captura com Capacitor, compressão automática via Canvas (~150KB), Tesseract.js, Regex de dosagem (`20mg`, `50mg`), permissões no `AndroidManifest.xml` | Concluído no app local |
| **Alertas & Notificações** | 🟢 100% | Web Audio API com sinal sonoro harmônico, notificações locais de horários e preferências no Perfil | Concluído (modo offline) |
| **PWA & Modo Offline** | 🟢 100% | `manifest.webmanifest`, `icon.svg`, `sw.js` (Service Worker com cache Network-First), standalone | Concluído |
| **Login & Autenticação** | 🟡 65% | Tela de Login (`LoginView.vue`), validação, "lembrar acesso", troca de perfil no Perfil, RBAC visual e Route Guard | Plugar Firebase Authentication real (.env) |
| **Nuvem em Tempo Real** | 🔴 15% | Código base preparado no `firebase.js` e chamadas no store | Chaves reais (.env), `onSnapshot` bidirecional e Firestore Rules |
| **Fotos na Nuvem (Storage)** | 🟡 30% | Compressão local no aparelho (`imageService.js` → ~150KB) em remédios e idosos | Firebase Storage para salvar URLs públicas na nuvem |
| **Publicação Android (Play Store)** | 🟢 85% | Pasta `android/` nativa criada via Capacitor, permissões configuradas no `AndroidManifest.xml`, sincronização web concluída | Gerar keystore e exportar `.aab` assinado |

---

## 📝 2. Checklist Detalhado das Funcionalidades Pendentes

### 🔐 FASE 1: Autenticação Real (Login, Senha e Perfis)
*Acesso seguro para diferenciar o Administrador (que cadastra e altera prescrições) das Cuidadoras (que confirmam as doses no plantão).*

- [x] **1.1. Tela de Login (`LoginView.vue`):** *(implementada e funcional em modo local via `authService.js`)*
  - [x] Formulário com campos de **E-mail institucional** e **Senha**.
  - [x] Validação visual de campos (e-mail válido, senha mínima de 6 caracteres).
  - [x] Opção de *"Lembrar meu acesso"* para não deslogar a cuidadora entre turnos.
  - [x] Feedback amigável para erros do Firebase (ex: "Senha incorreta", "E-mail não cadastrado", "Muitas tentativas").
  - [x] Botão *"Esqueci minha senha"* com validação de formato e fluxo simulado localmente.

- [ ] **1.2. Integração com Firebase Authentication:** *(Aguardando conexão com Firebase)*
  - [ ] Configurar provedor de autenticação por **E-mail/Senha** no Console do Firebase.
  - [ ] Função de login com `signInWithEmailAndPassword(auth, email, password)`.
  - [ ] Função de logout com `signOut(auth)`.
  - [ ] Observador de estado de login global com `onAuthStateChanged(auth, callback)`.

- [x] **1.3. Níveis de Acesso (RBAC - Role-Based Access Control):** *(Interface e regras no Front-End 100% concluídas)*
  - [x] **Regra para Perfil Cuidadora:**
    - Acessa Início, confere remédios, confirma doses com 1 toque, consulta idosos e histórico.
    - **Bloqueio:** Botão "+ Novo Idoso" ocultado, aba "Medicamentos" identificada como restrita e rota protegida.
  - [x] **Regra para Perfil Administrador:**
    - Acesso total: cadastra e edita idosos, cadastra remédios (com câmera/OCR), gerencia/suspende prescrições, alterna contas de cuidadores.
  - [ ] Criação da coleção `usuarios` no Firestore com os campos: `{ uid, nome, email, papel: 'admin' | 'cuidador', foto_url }`. *(Aguardando Firebase)*

- [x] **1.4. Proteção de Rotas no Vue Router (`router/index.js`):**
  - [x] Adicionar `meta: { requiredRole: 'admin' }` nas rotas restritas.
  - [x] Interceptor `router.beforeEach` para redirecionar usuários não logados para `/login`.
  - [x] Interceptor `router.beforeEach` impedindo que cuidadoras acessem telas exclusivas de Administrador (com aviso amigável).

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
- [x] **3.2. Serviço de Compressão e Upload (`imageService.js`):**
  - [x] Função para comprimir a foto antes do envio (reduz para ~150KB para economizar dados móveis e armazenamento).
  - [ ] Upload da imagem para `medicamentos/{id_remedio}.jpg` e `idosos/{id_idoso}.jpg`. *(Aguardando Firebase)*
  - [ ] Gravação da URL pública gerada no documento correspondente do Firestore. *(Aguardando Firebase)*

---

### 📱 FASE 4: Pacote Nativo Android (Capacitor & Google Play Store)
*Transformar a aplicação Vue.js em um aplicativo Android (.apk / .aab) pronto para a Play Store.*

- [x] **4.1. Adicionar o Projeto Android Nativo:**
  - [x] Executar no terminal:
    ```bash
    npm install @capacitor/android @capacitor/cli
    npx cap add android
    ```
- [x] **4.2. Permissões de Câmera no Android (`AndroidManifest.xml`):**
  - [x] Inserir permissões obrigatórias da câmera no arquivo `android/app/src/main/AndroidManifest.xml`:
    ```xml
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    ```
- [ ] **4.3. Identidade Visual do App:**
  - [ ] Ícone do aplicativo adaptativo para Android (Adaptive Icons em `res/mipmap`).
  - [ ] Tela de Splash Screen com o logotipo institucional do Lar do Ancião.
- [ ] **4.4. Geração de Chave Criptográfica (Keystore):**
  - [ ] Gerar o arquivo `lar-do-anciao.keystore` via comando `keytool` para assinar o aplicativo.
- [ ] **4.5. Build de Release para a Google Play Store:**
  - [x] Compilar os arquivos do Vue: `npm run build`.
  - [x] Sincronizar: `npx cap sync android`.
  - [ ] Gerar o **Android App Bundle (.aab)** assinado no Android Studio para publicação na Google Play Console.

---

## 🎯 3. Ordem de Prioridade para Próximos Passos (Quando for plugar a Nuvem)

```text
[Prioridade 1 - Nuvem]  ──▶  Criar Projeto no Firebase Console e preencher o .env
          │
[Prioridade 2 - Nuvem]  ──▶  Ativar Firebase Auth (E-mail/Senha) e Firestore em Tempo Real
          │
[Prioridade 3 - Nuvem]  ──▶  Ativar Firebase Storage (Upload das fotos comprimidas)
          │
[Prioridade 4 - Mobile] ──▶  Gerar Projeto Android Nativo (`npx cap add android`) e pacote .aab
```
