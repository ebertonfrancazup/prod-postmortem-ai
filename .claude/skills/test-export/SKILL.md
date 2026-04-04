---
name: test-export
description: Testa os endpoints de exportacao PDF e DOCX com payload de exemplo
allowed-tools:
  - Bash
user-invocable: true
---

Execute testes nos endpoints de exportacao:

1. Testar PDF:
```bash
curl -s -o /tmp/test.pdf -w "%{http_code}" -X POST http://localhost:8000/export-pdf \
  -H "Content-Type: application/json" \
  -d '{"request":{"ticket_number":"CS0099999","logs":"test","sla_hours":4,"customers":"TestCorp","slo":"99.9%","affected_requests_pct":"85%","impacted_journeys":"Login","estimated_loss":"R$ 10.000","language":"pt-br","proactive_incident":false},"report":{"metrics":{"incident_title":"CS0099999 | P2 | TestProduct | TestService","impact":"P2 - Alto","total_downtime":"2h30m","service_status":"Resolvido","downtime_minutes":150,"affected_customers":"TestCorp"},"executive_summary":{"impact":"Servico degradado por 2h30m.","root_cause":"Falha na configuracao do deploy.","resolution":"Rollback e fix aplicado."},"next_steps":["Adicionar validacao pre-deploy","Ampliar testes de integracao"],"timeline":[{"timestamp":"10:00","event":"Alerta recebido","detail":"Monitor Datadog disparou alerta de latencia"},{"timestamp":"12:30","event":"Resolucao confirmada"}]}}'
```

2. Testar DOCX:
```bash
curl -s -o /tmp/test.docx -w "%{http_code}" -X POST http://localhost:8000/export-docx \
  -H "Content-Type: application/json" \
  -d '{"request":{"ticket_number":"CS0099999","logs":"test","sla_hours":4,"customers":"TestCorp","language":"pt-br","proactive_incident":true},"report":{"metrics":{"incident_title":"CS0099999 | P2 | TestProduct | TestService","impact":"P2 - Alto","total_downtime":"2h30m","service_status":"Resolvido","downtime_minutes":150,"affected_customers":"TestCorp"},"executive_summary":{"impact":"Servico degradado.","root_cause":"Falha no deploy.","resolution":"Rollback aplicado."},"next_steps":["Fix deploy pipeline"],"timeline":[{"timestamp":"10:00","event":"Alerta"},{"timestamp":"12:30","event":"Resolucao"}]}}'
```

3. Validar resultados:
```bash
file /tmp/test.pdf && ls -lh /tmp/test.pdf
file /tmp/test.docx && ls -lh /tmp/test.docx
```

4. Reportar:
- HTTP 200 + "PDF document" + "Microsoft Word 2007+" = SUCESSO
- Qualquer outro resultado: mostrar logs com `docker logs prod-postmortem-ai --tail 20`
