# Deploy SARA on Railway

## Steps

### 1. Create Railway Account
Go to https://railway.app and sign up with GitHub.

### 2. Create New Project
- Click "New Project" → "Deploy from GitHub repo"
- Connect your GitHub account and select the SARA repo

### 3. Add PostgreSQL Database
- In the project dashboard, click "New" → "Database" → "PostgreSQL"
- Railway auto-generates `DATABASE_URL` and links it to your service

### 4. Set Environment Variables
In the service settings → Variables, add:

```
NODE_ENV=production
PORT=3001
JWT_SECRET=<generate-a-random-32-char-string>
AI_PROVIDER=gemini
GEMINI_API_KEY=<your-gemini-api-key>
```

Railway automatically provides `DATABASE_URL` from the PostgreSQL service.

### 5. Deploy
Railway will auto-deploy on push. The build command in `railway.json` handles:
- Installing dependencies (server + client)
- Generating Prisma client
- Building React frontend

The start command handles:
- Running database migrations
- Starting the Express server (serves both API + frontend)

### 6. Seed the Database (first time only)
Open the Railway service shell and run:
```bash
cd server && node prisma/seed.js
```

### 7. Get Your URL
Railway gives you a public URL like: `https://sara-production-xxxx.up.railway.app`

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | auto | PostgreSQL connection string (from Railway) |
| NODE_ENV | yes | Set to `production` |
| PORT | no | Railway provides this automatically |
| JWT_SECRET | yes | Random secret, min 32 chars |
| AI_PROVIDER | yes | `gemini` / `openai` / `ollama` |
| GEMINI_API_KEY | if gemini | From https://aistudio.google.com |
| CORS_ORIGIN | no | Defaults to `*` in production |
