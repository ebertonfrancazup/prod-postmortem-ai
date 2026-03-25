# 🛡️ Guia de Sobrevivência: UV & Post-Mortem AI

Este guia centraliza os comandos essenciais para gerenciar este projeto e o ecossistema Python moderno usando `uv`.

---

## 🚀 1. Ciclo de Vida do Projeto (uv)

| Comando | Descrição | Quando usar? |
| :--- | :--- | :--- |
| `uv sync` | Sincroniza o ambiente local | Ao baixar o código ou mudar o `pyproject.toml`. |
| `uv run <cmd>` | Executa algo no ambiente isolado | **Sempre.** Ex: `uv run python app/main.py`. |
| `uv add <lib>` | Instala uma nova biblioteca | Quando precisar de uma ferramenta nova no código. |
| `uv remove <lib>` | Remove uma biblioteca | Para limpar dependências não utilizadas. |
| `uv tree` | Mostra árvore de dependências | Para depurar conflitos de versão. |

---

## 🐳 2. Comandos Docker (Este Projeto)

Como este projeto roda em containers, use estes atalhos:

*   **Subir/Buildar tudo:** `docker compose up -d --build`
*   **Parar tudo:** `docker compose down`
*   **Ver Logs em tempo real:** `docker compose logs -f app`
*   **Reiniciar apenas o Backend:** `docker compose restart app`

---

## 🎨 3. Customização de Reports

### PDF (Estilos Visuais)
Os estilos (cores, fontes, tamanhos) estão centralizados em `app/services.py`, dentro da classe `ReportGenerator`.
*   **Cores principais:** `#FF6900` (Laranja) e `#334155` (Slate Gray).

### Google Docs (Template)
O arquivo base para o exportador do Word está em `app/templates/template.docx`.
*   **Como mudar o design:** Abra este arquivo no Google Docs/Word, mude as fontes ou cores dos estilos "Título 1", "Título 2" e salve o arquivo. O sistema passará a usar seu novo design automaticamente.

---

## 🧠 4. Ajustando a IA (Skills)
As instruções que o Gemini segue para analisar os logs estão em:
`app/skills/sre_report_skill.md`

Edite este arquivo para:
*   Mudar o tom de voz do relatório.
*   Adicionar novas métricas obrigatórias.
*   Mudar a estrutura do resumo executivo.

---

> **Dica SRE:** Para ver este guia formatado no VS Code, abra este arquivo e aperte `Ctrl + Shift + V`.

🚀 *Foco na Resiliência!*
