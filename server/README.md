# Ascend Core backend

The backend uses one Prisma schema (`prisma/schema.prisma`) with PostgreSQL in
both environments. The selected database is entirely determined by
`DATABASE_URL`; application code, API contracts, and Prisma models are shared.

## Local development

Install PostgreSQL and create a database named `ascend`. Copy `.env.example`
to `.env`, then update `DATABASE_URL` and `DATABASE_URL_UNPOOLED` if your
local PostgreSQL requires a username, password, port, or SSL settings.

```text
DATABASE_URL=postgresql://localhost:5432/ascend
DATABASE_URL_UNPOOLED=postgresql://localhost:5432/ascend
```

From `server/`, prepare the local schema and start the API:

```powershell
.\.venv\Scripts\python.exe -m prisma validate
.\.venv\Scripts\python.exe -m prisma generate
.\.venv\Scripts\python.exe -m prisma db push
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

`main.py` explicitly loads `server/.env`, while preserving values supplied by
the shell or deployment platform. This keeps local setup predictable and lets
production environment variables take precedence.

## Production (Neon)

Neon remains the production database. Use `.env.production.example` only as a
placeholder reference; configure the real `DATABASE_URL` and
`DATABASE_URL_UNPOOLED` as deployment secrets. The application uses the pooled
Neon URL for normal traffic. Use the direct URL for Prisma schema operations
when Neon requires a direct connection.

```powershell
# Run only with production deployment secrets deliberately loaded.
.\.venv\Scripts\python.exe -m prisma validate
.\.venv\Scripts\python.exe -m prisma generate
.\.venv\Scripts\python.exe -m prisma db push
```

## Switching environments

For local work, `.env` contains local PostgreSQL URLs. For production, inject
the Neon URLs through the hosting platform instead of committing an env file.
Because `load_dotenv(..., override=False)` is used, an explicitly supplied
`DATABASE_URL` always wins over `.env`; this is useful for CI and one-off
Prisma commands.

Never commit `.env`, `.env.development`, or `.env.production` files.
