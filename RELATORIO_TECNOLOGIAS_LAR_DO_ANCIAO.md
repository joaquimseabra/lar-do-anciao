# Relatório de Tecnologias e Arquitetura — Lar do Ancião

## 3. MAPA DAS TECNOLOGIAS SELECIONADAS E JUSTIFICATIVAS

Para atender à orientação do professor de criar um aplicativo Android na **Google Play Store** em **Vue.js**, e alinhando-se à necessidade real do asilo de **controle visual da rotina sem fadiga de notificações sonoras constantes**, a pilha tecnológica (*tech stack*) de custo zero foi refinada:

| Camada / Função | Tecnologia | Tipo / Licença | Justificativa Técnica e Social |
| :--- | :--- | :--- | :--- |
| **Linguagem & Framework de UI** | **Vue.js (Vue 3 com Vite)** | Open Source | • **Recomendação direta do professor:** Framework moderno, reativo e intuitivo para a equipe iniciante.<br>• Perfeito para construir o dashboard visual do Figma (cards de atrasados em vermelho, próximos remédios e abas de navegação). |
| **Motor Mobile (Google Play Store)** | **Capacitor (Ionic)** | Open Source | • **Ponte Nativa para Android:** Encapsula a aplicação Vue.js em um projeto Android nativo pronto para gerar pacotes `.apk` e `.aab` para a Google Play Store.<br>• Fornece acesso nativo direto à câmera do celular para a foto do medicamento. |
| **Reconhecimento de Imagem e Dosagem (OCR)** | **Tesseract.js** (ou **Capacitor ML Kit**) + Regex | Open Source / Free | • **Atende ao pedido do professor:** Permite capturar a foto da caixa do remédio pela câmera do celular.<br>• O motor de OCR extrai o texto da embalagem e, via Expressões Regulares (Regex), **identifica e preenche automaticamente o Nome e a Dosagem (ex: 20mg, 40mg)**, restando apenas definir os horários. |
| **Banco de Dados em Tempo Real** | **Firebase Firestore** (ou **Supabase**) | Free Tier (Plano Gratuito) | • **Prevenção Crítica de Superdosagem:** Quando uma cuidadora marca "remédio tomado", a tela de todas as outras cuidadoras e do ADM atualiza no mesmo segundo.<br>• Cota gratuita permanente (até 50.000 leituras/dia), sem custos recorrentes para o asilo. |
| **Autenticação e Níveis de Acesso** | **Firebase Auth** (ou **Supabase Auth**) | Free Tier | • Gerencia o controle de acesso com segurança: diferencia perfil de **Administrador** (pode cadastrar e editar idosos/remédios) e **Cuidadora** (consulta o painel e confirma a dose). |
| **Armazenamento de Imagens** | **Firebase Storage** (ou **Supabase Storage**) | Free Tier | • Armazena na nuvem as fotos dos idosos e as fotos das caixas de remédios para conferência visual rápida no momento da aplicação. |
| **Painel de Controle Visual (Sem Notificações)** | **Componentes Reativos Vue.js** | Nativo | • **Substituição inteligente das notificações:** Evita o incômodo de alertas sonoros o dia todo (dezenas de remédios por dia). O controle é feito por um painel visual com destaque em vermelho para remédios pendentes e atrasados. |

---

## 4. ARQUITETURA DO SISTEMA E FLUXO DE DADOS

O sistema adota uma arquitetura mobile com foco no **Painel de Controle Diário** (conforme protótipo do Figma):

```
┌────────────────────────────────────────────────────────────────────────┐
│                   APLICATIVO ANDROID (GOOGLE PLAY STORE)               │
│                        (Vue.js 3 + Capacitor)                          │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    DASHBOARD DIÁRIO (FIGMA)                      │  │
│  │  • Card Superior Vermelho: MEDICAMENTOS ATRASADOS (Ação Rápida)  │  │
│  │  • Card Central: PRÓXIMOS MEDICAMENTOS DO DIA (Horários)         │  │
│  │  • Barra Inferior (5 Abas): Início | Idosos | Remédios | Hist |  │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│  ┌──────────────────────────────────┴───────────────────────────────┐  │
│  │                CAMADA NATIVA CAPACITOR (ANDROID APIS)            │  │
│  │  • @capacitor/camera (Captura de foto da embalagem do remédio)    │  │
│  │  • Tesseract.js / ML Kit (Extração de Nome e Dosagem via OCR)    │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │ HTTPS / WebSockets
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   NUVEM CENTRALIZADA (CUSTO ZERO)                      │
│                           (Firebase / BaaS)                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │  Autenticação    │  │ Banco em Tempo   │  │   Armazenamento de   │  │
│  │  (ADM/Cuidadora) │  │ Real (Firestore) │  │   Fotos (Storage)    │  │
│  └──────────────────┘  └────────┬─────────┘  └──────────────────────┘  │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │ Sincronização Instantânea
                                     ▼
                [Atualização em Tempo Real em Todos os
                 Aparelhos Conectados Sem Recarregar]
```

---

## 5. DETALHAMENTO DE COMO CADA TECNOLOGIA SERÁ UTILIZADA

