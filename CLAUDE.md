# CLAUDE.md — Prod Post-Mortem AI

## Stack
- **Backend:** Python 3.12, FastAPI, Uvicorn
- **AI:** Google Gemini 2.5 Flash (via `google-generativeai`)
- **PDF:** ReportLab (motor de layout programatico)
- **DOCX:** python-docx (template-based, preenche placeholders)
- **Schemas:** Pydantic v2
- **Package manager:** uv (ultrafast, lockfile: uv.lock)
- **Container:** Docker + docker-compose
- **Frontend:** Vanilla HTML/CSS/JS (single page, static/)

## Comandos essenciais
```bash
# Rodar localmente (sem Docker)
uv run uvicorn app.main:app --reload

# Build e start com Docker
docker compose up --build -d

# Rebuild rapido (apos editar codigo)
docker compose up --build -d && sleep 2 && docker logs prod-postmortem-ai --tail 5

# Ver logs do container
docker logs prod-postmortem-ai -f

# Testar endpoint PDF
curl -s -o /tmp/test.pdf -w "%{http_code}" -X POST http://localhost:8000/export-pdf -H "Content-Type: application/json" -d '{"request":{"logs":"test","sla_hours":4},"report":{...}}'

# Testar endpoint DOCX
curl -s -o /tmp/test.docx -w "%{http_code}" -X POST http://localhost:8000/export-docx -H "Content-Type: application/json" -d '{"request":{"logs":"test","sla_hours":4},"report":{...}}'
```

## Arquitetura do projeto
```
app/
  main.py          — FastAPI app + static mount
  api/endpoints.py — 3 rotas: /analyze, /export-pdf, /export-docx
  schemas.py       — Pydantic models (AnalyzeRequest, IncidentReport, Metrics, etc.)
  services.py      — process_incident_data (LLM), ReportGenerator (PDF), DocxGenerator (DOCX)
  skills/          — Prompt templates para o Gemini (sre_report_skill.md)
  templates/       — Template.docx (template corporativo StackSpot)
static/
  index.html       — Dashboard SPA
  script.js        — Logica do frontend (payload, preview, download)
  style.css        — Tema dark
```

## Convencoes obrigatorias

### Antes de editar qualquer arquivo
- **Sempre explicar** o que sera modificado e por que antes de executar a edicao
- Nunca editar sem contexto claro para o usuario

### Big Numbers (PDF)
- **Row 1 (fixa, 4 cards):** Criticidade, Downtime/MTTR, Status, Cliente(s) Afetado(s)
- **Row 2 (dinamica):** SLO, % Requisicoes Afetadas, Jornadas Impactadas, Perda Estimada — so aparecem quando preenchidos pelo usuario
- Cards nao tem subtitulo, texto auto-ajustavel (16pt/13pt/10pt conforme comprimento)

### Titulo do incidente
- Formato obrigatorio: `TicketNumber | Criticidade | Produto | Servico`
- Exemplo: `CS0005577 | P3 | StackSpot AI | Remote QuickCommand`

### Nome do arquivo de download
- Prefixo: `Post-Mortem_{ticket}_{titulo}.pdf/docx`

### DOCX
- Preencher placeholders do Template.docx (nao appendar conteudo)
- Helpers: set_text(), find_para(), find_next_empty(), insert_after()

### PDF
- Header: Logo StackSpot (extraido do Template.docx) + CONFIDENTIAL + data
- Labels traduzidos por idioma (dicionario L no generate_pdf)
- Imagem de monitoramento: apos proximos passos, antes da timeline

### Frontend
- Cache bust: incrementar ?v=N no script.js ao alterar JS
- Apos rebuild Docker, sempre verificar logs com `docker logs`
- Novos campos do dashboard devem ser adicionados tambem no preview panel

### Idioma
- Toggle PT-BR / English controla labels do PDF e instrucao da LLM
- Default: PT-BR

### Git
- Branch principal: dev
- Commits em portugues ou ingles, prefixo convencional (feat:, fix:, docs:)
- Nunca commitar .env ou credenciais
