# Lar do Ancião — Sistema Mobile de Controle Visual de Medicamentos


**Teste do comando para sincronizar as alterações no github**

Aplicativo mobile oficial para o **Lar do Ancião** voltado para a Google Play Store, desenvolvido com foco estrito em **CONTROLE VISUAL DA MEDICAÇÃO** por cuidadores e administração.

---

## 🌟 Funcionalidades Principais

- 🚨 **Card de Alerta Vermelho (Medicamentos Atrasados):** Destaque prioritário visual de remédios pendentes com confirmação em 1 toque.
- ⏰ **Lista Cronológica de Próximos Medicamentos:** Horários organizados com filtros dinâmicos e ação rápida.
- 📷 **Cadastro Inteligente com OCR e Câmera:** Fotografe a embalagem para preenchimento automático de *Nome do Remédio* e *Dosagem* via IA (Tesseract.js) e Regex.
- 👥 **Gestão de Residentes:** Ficha de idosos com fotos, quarto, diagnóstico, restrições e alergias.
- 📋 **Auditoria em Tempo Real (Histórico):** Registro de quem ministrou o medicamento, data e horário exato.
- ☁️ **Sincronização em Nuvem:** Preparado para sincronização multiusuário em tempo real via Firebase Firestore (com modo local offline/demonstração resiliente).

---

## 🛠️ Stack Tecnológica

- **Frontend:** [Vue.js 3](https://vuejs.org/) (Composition API)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) (Design System baseado no Figma)
- **Gerenciamento de Estado:** [Pinia](https://pinia.vuejs.org/)
- **Roteamento:** [Vue Router](https://router.vuejs.org/)
- **Ícones:** [Lucide Icons](https://lucide.dev/)
- **Mobile Engine:** [Capacitor](https://capacitorjs.com/) (Android / Google Play Store)
- **Reconhecimento Óptico (OCR):** [Tesseract.js](https://tesseract.projectnaptha.com/) + Regex
- **Nuvem & Backend:** [Firebase Firestore](https://firebase.google.com/)

---

## 📚 Documentação e Planejamento

Todos os arquivos de planejamento, relatórios e especificações estão organizados na pasta [`docs/`](./docs/):

- 📋 **[Checklist de Pendências e Roadmap](./docs/CHECKLIST_PENDENCIAS_DESENVOLVIMENTO.md)**
- 🚀 **[Relatório Técnico de Implementação](./docs/RELATORIO_FINAL_LAR_DO_ANCIAO.md)**
- 💡 **[Prompt Mestre de Especificação do Figma](./docs/PROMPT_DESENVOLVIMENTO_LAR_DO_ANCIAO.md)**
- 🛠️ **[Relatório de Tecnologias](./docs/RELATORIO_TECNOLOGIAS_LAR_DO_ANCIAO.md)**
- 🏥 **[Contexto Institucional](./docs/LAR_DO_ANCIAO.md)**

---

## 🚀 Como Executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar servidor de desenvolvimento local
```bash
npm run dev
```
Acesse no navegador: `http://localhost:3000/`

### 3. Rodar suíte de testes automatizados
```bash
node test_app.js
```

### 4. Gerar build otimizado para produção
```bash
npm run build
```

### 5. Compilar para Android (Google Play Store)
```bash
npx cap sync android
npx cap open android
```
No Android Studio, selecione **Build > Generate Signed Bundle / APK** para gerar o arquivo `.aab` para publicação na Google Play Store.