### 5.1. Interface Vue.js (Estruturada a partir do Figma)
* **Estrutura com Barra de Navegação Inferior (Bottom Navigation):**
  1. **Aba Início (Dashboard Diário):**
     * **Seção de Alerta Vermelho (Medicamentos Atrasados):** Destaca de forma prioritária os idosos cujos medicamentos já passaram do horário previsto e ainda não foram dados, com botão direto de "Confirmar".
     * **Seção de Próximos Medicamentos:** Lista em ordem cronológica os medicamentos do turno com foto do idoso, nome, remédio, dosagem e horário (ex: `14:00`, `18:00`, `20:00`).
  2. **Aba Idosos:** Cadastro e consulta dos residentes (nome, quarto, foto e observações).
  3. **Aba Medicamentos:** Cadastro de medicações com acionamento de câmera e OCR.
  4. **Aba Histórico:** Registro de auditoria contendo data, hora e nome da cuidadora que administrou cada dose.
  5. **Aba Perfil / Configurações:** Gestão de login e perfil administrativo.

### 5.2. Módulo de Câmera Nativa e OCR (Nome e Dosagem Automáticos)
1. Ao cadastrar um novo medicamento para um idoso, o usuário clica no botão com ícone de câmera.
2. O plugin `@capacitor/camera` abre a câmera do celular com foco na caixa do remédio.
3. O motor de **OCR (Tesseract.js / ML Kit)** processa a imagem:
   * **Nome:** Identifica o nome de maior destaque na embalagem (ex: *"Losartana Potássica"*, *"Omeprazol"*).
   * **Dosagem:** O filtro por Regex localiza o padrão numérico de dosagem (ex: `20mg`, `40mg`, `500mg`).
4. Os campos no formulário Vue.js são preenchidos automaticamente. O usuário apenas confere e marca os **horários de rotina**.

### 5.3. Banco de Dados em Tempo Real (Firebase Firestore)
* **Controle Operacional sem Fadiga de Notificações:** Em vez de receber centenas de notificações por dia, as cuidadoras acompanham o status visualmente.
* **Prevenção de Duplicidade:** Quando a cuidadora clica em "Confirmar" no card vermelho ou da lista diária, o status muda imediatamente para "Tomado" e o item desaparece da lista de pendências em todos os celulares da equipe.

#### Estrutura de Coleções Proposta:
```text
idosos/
  └── {id_idoso}: { nome: "João Silva", quarto: "102", foto_url: "...", ativo: true }

medicamentos/
  └── {id_medicamento}: { 
        id_idoso: "ref_idoso", 
        nome_remedio: "Losartana", 
        dosagem: "50mg", 
        foto_caixa_url: "...", 
        horarios: ["08:00", "20:00"], 
        instrucoes: "Tomar após a refeição" 
      }

administracoes_registro/
  └── {id_registro}: { 
        id_medicamento: "ref_medicamento", 
        id_idoso: "ref_idoso", 
        dosagem: "50mg",
        horario_programado: "08:00", 
        data: "2026-09-27", 
        status: "tomado", -- "tomado" ou "pendente_atrasado"
        horario_realizado: "08:05", 
        cuidadora_nome: "Maria Santos" 
      }
```

---

## 6. FLUXO DE CONEXÕES E INTEGRAÇÃO ENTRE OS COMPONENTES

### Ciclo 1: Cadastro Inteligente por Foto (com OCR de Nome e Dosagem)
```text
[Usuário clica em "Fotografar Caixa" na aba Medicamentos do App Vue.js]
                             │
                             ▼
[@capacitor/camera aciona a câmera nativa do Android]
                             │
                             ▼
[Motor de OCR processa a imagem da embalagem]
                             │
                             ▼
[Algoritmo separa: Nome comercial + Dosagem (ex: 20mg / 40mg)]
                             │
                             ▼
[Campos reativos do formulário Vue.js são preenchidos automaticamente]
                             │
                             ▼
[Usuário valida os dados, seleciona os horários da rotina e salva]
                             │
                             ▼
[Dados e foto são gravados no Firestore e Storage da nuvem]
```

### Ciclo 2: Controle Visual da Rotina e Confirmação de Dose
```text
[Cuidadora abre o App no início ou durante o plantão]
                             │
                             ▼
[Dashboard exibe card vermelho com Atrasados e lista de Próximos Remédios]
                             │
                             ▼
[Cuidadora confere os dados e clica em "Confirmar" no card]
                             │
                             ▼
[Gravação instantânea no Firestore com horário exato e nome da cuidadora]
                             │
                             ▼
[Sincronização em Tempo Real: o item sai da lista de pendências
 em todos os celulares da equipe, evitando repetição da dose]
```

---

## 7. ESTRATÉGIA DE SINCRONIZAÇÃO, DISPONIBILIDADE E CUSTO ZERO

Para manter o sistema funcionando sem gerar despesas ao asilo e sem risco de perda de dados:

1. **Custo Zero Vitalício com Free Tier:**
   * Utilização dos serviços em nuvem (*Firebase* / *Supabase*) dentro de suas cotas gratuitas permanentes, garantindo banco de dados em tempo real, login e armazenamento de fotos sem cartão de crédito ou faturas.
2. **Distribuição Oficial e Flexibilidade:**
   * **Publicação na Google Play Store:** O aplicativo compilado via Capacitor gera o pacote oficial `.aab` para publicação na loja do Google.
   * **Instalação Direta (.apk):** Possibilidade de gerar o arquivo `.apk` diretamente para testes imediatos nos aparelhos do asilo e da equipe.
3. **Segurança e Continuidade:**
   * Por estar centralizado na nuvem, se o celular de uma cuidadora quebrar, descarregar ou for substituído, basta instalar o app em outro aparelho e fazer login para continuar o plantão sem perder nenhum histórico.
