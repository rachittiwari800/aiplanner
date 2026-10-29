# AI Travel Planner 2.0

An AI-powered travel planning platform built with React 19, TypeScript, Vite, Tailwind CSS, Zustand, Node.js, Express, MongoDB, Prisma, and OpenAI.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Zustand
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB with Prisma ORM
- **AI Integration:** OpenAI API

## Project Structure

```text
.
├── frontend/    # React + TypeScript + Vite application
└── backend/     # Express + TypeScript REST API
```

## Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB Community Server
- MongoDB Shell (`mongosh`)
- MongoDB Compass (optional, for visual database management)
- An OpenAI API key, if required by the application

## Getting Started

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

Replace the placeholders with your actual repository URL and project folder name.

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory and configure the environment variables required by your application. For example:

```env
DATABASE_URL="mongodb://127.0.0.1:27017/ai-travel-planner?replicaSet=rs0"
OPENAI_API_KEY="your_openai_api_key"
```

Use the actual environment variable names expected by your backend. Never commit real API keys or secrets to GitHub.

Generate the Prisma client and synchronize the database schema:

```bash
npm run prisma:generate
npm run prisma:db:push
```

Start the backend:

```bash
npm run dev
```

Keep this terminal running.

### 3. Configure the Frontend

Open a second terminal from the project root and run:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal, usually `http://localhost:5173`.

Configure the frontend's API base URL using the environment variable expected by your application, if required.

## Local MongoDB Replica Set Setup

Prisma's MongoDB connector requires replica-set support for transactions used by operations such as registration and trip creation.

If you are using MongoDB Community Server on Windows:

1. Open PowerShell as Administrator.
2. Stop the MongoDB service:

   ```powershell
   Stop-Service MongoDB
   ```

3. Back up your MongoDB configuration file, then open the `mongod.cfg` file for your installed MongoDB version.
4. Add the following configuration at the appropriate YAML level:

   ```yaml
   replication:
     replSetName: rs0
   ```

   Preserve the existing configuration and indentation.

5. Start MongoDB again:

   ```powershell
   Start-Service MongoDB
   ```

6. Open `mongosh` and initialize the replica set:

   ```javascript
   rs.initiate({
     _id: "rs0",
     members: [{ _id: 0, host: "127.0.0.1:27017" }]
   })
   ```

7. Connect MongoDB Compass using:

   ```text
   mongodb://127.0.0.1:27017/?replicaSet=rs0
   ```

8. Set the backend's `DATABASE_URL` to the address and port where MongoDB is actually listening. For the default port shown above:

   ```env
   DATABASE_URL="mongodb://127.0.0.1:27017/ai-travel-planner?replicaSet=rs0"
   ```

9. From the `backend/` directory, run:

   ```bash
   npm run prisma:db:push
   ```

**Note:** If your MongoDB server is configured to listen on port `27018`, use that port consistently in the connection URL. The replica-set member address must also match the actual server configuration.

## Environment Variables and Security

- Keep `.env` files out of version control.
- Add `.env` and other files containing credentials to `.gitignore`.
- Provide a `.env.example` file containing placeholder values for required variables.
- Never publish your OpenAI API key, database credentials, session secrets, or other private configuration.

## Troubleshooting

- **Database connection errors:** Verify MongoDB is running and the connection URL uses the correct port.
- **Replica-set errors:** Check that `rs0` has been initialized and the configured member address is reachable.
- **Prisma errors:** Run `npm run prisma:generate` from the backend directory after installing dependencies.
- **Frontend API errors:** Confirm the backend is running and the frontend is configured with the correct API URL.
- **Missing environment variables:** Check the backend and frontend configuration files and ensure the required variables are set.

## License

Add a license here if you intend to distribute the project under a specific open-source license.
