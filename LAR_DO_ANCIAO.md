# Projeto: Sistema de Controle de Medicamentos — Lar do Ancião

## 1. Visão Geral e Contexto
* **Instituição:** Lar do Ancião (Asilo / Instituição de Longa Permanência para Idosos).
* **Escopo:** Ferramenta 2 desenvolvida pelo grupo na disciplina de TSS.
* **Finalidade:** Sistema digital para organizar a rotina de medicamentos por idoso e por horário, disparar alertas/notificações no celular das cuidadoras, registrar a administração realizada com histórico e identificar medicamentos atrasados.
* **Modelo Operacional:** **Sistema Distribuído / Conectado (Mobile + Nuvem Gratuita)**.

---

## 2. Por que o sistema NÃO PODE ser totalmente local no celular?

Diferente do *Lar de Maria* (onde uma única pessoa opera tudo no computador do orfanato), o *Lar do Ancião* possui dinâmica colaborativa e crítica:

1. **Múltiplos Usuários Simultâneos:**
   * O **Administrador** cadastra os idosos, horários e receitas.
   * **Diversas Cuidadoras** (em diferentes turnos e setores) usam seus próprios celulares para consultar e marcar os remédios ministrados.
2. **Risco Crítico de Duplicidade de Dose:**
   * Se o sistema ficasse salvo apenas no celular da cuidadora "Maria", a cuidadora "Joana" não saberia que o remédio já foi dado, podendo medicar o idoso duas vezes (grave risco de intoxicação).
   * As informações de "remédio tomado" precisam ser sincronizadas **em tempo real** para todos os aparelhos.
3. **Alertas e Notificações Centralizadas:**
   * Os alarmes de horário de medicação precisam disparar nos aparelhos das cuidadoras de plantão, independente de onde o cadastro foi feito.
4. **Resiliência:**
   * Se um celular quebrar, for roubado ou descarregar, o histórico médico dos idosos e as próximas doses não podem se perder.

---

## 3. Requisitos Oficiais e Casos de Uso
1. **Login com Diferentes Níveis de Acesso:**
   * **ADM:** Acesso completo (cadastros, relatórios e auditoria).
   * **Cuidadora:** Consulta rápida dos remédios do turno e registro de administração.
2. **Cadastro dos Idosos (Somente ADM):** Nome, quarto, foto e restrições de saúde.
3. **Cadastro dos Medicamentos (Somente ADM):** Inserção manual (nome, dosagem, frequência) ou captura por foto da receita/caixa do remédio.
4. **Organização Automática por Horário:** Grade cronológica dos remédios do dia.
5. **Alertas e Notificações no Celular:** Avisos de medicamentos próximos do horário de aplicação.
6. **Registro de Administração:** Botão para a cuidadora confirmar que o remédio foi tomado, gravando data, hora e seu nome.
7. **Painel Diário e Medicamentos Atrasados:** Destaque visual (ex: cor vermelha) para remédios não confirmados após o horário previsto.
8. **Histórico de Administrações:** Log completo para fins de conferência médica e prestação de contas.

---

## 4. Stack Tecnológica Recomendada e Justificativas (Custo Zero)

Para atender a um asilo sem orçamento para servidores pagos e manter a complexidade acessível para estudantes iniciantes:

| Camada | Tecnologia Recomendada | Por que foi escolhida? (Justificativa) |
| :--- | :--- | :--- |
| **Aplicativo Mobile (Celular)** | **PWA (Progressive Web App)** ou **Flutter / React Native (com Expo)** | • **Opção PWA (Mais recomendada para iniciantes):** É um site moderno que pode ser "instalado" no celular com 1 clique (cria ícone na tela inicial).<br>• **Vantagem Financeira Crítica:** Não exige pagar as taxas das lojas oficiais (a Google cobra taxa única de \$25 e a Apple cobra \$99/ano para publicar aplicativos na Play Store/App Store).<br>• Funciona tanto em Android quanto em iPhone e computadores. |
| **Backend & Banco de Dados** | **Firebase (Google)** ou **Supabase** | • **Plano Gratuito Generoso (Free Tier):** Ambos são plataformas gratuitas para projetos de pequeno/médio porte (perfeito para um asilo).<br>• **Sincronização em Tempo Real:** Quando uma cuidadora marca "remédio tomado", a tela do administrador e das outras cuidadoras atualiza instantaneamente.<br>• **Autenticação Pronta:** Já inclui sistema seguro de login (ADM vs Cuidadora) sem precisar programar criptografia do zero. |
| **Armazenamento de Fotos** | **Firebase Storage** / **Supabase Storage** | • Permite armazenar as fotos das caixas de remédios e dos idosos na nuvem com cota gratuita suficiente. |
| **Notificações Push** | **Firebase Cloud Messaging (FCM)** / **Web Push Notifications** | • Serviço gratuito do Google para disparar mensagens e avisos sonoros de remédios nos celulares cadastrados. |

---

## 5. Comparativo Resumido: Lar de Maria vs. Lar do Ancião

| Critério | Lar de Maria (Álbum de Memórias) | Lar do Ancião (Controle de Medicamentos) |
| :--- | :--- | :--- |
| **Dispositivo Principal** | Computador (Desktop) | Celular (Mobile) + Painel PC para ADM |
| **Arquitetura** | 100% Local (Offline) | Conectado / Sincronizado em Nuvem |
| **Banco de Dados** | SQLite (arquivo local no PC) | Firebase Firestore / Supabase (Nuvem em tempo real) |
| **Número de Usuários** | Monousuário (Administradora) | Multiusuário (ADM + Múltiplas Cuidadoras) |
| **Estratégia de Backup** | Pasta sincronizada no Google Drive | Automático e contínuo nos servidores da nuvem |
| **Custo de Infraestrutura** | R$ 0,00 | R$ 0,00 (utilizando cotas gratuitas) |
