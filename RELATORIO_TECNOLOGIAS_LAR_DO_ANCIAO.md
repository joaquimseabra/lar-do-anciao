# Relatório de Tecnologias e Arquitetura — Lar do Ancião

## 3. MAPA DAS TECNOLOGIAS SELECIONADAS E JUSTIFICATIVAS

Para atender à necessidade de mobilidade das cuidadoras, sincronização instantânea entre múltiplos celulares, envio de alertas de horários e reconhecimento automático do nome e da dosagem do remédio por foto, a pilha tecnológica (*tech stack*) de custo zero foi selecionada:

| Camada / Função | Tecnologia | Tipo / Licença | Justificativa Técnica e Social |
| :--- | :--- | :--- | :--- |
| **Plataforma Mobile & Web** | **PWA (Progressive Web App)** com HTML5, CSS3 e JavaScript (ou React) | Open Source / Padrão Web | • **Custo Zero em Lojas:** Não exige pagar as taxas obrigatórias da Google Play (\$25) nem da Apple App Store (\$99/ano).<br>• As cuidadoras instalam diretamente pelo navegador com 1 clique (ganha ícone na tela inicial).<br>• Funciona em qualquer aparelho (Android, iPhone e no computador do ADM). |
| **Reconhecimento de Imagem e Dosagem (OCR)** | **Tesseract.js** (ou API de Visão Gratuita) + Expressões Regulares (Regex) | Open Source / Free Tier | • **Atende ao pedido do professor:** Permite apontar a câmera do celular para a caixa do remédio.<br>• O motor de OCR extrai os caracteres e, através de padrões de texto (Regex), **identifica e preenche automaticamente o Nome e a Dosagem (ex: 20mg, 40mg, 500mg)**, restando ao usuário apenas definir os horários. |
| **Banco de Dados em Tempo Real** | **Firebase Firestore** (ou **Supabase**) | Free Tier (Plano Gratuito) | • **Prevenção Crítica de Superdosagem:** Quando uma cuidadora marca "remédio tomado", a tela de todas as outras cuidadoras e do ADM atualiza no mesmo segundo.<br>• Plano gratuito generoso (até 50.000 leituras/dia), mais que suficiente para um asilo sem nunca gerar cobranças. |
| **Autenticação e Perfis** | **Firebase Auth** (ou **Supabase Auth**) | Free Tier | • Gerencia o controle de acesso com segurança: diferencia perfil de **Administrador** (pode cadastrar e editar idosos/remédios) e **Cuidadora** (apenas consulta horários e confirma a dose). |
| **Armazenamento de Imagens** | **Firebase Storage** (ou **Supabase Storage**) | Free Tier | • Armazena na nuvem as fotos de perfil dos idosos e as fotos das caixas de remédios para conferência visual rápida da cuidadora. |
| **Alertas e Notificações** | **Web Push API / Service Workers** | Padrão W3C / Nativo | • Dispara alertas visuais e sonoros no celular das cuidadoras minutos antes do horário de cada medicação, mesmo com o aplicativo fechado. |
| **Hospedagem da Aplicação** | **Vercel** ou **Firebase Hosting** | Free Tier | • Hospedagem gratuita com certificado de segurança SSL (HTTPS), obrigatório para permitir o uso da câmera do celular e o envio de notificações push. |

---

## 4. ARQUITETURA DO SISTEMA E FLUXO DE DADOS

