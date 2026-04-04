---
description: Regras para app/services.py — motor de PDF e DOCX
globs:
  - "app/services.py"
---

# Regras para services.py

## ReportGenerator (PDF)
- Header usa logo StackSpot extraido do Template.docx via zipfile
- Labels traduzidos via dicionario L (is_pt = self.request.language == "pt-br")
- Big Numbers Row 1: sempre 4 cards fixos sem subtitulo
- Big Numbers Row 2: cards dinamicos do request (slo, affected_requests_pct, etc)
- RoundedCard.draw(): subtitulo so renderiza se h_s > 2, valor clampado
- Imagem de monitoramento: apos next steps, antes da timeline
- Timeline: usar event.detail quando disponivel (fonte menor, cor cinza)

## DocxGenerator (DOCX)
- NUNCA usar doc.add_heading/doc.add_paragraph para appendar conteudo
- SEMPRE preencher placeholders existentes no Template.docx
- Usar helpers: set_text(), find_para(), find_next_empty(), insert_after()
- Imagem inserida com doc.add_picture(width=6in) apos next steps

## process_incident_data (LLM)
- Instrucao de idioma prepended ao prompt
- ticket_number incluido no context
