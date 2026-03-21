# Queue Creator

A queue management system for restaurants.

## Features

- **Kiosk (Waitlist Machine):** Issue tickets and see total waiting groups.
- **User View:** Real-time (refresh-based) status of your position in the queue.
- **Staff Dashboard:** Manage the queue, serve customers, and reorder entries.

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, Prisma, SQLite.
- **Frontend:** React, TypeScript, Tailwind CSS.
- **Deployment:** Docker, Docker Compose.

## How to Run

### Using Docker (Recommended)

1. Make sure you have Docker and Docker Compose installed.
2. Run the following command:
   ```bash
   docker-compose up --build
   ```
3. Access the application:
   - Selection Page: http://localhost:8080
   - Kiosk: http://localhost:8080/#kiosk
   - Staff: http://localhost:8080/#staff
   - User: http://localhost:8080/#user?t=T-001 (Replace T-001 with your ticket number)

### Manual Development

#### Backend
```bash
cd backend
yarn install --ignore-engines
npx prisma db push
npm run dev
```

#### Frontend
```bash
cd frontend
yarn install --ignore-engines
npm run dev
```

## Running Tests

```bash
cd backend
npm test
```