O sistema adota uma arquitetura distribuída baseada em **BaaS (Backend as a Service)**, eliminando a necessidade de manter e pagar por servidores dedicados:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DISPOSITIVOS DOS USUÁRIOS                       │
│  ┌───────────────────────────────┐   ┌───────────────────────────────┐ │
│  │   Celular das Cuidadoras      │   │     Computador / Celular      │ │
│  │      (PWA Instalado)          │   │      do Administrador         │ │
│  │ • Alertas de Medicamentos     │   │ • Cadastro de Idosos          │ │
│  │ • Confirmação de Dose Tomada  │   │ • Foto com OCR (Nome/Dosagem) │ │
│  │ • Painel de Remédios do Turno │   │ • Painel de Atrasados/Histórico│ │
│  └───────────────┬───────────────┘   └───────────────┬───────────────┘ │
└──────────────────┼───────────────────────────────────┼─────────────────┘
                   │ HTTPS                             │ HTTPS
                   ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     CAMADA DE CLIENTE & RECURSOS                       │
│  ┌───────────────────────────────┐   ┌───────────────────────────────┐ │
│  │     Módulo de Câmera, OCR e   │   │   Service Worker em Background│ │
│  │     Extrator de Nome/Dosagem  │   │   (Escuta Alertas de Horário  │ │
│  │      (Tesseract.js + Regex)   │   │   e Exibe Notificação Push)   │ │
│  └───────────────┬───────────────┘   └───────────────┬───────────────┘ │
└──────────────────┼───────────────────────────────────┼─────────────────┘
                   │                                   │
                   ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   NUVEM CENTRALIZADA (CUSTO ZERO)                      │
│                           (Firebase / BaaS)                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │  Autenticação    │  │ Banco em Tempo   │  │   Armazenamento de   │  │
│  │  (ADM/Cuidadora) │  │ Real (Firestore) │  │   Fotos (Storage)    │  │
│  └──────────────────┘  └────────┬─────────┘  └──────────────────────┘  │
└─────────────────────────────────┼──────────────────────────────────────┘
                                  │ Sincronização Instantânea
                                  ▼
                [Atualização em Tempo Real em Todos os
                 Aparelhos Conectados Sem Recarregar]
```

---

## 5. DETALHAMENTO DE COMO CADA TECNOLOGIA SERÁ UTILIZADA

### 5.1. PWA (Interface Mobile e Painel de Controle)
* **Tela de Login:** Identificação de usuário (Administrador ou Cuidadora de plantão).
* **Painel Diário de Medicamentos (Visão Principal da Cuidadora):**
  * Lista ordenada cronologicamente por horário (ex: `08:00`, `12:00`, `18:00`).
  * Cada card exibe: foto e nome do idoso, nome do remédio e sua dosagem exata (ex: *"Omeprazol 20mg"*), foto da embalagem para conferência e botão de ação rápida: **"Confirmar Administração"**.
  * **Identificação Visual de Atrasos:** Medicamentos cujo horário passou e não foram confirmados ganham destaque visual (cor vermelha e aviso de "Atrasado").
* **Painel Administrativo:**
  * Gestão de idosos acolhidos (nome, quarto, foto e observações).
  * Histórico de auditoria: exibe quem administrou cada remédio, com data, hora exata e nome da cuidadora responsável.

### 5.2. Módulo de Câmera e OCR (Leitura Automática de Nome e Dosagem)
Conforme solicitado pelo professor para simplificar o cadastro e evitar erros humanos de digitação:
1. Ao cadastrar um medicamento para o idoso, o usuário clica em **"Tirar Foto da Caixa"**.
2. A câmera do celular é acionada; ao capturar a foto da caixa do remédio, o motor de **OCR (Tesseract.js)** extrai os blocos de texto da embalagem.
3. **Extração Inteligente com Filtros:**
   * **Nome do Medicamento:** Identifica a palavra ou termo de maior destaque comercial na embalagem (ex: *"Losartana Potássica"*, *"Omeprazol"*).
   * **Dosagem:** Um algoritmo de padrão de texto (expressão regular) varre termos numéricos seguidos de unidades farmacêuticas (ex: `20mg`, `40mg`, `500mg`, `10ml`, `5mg/ml`).
4. **Preenchimento Automático:** Ambos os campos (**"Nome do Medicamento"** e **"Dosagem"**) são preenchidos automaticamente na tela.
5. O usuário apenas valida os dados reconhecidos e seleciona os **horários de tomada** (ex: `08:00` e `20:00` ou frequência de `12 em 12 horas`).

### 5.3. Banco de Dados em Tempo Real (Firebase Firestore / Supabase)
A persistência garante que toda a equipe trabalhe sobre uma base única e sincronizada:
* **Prevenção de Erros Graves:** No momento em que uma cuidadora clica em "Confirmar", o registro é gravado na nuvem e o status muda para "Tomado" nos celulares de todas as outras cuidadoras instantaneamente, evitando duplicidade de dose.

#### Estrutura de Coleções/Tabelas Proposta:
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
        data: "2026-09-14", 
        status: "tomado", -- "tomado" ou "atrasado"
        horario_realizado: "08:05", 
        cuidadora_nome: "Maria Santos" 
      }
```

