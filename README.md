# AI Travel Planner 2.0

An AI-powered travel planning platform built with React 19, TypeScript, Vite, Tailwind CSS, Zustand, Node.js, Express, MongoDB, Prisma, and OpenAI.

## Project Structure

```
.
├── frontend/    # Vite + React 19 + TypeScript + Tailwind CSS UI
└── backend/     # Express + TypeScript + MongoDB (Prisma) REST API
```

## Setup & Running

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```

### Local MongoDB Compass

The backend uses the local MongoDB database `ai-travel-planner` on port `27018`. Prisma requires MongoDB replica-set mode for user registration and trip writes.

1. Open **PowerShell as Administrator**.
2. Stop MongoDB: `Stop-Service MongoDB`.
3. Open `C:\Program Files\MongoDB\Server\8.2\bin\mongod.cfg` and add:

```yaml
replication:
	replSetName: rs0
```

4. Start MongoDB: `Start-Service MongoDB`.
5. Open `mongosh` and initialize the local replica set:

```javascript
rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: '127.0.0.1:27017' }] })
```

6. Connect MongoDB Compass to `mongodb://127.0.0.1:27017/?replicaSet=rs0`.
7. In `backend/.env`, set `DATABASE_URL=mongodb://127.0.0.1:27018/ai-travel-planner?replicaSet=rs0`, then run `npm run prisma:db:push`.
