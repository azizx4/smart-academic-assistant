# SARA — Setup Guide

## Prerequisites
- Node.js 18+
- npm

## 1. Install Dependencies

```bash
cd server
npm install

cd ../client
npm install
```

## 2. Configure Environment

```bash
cd server
cp .env.example .env
# Edit .env and set your GEMINI_API_KEY
```

## 3. Setup Database

```bash
cd server
npx prisma migrate reset --force
```

This creates the SQLite database and seeds it with test data (300 students, 30 faculty, 20 courses).

## 4. Run the Project

**Terminal 1 — Backend:**
```bash
cd server
PORT=3001 node src/index.js
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

## 5. Open in Browser

http://localhost:5173

## Test Accounts

| Username | Password | Role |
|----------|----------|------|
| 441001 | pass123 | student |
| 441002 | pass123 | student |
| dr.omar | pass123 | faculty |

## API Health Check

```bash
curl http://localhost:3001/api/health
```