### 5.4. Motor de Alertas e Notificações
* Utiliza a **Web Push API** em conjunto com **Service Workers**.
* Quando o relógio do sistema se aproxima do horário de uma medicação (ex: 10 minutos antes das 08:00), o sistema emite um alerta com vibração e som no celular da cuidadora indicando: *"Remédio das 08:00: Losartana 50mg para o Seu João (Quarto 102)"*.

---

## 6. FLUXO DE CONEXÕES E INTEGRAÇÃO ENTRE OS COMPONENTES

### Ciclo 1: Cadastro Inteligente por Foto (com Extração de Nome e Dosagem)
```text
[Usuário clica em "Fotografar Caixa" no PWA do celular]
                             │
                             ▼
[Câmera nativa tira a foto da caixa do medicamento]
                             │
                             ▼
[Motor de OCR processa a imagem e extrai o texto da embalagem]
                             │
                             ▼
[Algoritmo separa: Nome comercial + Dosagem (ex: 20mg / 40mg)]
                             │
                             ▼
[Campos "Nome" e "Dosagem" são preenchidos automaticamente na tela]
                             │
                             ▼
[Usuário apenas confirma os dados e define os horários de tomada]
                             │
                             ▼
[Dados e foto da embalagem são salvos no Firestore e Storage]
```

### Ciclo 2: Alerta, Administração e Sincronização em Tempo Real
```text
[Horário programado se aproxima (ex: 08:00)]
                             │
                             ▼
[Service Worker dispara Notificação Push no celular da cuidadora]
                             │
                             ▼
[Cuidadora confere idoso, remédio e dosagem, e clica em "Confirmar Tomado"]
                             │
                             ▼
[Gravação instantânea no banco com data, hora e nome da cuidadora]
                             │
                             ▼
[Sincronização em Tempo Real: o item fica verde ("Tomado") em todos
 os celulares da equipe, evitando que outra pessoa repita a dose]
```

---

## 7. ESTRATÉGIA DE SINCRONIZAÇÃO, DISPONIBILIDADE E CUSTO ZERO

Para manter o sistema funcionando sem gerar despesas ao asilo e sem risco de perda de dados:

1. **Custo Zero Vitalício com Free Tier:**
   * Utilização dos serviços em nuvem (*Firebase* / *Supabase*) dentro de suas cotas gratuitas mensais permanentes, garantindo banco de dados, login e armazenamento de fotos sem cartão de crédito ou faturas.
2. **Independência de Hardware e Recuperação Imediata:**
   * Por estar sincronizado na nuvem, se o celular de uma cuidadora descarregar ou estragar, basta que ela faça login em qualquer outro aparelho ou no computador da recepção para continuar o plantão exatamente de onde parou.
3. **Sem Burocracia de Lojas de Aplicativos:**
   * Por ser um PWA, o asilo não precisa esperar aprovação da Google ou da Apple para instalar o sistema nos celulares de novas cuidadoras que forem contratadas: basta abrir o link seguro do asilo e salvar o atalho.
