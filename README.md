# Lar do Ancião — Sistema Mobile de Controle Visual de Medicamentos

> Aplicativo mobile oficial para o **Lar do Ancião** voltado para a Google Play Store, desenvolvido com foco estrito em **CONTROLE VISUAL DA MEDICAÇÃO** por cuidadores e equipe de enfermagem, sem notificações sonoras contínuas.

---

## 💻 Pré-requisitos e Tecnologias que Devem Ser Instaladas no Computador

Para executar o projeto localmente no seu computador e posteriormente gerar o aplicativo Android para a Google Play Store, você precisará das seguintes ferramentas instaladas:

### 1. ⚙️ Ambiente Básico de Desenvolvimento (Obrigatório para Rodar no PC)

| Tecnologia | Versão Recomendada | Para que serve? | Link de Instalação |
| :--- | :---: | :--- | :--- |
| **Node.js** | **LTS v20.x ou v18.x** | Ambiente de execução JavaScript no computador (necessário para rodar o Vite e os testes) | [nodejs.org](https://nodejs.org/) |
| **npm** | **v10.x** (incluso no Node) | Gerenciador de pacotes para baixar as bibliotecas do projeto | Já vem com o Node.js |
| **Git** | **v2.40+** | Sistema de versionamento para clonar o repositório e sincronizar com o GitHub | [git-scm.com](https://git-scm.com/) |
| **Navegador Moderno** | **Chrome / Edge / Firefox** | Para testar o aplicativo em modo responsivo mobile (F12) | [google.com/chrome](https://www.google.com/chrome/) |
| **VS Code ou IDE compatível** | Última versão | Editor de código recomendado com as extensões oficiais | [code.visualstudio.com](https://code.visualstudio.com/) |

> 💡 **Extensões recomendadas no VS Code:**
> - [Vue - Official (antigo Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
> - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

---

### 2. 📱 Ambiente Mobile Android (Necessário para Gerar APK / AAB para a Play Store)

Se você for gerar o aplicativo instalado no celular Android ou enviar para a Google Play Store:

| Tecnologia | Versão Recomendada | Para que serve? | Link de Instalação |
| :--- | :---: | :--- | :--- |
| **Java JDK** | **JDK 17 ou 21 (LTS)** | Obrigatório para o Android Gradle compilar o código nativo | [oracle.com/java](https://www.oracle.com/java/technologies/downloads/) ou [adoptium.net](https://adoptium.net/) |
| **Android Studio** | **Ladybug / Iguana ou mais recente** | IDE oficial para compilar o APK, emular celulares e gerar o arquivo assinado `.aab` | [developer.android.com/studio](https://developer.android.com/studio) |
| **Android SDK & Build-Tools** | **API 34 ou 35 (Android 14 / 15)** | Ferramentas de compilação instaladas via SDK Manager dentro do Android Studio | Instalado pelo Android Studio |

> ⚠️ **Configuração das Variáveis de Ambiente no Windows (para Android):**
> - `JAVA_HOME`: caminho da instalação do JDK (ex: `C:\Program Files\Java\jdk-17`).
> - `ANDROID_HOME`: caminho do SDK Android (geralmente `%LOCALAPPDATA%\Android\Sdk`).
> - Adicionar `%ANDROID_HOME%\platform-tools` à variável `Path` para ter acesso ao comando `adb`.

---

### 3. ☁️ Ferramentas Opcionais de Nuvem (Para Conexão com Firebase)

| Tecnologia | Para que serve? |
| :--- | :--- |
| **Conta no Firebase Console** | Para criar o banco Firestore, Firebase Auth e Storage ([console.firebase.google.com](https://console.firebase.google.com/)) |
| **Firebase CLI** *(opcional)* | Instalável via `npm install -g firebase-tools` para implantar regras de segurança (`firestore.rules`) |

---

### ⚡ Instalação Rápida no Windows (copie e cole no terminal)

Com o **winget** (já incluso no Windows 10/11), este comando instala **Node.js LTS** e **Git** de uma vez. Abra o **PowerShell** como usuário comum e cole o bloco abaixo:

```powershell
winget install --id OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements; winget install --id Git.Git -e --accept-package-agreements --accept-source-agreements
```

Depois da instalação, **feche e abra o terminal novamente** (para o Windows reconhecer os novos comandos) e confira as versões:

```powershell
node -v; npm -v; git --version
```

Em seguida, clone e rode o projeto:

```powershell
git clone https://github.com/joaquimseabra/lar-do-anciao.git; cd lar-do-anciao; npm install; npm run dev
```

> 📱 **Só para gerar o APK/AAB Android (opcional):** instale o JDK 17 e o Android Studio com o comando abaixo e depois siga a seção [Como Gerar o Aplicativo Android](#-como-gerar-o-aplicativo-android-apk--aab):
> ```powershell
> winget install --id EclipseAdoptium.Temurin.17.JDK -e --accept-package-agreements --accept-source-agreements; winget install --id Google.AndroidStudio -e --accept-package-agreements --accept-source-agreements
> ```
> O Android Studio instala o Android SDK pelo próprio assistente de primeira execução.

---

## 🛠️ Stack Tecnológica do Projeto (Instalada via `npm install`)

As dependências abaixo são baixadas automaticamente pelo `npm` a partir do `package.json`:

- **Framework Frontend:** [Vue.js 3](https://vuejs.org/) (Composition API, `<script setup>`)
- **Compilador e Bundler:** [Vite](https://vitejs.dev/) (Build ultrarrápido com Hot Module Replacement)
- **Design System & Estilização:** [Tailwind CSS](https://tailwindcss.com/) (Mobile-First fiel ao Figma)
- **Gerenciamento de Estado Reativo:** [Pinia](https://pinia.vuejs.org/)
- **Roteamento & RBAC:** [Vue Router](https://router.vuejs.org/)
- **Ícones Modernos:** [Lucide Vue Next](https://lucide.dev/)
- **Ponte Mobile Nativa:** [Capacitor](https://capacitorjs.com/) (`@capacitor/core`, `@capacitor/camera`)
- **Inteligência Óptica (OCR):** [Tesseract.js](https://tesseract.projectnaptha.com/) + Expressões Regulares de Dosagem
- **Compressão de Imagens:** HTML5 Canvas API (~150KB por foto para economia de dados)
- **Nuvem em Tempo Real:** [Firebase SDK](https://firebase.google.com/) (Firestore e Auth)

---

## 🌟 Funcionalidades do Sistema

- 🚨 **Card de Alerta Vermelho (Medicamentos Atrasados):** Destaque prioritário visual de remédios pendentes com confirmação em 1 toque.
- ⏰ **Lista Cronológica de Próximos Medicamentos:** Horários organizados com chips de filtro dinâmicos (Todos, 14:00, 18:00, 22:00) e quarto do residente.
- 📷 **Cadastro Inteligente com OCR e Câmera:** Fotografe a embalagem para preenchimento automático do *Nome do Remédio* e *Dosagem* (ex: 20mg, 50mg) com compressão de foto no aparelho.
- 🧓 **Prontuário Completo de Residentes:** Consulta e cadastro de idosos com quarto/leito, idade, diagnósticos, alergias destacadas em vermelho e todas as prescrições médicas ativas.
- 📋 **Auditoria de Doses (Histórico):** Registro de quem ministrou o medicamento, data e horário exato, com opção de desfazer (undo) em caso de confirmação acidental.
- 🔐 **Controle de Níveis de Acesso (RBAC):** Cuidadoras confirmam e consultam; Administradores prescrevem remédios e cadastram idosos.
- ☁️ **Modo Offline Resiliente:** Funciona 100% no modo local sem internet (armazenamento persistido no aparelho) e preparado para o Firebase em tempo real.

---

## 🚀 Como Executar o Projeto Passo a Passo

### 1. Clonar o repositório
```bash
git clone https://github.com/joaquimseabra/lar-do-anciao.git
cd lar-do-anciao
```

### 2. Instalar as dependências do Node.js
```bash
npm install
```

### 3. Iniciar o servidor de desenvolvimento local
```bash
npm run dev
```
Abra no seu navegador: `http://localhost:3000/`  
*(Pressione `F12` no teclado e ative o modo responsivo mobile para ver a experiência de smartphone conforme o Figma).*

### 4. Rodar a suíte de testes automatizados (37 testes)
```bash
node test_app.js
```

### 5. Compilar o pacote de produção web
```bash
npm run build
```

---

## 📱 Como Gerar o Aplicativo Android (.apk / .aab)

Quando você tiver o **Android Studio** e o **JDK** instalados:

```bash
# 1. Instalar as ferramentas Android do Capacitor (uma única vez)
npm install @capacitor/android @capacitor/cli

# 2. Adicionar o projeto nativo Android
npx cap add android

# 3. Compilar os arquivos do Vue e sincronizar com a pasta android/
npm run build
npx cap sync android

# 4. Abrir o projeto no Android Studio
npx cap open android
```

No **Android Studio**:
1. Aguarde o Gradle sincronizar as dependências.
2. Conecte seu celular Android via cabo USB com **Depuração USB** ativada ou inicie um Emulador.
3. Clique no botão verde de **Run (Play)** para instalar e rodar diretamente no celular.
4. Para gerar o pacote de publicação para a **Google Play Store**, vá em **Build > Generate Signed Bundle / APK > Android App Bundle (.aab)**.

---

## 📚 Documentação Técnica e Planejamento

Todos os documentos de arquitetura, relatórios e especificações estão na pasta [`docs/`](./docs/):

- 📋 **[Checklist de Pendências e Roadmap Atualizado](./docs/CHECKLIST_PENDENCIAS_DESENVOLVIMENTO.md)**
- 🚀 **[Relatório Técnico Final de Implementação](./docs/RELATORIO_FINAL_LAR_DO_ANCIAO.md)**
- 💡 **[Prompt Mestre de Especificação do Figma](./docs/PROMPT_DESENVOLVIMENTO_LAR_DO_ANCIAO.md)**
- 🛠️ **[Relatório Comparativo de Tecnologias](./docs/RELATORIO_TECNOLOGIAS_LAR_DO_ANCIAO.md)**
- 🏥 **[Contexto Institucional do Asilo](./docs/LAR_DO_ANCIAO.md)**