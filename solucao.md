# Solução - LocPay Tech Challenge (Express + SQLite)

Este projeto implementa uma API simples para gerenciar recebedores e operações de antecipação conforme o enunciado do desafio.

Resumo da implementação
- Stack: Node.js + Express + SQLite (pacote `sqlite3`).
- Arquivos principais adicionados:
  - `db.js` — inicializa o banco SQLite e fornece helpers async (`run`, `get`, `all`).
  - `routes/receivers.js` — `POST /receivers` (cria recebedor), `GET /receivers/:id` (retorna recebedor + histórico).
  - `routes/operations.js` — `POST /operations`, `GET /operations/:id`, `POST /operations/:id/confirm`.
  - `scripts/auto_test.js` — script que executa automaticamente a sequência de criação/confirm.

Modelagem de dados
- Tabela `receivers`:
  - `id` INTEGER PK
  - `name` TEXT
  - `balance` INTEGER (em centavos)

- Tabela `operations`:
  - `id` INTEGER PK
  - `receiver_id` INTEGER (FK para receivers.id)
  - `gross_value` INTEGER (centavos)
  - `fee` INTEGER (centavos)
  - `net_value` INTEGER (centavos)
  - `status` TEXT ("pending" | "confirmed")

Decisões de design
- Valores são armazenados em centavos (inteiros) para evitar problemas com ponto flutuante.
- `fee` é calculada como `Math.round(gross_value * 0.03)`.
- `net_value = gross_value - fee`.

Como rodar localmente (Windows / PowerShell)
1. Instale dependências (se ainda não fez):
```powershell
npm install
```

2. Inicie o servidor (usa a porta 3000 por padrão):
```powershell
npm run dev
```

3. Rotas disponíveis
- GET `/` — mensagem de boas-vindas
- POST `/receivers` — cria recebedor
  - Body JSON: `{ "name": "João", "balance": 0 }` (balance opcional)
  - Retorna: `{ id, name, balance }`
- GET `/receivers/:id` — retorna `{ receiver, operations }`
- POST `/operations` — cria operação
  - Body JSON: `{ "receiver_id": 1, "gross_value": 100000 }` (centavos)
  - Retorna: operação criada com `fee` e `net_value`, `status: "pending"`
- GET `/operations/:id` — retorna operação
- POST `/operations/:id/confirm` — confirma operação
  - Valida que a operação existe e está `pending`.
  - Atualiza `status` para `confirmed` e soma `net_value` ao `receivers.balance`.
  - Retorna `{ operation, receiver }`.

Exemplos rápidos (PowerShell)

- Criar recebedor:
```powershell
#$body = @{ name = 'João'; balance = 0 } | ConvertTo-Json
#Invoke-RestMethod -Method Post -Uri http://localhost:3000/receivers -Body $body -ContentType 'application/json'
```

- Criar operação:
```powershell
#$body = @{ receiver_id = 1; gross_value = 100000 } | ConvertTo-Json
#Invoke-RestMethod -Method Post -Uri http://localhost:3000/operations -Body $body -ContentType 'application/json'
```

- Confirmar operação:
```powershell
#Invoke-RestMethod -Method Post -Uri http://localhost:3000/operations/1/confirm
```

- Consultar recebedor + histórico:
```powershell
#Invoke-RestMethod -Method Get -Uri http://localhost:3000/receivers/1
```

Script de teste automático
- Existe `scripts/auto_test.js` que faz: criar recebedor → criar operação → confirmar → consultar recebedor.
- Rode com:
```powershell
# node scripts/auto_test.js
```

