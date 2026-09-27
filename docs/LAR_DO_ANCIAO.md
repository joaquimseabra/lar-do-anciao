# Projeto: Sistema de Controle de Medicamentos — Lar do Ancião

## 1. Visão Geral e Contexto
* **Instituição:** Lar do Ancião (Asilo / Instituição de Longa Permanência para Idosos).
* **Escopo:** Ferramenta 2 desenvolvida pelo grupo na disciplina de TSS.
* **Finalidade:** Aplicativo mobile publicado na Google Play Store para organizar e controlar visualmente a rotina de medicamentos por idoso e por horário, registrar administrações com identificação da cuidadora e destacar visualmente remédios atrasados (sem o incômodo de notificações sonoras contínuas).
* **Modelo Operacional:** **Aplicativo Android Nativo (Vue.js + Capacitor) Conectado a Nuvem em Tempo Real (Firebase)**, estruturado a partir do protótipo oficial do Figma.

---

## 2. Por que o sistema NÃO PODE ser totalmente local no celular?

1. **Múltiplos Usuários Simultâneos:**
   * O **Administrador** cadastra idosos, horários, receitas e fotografa remédios.
   * **Diversas Cuidadoras** usam seus próprios celulares para consultar e marcar os remédios ministrados.
2. **Risco Crítico de Duplicidade de Dose:**
   * Se o sistema ficasse salvo apenas no celular da cuidadora "Maria", a cuidadora "Joana" não saberia que o remédio já foi dado, podendo medicar o idoso duas vezes (grave risco de intoxicação).
   * As informações de "remédio tomado" precisam ser sincronizadas **em tempo real** para todos os aparelhos.

---

## 3. Estrutura de Telas e Casos de Uso (Baseado no Figma)

* **Protótipo Interativo:** [Link do Projeto no Figma](https://www.figma.com/make/5Q43ahkSNsRj3jIi2yZ6yY/Lar-do-anci%C3%A3o?code-node-id=0-6&p=f&fullscreen=1)

Conforme protótipo construído no Figma, a interface é estruturada com **Barra Inferior de 5 Abas**:

1. **Início (Dashboard Diário):**
   * **Card Vermelho Superior (Medicamentos Atrasados):** Alerta visual prioritário com lista de remédios que passaram do horário e ainda não foram dados, com botão direto de "Confirmar".
   * **Lista de Próximos Medicamentos:** Cronograma do dia ordenado por horários (ex: 14:00, 18:00, 20:00), foto do idoso, medicamento, dosagem e botão de ação.
2. **Idosos:** Cadastro e consulta dos residentes (nome, quarto, foto e saúde).
3. **Medicamentos:** Cadastro com foto e OCR automático de Nome e Dosagem (ex: 20mg, 40mg).
4. **Histórico:** Auditoria completa de doses tomadas com data, hora e cuidadora.
5. **Perfil / ADM:** Gerenciamento de login e acessos.

---

## 4. Stack Tecnológica (Vue.js + Android Play Store + Firebase)

| Camada | Tecnologia | Justificativa |
| :--- | :--- | :--- |
| **Framework Frontend** | **Vue.js 3 (com Vite)** | Recomendado pelo professor; reatividade excelente para os cards do Figma. |
| **Ponte Mobile (Play Store)** | **Capacitor (Ionic)** | Converte a aplicação Vue.js em um projeto Android nativo pronto para gerar pacotes `.apk` e `.aab` para a Google Play Store. |
| **Reconhecimento por Foto** | **Tesseract.js (ou ML Kit) + Regex** | Extrai os textos da embalagem e preenche automaticamente o Nome e a Dosagem do remédio. |
| **Backend & Banco de Dados** | **Firebase Firestore** | Nuvem gratuita com sincronização em tempo real entre todos os celulares para evitar dose dupla. |
| **Autenticação** | **Firebase Auth** | Gerencia com segurança o login de Administrador vs Cuidadora. |
