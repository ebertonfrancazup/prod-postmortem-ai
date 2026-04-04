---
description: Regras para arquivos do frontend (static/)
globs:
  - "static/**"
---

# Regras para Frontend

## index.html
- Ao adicionar novo campo no dashboard, adicionar tambem no preview panel
- Icones usam cor laranja #ff6900 (nao azul)
- Incrementar ?v=N no script.js ao alterar JS (cache bust)

## script.js
- Novos campos devem ser adicionados em 3 lugares:
  1. payload (dentro do click handler do generateBtn)
  2. populacao do preview (apos analyzeRes)
  3. getEditedReport() (leitura dos campos editados)
- Nome do arquivo: Post-Mortem_{ticket}_{titulo}.ext

## style.css
- Tema dark: --bg-dark #0a0b10, --bg-card #12141d
- Toggle pills: fundo laranja #ff6900 quando selected
- Preview panel: borda verde #10b981
