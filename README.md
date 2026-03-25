# 🚀 PROD POST-MORTEM AI

**PROD POST-MORTEM AI EXECUTIVE REPORT** é um sistema inteligente concebido para ajudar equipes de Engenharia de Confiabilidade (SRE) e Plataforma. Ele ingere logs massivos, transcrições de chats complexos e cria **Post-Mortems Automáticos** super completos com IA, detalhando as raízes dos incidentes (5 Whys), métricas, impacto no raio de explosão (Blast Radius) e os disponibiliza instantaneamente no seu painel em formato PDF profissional! 

Nós nos orgulhamos de ter uma arquitetura leve, desacoplada e modularizada segundo as melhores práticas modernas do mercado usando Python e FastAPI.

---

## 🏗️ Arquitetura e Fluxo Assíncrono

Utilizamos uma organização rigorosamente isolada, separando o Servidor (Backend) do Cliente (Frontend):

```mermaid
graph TD
    User([Usuário]) -->|Logs + Imagens| App[FastAPI / App]
    App -->|Análise Multimodal| Gemini[Google Gemini AI]
    Gemini -->|JSON SRE| App
    App -->|Motor ReportLab| PDF([Post-Mortem PDF])
    PDF -->|Download| User

    subgraph "Camada de Inteligência"
    App
    Skills[(Prompt Skills)]
    end
    App --- Skills

    classDef main fill:#3b82f6,stroke:#fff,stroke-width:2px,color:#fff;
    classDef alt fill:#1e293b,stroke:#fff,color:#fff;
    class App,Gemini,PDF main;
    class Skills alt;
```

A estrutura interna no seu disco é esta base limpa e escalável:

```text
prod-postmortem-ai/
├── app/                  # Núcleo lógico da API
│   ├── main.py           # Hub central e middleware
│   ├── api/              # Rotas da API
│   │   ├── __init__.py
│   │   └── endpoints.py  # Handlers de requisição
│   ├── schemas.py        # Validação com Pydantic
│   ├── services.py       # Lógica de IA e PDF
│   ├── skills/           # Prompts e conhecimentos externos (Skills)
│   │   ├── sre_report_skill.md
│   │   └── ...
│   └── __init__.py
│
├── static/               # Assets do Frontend
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── example_logs.txt  # Exemplo de logs para teste
│
├── docker-compose.yml    # Orquestração Docker
├── Dockerfile            # Imagem do container
├── pyproject.toml        # Dependências do projeto
├── uv.lock               # Lockfile do 'uv'
└── README.md             # Esta documentação
```

---

## ✨ Features Exclusivas da Plataforma

*   **Multimodal Vision (Evidências de Datadog)**: Arraste e solte capturas de tela dos seus dashboards de observabilidade. O Gemini fará engenharia reversa visual da falha e nosso gerador inserirá nativamente as imagens limpas no PDF final como prova do incidente.
*   **Dynamic Executive Cards (UI Flutuante)**: Através do motor *ReportLab*, eliminamos o conceito de tabelas rígidas. O PDF ajusta fontes dinamicamente e monta uma arquitetura SaaS de fileiras duplas baseadas no que o modelo encontrou: métricas de núcleo (Impactos P1-P3, Status, MTTR) na linha de cima, e SLOs/Contagem de Erros descobertos autônomamente na linha de baixo.
*   **Time Range Engine (Fallback Matemático)**: O SRE virtual detecta conflitos materiais. Se os logs possuírem buracos de tempo, ele utiliza janelas explícitas estipuladas pelos redatores humanos e trava firmemente as bordas de downtime, isolando MTTRs de forma determinística e prevenindo alucinações cognitivas no cálculo de SLAs!

---

## ⚡ Como Rodar o Projeto (Passos Rápidos)

Nós preparamos tudo para que seja o mais fácil e moderno de se iniciar o serviço localmente! Siga os passos abaixo, mesmo que você não possua grandes conhecimentos de ambiente:

### 📌 1. Declare sua Chave (Totalmente Grátis)
Abra o [Google AI Studio](https://aistudio.google.com/app/apikey) e crie uma nova API Key para utilizar o Gemini nativo. 
Na pasta raiz deste projeto, utilize o arquivo `.env.example` como base para criar o seu arquivo `.env`:
```env
GOOGLE_API_KEY=AI...sua_chave_linda_aqui
```

---

### Execução via Docker (Opção Mais Simples - Recomendado)
*Para quem quer 0 esforço de instalação (Requer apenas [Docker](https://www.docker.com/) instalado no seu PC):*

1. Abra seu terminal de comando e garanta que você está na pasta do projeto.
2. Digite este comando único e dê enter:
```bash
docker compose up -d --build
```
3. Aguarde uns segundinhos e acesse **http://localhost:8000** no seu navegador!

---

### Execução Nativa usando Python `uv`
*Se preferir trabalhar na máquina crua (Baremetal) ou desenvolver diretamente no código:*

1. Instale o gerenciador ultrarápido oficial (`uv`):
   *(Unix/Mac)* `curl -LsSf https://astral.sh/uv/install.sh | sh`
   *(Windows)* `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`
2. Dentro da pasta, inicie o app sem precisar ativar o ambiente virtual manualmente:
```bash
uv run uvicorn app.main:app --reload
```
3. O servidor vai abrir! Vá em **http://localhost:8000** no seu próprio browser e divirta-se.

---

## 🛠️ Solução de Problemas (Troubleshooting)

### Docker não encontrado no WSL 2 (Windows)
Se você utiliza Windows com WSL (Subssistema Windows para Linux) e, ao rodar o comando docker, receber o erro `The command 'docker' could not be found in this WSL 2 distro`, você precisa ativar a integração do Docker Desktop com o seu ambiente Linux:

1. Abra o **Docker Desktop** no Windows.
2. Acesse as **Settings** (ícone de engrenagem no canto superior direito).
3. Vá em **Resources > WSL Integration**.
4. Ative a opção **"Enable integration with my default WSL distro"** e marque a caixa da sua distribuição Linux (ex: *Ubuntu*).
5. Clique em **Apply & restart**.
6. Feche e abra o seu terminal do WSL novamente. Agora o comando rodará perfeitamente e com alta performance de leitura de arquivos!