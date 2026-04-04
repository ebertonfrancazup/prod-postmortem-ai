---
name: deploy
description: Rebuild e restart do Docker container com verificacao de logs
allowed-tools:
  - Bash
user-invocable: true
---

Execute os seguintes passos em sequencia:

1. Rebuild e restart do container:
```bash
docker compose up --build -d
```

2. Aguardar startup e verificar logs:
```bash
sleep 2 && docker logs prod-postmortem-ai --tail 10
```

3. Verificar se a app esta respondendo:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/
```

4. Reportar o resultado:
- Se HTTP 200: "App rodando em http://localhost:8000. Ctrl+Shift+R no navegador."
- Se erro: Mostrar os logs e diagnosticar o problema.
